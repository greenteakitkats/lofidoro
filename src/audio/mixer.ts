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
// 1 = full, 0.35 ≈ ducked, 0 = silenced during breaks (set by useBreakAudio)
let focusLevel = 1
const layers = new Map<AmbienceLayerId, Layer>()
const volumes: AmbienceMix = {
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

function ensureMaster(ctx: AudioContext): GainNode {
  if (!master) {
    master = ctx.createGain()
    master.gain.value = focusLevel
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
  // copy only keys we still recognize, so a mix saved with a since-removed
  // layer (e.g. an old 'cafe' value) can't leak in and crash ensureLayer
  for (const id of Object.keys(volumes) as AmbienceLayerId[]) {
    if (id in mix) volumes[id] = mix[id]
  }
}

/** Called on the first user gesture to make a persisted mix audible. */
export function applyPrimedMix(): void {
  const ctx = getAudioContext()
  if (!ctx) return
  for (const id of Object.keys(volumes) as AmbienceLayerId[]) {
    if (volumes[id] > 0 && GENERATORS[id]) {
      const { gain } = ensureLayer(ctx, id)
      gain.gain.setTargetAtTime(volumes[id] * volumes[id], ctx.currentTime, SMOOTHING)
    }
  }
}

/**
 * Set the overall ambience level (0..1) — the break-audio system rides this
 * down before/through breaks and back up on focus. Smoothly ramped so the
 * pre-break fade is inaudible-of-seam. Idempotent: no-op if unchanged.
 */
export function setFocusAudioLevel(level: number, rampSeconds = 0.5): void {
  const clamped = Math.min(1, Math.max(0, level))
  if (clamped === focusLevel) return
  focusLevel = clamped
  const ctx = getAudioContext()
  if (!ctx || !master) return
  master.gain.setTargetAtTime(clamped, ctx.currentTime, rampSeconds)
}

export function getVolumes(): AmbienceMix {
  return { ...volumes }
}
