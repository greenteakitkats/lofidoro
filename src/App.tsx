import { useEffect, useRef } from 'react'
import { SettingsProvider, useSettings } from './state/SettingsContext'
import { TimerProvider, useTimer } from './state/TimerContext'
import { RoomScene } from './components/Room/RoomScene'
import { Controls } from './components/Controls'
import { SettingsPanel } from './components/SettingsPanel'
import { MixerPanel } from './components/MixerPanel'
import { SpotifyPanel } from './components/SpotifyPanel'
import { useAmbience } from './audio/useAmbience'
import { setDucked } from './audio/mixer'
import { useSpotify } from './spotify/useSpotify'

function CozyRoom() {
  const { settings } = useSettings()
  const { state } = useTimer()
  const { mix, setVolume, rainActive } = useAmbience()
  const spotify = useSpotify()

  const onBreak = state.status === 'running' && state.phase !== 'focus'
  // only act on spotify if lofidoro actually found something playing (avoid
  // surprising a user who wasn't using spotify at all)
  const wasPlayingRef = useRef(false)

  useEffect(() => {
    if (settings.breakAudio === 'duck') {
      setDucked(onBreak)
    } else {
      setDucked(false)
    }
  }, [settings.breakAudio, onBreak])

  useEffect(() => {
    if (!spotify.connected || settings.breakAudio === 'nothing') return
    if (onBreak) {
      wasPlayingRef.current = spotify.nowPlaying?.isPlaying ?? false
      if (!wasPlayingRef.current) return
      if (settings.breakAudio === 'pause') spotify.pause()
      else if (settings.breakAudio === 'duck' && spotify.canDuck) spotify.setVolume(35)
    } else if (wasPlayingRef.current) {
      if (settings.breakAudio === 'pause') spotify.play()
      else if (settings.breakAudio === 'duck' && spotify.canDuck) spotify.setVolume(80)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBreak])

  return (
    <>
      <RoomScene rain={rainActive} music={spotify.nowPlaying?.isPlaying ?? false} />
      <Controls />
      <MixerPanel mix={mix} setVolume={setVolume} />
      <SpotifyPanel />
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
