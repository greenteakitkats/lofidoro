import { useEffect, useState, type CSSProperties } from 'react'
import { useTimer } from '../../state/TimerContext'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'
import { useSessionProgression } from '../../hooks/useSessionProgression'
import { Window } from './Window'
import { Desk } from './Desk'
import { Lamp } from './Lamp'
import { Cat } from './Cat'
import { SceneTimer } from './SceneTimer'
import './room.css'

type SceneMode = 'focus' | 'break' | 'idle'

interface RoomSceneProps {
  /** rain ambience layer is audible */
  rain?: boolean
  /** thunder ambience layer is audible (occasional window lightning) */
  thunder?: boolean
  /** spotify is playing */
  music?: boolean
}

export function RoomScene({ rain = false, thunder = false, music = false }: RoomSceneProps) {
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
      data-rain={rain}
      data-thunder={thunder}
      data-music={music}
      data-growth={growthStage}
      data-cat-pose={catPose}
      style={{ '--session-drift': drift } as CSSProperties}
      aria-label={`A cozy room. ${mode === 'focus' ? 'The lamp is on and the cat is keeping you company.' : mode === 'break' ? 'The cat is napping — break time.' : 'The room is waiting for you.'}`}
    >
      <g className="scene">
        {/* walls + floor */}
        <rect className="wall" x="0" y="0" width="800" height="420" />
        <rect className="wall-2" x="0" y="404" width="800" height="18" rx="4" />
        <rect className="floor" x="0" y="418" width="800" height="82" />

        <Window />
        <Desk />
        <Cat />
        <Lamp />
        <SceneTimer />

        {/* session drift: the day mellowing into golden evening, on top of everything */}
        <rect className="drift-room-glow" x="0" y="0" width="800" height="500" />
      </g>
    </svg>
  )
}
