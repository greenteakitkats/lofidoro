import { describe, it, expect } from 'vitest'
import {
  initialTimerState,
  start,
  pause,
  reset,
  skip,
  tick,
  remainingMs,
  formatMs,
  phaseDurationMs,
} from './timer'
import type { Intervals } from '../types'

const intervals: Intervals = { focus: 25, shortBreak: 5, longBreak: 15, sessionsUntilLongBreak: 4 }
const MIN = 60_000
const t0 = 1_000_000

describe('timer engine', () => {
  it('starts a focus phase for the full duration', () => {
    const s = start(initialTimerState, intervals, t0)
    expect(s.status).toBe('running')
    expect(s.phaseEndsAt).toBe(t0 + 25 * MIN)
    expect(remainingMs(s, intervals, t0)).toBe(25 * MIN)
  })

  it('pause captures remaining time; resume recomputes end from now', () => {
    let s = start(initialTimerState, intervals, t0)
    s = pause(s, t0 + 10 * MIN)
    expect(s.status).toBe('paused')
    expect(s.pausedRemainingMs).toBe(15 * MIN)
    expect(remainingMs(s, intervals, t0 + 60 * MIN)).toBe(15 * MIN) // frozen while paused
    s = start(s, intervals, t0 + 60 * MIN)
    expect(s.phaseEndsAt).toBe(t0 + 60 * MIN + 15 * MIN)
  })

  it('tick before the boundary changes nothing', () => {
    const s = start(initialTimerState, intervals, t0)
    const { state, transitions } = tick(s, intervals, t0 + 24 * MIN, true)
    expect(transitions).toHaveLength(0)
    expect(state).toBe(s)
  })

  it('auto-advances focus -> shortBreak, carrying overshoot from the scheduled end', () => {
    const s = start(initialTimerState, intervals, t0)
    // tick 90s late
    const { state, transitions } = tick(s, intervals, t0 + 25 * MIN + 90_000, true)
    expect(transitions).toEqual([{ from: 'focus', to: 'shortBreak', completedFocusSessions: 1 }])
    expect(state.phase).toBe('shortBreak')
    expect(state.status).toBe('running')
    // break ends 5min after the *scheduled* focus end, not after `now`
    expect(state.phaseEndsAt).toBe(t0 + 25 * MIN + 5 * MIN)
  })

  it('advances through multiple missed phases when the tab slept', () => {
    const s = start(initialTimerState, intervals, t0)
    // sleep past focus (25) + break (5) + into the next focus
    const now = t0 + 31 * MIN
    const { state, transitions } = tick(s, intervals, now, true)
    expect(transitions.map((tr) => tr.to)).toEqual(['shortBreak', 'focus'])
    expect(state.phase).toBe('focus')
    expect(state.phaseEndsAt).toBe(t0 + 30 * MIN + 25 * MIN)
  })

  it('without auto-advance, stops idle at the next phase', () => {
    const s = start(initialTimerState, intervals, t0)
    const { state, transitions } = tick(s, intervals, t0 + 26 * MIN, false)
    expect(transitions).toHaveLength(1)
    expect(state.status).toBe('idle')
    expect(state.phase).toBe('shortBreak')
    expect(state.phaseEndsAt).toBeNull()
    expect(remainingMs(state, intervals, t0 + 26 * MIN)).toBe(5 * MIN)
  })

  it('gives a long break after sessionsUntilLongBreak focus sessions', () => {
    let s = start(initialTimerState, intervals, t0)
    let now = t0
    const phases: string[] = []
    for (let i = 0; i < 8; i++) {
      now = s.phaseEndsAt!
      const r = tick(s, intervals, now, true)
      s = r.state
      phases.push(...r.transitions.map((tr) => tr.to))
    }
    expect(phases).toEqual([
      'shortBreak', 'focus',
      'shortBreak', 'focus',
      'shortBreak', 'focus',
      'longBreak', 'focus',
    ])
    expect(s.completedFocusSessions).toBe(4)
  })

  it('skip moves to next phase without crediting the focus session', () => {
    let s = start(initialTimerState, intervals, t0)
    s = skip(s, intervals, t0 + MIN)
    expect(s.phase).toBe('shortBreak')
    expect(s.completedFocusSessions).toBe(0)
    expect(s.status).toBe('running')
    expect(s.phaseEndsAt).toBe(t0 + MIN + 5 * MIN)
  })

  it('skip while idle stays idle', () => {
    const s = skip(initialTimerState, intervals, t0)
    expect(s.phase).toBe('shortBreak')
    expect(s.status).toBe('idle')
    expect(s.phaseEndsAt).toBeNull()
  })

  it('reset returns to idle focus but keeps the session count', () => {
    let s = start(initialTimerState, intervals, t0)
    s = tick(s, intervals, t0 + 25 * MIN, true).state
    s = reset(s)
    expect(s.phase).toBe('focus')
    expect(s.status).toBe('idle')
    expect(s.completedFocusSessions).toBe(1)
  })

  it('formats times', () => {
    expect(formatMs(25 * MIN)).toBe('25:00')
    expect(formatMs(61_000)).toBe('01:01')
    expect(formatMs(999)).toBe('00:01')
    expect(formatMs(0)).toBe('00:00')
  })

  it('phase durations', () => {
    expect(phaseDurationMs('focus', intervals)).toBe(25 * MIN)
    expect(phaseDurationMs('shortBreak', intervals)).toBe(5 * MIN)
    expect(phaseDurationMs('longBreak', intervals)).toBe(15 * MIN)
  })
})
