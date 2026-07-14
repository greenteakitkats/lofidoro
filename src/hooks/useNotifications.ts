import { useCallback } from 'react'
import type { Phase } from '../types'

const MESSAGES: Record<Phase, { title: string; body: string }> = {
  focus: { title: 'Back to focus 🍵', body: 'The lamp is on. Time to settle in.' },
  shortBreak: { title: 'Break time 🐈', body: 'Stretch, sip, look out the window.' },
  longBreak: { title: 'Long break 🌙', body: 'You earned it. Step away for a bit.' },
}

export function useNotifications(enabled: boolean) {
  /** Ask for permission — call only from a user-gesture handler (settings toggle). */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    return (await Notification.requestPermission()) === 'granted'
  }, [])

  const notifyPhase = useCallback(
    (phase: Phase) => {
      if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return
      const { title, body } = MESSAGES[phase]
      try {
        new Notification(title, { body, silent: true, tag: 'lofidoro-phase' })
      } catch {
        // some platforms (mobile) require a service worker; fine to skip
      }
    },
    [enabled],
  )

  return { requestPermission, notifyPhase }
}
