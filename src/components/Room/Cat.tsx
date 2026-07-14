/**
 * The resident cat: sits alert on the rug during focus,
 * curls up asleep (with drifting z's) on breaks.
 */
export function Cat() {
  const fur = '#4a3a44'
  const furDark = '#3c2f38'
  const inner = '#c98d9b'

  return (
    <g>
      {/* rug */}
      <ellipse cx="330" cy="446" rx="98" ry="20" fill="#7a5a6a" />
      <ellipse cx="330" cy="446" rx="78" ry="15" fill="#8d6a7c" />

      {/* awake: sitting upright, tail swaying */}
      <g className="cat-awake">
        <path className="cat-tail" d="M366 436 q 26 -4 24 -30" fill="none" stroke={fur} strokeWidth="8" strokeLinecap="round" />
        {/* body */}
        <path d="M304 442 q -4 -34 26 -36 q 30 2 26 36 q -1 5 -6 5 h -40 q -5 0 -6 -5 Z" fill={fur} />
        {/* head */}
        <circle cx="330" cy="392" r="17" fill={fur} />
        <path d="M316 382 l -3 -12 l 11 6 Z" fill={furDark} />
        <path d="M344 382 l 3 -12 l -11 6 Z" fill={furDark} />
        <path d="M318 379 l -1.5 -6 l 5.5 3 Z" fill={inner} />
        <path d="M342 379 l 1.5 -6 l -5.5 3 Z" fill={inner} />
        {/* face: open eyes, tiny nose */}
        <circle cx="324" cy="391" r="2" fill="#ffdf9e" />
        <circle cx="336" cy="391" r="2" fill="#ffdf9e" />
        <path d="M328.6 397 l 1.4 1.6 l 1.4 -1.6" fill="none" stroke={inner} strokeWidth="1.4" strokeLinecap="round" />
        {/* front paws */}
        <ellipse cx="322" cy="446" rx="6" ry="3.4" fill={furDark} />
        <ellipse cx="338" cy="446" rx="6" ry="3.4" fill={furDark} />
      </g>

      {/* asleep: curled ball, breathing */}
      <g className="cat-asleep">
        <g className="cat-body">
          <ellipse cx="330" cy="432" rx="34" ry="20" fill={fur} />
          {/* tail wrapped around */}
          <path d="M300 438 q -6 -14 12 -18" fill="none" stroke={furDark} strokeWidth="7" strokeLinecap="round" />
          {/* tucked head */}
          <circle cx="352" cy="428" r="13" fill={fur} />
          <path d="M344 419 l -2 -9 l 8 4.5 Z" fill={furDark} />
          <path d="M362 421 l 3 -8.5 l -9 3.5 Z" fill={furDark} />
          {/* closed eyes */}
          <path d="M348 428 q 2 2 4 0" fill="none" stroke="#2b222d" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M356 428 q 2 2 4 0" fill="none" stroke="#2b222d" strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <g className="zz">
          <text x="372" y="404">z</text>
          <text x="380" y="396">z</text>
          <text x="374" y="400">z</text>
        </g>
      </g>
    </g>
  )
}
