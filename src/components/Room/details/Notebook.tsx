/**
 * An open notebook on the desk that quietly fills with ink as focus
 * sessions complete (data-growth 0–3). No numbers — just a day's work
 * accumulating on paper.
 */
export function Notebook() {
  return (
    <g>
      {/* open pages */}
      <path d="M500 310 q 17 -5 34 0 l 0 8 q -17 -4 -34 0 Z" fill="#efe6d4" />
      <path d="M500 310 q 17 -5 34 0" fill="none" stroke="#d8ccb4" strokeWidth="1" />
      <line x1="517" y1="306.5" x2="517" y2="317" stroke="#d8ccb4" strokeWidth="1" />
      {/* ink lines, revealed as the day fills */}
      <g stroke="#8a7f9d" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <path className="ink ink-0" d="M503 309.5 h 10" />
        <path className="ink ink-1" d="M503 312 h 11 M520 309.5 h 10" />
        <path className="ink ink-2" d="M503 314.5 h 9 M520 312 h 11" />
        <path className="ink ink-3" d="M520 314.5 h 8" />
      </g>
    </g>
  )
}
