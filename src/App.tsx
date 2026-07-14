import { useEffect } from 'react'
import { SettingsProvider, useSettings } from './state/SettingsContext'
import { TimerProvider, useTimer } from './state/TimerContext'
import { RoomScene } from './components/Room/RoomScene'
import { Controls } from './components/Controls'
import { SettingsPanel } from './components/SettingsPanel'
import { MixerPanel } from './components/MixerPanel'
import { useAmbience } from './audio/useAmbience'
import { setDucked } from './audio/mixer'

function CozyRoom() {
  const { settings } = useSettings()
  const { state } = useTimer()
  const { mix, setVolume, rainActive } = useAmbience()

  // gently duck the ambience during breaks when the duck setting is on
  useEffect(() => {
    if (settings.breakAudio !== 'duck') {
      setDucked(false)
      return
    }
    setDucked(state.status === 'running' && state.phase !== 'focus')
  }, [settings.breakAudio, state.status, state.phase])

  return (
    <>
      <RoomScene rain={rainActive} />
      <Controls />
      <MixerPanel mix={mix} setVolume={setVolume} />
      <SettingsPanel />
    </>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <TimerProvider>
        <header className="app-header">
          <h1 className="app-title">lofidoro</h1>
          <span className="app-tagline">a cozy little focus room</span>
        </header>
        <CozyRoom />
      </TimerProvider>
    </SettingsProvider>
  )
}
