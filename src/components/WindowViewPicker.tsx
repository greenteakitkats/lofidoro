import { WINDOW_VIEWS, type WindowViewId } from './Room/views'
import './panels.css'

interface WindowViewPickerProps {
  view: WindowViewId
  setView: (view: WindowViewId) => void
}

/** Compact chip strip for choosing what's outside the window. */
export function WindowViewPicker({ view, setView }: WindowViewPickerProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">out the window</h2>
      <div className="preset-row">
        {WINDOW_VIEWS.map((v) => (
          <button
            key={v.id}
            className={'chip chip-view' + (view === v.id ? ' active' : '')}
            onClick={() => setView(v.id)}
            aria-pressed={view === v.id}
          >
            <span aria-hidden="true">{v.emoji}</span> {v.label}
          </button>
        ))}
      </div>
    </section>
  )
}
