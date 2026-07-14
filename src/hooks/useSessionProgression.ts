import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../config'
import {
  deriveProgression,
  recordSession,
  sessionsToday,
  EMPTY_PROGRESS,
  type DayProgress,
  type Progression,
} from '../engine/progression'
import { useLocalStorage } from './useLocalStorage'
import { useTimer } from '../state/TimerContext'

function devSessionOverride(): number | null {
  // eyeball progression stages: ?sessions=5 (mirrors the ?hour= pattern)
  const param = new URLSearchParams(window.location.search).get('sessions')
  if (param === null) return null
  const n = Number(param)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null
}

/**
 * Counts completed focus sessions per "cozy day" (4am boundary) and derives
 * the scene's quiet evolution from them. Counting subscribes to the timer's
 * transition stream — the engine's own completedFocusSessions resets with
 * the long-break cycle and must not be used here.
 */
export function useSessionProgression(): Progression & { focusSessions: number } {
  const { onTransition } = useTimer()
  const [record, setRecord] = useLocalStorage<DayProgress>(
    STORAGE_KEYS.dayProgress,
    EMPTY_PROGRESS,
  )
  // nonce forces a re-read of "today" if the tab sat open across the 4am boundary
  const [, setDayCheck] = useState(0)

  useEffect(
    () =>
      onTransition((t) => {
        if (t.from === 'focus') {
          setRecord((prev) => recordSession(prev, new Date()))
        }
      }),
    [onTransition, setRecord],
  )

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) setDayCheck((n) => n + 1)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const focusSessions = devSessionOverride() ?? sessionsToday(record, new Date())
  return { focusSessions, ...deriveProgression(focusSessions) }
}
