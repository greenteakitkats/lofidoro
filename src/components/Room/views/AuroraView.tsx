/** Northern lights over a dark ridge — always night-flavored. */
export function AuroraView() {
  return (
    <g>
      {/* own stars (this view forces a night sky regardless of tod) */}
      <g fill="#fff">
        <circle cx="124" cy="102" r="1.3" />
        <circle cx="158" cy="94" r="1" />
        <circle cx="205" cy="108" r="1.4" />
        <circle cx="238" cy="98" r="1.1" />
        <circle cx="264" cy="118" r="1.2" />
        <circle cx="140" cy="130" r="0.9" />
        <circle cx="222" cy="132" r="1" />
      </g>
      {/* aurora ribbons */}
      <g className="aurora" strokeLinecap="round" fill="none">
        <path className="ribbon ribbon-1" d="M112 180 C 140 120, 180 140, 210 96" stroke="#4fe0a8" strokeWidth="13" opacity="0.32" />
        <path className="ribbon ribbon-2" d="M150 196 C 180 140, 214 156, 248 108" stroke="#6fd6e8" strokeWidth="10" opacity="0.26" />
        <path className="ribbon ribbon-3" d="M190 200 C 220 156, 246 168, 272 128" stroke="#b98fe0" strokeWidth="8" opacity="0.22" />
      </g>
      {/* dark ridge */}
      <path d="M104 230 L148 204 L190 228 L236 200 L280 226 V248 H104 Z" fill="#141a2c" />
    </g>
  )
}
