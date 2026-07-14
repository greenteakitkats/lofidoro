/** City skyline: two depth rows of buildings, lit windows, neon signs at night. */
export function CityView() {
  return (
    <g>
      {/* far row */}
      <g fill="#2a2440" opacity="0.75">
        <rect x="108" y="168" width="20" height="80" />
        <rect x="132" y="150" width="16" height="98" />
        <rect x="152" y="176" width="24" height="72" />
        <rect x="180" y="142" width="18" height="106" />
        <rect x="202" y="164" width="22" height="84" />
        <rect x="228" y="154" width="16" height="94" />
        <rect x="248" y="172" width="28" height="76" />
      </g>
      {/* near row */}
      <g fill="#1d1a33">
        <rect x="104" y="196" width="26" height="52" />
        <rect x="136" y="184" width="22" height="64" />
        <rect x="164" y="204" width="30" height="44" />
        <rect x="200" y="188" width="20" height="60" />
        <rect x="226" y="198" width="26" height="50" />
        <rect x="258" y="190" width="22" height="58" />
      </g>
      {/* lit windows (always on; read as office lights) */}
      <g fill="#f1d9a0" opacity="0.5">
        <rect x="140" y="190" width="3" height="4" />
        <rect x="147" y="198" width="3" height="4" />
        <rect x="140" y="208" width="3" height="4" />
        <rect x="170" y="210" width="3" height="4" />
        <rect x="179" y="218" width="3" height="4" />
        <rect x="205" y="194" width="3" height="4" />
        <rect x="211" y="204" width="3" height="4" />
        <rect x="232" y="204" width="3" height="4" />
        <rect x="263" y="196" width="3" height="4" />
        <rect x="268" y="210" width="3" height="4" />
      </g>
      {/* neon signs — only glow at night (CSS) */}
      <g className="city-neon">
        <rect x="166" y="196" width="12" height="4" rx="1" fill="#5fe0d8" />
        <rect x="240" y="188" width="4" height="12" rx="1" fill="#e86fa8" />
      </g>
    </g>
  )
}
