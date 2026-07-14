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

      {/* asleep: three poses, one per data-cat-pose, cycling through the day */}
      <g className="cat-asleep">
        {/* pose a: curled ball */}
        <g className="cat-pose cat-pose-a">
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
        </g>

        {/* pose b: stretched out on one side */}
        <g className="cat-pose cat-pose-b">
          <g className="cat-body">
            <ellipse cx="328" cy="438" rx="42" ry="13" fill={fur} />
            {/* outstretched tail */}
            <path d="M286 440 q -16 -2 -20 -12" fill="none" stroke={furDark} strokeWidth="7" strokeLinecap="round" />
            {/* head resting on the rug */}
            <circle cx="366" cy="434" r="12.5" fill={fur} />
            <path d="M359 425 l -2.5 -8.5 l 8 4 Z" fill={furDark} />
            <path d="M375 427 l 3.5 -8 l -9 3 Z" fill={furDark} />
            <path d="M362 434 q 2 2 4 0" fill="none" stroke="#2b222d" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M370 434 q 2 2 4 0" fill="none" stroke="#2b222d" strokeWidth="1.4" strokeLinecap="round" />
            {/* front paws stretched */}
            <ellipse cx="352" cy="447" rx="7" ry="3" fill={furDark} />
          </g>
        </g>

        {/* pose c: loaf, facing away */}
        <g className="cat-pose cat-pose-c">
          <g className="cat-body">
            <path d="M304 448 q -3 -24 26 -25 q 29 1 26 25 q 0 3 -4 3 h -44 q -4 0 -4 -3 Z" fill={fur} />
            {/* back of head */}
            <circle cx="330" cy="420" r="14" fill={fur} />
            <path d="M318 411 l -2.5 -10 l 9 5 Z" fill={furDark} />
            <path d="M342 411 l 2.5 -10 l -9 5 Z" fill={furDark} />
            {/* tail curled alongside */}
            <path d="M352 448 q 12 -4 10 -16" fill="none" stroke={furDark} strokeWidth="7" strokeLinecap="round" />
          </g>
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
