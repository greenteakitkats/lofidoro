/** Minimal ambient types for the Spotify Web Playback SDK (loaded via <script>, not npm). */

interface SpotifyPlayerOptions {
  name: string
  getOAuthToken: (cb: (token: string) => void) => void
  volume?: number
}

interface SpotifyPlaybackTrack {
  name: string
  artists: Array<{ name: string }>
  album: { images: Array<{ url: string }> }
}

interface SpotifyPlaybackState {
  paused: boolean
  track_window: { current_track: SpotifyPlaybackTrack }
}

interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>
  disconnect: () => void
  addListener: (
    event: string,
    cb: (payload: { device_id?: string; message?: string; state?: SpotifyPlaybackState }) => void,
  ) => void
  togglePlay: () => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  nextTrack: () => Promise<void>
  previousTrack: () => Promise<void>
  setVolume: (v: number) => Promise<void>
  getCurrentState: () => Promise<SpotifyPlaybackState | null>
  /** unlock audio output on browsers that need a gesture (mobile Safari) */
  activateElement?: () => Promise<void>
}

interface Window {
  onSpotifyWebPlaybackSDKReady?: () => void
  Spotify?: {
    Player: new (options: SpotifyPlayerOptions) => SpotifyPlayerInstance
  }
}
