import { useRemainingTime } from '../hooks/useRemainingTime'
import { useTimer } from '../state/TimerContext'
import { useTabTitle } from '../hooks/useTabTitle'
import './timer-display.css'

/**
 * Standalone countdown (Phase 1). In Phase 2 this moves inside the room
 * scene as a wall clock; the tab-title hook stays wherever this renders.
 */
export function TimerDisplay() {
  const { state, startTimer, pauseTimer } = useTimer()
  const { text } = useRemainingTime()
  useTabTitle(state.status, state.phase, text)

  return (
    <button
      className={`timer-display phase-${state.phase} status-${state.status}`}
      onClick={state.status === 'running' ? pauseTimer : startTimer}
      title={state.status === 'running' ? 'pause' : 'start'}
    >
      {text}
    </button>
  )
}
