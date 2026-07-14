import { useRemainingTime } from '../../hooks/useRemainingTime'
import { useTabTitle } from '../../hooks/useTabTitle'
import { useTimer } from '../../state/TimerContext'

const PHASE_LABEL = {
  focus: 'focus',
  shortBreak: 'short break',
  longBreak: 'long break',
} as const

/** The countdown, hanging on the room's wall like a clock. Click to start/pause. */
export function SceneTimer() {
  const { state, startTimer, pauseTimer } = useTimer()
  const { text } = useRemainingTime()
  useTabTitle(state.status, state.phase, text)

  const running = state.status === 'running'

  return (
    <g
      className="scene-timer"
      onClick={running ? pauseTimer : startTimer}
      role="button"
      tabIndex={0}
      aria-label={running ? `pause timer, ${text} remaining` : 'start timer'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          ;(running ? pauseTimer : startTimer)()
        }
      }}
    >
      {/* invisible hit area so the whole clock region is clickable */}
      <rect x="420" y="96" width="290" height="130" fill="transparent" />
      <text className="timer-digits" x="565" y="172" textAnchor="middle">
        {text}
      </text>
      <text className="timer-label" x="565" y="200" textAnchor="middle">
        {state.status === 'paused' ? 'paused' : PHASE_LABEL[state.phase]}
      </text>
      <text className="timer-hint" x="565" y="222" textAnchor="middle">
        click to {state.status === 'paused' ? 'resume' : 'begin'}
      </text>
    </g>
  )
}
