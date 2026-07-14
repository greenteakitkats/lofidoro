/** Conifer forest; fireflies blink at night. */
export function ForestView() {
  const tree = (x: number, y: number, s: number, fill: string) => (
    <path
      key={`${x}-${y}`}
      d={`M${x} ${y} l ${7 * s} ${-22 * s} l ${7 * s} ${22 * s} l ${-4.5 * s} 0 l ${5.5 * s} ${14 * s} l ${-16 * s} 0 l ${5.5 * s} ${-14 * s} Z`}
      fill={fill}
    />
  )
  return (
    <g>
      {/* far row */}
      <g opacity="0.7">
        {[112, 140, 168, 196, 224, 252].map((x) => tree(x, 212, 0.8, '#2f3a4e'))}
      </g>
      {/* near row */}
      <g>{[100, 134, 170, 206, 242, 270].map((x) => tree(x, 232, 1.1, '#26303f'))}</g>
      <rect x="104" y="242" width="176" height="6" fill="#222a37" />
      {/* fireflies — night only (CSS) */}
      <g className="fireflies" fill="#ffe9a0">
        <circle className="firefly firefly-1" cx="150" cy="222" r="1.6" />
        <circle className="firefly firefly-2" cx="230" cy="230" r="1.4" />
      </g>
    </g>
  )
}
