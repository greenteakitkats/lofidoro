/** Floor lamp — glows warm during focus, dims for breaks. */
export function Lamp() {
  return (
    <g>
      <defs>
        <radialGradient id="lamp-light" cx="0.5" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ffd9a0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* pool of light (opacity animated by mode) */}
      <ellipse className="lamp-glow" cx="757" cy="320" rx="150" ry="180" fill="url(#lamp-light)" />

      {/* stand */}
      <line x1="757" y1="248" x2="757" y2="452" stroke="#39303f" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="757" cy="455" rx="26" ry="7" fill="#39303f" />
      {/* shade */}
      <path d="M731 250 L783 250 L774 214 L740 214 Z" fill="#c98d6b" />
      <ellipse className="lamp-bulb" cx="757" cy="252" rx="20" ry="6" fill="#ffdf9e" />
    </g>
  )
}
