import type { CSSProperties } from 'react'
import { AMBIENCE_GROUPS, AMBIENCE_LAYERS } from '../config'
import type { AmbienceLayerId, AmbienceMix } from '../types'
import { LayerIcon } from './Icon'

interface MixerPanelProps {
  mix: AmbienceMix
  setVolume: (id: AmbienceLayerId, volume: number) => void
}

export function MixerPanel({ mix, setVolume }: MixerPanelProps) {
  return (
    <div className="mixer">
      <div className="mixer-groups">
        {AMBIENCE_GROUPS.map((group) => (
          <div key={group.id} className="mixer-group">
            <h3 className="group-title">{group.label}</h3>
            <div className="mixer-grid">
              {AMBIENCE_LAYERS.filter((l) => l.group === group.id).map((layer) => {
                const value = mix[layer.id]
                return (
                  <label
                    key={layer.id}
                    className={'mixer-row' + (value > 0 ? ' active' : '')}
                  >
                    <LayerIcon id={layer.id} className="mixer-icon" />
                    <span className="mixer-label">{layer.label}</span>
                    <input
                      className="slider"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={value}
                      style={{ '--fill': `${value * 100}%` } as CSSProperties}
                      onChange={(e) => setVolume(layer.id, Number(e.target.value))}
                      aria-label={`${layer.label} volume`}
                    />
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="drawer-note">synthesized right in your browser — layer it under your own music</p>
    </div>
  )
}
