import type { Preset, Settings, AmbienceLayerId, AmbienceGroup } from './types'

export const PRESETS: Preset[] = [
  {
    id: 'classic',
    label: 'Classic',
    intervals: { focus: 25, shortBreak: 5, longBreak: 15, sessionsUntilLongBreak: 4 },
  },
  {
    id: 'deep',
    label: 'Deep work',
    intervals: { focus: 50, shortBreak: 10, longBreak: 20, sessionsUntilLongBreak: 3 },
  },
  {
    id: 'quick',
    label: 'Quick',
    intervals: { focus: 15, shortBreak: 3, longBreak: 10, sessionsUntilLongBreak: 4 },
  },
]

export const CUSTOM_PRESET_ID = 'custom'

export const DEFAULT_SETTINGS: Settings = {
  presetId: 'classic',
  custom: { focus: 25, shortBreak: 5, longBreak: 15, sessionsUntilLongBreak: 4 },
  autoAdvance: true,
  notifications: false,
  chime: true,
  breakAudio: 'duck',
}

export const MIN_MINUTES = 1
export const MAX_MINUTES = 120

export interface AmbienceLayerDef {
  id: AmbienceLayerId
  label: string
  emoji: string
  group: AmbienceGroup
}

export const AMBIENCE_LAYERS: AmbienceLayerDef[] = [
  { id: 'lofi', label: 'Lo-fi radio', emoji: '📻', group: 'music' },
  { id: 'fire', label: 'Fireplace', emoji: '🔥', group: 'cozy' },
  { id: 'cafe', label: 'Café', emoji: '☕', group: 'cozy' },
  { id: 'typing', label: 'Typing', emoji: '⌨️', group: 'cozy' },
  { id: 'birds', label: 'Morning birds', emoji: '🐦', group: 'nature' },
  { id: 'waves', label: 'Ocean waves', emoji: '🌊', group: 'nature' },
  { id: 'stream', label: 'Forest stream', emoji: '🏞', group: 'nature' },
  { id: 'crickets', label: 'Night crickets', emoji: '🦗', group: 'nature' },
  { id: 'rain', label: 'Rain', emoji: '🌧', group: 'weather' },
  { id: 'thunder', label: 'Thunder', emoji: '⛈', group: 'weather' },
  { id: 'wind', label: 'Wind', emoji: '🍃', group: 'weather' },
]

export const AMBIENCE_GROUPS: Array<{ id: AmbienceGroup; label: string }> = [
  { id: 'music', label: 'music' },
  { id: 'cozy', label: 'cozy' },
  { id: 'nature', label: 'nature' },
  { id: 'weather', label: 'weather' },
]

// Spotify — client ID is public by design in the PKCE flow.
// Filled in during Phase 4 once the app is registered at developer.spotify.com.
export const SPOTIFY_CLIENT_ID = ''
export const SPOTIFY_SCOPES =
  'streaming user-read-private user-read-playback-state user-modify-playback-state playlist-read-private'

// Curated lo-fi / focus playlists shown to everyone (filled in Phase 4).
export const CURATED_PLAYLIST_IDS: string[] = []

export const STORAGE_KEYS = {
  settings: 'lofidoro:settings',
  mix: 'lofidoro:mix',
  spotifyTokens: 'lofidoro:spotify_tokens',
  spotifyLastPlaylist: 'lofidoro:spotify_last_playlist',
  dayProgress: 'lofidoro:day_progress',
  windowView: 'lofidoro:window_view',
} as const
