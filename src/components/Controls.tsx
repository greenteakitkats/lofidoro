import { useTimer } from '../state/TimerContext'
import './controls.css'

const PHASE_LABEL = {
  focus: 'focus',
  shortBreak: 'short break',
  longBreak: 'long break',
} as const

export function Controls() {
  const { state, intervals, startTimer, pauseTimer, resetTimer, skipTimer } = useTimer()
  const running = state.status === 'running'
  const n = intervals.sessionsUntilLongBreak
  const mod = state.completedFocusSessions % n
  // a full cycle just completed shows all dots lit until the next focus finishes
  const filled = state.completedFocusSessions > 0 && mod === 0 ? n : mod

  return (
    <div className="controls">
      <div className="controls-session" title="completed focus sessions this sitting">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={'session-dot' + (i < filled ? ' filled' : '')} />
        ))}
        <span className="controls-phase">{PHASE_LABEL[state.phase]}</span>
      </div>
      <div className="controls-buttons">
        <button className="btn btn-primary" onClick={running ? pauseTimer : startTimer}>
          {running ? 'pause' : state.status === 'paused' ? 'resume' : 'start'}
        </button>
        <button className="btn" onClick={skipTimer} title="skip to the next phase">
          skip
        </button>
        <button className="btn" onClick={resetTimer} title="back to the start of a focus block">
          reset
        </button>
      </div>
    </div>
  )
}
