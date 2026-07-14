import { useCallback, useEffect, useRef, useState } from 'react'
import * as auth from './auth'
import * as api from './api'
import { createPlayer, isIOS, type PlayerHandle } from './player'
import { SPOTIFY_CLIENT_ID } from '../config'

export type SpotifyMode = 'disconnected' | 'connecting' | 'sdk' | 'remote' | 'no-device' | 'error'

export interface NowPlaying {
  name: string
  artist: string
  albumArt: string | null
  isPlaying: boolean
}

const POLL_MS = 5000

export function useSpotify() {
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
            if (!state) return
            const track = state.track_window.current_track
            setNowPlaying({
              name: track.name,
              artist: track.artists.map((a) => a.name).join(', '),
              albumArt: track.album.images[0]?.url ?? null,
              isPlaying: !state.paused,
            })
          })
          setMode('sdk')
          return
        } catch {
          // fall through to remote-control mode
        }
      }
      setMode('remote')
    } catch {
      setMode('error')
      setErrorMessage('Could not connect to Spotify. Try reconnecting.')
    }
  }, [])

  // on mount: finish PKCE redirect if present, then connect if we have tokens
  useEffect(() => {
    void auth.handleRedirect().then(() => {
      if (auth.isLoggedIn()) void connect()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const play = useCallback((contextUri?: string) => {
    if (mode === 'sdk' && playerRef.current) {
      if (contextUri) void api.play(playerRef.current.deviceId, contextUri)
      else void playerRef.current.instance.resume()
    } else {
      void api.play(undefined, contextUri)
    }
  }, [mode])

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
  const setVolume = useCallback(
    (percent: number) => {
      if (mode === 'sdk' && playerRef.current) void playerRef.current.instance.setVolume(percent / 100)
    },
    [mode],
  )

  return {
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
}
