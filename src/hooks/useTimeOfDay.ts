import { useEffect, useState } from 'react'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

function classify(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

function currentHour(): number {
  // dev override for eyeballing palettes: ?hour=22
  const param = new URLSearchParams(window.location.search).get('hour')
  if (param !== null) {
    const h = Number(param)
    if (Number.isFinite(h) && h >= 0 && h <= 23) return h
  }
  return new Date().getHours()
}

/** Real-clock time of day, re-checked every minute. */
export function useTimeOfDay(): TimeOfDay {
  const [tod, setTod] = useState<TimeOfDay>(() => classify(currentHour()))
  useEffect(() => {
    const id = setInterval(() => setTod(classify(currentHour())), 60_000)
    return () => clearInterval(id)
  }, [])
  return tod
}
