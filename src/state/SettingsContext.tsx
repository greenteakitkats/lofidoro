import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Intervals, Settings } from '../types'
import { CUSTOM_PRESET_ID, DEFAULT_SETTINGS, PRESETS, STORAGE_KEYS } from '../config'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface SettingsApi {
  settings: Settings
  /** the intervals currently in effect (selected preset or custom) */
  intervals: Intervals
  update: (patch: Partial<Settings>) => void
  updateCustom: (patch: Partial<Intervals>) => void
}

const SettingsContext = createContext<SettingsApi | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)

  const api = useMemo<SettingsApi>(() => {
    const preset = PRESETS.find((p) => p.id === settings.presetId)
    const intervals = settings.presetId === CUSTOM_PRESET_ID || !preset
      ? settings.custom
      : preset.intervals
    return {
      settings,
      intervals,
      update: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
      updateCustom: (patch) =>
        setSettings((prev) => ({
          ...prev,
          presetId: CUSTOM_PRESET_ID,
          custom: { ...prev.custom, ...patch },
        })),
    }
  }, [settings, setSettings])

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsApi {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
