/** Floor-standing bookcase on the left wall. Fully static — no animation. */
export function Bookshelf() {
  return (
    <g>
      {/* case */}
      <rect x="16" y="282" width="88" height="174" rx="4" fill="#4a3a30" />
      <rect x="22" y="290" width="76" height="72" rx="2" fill="#392c24" />
      <rect x="22" y="370" width="76" height="72" rx="2" fill="#392c24" />

      {/* top shelf: leaning books + a trailing plant */}
      <g>
        <rect x="26" y="316" width="9" height="46" rx="1.5" fill="#7a89a8" />
        <rect x="37" y="322" width="8" height="40" rx="1.5" fill="#a8707f" />
        <rect x="47" y="318" width="9" height="44" rx="1.5" fill="#8f9d72" />
        <rect x="58" y="326" width="7" height="36" rx="1.5" fill="#c98d6b" />
        {/* leaning book */}
        <rect x="68" y="322" width="8" height="42" rx="1.5" fill="#8a7f9d" transform="rotate(9 72 364)" />
        {/* trailing plant in the corner */}
        <path d="M86 318 c 0 -6 4 -9 8 -10 c -1 5 -3 8 -8 10 Z" fill="#6f9d6b" />
        <path d="M88 320 c 4 2 5 8 3 14 c -3 -3 -4 -9 -3 -14 Z" fill="#628c5e" />
        <path d="M84 316 h 10 l -1.5 6 h -7 Z" fill="#b3705f" />
      </g>

      {/* bottom shelf: stacked + upright books, tiny trinket */}
      <g>
        <rect x="26" y="428" width="30" height="7" rx="1.5" fill="#a8707f" />
        <rect x="29" y="421" width="26" height="7" rx="1.5" fill="#7a89a8" />
        <rect x="32" y="414" width="20" height="7" rx="1.5" fill="#d8bd6a" />
        <rect x="64" y="398" width="8" height="44" rx="1.5" fill="#8f9d72" />
        <rect x="74" y="404" width="8" height="38" rx="1.5" fill="#c98d6b" />
        <rect x="84" y="400" width="7" height="42" rx="1.5" fill="#7a89a8" />
        {/* trinket: little round vase */}
        <circle cx="58" cy="435" r="4.5" fill="#c9a7d8" opacity="0.85" />
      </g>

      {/* feet */}
      <rect x="20" y="456" width="10" height="6" rx="2" fill="#392c24" />
      <rect x="90" y="456" width="10" height="6" rx="2" fill="#392c24" />
    </g>
  )
}
