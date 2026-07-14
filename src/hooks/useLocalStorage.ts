import { useCallback, useState } from 'react'

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return { ...fallback, ...(JSON.parse(raw) as T) }
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — settings just won't persist
  }
}

/** useState persisted to localStorage (object values shallow-merged over the fallback on load). */
export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => loadJSON(key, fallback))
  const set = useCallback(
    (update: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = update instanceof Function ? update(prev) : update
        saveJSON(key, next)
        return next
      })
    },
    [key],
  )
  return [value, set] as const
}
