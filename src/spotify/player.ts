import { getAccessToken } from './auth'

/**
 * Loads and wraps the Spotify Web Playback SDK (Premium only, and
 * officially unsupported on iOS browsers — callers should check
 * `isIOS()` and skip straight to remote-control mode there).
 */

const SDK_SRC = 'https://sdk.scdn.co/spotify-player.js'
let sdkLoadPromise: Promise<void> | null = null

export function isIOS(): boolean {
  return /iP(hone|ad|od)/.test(navigator.userAgent)
}

function loadSdk(): Promise<void> {
  if (sdkLoadPromise) return sdkLoadPromise
  sdkLoadPromise = new Promise((resolve, reject) => {
    if (window.Spotify) return resolve()
    window.onSpotifyWebPlaybackSDKReady = () => resolve()
    const script = document.createElement('script')
    script.src = SDK_SRC
    script.async = true
    script.onerror = () => reject(new Error('failed to load Spotify SDK'))
    document.head.appendChild(script)
  })
  return sdkLoadPromise
}

export interface PlayerHandle {
  deviceId: string
  instance: SpotifyPlayerInstance
}

/** Creates and connects a Web Playback SDK player. Resolves once a device_id is assigned. */
export function createPlayer(): Promise<PlayerHandle> {
  return loadSdk().then(
    () =>
      new Promise<PlayerHandle>((resolve, reject) => {
        const Spotify = window.Spotify
        if (!Spotify) return reject(new Error('Spotify SDK unavailable'))
        const instance = new Spotify.Player({
          name: 'lofidoro room',
          getOAuthToken: (cb) => {
            void getAccessToken().then((t) => t && cb(t))
          },
          volume: 0.8,
        })
        instance.addListener('ready', ({ device_id }) => {
          if (device_id) resolve({ deviceId: device_id, instance })
        })
        instance.addListener('initialization_error', ({ message }) => reject(new Error(message)))
        instance.addListener('authentication_error', ({ message }) => reject(new Error(message)))
        void instance.connect()
      }),
  )
}
