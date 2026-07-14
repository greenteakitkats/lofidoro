export type Phase = 'focus' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface Intervals {
  /** minutes */
  focus: number
  shortBreak: number
  longBreak: number
  sessionsUntilLongBreak: number
}

export interface Preset {
  id: string
  label: string
  intervals: Intervals
}

export type BreakAudioBehavior = 'pause' | 'duck' | 'nothing'

export interface Settings {
  presetId: string
  custom: Intervals
  autoAdvance: boolean
  notifications: boolean
  chime: boolean
  breakAudio: BreakAudioBehavior
}

export type AmbienceLayerId = 'rain' | 'fire' | 'cafe' | 'crickets'

export type AmbienceMix = Record<AmbienceLayerId, number>
