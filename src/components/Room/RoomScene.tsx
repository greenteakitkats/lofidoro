import { useEffect, useState, type CSSProperties } from 'react'
import { useTimer } from '../../state/TimerContext'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'
import { useSessionProgression } from '../../hooks/useSessionProgression'
import { Window } from './Window'
import { Bookshelf } from './Bookshelf'
import type { WindowViewId } from './views'
import { Desk } from './Desk'
import { Lamp } from './Lamp'
import { Cat } from './Cat'
import { SceneTimer } from './SceneTimer'
import './room.css'

type SceneMode = 'focus' | 'break' | 'idle'

interface RoomSceneProps {
  /** what's outside the window */
  view: WindowViewId
  /** rain ambience layer is audible */
  rain?: boolean
  /** thunder ambience layer is audible (occasional window lightning) */
  thunder?: boolean
  /** spotify is playing */
  music?: boolean
}

export function RoomScene({ view, rain = false, thunder = false, music = false }: RoomSceneProps) {
  const { state } = useTimer()
  const tod = useTimeOfDay()
  const { drift, growthStage, catPose } = useSessionProgression()
  const [hidden, setHidden] = useState(document.hidden)

  // pause all scene animations while the tab is hidden
  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const mode: SceneMode =
    state.status === 'running'
      ? state.phase === 'focus'
        ? 'focus'
        : 'break'
      : 'idle'

  return (
    <svg
      className={'room' + (hidden ? ' hidden' : '')}
      viewBox="0 0 800 500"
      xmlns="http://www.w3.org/2000/svg"
      data-mode={mode}
      data-tod={tod}
      data-view={view}
      data-rain={rain}
      data-thunder={thunder}
      data-music={music}
      data-growth={growthStage}
      data-cat-pose={catPose}
      style={{ '--session-drift': drift } as CSSProperties}
      aria-label={`A cozy room. ${mode === 'focus' ? 'The lamp is on and the cat is keeping you company.' : mode === 'break' ? 'The cat is napping — break time.' : 'The room is waiting for you.'}`}
    >
      <g className="scene">
        <defs>
          <radialGradient id="lamp-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="window-wash" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#dbe6f5" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#dbe6f5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.48" r="0.75">
            <stop offset="62%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#120d18" stopOpacity="0.28" />
          </radialGradient>
        </defs>

        {/* walls + floor */}
        <rect className="wall" x="0" y="0" width="800" height="420" />
        {/* wainscoting on the lower wall */}
        <rect className="wall-2" x="0" y="330" width="800" height="74" opacity="0.55" />
        <rect x="0" y="328" width="800" height="4" rx="2" fill="#2c2335" opacity="0.5" />
        <g fill="#2c2335" opacity="0.22">
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={30 + i * 110} y="342" width="72" height="52" rx="4" />
          ))}
        </g>
        <rect className="wall-2" x="0" y="404" width="800" height="18" rx="4" />
        <rect className="floor" x="0" y="418" width="800" height="82" />
        {/* floorboards */}
        <g stroke="#4a3a36" strokeWidth="1.2" opacity="0.5">
          <line x1="0" y1="444" x2="800" y2="444" />
          <line x1="0" y1="470" x2="800" y2="470" />
        </g>

        {/* soft light pools (static gradients — depth without filters) */}
        <ellipse fill="url(#window-wash)" cx="192" cy="200" rx="190" ry="160" />

        <Bookshelf />
        <Window view={view} />
        <Desk />
        {/* shadows under furniture */}
        <ellipse cx="565" cy="422" rx="150" ry="9" fill="#120d18" opacity="0.22" />
        <ellipse cx="60" cy="460" rx="52" ry="7" fill="#120d18" opacity="0.25" />
        <Cat />
        <Lamp />
        <ellipse fill="url(#lamp-pool)" cx="720" cy="380" rx="180" ry="140" />
        <SceneTimer />

        {/* wall art between window and clock */}
        <g>
          <rect x="330" y="128" width="46" height="58" rx="3" fill="#2c2335" />
          <rect x="334" y="132" width="38" height="50" rx="2" fill="#443a52" />
          <path d="M338 172 l 10 -14 l 7 8 l 6 -10 l 7 16 Z" fill="#8f9d72" opacity="0.9" />
          <circle cx="362" cy="142" r="4.5" fill="#e8b88a" opacity="0.9" />
        </g>
        <g>
          <rect x="330" y="206" width="46" height="34" rx="3" fill="#2c2335" />
          <rect x="334" y="210" width="38" height="26" rx="2" fill="#3d3450" />
          <path d="M340 230 q 13 -14 26 0" fill="none" stroke="#c9a7d8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="353" cy="219" r="2.5" fill="#f7d774" />
        </g>

        {/* session drift: the day mellowing into golden evening, on top of everything */}
        <rect className="drift-room-glow" x="0" y="0" width="800" height="500" />
        {/* gentle vignette for depth */}
        <rect fill="url(#vignette)" x="0" y="0" width="800" height="500" pointerEvents="none" />
      </g>
    </svg>
  )
}
