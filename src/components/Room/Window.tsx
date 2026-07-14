import { WINDOW_VIEWS, type WindowViewId } from './views'
import { Plant } from './details/Plant'

/**
 * Window with a time-of-day sky, a swappable view outside, and weather /
 * drift overlays. Z-order inside the clip: sky → tod celestials → active
 * view → drift overlays → rain → lightning. Only the active view mounts,
 * so view animations never stack.
 */
export function Window({ view }: { view: WindowViewId }) {
  const ActiveView = (WINDOW_VIEWS.find((v) => v.id === view) ?? WINDOW_VIEWS[0]).component

  return (
    <g>
      {/* sky behind the panes */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="sky-top-stop" />
          <stop offset="100%" className="sky-bottom-stop" />
        </linearGradient>
        <clipPath id="window-clip">
          <rect x="104" y="84" width="176" height="164" rx="6" />
        </clipPath>
      </defs>

      <g clipPath="url(#window-clip)">
        <rect x="104" y="84" width="176" height="164" fill="url(#sky)" />
        <rect x="104" y="84" width="176" height="164" className="sky-dim" />

        {/* night: moon + stars (hidden for views that bring their own sky) */}
        <g className="night-sky">
          <circle cx="240" cy="120" r="17" fill="#f4ecd7" />
          <circle cx="233" cy="114" r="5" fill="#e2d7bd" opacity="0.5" />
          <circle cx="247" cy="127" r="3.4" fill="#e2d7bd" opacity="0.45" />
          <circle className="star" cx="128" cy="104" r="1.7" fill="#fff" />
          <circle className="star" cx="156" cy="132" r="1.3" fill="#fff" />
          <circle className="star" cx="188" cy="99" r="1.6" fill="#fff" />
          <circle className="star" cx="139" cy="164" r="1.2" fill="#fff" />
          <circle className="star" cx="205" cy="150" r="1.4" fill="#fff" />
          <circle className="star" cx="172" cy="186" r="1.2" fill="#fff" />
          <circle className="star" cx="252" cy="170" r="1.5" fill="#fff" />
          <circle className="star" cx="121" cy="210" r="1.3" fill="#fff" />
        </g>

        {/* morning sun (also hidden for night-flavored views) */}
        <g className="morning-sun">
          <circle cx="146" cy="128" r="16" fill="#ffdf9e" />
          <circle cx="146" cy="128" r="24" fill="#ffdf9e" opacity="0.25" />
        </g>

        {/* the view outside */}
        <ActiveView />

        {/* session drift: extra faint stars easing in as the day's sessions add up */}
        <g className="drift-stars" fill="#fff">
          <circle cx="120" cy="96" r="1.1" />
          <circle cx="164" cy="118" r="0.9" />
          <circle cx="216" cy="103" r="1.2" />
          <circle cx="146" cy="142" r="0.8" />
          <circle cx="242" cy="136" r="1" />
          <circle cx="196" cy="158" r="0.9" />
        </g>

        {/* session drift: golden warmth washing over the view */}
        <rect className="drift-warmth" x="104" y="84" width="176" height="164" />

        {/* rain (visible when the rain ambience layer is audible) */}
        <g className="rain" stroke="#bcd3ef" strokeWidth="1.4" strokeLinecap="round">
          {Array.from({ length: 14 }, (_, i) => {
            const x = 110 + i * 12.4
            const y = 90 + (i % 4) * 34
            return <line key={i} x1={x} y1={y} x2={x - 3} y2={y + 15} />
          })}
        </g>

        {/* lightning flash — audible thunder occasionally lights the window */}
        <rect className="lightning" x="104" y="84" width="176" height="164" fill="#eef3ff" />
      </g>

      {/* frame + cross bars + sill */}
      <rect x="98" y="78" width="188" height="176" rx="9" fill="none" stroke="#2c2335" strokeWidth="12" />
      <line x1="192" y1="84" x2="192" y2="248" stroke="#2c2335" strokeWidth="7" />
      <line x1="104" y1="166" x2="280" y2="166" stroke="#2c2335" strokeWidth="7" />
      <rect x="88" y="252" width="208" height="12" rx="5" fill="#2c2335" />

      {/* the sill plant, growing with the day */}
      <Plant />
    </g>
  )
}
