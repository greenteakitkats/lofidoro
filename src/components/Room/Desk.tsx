/** Desk with mug (steam), candle, book stack, and a little radio with an equalizer. */
export function Desk() {
  return (
    <g>
      {/* desk top + legs */}
      <rect x="420" y="318" width="290" height="14" rx="5" fill="#6b4f3f" />
      <rect x="420" y="318" width="290" height="5" rx="2.5" fill="#7d5d4a" />
      <rect x="436" y="332" width="11" height="86" rx="3" fill="#5a4234" />
      <rect x="684" y="332" width="11" height="86" rx="3" fill="#5a4234" />

      {/* radio (equalizer bars animate while music plays) */}
      <g>
        <rect x="438" y="284" width="58" height="34" rx="7" fill="#8a5a4a" />
        <circle cx="452" cy="301" r="7.5" fill="#e8d9c3" />
        <circle cx="452" cy="301" r="3" fill="#4a3428" />
        <rect x="464" y="292" width="24" height="18" rx="3" fill="#4a3428" />
        <g className="eq" fill="#e8b88a">
          <rect x="468" y="296" width="4" height="10" rx="1.5" />
          <rect x="474" y="296" width="4" height="10" rx="1.5" />
          <rect x="480" y="296" width="4" height="10" rx="1.5" />
        </g>
        <line x1="490" y1="284" x2="498" y2="270" stroke="#4a3428" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* mug with steam */}
      <g>
        <g className="steam" fill="none" stroke="#d8cfe8" strokeWidth="2.4" strokeLinecap="round">
          <path d="M547 288 c -4 -7 3 -11 -1 -19" />
          <path d="M556 286 c -4 -7 3 -11 -1 -19" />
          <path d="M551 290 c -4 -7 3 -11 -1 -19" />
        </g>
        <path d="M538 292 h 26 v 17 a 9 9 0 0 1 -9 9 h -8 a 9 9 0 0 1 -9 -9 Z" fill="#c98d6b" />
        <path d="M564 295 h 5 a 6.5 6.5 0 0 1 0 13 h -5" fill="none" stroke="#c98d6b" strokeWidth="4" />
      </g>

      {/* book stack */}
      <g>
        <rect x="596" y="308" width="52" height="10" rx="2.5" fill="#7a89a8" />
        <rect x="601" y="298" width="44" height="10" rx="2.5" fill="#a8707f" />
        <rect x="606" y="288" width="36" height="10" rx="2.5" fill="#8f9d72" />
      </g>

      {/* candle (flame lit during focus) */}
      <g>
        <ellipse className="flame" cx="672" cy="281" rx="4.5" ry="8" fill="#ffce7a" />
        <ellipse className="flame" cx="672" cy="283" rx="2.2" ry="4.5" fill="#fff3d0" />
        <rect x="665" y="290" width="14" height="28" rx="4" fill="#e8e0d0" />
        <line x1="672" y1="290" x2="672" y2="286" stroke="#5a4a3a" strokeWidth="1.6" />
      </g>
    </g>
  )
}
