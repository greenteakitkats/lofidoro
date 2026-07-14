import { useEffect, useState } from 'react'
import { formatMs, remainingMs } from '../engine/timer'
import { useTimer } from '../state/TimerContext'

/**
 * Self-ticking display value. TimerState itself only changes on user actions
 * and phase transitions; components that show the countdown use this hook so
 * only they re-render every 500ms.
 */
export function useRemainingTime(): { ms: number; text: string } {
  const { state, intervals } = useTimer()
  const [ms, setMs] = useState(() => remainingMs(state, intervals, Date.now()))

  useEffect(() => {
    const update = () => setMs(remainingMs(state, intervals, Date.now()))
    update()
    if (state.status !== 'running') return
    const id = setInterval(update, 500)
    return () => clearInterval(id)
  }, [state, intervals])

  return { ms, text: formatMs(ms) }
}
