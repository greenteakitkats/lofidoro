import { getAccessToken } from './auth'

const BASE = 'https://api.spotify.com/v1'

export interface SpotifyProfile {
  product: 'premium' | 'free' | 'open'
  display_name: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  /** null for playlists without cover art — Spotify really does send null */
  images: Array<{ url: string }> | null
  external_urls: { spotify: string }
}

export interface PlaybackState {
  is_playing: boolean
  device: { id: string; name: string; volume_percent: number | null } | null
  /** artists/album absent for podcast episodes; images can be null */
  item: {
    name: string
    artists?: Array<{ name: string }>
    album?: { images: Array<{ url: string }> | null }
  } | null
}

class SpotifyApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const token = await getAccessToken()
  if (!token) throw new SpotifyApiError(401, 'not logged in')
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  })
  if (res.status === 204) return null // e.g. no active device
  if (!res.ok) throw new SpotifyApiError(res.status, await res.text())
  const text = await res.text()
  return text ? (JSON.parse(text) as T) : null
}

export function getProfile() {
  return request<SpotifyProfile>('/me')
}

export function getMyPlaylists() {
  return request<{ items: SpotifyPlaylist[] }>('/me/playlists?limit=50')
}

export function getPlaylist(id: string) {
  return request<SpotifyPlaylist>(`/playlists/${id}?fields=id,name,images,external_urls`)
}

export function getPlaybackState() {
  return request<PlaybackState>('/me/player')
}

export function play(deviceId?: string, contextUri?: string) {
  const qs = deviceId ? `?device_id=${deviceId}` : ''
  return request(`/me/player/play${qs}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: contextUri ? JSON.stringify({ context_uri: contextUri }) : undefined,
  })
}

export function pause(deviceId?: string) {
  const qs = deviceId ? `?device_id=${deviceId}` : ''
  return request(`/me/player/pause${qs}`, { method: 'PUT' })
}

export function next() {
  return request('/me/player/next', { method: 'POST' })
}

export function previous() {
  return request('/me/player/previous', { method: 'POST' })
}

export function setVolume(percent: number, deviceId?: string) {
  const qs = new URLSearchParams({ volume_percent: String(Math.round(percent)) })
  if (deviceId) qs.set('device_id', deviceId)
  return request(`/me/player/volume?${qs.toString()}`, { method: 'PUT' })
}

export function transferPlayback(deviceId: string) {
  return request('/me/player', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  })
}

export { SpotifyApiError }
