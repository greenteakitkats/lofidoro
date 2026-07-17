import { WINDOW_VIEWS, type WindowViewId } from './Room/views'

interface WindowViewPickerProps {
  view: WindowViewId
  setView: (view: WindowViewId) => void
}

// thumbnails need a lighter sky than the room so silhouettes read at 100px;
// space/aurora are night-flavored and keep a dark sky
const THUMB_SKY: Partial<Record<WindowViewId, string>> = {
  space: '#0b0f1e',
  aurora: '#101d33',
}
const DEFAULT_THUMB_SKY = '#8793b6'

/**
 * Each swatch is the actual view component rendered into a tiny window-shaped
 * SVG (same 104–280 / 84–248 coordinates it uses in the room), so the picker
 * previews the real scenery instead of standing in with an emoji.
 */
export function WindowViewPicker({ view, setView }: WindowViewPickerProps) {
  return (
    <div className="view-picker">
      {WINDOW_VIEWS.map((v) => {
        const ViewComponent = v.component
        return (
          <button
            key={v.id}
            className={'view-swatch' + (view === v.id ? ' active' : '')}
            onClick={() => setView(v.id)}
            aria-pressed={view === v.id}
            title={v.label}
          >
            <svg
              viewBox="104 84 176 164"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <rect
                x="104"
                y="84"
                width="176"
                height="164"
                fill={THUMB_SKY[v.id] ?? DEFAULT_THUMB_SKY}
              />
              <ViewComponent />
            </svg>
            <span>{v.label}</span>
          </button>
        )
      })}
    </div>
  )
}
