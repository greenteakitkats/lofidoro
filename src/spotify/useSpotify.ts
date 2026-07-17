import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as auth from './auth'
import * as api from './api'
import { createPlayer, isIOS, type PlayerHandle } from './player'
import { SPOTIFY_CLIENT_ID, STORAGE_KEYS } from '../config'
import { loadJSON } from '../hooks/useLocalStorage'

export type SpotifyMode = 'disconnected' | 'connecting' | 'sdk' | 'remote' | 'no-device' | 'error'

export interface NowPlaying {
  name: string
  artist: string
  albumArt: string | null
  isPlaying: boolean
}

export interface SpotifyApi {
  mode: SpotifyMode
  connected: boolean
  canDuck: boolean
  nowPlaying: NowPlaying | null
  errorMessage: string | null
  login: () => void
  disconnect: () => void
  play: (contextUri?: string) => void
  pause: () => void
  skipNext: () => void
  skipPrevious: () => void
  setVolume: (percent: number) => void
}

const POLL_MS = 5000

const SpotifyContext = createContext<SpotifyApi | null>(null)

function toNowPlaying(state: SpotifyPlaybackState): NowPlaying {
  const track = state.track_window.current_track
  return {
    name: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    albumArt: track.album.images[0]?.url ?? null,
    isPlaying: !state.paused,
  }
}

/**
 * One Spotify connection for the whole app. This MUST be a single provider:
 * two instances of this logic would each spin up a Web Playback SDK player
 * and fight over the connection (which is exactly the bug that motivated
 * the context — a panel stuck on "connecting…" while a second player won).
 */
export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SpotifyMode>('disconnected')
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const playerRef = useRef<PlayerHandle | null>(null)

  const connect = useCallback(async () => {
    if (!SPOTIFY_CLIENT_ID) {
      setErrorMessage('Spotify isn’t configured yet.')
      setMode('error')
      return
    }
    setMode('connecting')
    try {
      const profile = await api.getProfile()
      if (!profile) throw new Error('could not load profile')

      if (profile.product === 'premium' && !isIOS()) {
        try {
          const handle = await createPlayer()
          playerRef.current = handle
          await api.transferPlayback(handle.deviceId)
          handle.instance.addListener('player_state_changed', ({ state }) => {
            if (state) setNowPlaying(toNowPlaying(state))
          })
          // populate now-playing immediately; state_changed only fires on changes
          const current = await handle.instance.getCurrentState()
          if (current) setNowPlaying(toNowPlaying(current))
          setMode('sdk')
          return
        } catch {
          // SDK failed or timed out — degrade to remote-control mode
          playerRef.current = null
        }
      }
      setMode('remote')
    } catch {
      setMode('error')
      setErrorMessage('Could not connect to Spotify. Try reconnecting.')
    }
  }, [])

  // on mount (StrictMode-safe): finish PKCE redirect, then connect if logged in
  const bootedRef = useRef(false)
  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true
    void auth.handleRedirect().then(() => {
      if (auth.isLoggedIn()) void connect()
    })
  }, [connect])

  // remote-control mode: poll now-playing
  useEffect(() => {
    if (mode !== 'remote' && mode !== 'no-device') return
    let cancelled = false
    const poll = async () => {
      try {
        const state = await api.getPlaybackState()
        if (cancelled) return
        if (!state) {
          setMode('no-device')
          setNowPlaying(null)
          return
        }
        setMode('remote')
        setNowPlaying(
          state.item
            ? {
                name: state.item.name,
                artist: state.item.artists.map((a) => a.name).join(', '),
                albumArt: state.item.album.images[0]?.url ?? null,
                isPlaying: state.is_playing,
              }
            : null,
        )
      } catch {
        // transient — try again next tick
      }
    }
    void poll()
    const id = setInterval(poll, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [mode])

  const login = useCallback(() => {
    void auth.beginLogin()
  }, [])

  const disconnect = useCallback(() => {
    playerRef.current?.instance.disconnect()
    playerRef.current = null
    auth.logout()
    setMode('disconnected')
    setNowPlaying(null)
  }, [])

  const play = useCallback(
    (contextUri?: string) => {
      // nothing loaded yet and no explicit choice: fall back to the last playlist
      let uri = contextUri
      if (!uri && !nowPlaying) {
        const last = loadJSON<string>(STORAGE_KEYS.spotifyLastPlaylist, '')
        if (last) uri = `spotify:playlist:${last}`
      }
      if (mode === 'sdk' && playerRef.current) {
        if (uri) void api.play(playerRef.current.deviceId, uri)
        else void playerRef.current.instance.resume()
      } else {
        void api.play(undefined, uri)
      }
    },
    [mode, nowPlaying],
  )

  const pausePlayback = useCallback(() => {
    if (mode === 'sdk' && playerRef.current) void playerRef.current.instance.pause()
    else void api.pause()
  }, [mode])

  const skipNext = useCallback(() => {
    if (mode === 'sdk' && playerRef.current) void playerRef.current.instance.nextTrack()
    else void api.next()
  }, [mode])

  const skipPrevious = useCallback(() => {
    if (mode === 'sdk' && playerRef.current) void playerRef.current.instance.previousTrack()
    else void api.previous()
  }, [mode])

  /** True volume ducking — Premium/SDK only; no-op (silently) elsewhere. */
  const setVolume = useCallback((percent: number) => {
    if (playerRef.current) void playerRef.current.instance.setVolume(percent / 100)
  }, [])

  const value: SpotifyApi = {
    mode,
    connected: mode === 'sdk' || mode === 'remote' || mode === 'no-device',
    canDuck: mode === 'sdk',
    nowPlaying,
    errorMessage,
    login,
    disconnect,
    play,
    pause: pausePlayback,
    skipNext,
    skipPrevious,
    setVolume,
  }

  return createElement(SpotifyContext.Provider, { value }, children)
}

export function useSpotify(): SpotifyApi {
  const ctx = useContext(SpotifyContext)
  if (!ctx) throw new Error('useSpotify must be used within SpotifyProvider')
  return ctx
}
