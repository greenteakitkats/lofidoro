import { useMemo, useState } from 'react'
import { useSpotify } from '../spotify/useSpotify'
import { usePlaylists } from '../spotify/usePlaylists'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS, SPOTIFY_CLIENT_ID } from '../config'
import type { SpotifyPlaylist } from '../spotify/api'
import './spotify-panel.css'

const MODE_COPY: Record<string, string> = {
  connecting: 'connecting…',
  error: 'something went wrong — try reconnecting',
}

export function SpotifyPanel() {
  const spotify = useSpotify()
  const { curated, mine } = usePlaylists(spotify.connected)
  const [lastPlaylistId, setLastPlaylistId] = useLocalStorage<string>(
    STORAGE_KEYS.spotifyLastPlaylist,
    '',
  )
  const [filter, setFilter] = useState('')

  const filteredMine = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return q ? mine.filter((p) => p.name.toLowerCase().includes(q)) : mine
  }, [mine, filter])

  if (!SPOTIFY_CLIENT_ID) {
    return (
      <p className="drawer-note">
        Not set up yet — add a Spotify client ID to enable playback controls.
      </p>
    )
  }

  const playTrack = (playlist: SpotifyPlaylist) => {
    setLastPlaylistId(playlist.id)
    spotify.play(`spotify:playlist:${playlist.id}`)
  }

  if (spotify.mode === 'disconnected') {
    return (
      <div className="spotify">
        <p className="drawer-note">Bring your own music — connect to control playback here.</p>
        <button className="btn btn-primary" onClick={spotify.login}>
          connect spotify
        </button>
      </div>
    )
  }

  const isPlaying = spotify.nowPlaying?.isPlaying ?? false

  return (
    <div className="spotify">
      {MODE_COPY[spotify.mode] && <p className="drawer-note">{MODE_COPY[spotify.mode]}</p>}

      {(spotify.mode === 'remote' || spotify.mode === 'no-device') && (
        <div className="spotify-remote">
          <p className="drawer-note">
            {spotify.canPlayInBrowser
              ? 'Play right here in the browser, or control Spotify already running on another device.'
              : 'Controlling Spotify on your other device — start something playing there, then use these controls.'}
          </p>
          {spotify.canPlayInBrowser && (
            <button className="btn" onClick={spotify.enableInBrowser}>
              play in this browser
            </button>
          )}
        </div>
      )}

      {spotify.statusMessage && <p className="drawer-note drawer-note--alert">{spotify.statusMessage}</p>}

      {spotify.nowPlaying && (
        <div className="now-playing">
          {spotify.nowPlaying.albumArt ? (
            <img src={spotify.nowPlaying.albumArt} alt="" className="now-playing-art" />
          ) : (
            <div className="now-playing-art now-playing-art--empty" />
          )}
          <div className="now-playing-meta">
            <div className="now-playing-track">{spotify.nowPlaying.name}</div>
            <div className="now-playing-artist">{spotify.nowPlaying.artist}</div>
          </div>
        </div>
      )}

      <div className="transport">
        <button className="icon-btn" onClick={spotify.skipPrevious} aria-label="previous track">
          <TransportIcon kind="prev" />
        </button>
        <button
          className="icon-btn icon-btn--primary"
          onClick={() => (isPlaying ? spotify.pause() : spotify.play())}
          aria-label={isPlaying ? 'pause' : 'play'}
        >
          <TransportIcon kind={isPlaying ? 'pause' : 'play'} />
        </button>
        <button className="icon-btn" onClick={spotify.skipNext} aria-label="next track">
          <TransportIcon kind="next" />
        </button>
      </div>

      {curated.length > 0 && (
        <section className="playlist-section">
          <h3 className="group-title">lo-fi picks</h3>
          <div className="playlist-grid">
            {curated.map((p) => (
              <PlaylistTile key={p.id} playlist={p} active={p.id === lastPlaylistId} onClick={() => playTrack(p)} />
            ))}
          </div>
        </section>
      )}

      {mine.length > 0 && (
        <section className="playlist-section">
          <div className="playlist-section-head">
            <h3 className="group-title">your playlists</h3>
            {mine.length > 8 && (
              <input
                className="playlist-filter"
                type="search"
                placeholder="filter…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="filter your playlists"
              />
            )}
          </div>
          <div className="playlist-scroll">
            <div className="playlist-grid">
              {filteredMine.map((p) => (
                <PlaylistTile key={p.id} playlist={p} active={p.id === lastPlaylistId} onClick={() => playTrack(p)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <button className="text-btn" onClick={spotify.disconnect}>
        disconnect
      </button>
    </div>
  )
}

function TransportIcon({ kind }: { kind: 'prev' | 'next' | 'play' | 'pause' }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      {kind === 'play' && <path d="M8 5.5v13l11-6.5z" />}
      {kind === 'pause' && <path d="M7 5.5h3.5v13H7zM13.5 5.5H17v13h-3.5z" />}
      {kind === 'prev' && <path d="M8 6v12H6V6zM18 6v12l-9-6z" />}
      {kind === 'next' && <path d="M16 6v12h2V6zM6 6v12l9-6z" />}
    </svg>
  )
}

function PlaylistTile({
  playlist,
  active,
  onClick,
}: {
  playlist: SpotifyPlaylist
  active: boolean
  onClick: () => void
}) {
  return (
    <button className={'playlist-tile' + (active ? ' active' : '')} onClick={onClick} title={playlist.name}>
      {playlist.images?.[0]?.url ? (
        <img src={playlist.images[0].url} alt="" />
      ) : (
        <div className="playlist-tile-fallback" />
      )}
      <span>{playlist.name}</span>
    </button>
  )
}
