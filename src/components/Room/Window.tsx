/** Window with time-of-day sky, stars/moon at night, sun in the morning, rain overlay. */
export function Window() {
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

        {/* night: moon + stars */}
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

        {/* morning sun */}
        <g className="morning-sun">
          <circle cx="146" cy="128" r="16" fill="#ffdf9e" />
          <circle cx="146" cy="128" r="24" fill="#ffdf9e" opacity="0.25" />
        </g>

        {/* distant hills */}
        <path d="M104 218 Q150 196 200 214 T280 210 V248 H104 Z" fill="#3b3f63" opacity="0.55" />
        <path d="M104 230 Q160 214 216 228 T280 226 V248 H104 Z" fill="#333654" opacity="0.7" />

        {/* rain (visible when the rain ambience layer is audible) */}
        <g className="rain" stroke="#bcd3ef" strokeWidth="1.4" strokeLinecap="round">
          {Array.from({ length: 14 }, (_, i) => {
            const x = 110 + i * 12.4
            const y = 90 + (i % 4) * 34
            return <line key={i} x1={x} y1={y} x2={x - 3} y2={y + 15} />
          })}
        </g>
      </g>

      {/* frame + cross bars + sill */}
      <rect x="98" y="78" width="188" height="176" rx="9" fill="none" stroke="#2c2335" strokeWidth="12" />
      <line x1="192" y1="84" x2="192" y2="248" stroke="#2c2335" strokeWidth="7" />
      <line x1="104" y1="166" x2="280" y2="166" stroke="#2c2335" strokeWidth="7" />
      <rect x="88" y="252" width="208" height="12" rx="5" fill="#2c2335" />

      {/* little plant on the sill */}
      <g>
        <path d="M136 252 c -3 -10 -12 -13 -15 -21 c 8 1 13 6 15 12 c 2 -9 7 -15 15 -17 c -2 10 -9 14 -13 26 Z" fill="#6f9d6b" />
        <path d="M128 252 h 17 l -2.5 11 h -12 Z" fill="#b3705f" />
      </g>
    </g>
  )
}
