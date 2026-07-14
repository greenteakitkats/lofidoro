import { describe, it, expect } from 'vitest'
import {
  dateKeyFor,
  sessionsToday,
  recordSession,
  deriveProgression,
  EMPTY_PROGRESS,
} from './progression'

describe('progression', () => {
  it('rolls the day over at 4am local, not midnight', () => {
    expect(dateKeyFor(new Date(2026, 6, 14, 3, 59))).toBe('2026-07-13')
    expect(dateKeyFor(new Date(2026, 6, 14, 4, 0))).toBe('2026-07-14')
    expect(dateKeyFor(new Date(2026, 6, 14, 23, 30))).toBe('2026-07-14')
    expect(dateKeyFor(new Date(2026, 6, 15, 1, 0))).toBe('2026-07-14')
  })

  it('a stale record reads as zero sessions', () => {
    const record = { dateKey: '2026-07-13', focusSessions: 5 }
    expect(sessionsToday(record, new Date(2026, 6, 14, 12, 0))).toBe(0)
    expect(sessionsToday(record, new Date(2026, 6, 14, 2, 0))).toBe(5) // still the 13th, cozy-time
  })

  it('recordSession increments within a day and restarts across the boundary', () => {
    const noon = new Date(2026, 6, 14, 12, 0)
    let r = recordSession(EMPTY_PROGRESS, noon)
    r = recordSession(r, noon)
    expect(r).toEqual({ dateKey: '2026-07-14', focusSessions: 2 })
    const nextDay = new Date(2026, 6, 15, 9, 0)
    expect(recordSession(r, nextDay)).toEqual({ dateKey: '2026-07-15', focusSessions: 1 })
  })

  it('derives drift, growth, and cat pose', () => {
    expect(deriveProgression(0)).toEqual({ drift: 0, growthStage: 0, catPose: 0 })
    expect(deriveProgression(3)).toEqual({ drift: 0.5, growthStage: 1, catPose: 0 })
    expect(deriveProgression(6)).toEqual({ drift: 1, growthStage: 3, catPose: 0 })
    expect(deriveProgression(10).drift).toBe(1)
    expect(deriveProgression(10).growthStage).toBe(3)
    expect(deriveProgression(7).catPose).toBe(1)
  })
})
