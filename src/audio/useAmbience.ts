import { useCallback, useEffect } from 'react'
import type { AmbienceLayerId, AmbienceMix } from '../types'
import { STORAGE_KEYS } from '../config'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { applyPrimedMix, primeMix, setLayerVolume } from './mixer'
import { unlockAudio } from './context'

// loadJSON shallow-merges stored values over this fallback, so mixes saved
// before new layers existed pick up the new keys at 0 automatically
const EMPTY_MIX: AmbienceMix = {
  lofi: 0,
  rain: 0,
  fire: 0,
  typing: 0,
  crickets: 0,
  birds: 0,
  waves: 0,
  stream: 0,
  thunder: 0,
  wind: 0,
}

/** React face of the mixer: persisted slider values + lazy audible start. */
export function useAmbience() {
  const [mix, setMix] = useLocalStorage<AmbienceMix>(STORAGE_KEYS.mix, EMPTY_MIX)

  // tell the mixer about the persisted mix; it becomes audible on the
  // first user gesture anywhere in the app (start button, slider, ...)
  useEffect(() => {
    primeMix(mix)
    const onGesture = () => {
      unlockAudio()
      applyPrimedMix()
    }
    window.addEventListener('pointerdown', onGesture, { once: true })
    window.addEventListener('keydown', onGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setVolume = useCallback(
    (id: AmbienceLayerId, volume: number) => {
      setLayerVolume(id, volume) // slider input = user gesture
      setMix((prev) => ({ ...prev, [id]: volume }))
    },
    [setMix],
  )

  return {
    mix,
    setVolume,
    rainActive: mix.rain > 0,
    thunderActive: mix.thunder > 0,
    lofiActive: mix.lofi > 0,
  }
}
