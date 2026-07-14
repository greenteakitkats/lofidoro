/**
 * The windowsill plant grows with the day's focus sessions (data-growth 0–3):
 * sprout → first leaves → fuller foliage → a little flower. Stages are
 * cumulative, revealed by opacity via CSS.
 */
export function Plant() {
  return (
    <g>
      {/* pot (always) */}
      <path d="M128 252 h 17 l -2.5 11 h -12 Z" fill="#b3705f" />

      {/* stage 0: a hopeful sprout */}
      <g className="plant-stage plant-stage-0">
        <path d="M136 252 c -1 -5 -4 -7 -5 -10 c 4 1 5 4 5 6 c 1 -4 3 -6 6 -7 c -1 5 -4 7 -6 11 Z" fill="#6f9d6b" />
      </g>

      {/* stage 1: the original leaves */}
      <g className="plant-stage plant-stage-1">
        <path d="M136 252 c -3 -10 -12 -13 -15 -21 c 8 1 13 6 15 12 c 2 -9 7 -15 15 -17 c -2 10 -9 14 -13 26 Z" fill="#6f9d6b" />
      </g>

      {/* stage 2: fuller foliage */}
      <g className="plant-stage plant-stage-2">
        <path d="M135 252 c -6 -8 -16 -8 -21 -14 c 8 -2 15 1 19 7 c 0 -7 2 -13 7 -17 c 1 8 -2 14 -5 24 Z" fill="#7fae77" />
        <path d="M138 252 c 5 -9 14 -10 18 -16 c -7 -1 -13 3 -16 8 c -1 -6 -3 -10 -7 -13 c 0 7 3 12 5 21 Z" fill="#628c5e" />
      </g>

      {/* stage 3: a bloom */}
      <g className="plant-stage plant-stage-3">
        <line x1="133" y1="252" x2="130" y2="236" stroke="#628c5e" strokeWidth="1.6" strokeLinecap="round" />
        <g fill="#e8a7b8">
          <circle cx="127" cy="233" r="2.6" />
          <circle cx="133" cy="233" r="2.6" />
          <circle cx="130" cy="229" r="2.6" />
          <circle cx="128" cy="237" r="2.6" />
          <circle cx="132" cy="237" r="2.6" />
        </g>
        <circle cx="130" cy="233.5" r="1.9" fill="#f7d774" />
      </g>
    </g>
  )
}
