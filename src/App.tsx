import { SettingsProvider } from './state/SettingsContext'
import { TimerProvider } from './state/TimerContext'
import { TimerDisplay } from './components/TimerDisplay'
import { Controls } from './components/Controls'
import { SettingsPanel } from './components/SettingsPanel'

export default function App() {
  return (
    <SettingsProvider>
      <TimerProvider>
        <header className="app-header">
          <h1 className="app-title">lofidoro</h1>
          <span className="app-tagline">a cozy little focus room</span>
        </header>
        <TimerDisplay />
        <Controls />
        <SettingsPanel />
      </TimerProvider>
    </SettingsProvider>
  )
}
