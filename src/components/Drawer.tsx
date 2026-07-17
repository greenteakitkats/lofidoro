import { useId, type ReactNode } from 'react'
import { Chevron } from './Icon'
import './drawer.css'

interface DrawerProps {
  label: string
  /** short muted text on the right of the header, e.g. a hint or state */
  hint?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

/**
 * One accordion section. Collapsed by default so the room stays the hero;
 * the parent keeps only one open at a time. Body uses a grid-rows trick so
 * it animates height smoothly without measuring.
 */
export function Drawer({ label, hint, open, onToggle, children }: DrawerProps) {
  const bodyId = useId()
  return (
    <div className={'drawer' + (open ? ' open' : '')}>
      <button
        className="drawer-header"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <span className="drawer-label">{label}</span>
        {hint && <span className="drawer-hint">{hint}</span>}
        <Chevron className="drawer-chevron" />
      </button>
      <div
        className="drawer-body"
        id={bodyId}
        role="region"
        // keep in the DOM so it can animate; inert removes it from tab order
        // and the a11y tree while collapsed
        inert={!open}
      >
        <div className="drawer-body-inner">{children}</div>
      </div>
    </div>
  )
}
