import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Intervals } from '../types'
import {
  initialTimerState,
  start,
  pause,
  reset,
  skip,
  tick,
  type PhaseTransition,
  type TimerState,
} from '../engine/timer'
import { playChime } from '../engine/chime'
import { unlockAudio } from '../audio/context'
import { useSettings } from './SettingsContext'
import { useNotifications } from '../hooks/useNotifications'

type TransitionListener = (transition: PhaseTransition) => void

interface TimerApi {
  state: TimerState
  intervals: Intervals
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipTimer: () => void
  /** subscribe to phase transitions (returns unsubscribe) */
  onTransition: (fn: TransitionListener) => () => void
}

const TimerContext = createContext<TimerApi | null>(null)

export function TimerProvider({ children }: { children: ReactNode }) {
  const { settings, intervals } = useSettings()
  const [state, setState] = useState<TimerState>(initialTimerState)
  const { notifyPhase } = useNotifications(settings.notifications)

  // refs so the tick loop always sees current values without re-subscribing
  const stateRef = useRef(state)
  stateRef.current = state
  const intervalsRef = useRef(intervals)
  intervalsRef.current = intervals
  const autoAdvanceRef = useRef(settings.autoAdvance)
  autoAdvanceRef.current = settings.autoAdvance
  const chimeRef = useRef(settings.chime)
  chimeRef.current = settings.chime
  const notifyRef = useRef(notifyPhase)
  notifyRef.current = notifyPhase
  const listenersRef = useRef(new Set<TransitionListener>())

  const runTick = useCallback(() => {
    const prev = stateRef.current
    if (prev.status !== 'running') return
    const { state: next, transitions } = tick(
      prev,
      intervalsRef.current,
      Date.now(),
      autoAdvanceRef.current,
    )
    if (transitions.length === 0) return
    setState(next)
    // announce only the final landing phase; intermediate missed phases
    // (tab slept through a whole break) shouldn't stack chimes
    const last = transitions[transitions.length - 1]
    if (chimeRef.current) playChime(last.to === 'focus' ? 'focus' : 'break')
    notifyRef.current(last.to)
    for (const t of transitions) {
      for (const fn of listenersRef.current) fn(t)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(runTick, 500)
    const onVisible = () => {
      if (!document.hidden) runTick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [runTick])

  const api = useMemo<TimerApi>(
    () => ({
      state,
      intervals,
      startTimer: () => {
        unlockAudio() // user gesture: unlock audio for chimes/ambience
        setState((prev) => start(prev, intervalsRef.current, Date.now()))
      },
      pauseTimer: () => setState((prev) => pause(prev, Date.now())),
      resetTimer: () => setState((prev) => reset(prev)),
      skipTimer: () => setState((prev) => skip(prev, intervalsRef.current, Date.now())),
      onTransition: (fn) => {
        listenersRef.current.add(fn)
        return () => listenersRef.current.delete(fn)
      },
    }),
    [state, intervals],
  )

  return <TimerContext.Provider value={api}>{children}</TimerContext.Provider>
}

export function useTimer(): TimerApi {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used within TimerProvider')
  return ctx
}
