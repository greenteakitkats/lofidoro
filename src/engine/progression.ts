/**
 * Pure session-progression logic: the room's day quietly evolves as focus
 * sessions complete. Resets at a local 4 a.m. boundary — the scene's fiction
 * is "a day at your desk" (fresh candle each morning, plant regrowing), and
 * 4 a.m. means a late-night sitting doesn't reset out from under you.
 */

export interface DayProgress {
  dateKey: string
  focusSessions: number
}

export const EMPTY_PROGRESS: DayProgress = { dateKey: '', focusSessions: 0 }

const DAY_BOUNDARY_HOURS = 4

/** YYYY-MM-DD of the "cozy day" containing `now` (days roll over at 4 a.m. local). */
export function dateKeyFor(now: Date): string {
  const shifted = new Date(now.getTime() - DAY_BOUNDARY_HOURS * 3_600_000)
  const y = shifted.getFullYear()
  const m = String(shifted.getMonth() + 1).padStart(2, '0')
  const d = String(shifted.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Sessions counted so far today; a stale record reads as zero. */
export function sessionsToday(record: DayProgress, now: Date): number {
  return record.dateKey === dateKeyFor(now) ? record.focusSessions : 0
}

/** Record one more completed focus session. */
export function recordSession(record: DayProgress, now: Date): DayProgress {
  return { dateKey: dateKeyFor(now), focusSessions: sessionsToday(record, now) + 1 }
}

export interface Progression {
  /** 0..1 — evening warmth drift; full glow after ~6 sessions */
  drift: number
  /** 0..3 — plant / candle / notebook stage */
  growthStage: number
  /** 0..2 — which sleeping pose the cat picks on breaks */
  catPose: number
}

export function deriveProgression(focusSessions: number): Progression {
  return {
    drift: Math.min(focusSessions / 6, 1),
    growthStage: Math.min(Math.floor(focusSessions / 2), 3),
    catPose: focusSessions % 3,
  }
}
