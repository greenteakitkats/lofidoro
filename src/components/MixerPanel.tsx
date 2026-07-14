import { AMBIENCE_LAYERS } from '../config'
import type { AmbienceLayerId, AmbienceMix } from '../types'
import './panels.css'

interface MixerPanelProps {
  mix: AmbienceMix
  setVolume: (id: AmbienceLayerId, volume: number) => void
}

export function MixerPanel({ mix, setVolume }: MixerPanelProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">ambience</h2>
      <div className="mixer-grid">
        {AMBIENCE_LAYERS.map((layer) => (
          <label key={layer.id} className="mixer-row">
            <span className="mixer-emoji" aria-hidden="true">
              {layer.emoji}
            </span>
            <span className="mixer-label">{layer.label}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={mix[layer.id]}
              onChange={(e) => setVolume(layer.id, Number(e.target.value))}
              aria-label={`${layer.label} volume`}
            />
          </label>
        ))}
      </div>
      <p className="panel-note">
        soundscapes are synthesized right in your browser — mix them under your music
      </p>
    </section>
  )
}
