import { AMBIENCE_GROUPS, AMBIENCE_LAYERS } from '../config'
import type { AmbienceLayerId, AmbienceMix } from '../types'
import './panels.css'

interface MixerPanelProps {
  mix: AmbienceMix
  setVolume: (id: AmbienceLayerId, volume: number) => void
}

export function MixerPanel({ mix, setVolume }: MixerPanelProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">sound</h2>
      <div className="mixer-groups">
        {AMBIENCE_GROUPS.map((group) => (
          <div key={group.id} className="mixer-group">
            <h3 className="mixer-group-title">{group.label}</h3>
            <div className="mixer-grid">
              {AMBIENCE_LAYERS.filter((l) => l.group === group.id).map((layer) => (
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
          </div>
        ))}
      </div>
      <p className="panel-note">
        everything here is synthesized right in your browser — mix it under your own music
      </p>
    </section>
  )
}
