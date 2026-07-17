import { useState } from 'react'
import { SettingsProvider, useSettings } from './state/SettingsContext'
import { TimerProvider } from './state/TimerContext'
import { RoomScene } from './components/Room/RoomScene'
import { Controls } from './components/Controls'
import { SettingsPanel } from './components/SettingsPanel'
import { MixerPanel } from './components/MixerPanel'
import { SpotifyPanel } from './components/SpotifyPanel'
import { WindowViewPicker } from './components/WindowViewPicker'
import { Drawer } from './components/Drawer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAmbience } from './audio/useAmbience'
import { useBreakAudio } from './hooks/useBreakAudio'
import { SpotifyProvider, useSpotify } from './spotify/useSpotify'
import { useLocalStorage } from './hooks/useLocalStorage'
import { DEFAULT_VIEW, WINDOW_VIEWS, isWindowViewId, type WindowViewId } from './components/Room/views'
import { AMBIENCE_LAYERS, PRESETS, CUSTOM_PRESET_ID, STORAGE_KEYS } from './config'

type DrawerId = 'sound' | 'spotify' | 'window' | 'timer'

function CozyRoom() {
  const { settings } = useSettings()
  const { mix, setVolume, rainActive, thunderActive, lofiActive } = useAmbience()
  const spotify = useSpotify()
  const [storedView, setView] = useLocalStorage<WindowViewId>(STORAGE_KEYS.windowView, DEFAULT_VIEW)
  const view = isWindowViewId(storedView) ? storedView : DEFAULT_VIEW
  const [open, setOpen] = useState<DrawerId | null>(null)

  // one place drives all break-time audio behavior (fade, duck, pause)
  useBreakAudio(spotify)

  const toggle = (id: DrawerId) => setOpen((prev) => (prev === id ? null : id))

  const activeLayers = AMBIENCE_LAYERS.filter((l) => mix[l.id] > 0).length
  const viewLabel = WINDOW_VIEWS.find((v) => v.id === view)?.label ?? ''
  const preset = PRESETS.find((p) => p.id === settings.presetId)
  const timerHint =
    settings.presetId === CUSTOM_PRESET_ID || !preset
      ? `${settings.custom.focus}/${settings.custom.shortBreak}`
      : `${preset.intervals.focus}/${preset.intervals.shortBreak}`
  const spotifyHint =
    spotify.mode === 'sdk' || spotify.mode === 'remote'
      ? (spotify.nowPlaying?.name ?? 'connected')
      : spotify.mode === 'connecting'
        ? 'connecting…'
        : ''

  return (
    <>
      <RoomScene
        view={view}
        rain={rainActive}
        thunder={thunderActive}
        music={(spotify.nowPlaying?.isPlaying ?? false) || lofiActive}
      />
      <Controls />

      <div className="drawers">
        <Drawer
          label="sound"
          hint={activeLayers ? `${activeLayers} playing` : ''}
          open={open === 'sound'}
          onToggle={() => toggle('sound')}
        >
          <MixerPanel mix={mix} setVolume={setVolume} />
        </Drawer>

        <Drawer
          label="music"
          hint={spotifyHint}
          open={open === 'spotify'}
          onToggle={() => toggle('spotify')}
        >
          <ErrorBoundary fallbackLabel="Spotify hit a snag">
            <SpotifyPanel />
          </ErrorBoundary>
        </Drawer>

        <Drawer
          label="window"
          hint={viewLabel}
          open={open === 'window'}
          onToggle={() => toggle('window')}
        >
          <WindowViewPicker view={view} setView={setView} />
        </Drawer>

        <Drawer
          label="timer"
          hint={timerHint}
          open={open === 'timer'}
          onToggle={() => toggle('timer')}
        >
          <SettingsPanel />
        </Drawer>
      </div>
    </>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <TimerProvider>
        <SpotifyProvider>
          <header className="app-header">
            <h1 className="app-title">lofidoro</h1>
            <span className="app-tagline">a cozy little focus room</span>
          </header>
          <CozyRoom />
        </SpotifyProvider>
      </TimerProvider>
    </SettingsProvider>
  )
}
