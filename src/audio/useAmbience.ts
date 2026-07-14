import { useCallback, useEffect } from 'react'
import type { AmbienceLayerId, AmbienceMix } from '../types'
import { STORAGE_KEYS } from '../config'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { applyPrimedMix, primeMix, setLayerVolume } from './mixer'
import { unlockAudio } from './context'

const EMPTY_MIX: AmbienceMix = { rain: 0, fire: 0, cafe: 0, crickets: 0 }

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

  return { mix, setVolume, rainActive: mix.rain > 0 }
}
