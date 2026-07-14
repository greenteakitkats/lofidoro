import type { AmbienceLayerId, AmbienceMix } from '../types'
import { getAudioContext, unlockAudio } from './context'
import { GENERATORS } from './generators'

/**
 * Ambient layer mixer — module singleton around the shared AudioContext.
 *
 *   ctx -> masterGain -> destination
 *            ^ per-layer: AudioBufferSourceNode(loop) -> GainNode
 *
 * Layers are built lazily the first time their volume goes above zero
 * (which happens inside a user gesture, satisfying autoplay policies).
 * Volume changes always go through setTargetAtTime to avoid clicks.
 */

interface Layer {
  source: AudioBufferSourceNode
  gain: GainNode
}

const SMOOTHING = 0.08

let master: GainNode | null = null
let ducked = false
const layers = new Map<AmbienceLayerId, Layer>()
const volumes: AmbienceMix = {
  lofi: 0,
  rain: 0,
  fire: 0,
  cafe: 0,
  typing: 0,
  crickets: 0,
  birds: 0,
  waves: 0,
  stream: 0,
  thunder: 0,
  wind: 0,
}

function ensureMaster(ctx: AudioContext): GainNode {
  if (!master) {
    master = ctx.createGain()
    master.gain.value = ducked ? 0.55 : 1
    master.connect(ctx.destination)
  }
  return master
}

function ensureLayer(ctx: AudioContext, id: AmbienceLayerId): Layer {
  let layer = layers.get(id)
  if (!layer) {
    const source = ctx.createBufferSource()
    source.buffer = GENERATORS[id](ctx)
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(gain).connect(ensureMaster(ctx))
    source.start()
    layer = { source, gain }
    layers.set(id, layer)
  }
  return layer
}

/** Set a layer's volume (0..1). Call from a user-gesture handler. */
export function setLayerVolume(id: AmbienceLayerId, volume: number): void {
  const v = Math.min(1, Math.max(0, volume))
  volumes[id] = v
  if (v === 0 && !layers.has(id)) return // nothing to silence
  const ctx = unlockAudio()
  const { gain } = ensureLayer(ctx, id)
  gain.gain.setTargetAtTime(v * v, ctx.currentTime, SMOOTHING) // v² ≈ perceptual taper
}

/** Restore a persisted mix without a user gesture — layers actually start on first interaction. */
export function primeMix(mix: AmbienceMix): void {
  Object.assign(volumes, mix)
}

/** Called on the first user gesture to make a persisted mix audible. */
export function applyPrimedMix(): void {
  const ctx = getAudioContext()
  if (!ctx) return
  for (const id of Object.keys(volumes) as AmbienceLayerId[]) {
    if (volumes[id] > 0) {
      const { gain } = ensureLayer(ctx, id)
      gain.gain.setTargetAtTime(volumes[id] * volumes[id], ctx.currentTime, SMOOTHING)
    }
  }
}

/** Gently lower everything during breaks (when the duck setting is on). */
export function setDucked(next: boolean): void {
  ducked = next
  const ctx = getAudioContext()
  if (!ctx || !master) return
  master.gain.setTargetAtTime(next ? 0.55 : 1, ctx.currentTime, 0.4)
}

export function getVolumes(): AmbienceMix {
  return { ...volumes }
}
