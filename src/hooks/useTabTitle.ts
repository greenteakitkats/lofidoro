import { useEffect } from 'react'
import type { Phase, TimerStatus } from '../types'

const PHASE_LABEL: Record<Phase, string> = {
  focus: 'Focus',
  shortBreak: 'Break',
  longBreak: 'Long break',
}

export function useTabTitle(status: TimerStatus, phase: Phase, timeText: string): void {
  useEffect(() => {
    document.title =
      status === 'idle'
        ? 'lofidoro · cozy focus timer'
        : `(${timeText}) ${PHASE_LABEL[phase]}${status === 'paused' ? ' ⏸' : ''} · lofidoro`
    return () => {
      document.title = 'lofidoro · cozy focus timer'
    }
  }, [status, phase, timeText])
}
