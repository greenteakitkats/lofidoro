/** Deep space: starfield, a ringed planet, faint nebula. No horizon. */
export function SpaceView() {
  const stars: Array<[number, number, number]> = [
    [116, 100, 1.4], [142, 128, 1], [168, 96, 1.2], [190, 146, 0.9],
    [214, 108, 1.5], [238, 132, 1], [262, 100, 1.2], [126, 168, 1.1],
    [158, 196, 0.9], [200, 180, 1.3], [244, 170, 1], [268, 208, 1.2],
    [130, 224, 1], [226, 226, 0.9],
  ]
  return (
    <g>
      {/* faint nebula */}
      <ellipse cx="180" cy="150" rx="55" ry="30" fill="#7a5fb0" opacity="0.14" />
      <ellipse cx="205" cy="165" rx="38" ry="20" fill="#4f79b0" opacity="0.12" />
      <g fill="#fff">
        {stars.map(([x, y, r], i) => (
          <circle key={i} className="space-star" cx={x} cy={y} r={r} />
        ))}
      </g>
      {/* ringed planet */}
      <g>
        <circle cx="238" cy="200" r="14" fill="#d8a878" />
        <circle cx="233" cy="195" r="4" fill="#c2915f" opacity="0.7" />
        <ellipse cx="238" cy="202" rx="24" ry="6" fill="none" stroke="#e8d0a8" strokeWidth="2.5" opacity="0.75" transform="rotate(-14 238 202)" />
      </g>
    </g>
  )
}
