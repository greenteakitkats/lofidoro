/** Ocean horizon with gently drifting wave bands; a little sail in the afternoon. */
export function OceanView() {
  return (
    <g>
      <rect x="104" y="196" width="176" height="52" fill="#33436b" />
      <g className="ocean-waves" fill="none" strokeLinecap="round">
        <path className="wave wave-1" d="M96 210 Q116 206 136 210 T176 210 T216 210 T256 210 T296 210" stroke="#4a5d8a" strokeWidth="3" />
        <path className="wave wave-2" d="M96 224 Q120 220 144 224 T192 224 T240 224 T288 224" stroke="#41527c" strokeWidth="3.4" />
        <path className="wave wave-3" d="M96 238 Q112 234 128 238 T160 238 T192 238 T224 238 T256 238 T288 238" stroke="#3a4a71" strokeWidth="4" />
      </g>
      {/* sail, out in the afternoon */}
      <g className="ocean-sail">
        <path d="M210 196 l 0 -14 l 9 14 Z" fill="#e8e0d0" />
        <rect x="205" y="196" width="18" height="3" rx="1.5" fill="#5a4234" />
      </g>
    </g>
  )
}
