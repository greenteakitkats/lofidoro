import { useSpotify } from '../spotify/useSpotify'
import { usePlaylists } from '../spotify/usePlaylists'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS, SPOTIFY_CLIENT_ID } from '../config'
import type { SpotifyPlaylist } from '../spotify/api'
import './panels.css'
import './spotify-panel.css'

const MODE_COPY: Record<string, string> = {
  connecting: 'connecting…',
  error: 'something went wrong',
  'no-device': 'no active device — open Spotify on your phone or computer first',
}

export function SpotifyPanel() {
  const spotify = useSpotify()
  const { curated, mine } = usePlaylists(spotify.connected)
  const [lastPlaylistId, setLastPlaylistId] = useLocalStorage<string>(
    STORAGE_KEYS.spotifyLastPlaylist,
    '',
  )

  if (!SPOTIFY_CLIENT_ID) {
    return (
      <section className="panel">
        <h2 className="panel-title">spotify</h2>
        <p className="panel-note">
          Not set up yet — register an app at developer.spotify.com and add the client ID to
          get lo-fi playlists and playback controls here.
        </p>
      </section>
    )
  }

  const playTrack = (playlist: SpotifyPlaylist) => {
    setLastPlaylistId(playlist.id)
    spotify.play(`spotify:playlist:${playlist.id}`)
  }

  return (
    <section className="panel">
      <h2 className="panel-title">spotify</h2>

      {spotify.mode === 'disconnected' && (
        <button className="btn btn-primary" onClick={spotify.login}>
          connect spotify
        </button>
      )}

      {spotify.mode !== 'disconnected' && (
        <>
          {MODE_COPY[spotify.mode] && <p className="panel-note">{MODE_COPY[spotify.mode]}</p>}
          {spotify.mode === 'remote' && (
            <p className="panel-note">
              free account: controlling playback on your other device
            </p>
          )}

          {spotify.nowPlaying && (
            <div className="now-playing">
              {spotify.nowPlaying.albumArt && (
                <img src={spotify.nowPlaying.albumArt} alt="" className="now-playing-art" />
              )}
              <div>
                <div className="now-playing-track">{spotify.nowPlaying.name}</div>
                <div className="now-playing-artist">{spotify.nowPlaying.artist}</div>
              </div>
            </div>
          )}

          <div className="spotify-controls">
            <button className="btn" onClick={spotify.skipPrevious} aria-label="previous track">
              ⏮
            </button>
            <button
              className="btn btn-primary"
              onClick={() => (spotify.nowPlaying?.isPlaying ? spotify.pause() : spotify.play())}
            >
              {spotify.nowPlaying?.isPlaying ? 'pause' : 'play'}
            </button>
            <button className="btn" onClick={spotify.skipNext} aria-label="next track">
              ⏭
            </button>
          </div>

          {(curated.length > 0 || mine.length > 0) && (
            <div className="playlist-sections">
              {curated.length > 0 && (
                <div>
                  <h3 className="playlist-heading">lo-fi picks</h3>
                  <div className="playlist-grid">
                    {curated.map((p) => (
                      <PlaylistTile key={p.id} playlist={p} active={p.id === lastPlaylistId} onClick={() => playTrack(p)} />
                    ))}
                  </div>
                </div>
              )}
              {mine.length > 0 && (
                <div>
                  <h3 className="playlist-heading">your playlists</h3>
                  <div className="playlist-grid">
                    {mine.map((p) => (
                      <PlaylistTile key={p.id} playlist={p} active={p.id === lastPlaylistId} onClick={() => playTrack(p)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="btn disconnect-btn" onClick={spotify.disconnect}>
            disconnect
          </button>
        </>
      )}
    </section>
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
