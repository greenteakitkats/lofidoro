import { CUSTOM_PRESET_ID, MAX_MINUTES, MIN_MINUTES, PRESETS } from '../config'
import { useSettings } from '../state/SettingsContext'
import { useNotifications } from '../hooks/useNotifications'
import type { Intervals } from '../types'
import './panels.css'

function clampMinutes(v: number): number {
  if (!Number.isFinite(v)) return MIN_MINUTES
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(v)))
}

const CUSTOM_FIELDS: Array<{ key: keyof Intervals; label: string; max: number }> = [
  { key: 'focus', label: 'focus', max: MAX_MINUTES },
  { key: 'shortBreak', label: 'short break', max: MAX_MINUTES },
  { key: 'longBreak', label: 'long break', max: MAX_MINUTES },
  { key: 'sessionsUntilLongBreak', label: 'sessions / long break', max: 12 },
]

export function SettingsPanel() {
  const { settings, update, updateCustom } = useSettings()
  const { requestPermission } = useNotifications(settings.notifications)

  const onNotificationsToggle = async (checked: boolean) => {
    if (!checked) {
      update({ notifications: false })
      return
    }
    const ok = await requestPermission()
    update({ notifications: ok })
  }

  return (
    <section className="panel">
      <h2 className="panel-title">timer</h2>
      <div className="preset-row">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className={'chip' + (settings.presetId === p.id ? ' active' : '')}
            onClick={() => update({ presetId: p.id })}
            title={`${p.intervals.focus}/${p.intervals.shortBreak}, long break ${p.intervals.longBreak} every ${p.intervals.sessionsUntilLongBreak}`}
          >
            {p.label}
            <span className="chip-sub">
              {p.intervals.focus}/{p.intervals.shortBreak}
            </span>
          </button>
        ))}
        <button
          className={'chip' + (settings.presetId === CUSTOM_PRESET_ID ? ' active' : '')}
          onClick={() => update({ presetId: CUSTOM_PRESET_ID })}
        >
          Custom
          <span className="chip-sub">
            {settings.custom.focus}/{settings.custom.shortBreak}
          </span>
        </button>
      </div>

      {settings.presetId === CUSTOM_PRESET_ID && (
        <div className="custom-grid">
          {CUSTOM_FIELDS.map(({ key, label, max }) => (
            <label key={key} className="field">
              <span>{label}</span>
              <input
                type="number"
                min={key === 'sessionsUntilLongBreak' ? 2 : MIN_MINUTES}
                max={max}
                value={settings.custom[key]}
                onChange={(e) =>
                  updateCustom({
                    [key]:
                      key === 'sessionsUntilLongBreak'
                        ? Math.min(12, Math.max(2, Math.round(Number(e.target.value) || 2)))
                        : clampMinutes(Number(e.target.value)),
                  })
                }
              />
              {key !== 'sessionsUntilLongBreak' && <span className="field-unit">min</span>}
            </label>
          ))}
        </div>
      )}

      <div className="toggle-list">
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(e) => update({ autoAdvance: e.target.checked })}
          />
          <span>auto-start the next phase</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.chime}
            onChange={(e) => update({ chime: e.target.checked })}
          />
          <span>gentle chime between phases</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => void onNotificationsToggle(e.target.checked)}
          />
          <span>desktop notifications</span>
        </label>
      </div>
    </section>
  )
}
