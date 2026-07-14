import type { Intervals, Phase, TimerStatus } from '../types'

/**
 * Pure, framework-free pomodoro engine.
 *
 * Core principle: never count intervals — always derive from timestamps.
 * The UI's tick only *renders* `phaseEndsAt - now`; it never accumulates,
 * so background-tab timer throttling cannot cause drift. When auto-advancing
 * past a missed phase boundary, the next phase starts from the *scheduled*
 * end (carrying overshoot), so multi-phase advances stay exact even if the
 * tab slept through an entire break.
 */

export interface TimerState {
  phase: Phase
  status: TimerStatus
  /** epoch ms when the current phase ends (running only) */
  phaseEndsAt: number | null
  /** remaining ms captured at pause time (paused only) */
  pausedRemainingMs: number | null
  completedFocusSessions: number
}

export interface PhaseTransition {
  from: Phase
  to: Phase
  /** total focus sessions completed after this transition */
  completedFocusSessions: number
}

export interface TickResult {
  state: TimerState
  transitions: PhaseTransition[]
}

export const initialTimerState: TimerState = {
  phase: 'focus',
  status: 'idle',
  phaseEndsAt: null,
  pausedRemainingMs: null,
  completedFocusSessions: 0,
}

export function phaseDurationMs(phase: Phase, intervals: Intervals): number {
  const minutes =
    phase === 'focus'
      ? intervals.focus
      : phase === 'shortBreak'
        ? intervals.shortBreak
        : intervals.longBreak
  return Math.round(minutes * 60_000)
}

function nextPhase(state: TimerState, intervals: Intervals): { phase: Phase; completed: number } {
  if (state.phase === 'focus') {
    const completed = state.completedFocusSessions + 1
    const isLong = completed % intervals.sessionsUntilLongBreak === 0
    return { phase: isLong ? 'longBreak' : 'shortBreak', completed }
  }
  return { phase: 'focus', completed: state.completedFocusSessions }
}

export function start(state: TimerState, intervals: Intervals, now: number): TimerState {
  if (state.status === 'running') return state
  const remaining =
    state.status === 'paused' && state.pausedRemainingMs !== null
      ? state.pausedRemainingMs
      : phaseDurationMs(state.phase, intervals)
  return { ...state, status: 'running', phaseEndsAt: now + remaining, pausedRemainingMs: null }
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.phaseEndsAt === null) return state
  return {
    ...state,
    status: 'paused',
    pausedRemainingMs: Math.max(0, state.phaseEndsAt - now),
    phaseEndsAt: null,
  }
}

export function reset(state: TimerState): TimerState {
  return { ...initialTimerState, completedFocusSessions: state.completedFocusSessions }
}

/** Skip to the next phase immediately. Skipped focus phases don't count as completed. */
export function skip(state: TimerState, intervals: Intervals, now: number): TimerState {
  const to: Phase = state.phase === 'focus' ? (
    // peek at what the next break *would* be without crediting the session
    (state.completedFocusSessions + 1) % intervals.sessionsUntilLongBreak === 0
      ? 'longBreak'
      : 'shortBreak'
  ) : 'focus'
  const wasRunning = state.status === 'running'
  return {
    ...state,
    phase: to,
    status: wasRunning ? 'running' : 'idle',
    phaseEndsAt: wasRunning ? now + phaseDurationMs(to, intervals) : null,
    pausedRemainingMs: null,
  }
}

/**
 * Advance the state to `now`. Returns any phase transitions that occurred
 * (usually 0 or 1, but can be several if the tab slept a long time).
 */
export function tick(
  state: TimerState,
  intervals: Intervals,
  now: number,
  autoAdvance: boolean,
): TickResult {
  const transitions: PhaseTransition[] = []
  let s = state
  while (s.status === 'running' && s.phaseEndsAt !== null && now >= s.phaseEndsAt) {
    const scheduledEnd = s.phaseEndsAt
    const { phase, completed } = nextPhase(s, intervals)
    transitions.push({ from: s.phase, to: phase, completedFocusSessions: completed })
    if (autoAdvance) {
      s = {
        ...s,
        phase,
        completedFocusSessions: completed,
        // carry overshoot: next phase starts from the scheduled end, not `now`
        phaseEndsAt: scheduledEnd + phaseDurationMs(phase, intervals),
      }
    } else {
      s = {
        ...s,
        phase,
        completedFocusSessions: completed,
        status: 'idle',
        phaseEndsAt: null,
        pausedRemainingMs: null,
      }
    }
  }
  return { state: s, transitions }
}

/** Remaining ms in the current phase (full duration when idle). */
export function remainingMs(state: TimerState, intervals: Intervals, now: number): number {
  if (state.status === 'running' && state.phaseEndsAt !== null) {
    return Math.max(0, state.phaseEndsAt - now)
  }
  if (state.status === 'paused' && state.pausedRemainingMs !== null) {
    return state.pausedRemainingMs
  }
  return phaseDurationMs(state.phase, intervals)
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
