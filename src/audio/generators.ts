import type { AmbienceLayerId } from '../types'

/**
 * Procedurally generated ambient loops — no audio assets, no licensing,
 * perfectly seamless, zero bundle weight. Each layer bakes a few seconds
 * of shaped noise into an AudioBuffer that loops gaplessly; durations are
 * deliberately different so combined layers don't phase-align.
 */

function noiseBuffer(
  ctx: AudioContext,
  seconds: number,
  fill: (data: Float32Array, sampleRate: number, channel: number) => void,
): AudioBuffer {
  const sr = ctx.sampleRate
  const buf = ctx.createBuffer(2, Math.floor(seconds * sr), sr)
  for (let ch = 0; ch < 2; ch++) {
    fill(buf.getChannelData(ch), sr, ch)
  }
  return buf
}

/** crossfade the tail into the head so the loop point is inaudible */
function makeSeamless(data: Float32Array, sr: number, fadeSeconds = 0.5): void {
  const fade = Math.min(Math.floor(fadeSeconds * sr), Math.floor(data.length / 4))
  for (let i = 0; i < fade; i++) {
    const t = i / fade
    const head = data[i]
    const tail = data[data.length - fade + i]
    data[i] = head * t + tail * (1 - t)
  }
}

/** simple one-pole lowpass over a sample array */
function lowpass(data: Float32Array, sr: number, cutoffHz: number): void {
  const rc = 1 / (2 * Math.PI * cutoffHz)
  const dt = 1 / sr
  const alpha = dt / (rc + dt)
  let prev = 0
  for (let i = 0; i < data.length; i++) {
    prev = prev + alpha * (data[i] - prev)
    data[i] = prev
  }
}

function normalize(data: Float32Array, peak = 0.9): void {
  let max = 0
  for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]))
  if (max === 0) return
  const k = peak / max
  for (let i = 0; i < data.length; i++) data[i] *= k
}

/** steady rain: dense filtered noise + sparse brighter droplet ticks */
function rain(ctx: AudioContext): AudioBuffer {
  return noiseBuffer(ctx, 7.3, (data, sr) => {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    lowpass(data, sr, 3200)
    // droplets: short bright taps scattered through the loop
    const drops = Math.floor(data.length / sr) * 26
    for (let d = 0; d < drops; d++) {
      const at = Math.floor(Math.random() * (data.length - 400))
      const amp = 0.25 + Math.random() * 0.5
      for (let i = 0; i < 300; i++) {
        data[at + i] += Math.sin(i * 0.35) * amp * Math.exp(-i / 45)
      }
    }
    makeSeamless(data, sr)
    normalize(data, 0.55)
  })
}

/** fireplace: deep rumble + random crackles and pops */
function fire(ctx: AudioContext): AudioBuffer {
  return noiseBuffer(ctx, 9.1, (data, sr) => {
    // brown-ish noise base
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.015 * white) / 1.015
      data[i] = last * 4
    }
    lowpass(data, sr, 420)
    // crackles: sharp decaying bursts, occasional louder pops
    const crackles = Math.floor(data.length / sr) * 11
    for (let c = 0; c < crackles; c++) {
      const at = Math.floor(Math.random() * (data.length - 900))
      const pop = Math.random() < 0.18
      const amp = pop ? 0.6 + Math.random() * 0.3 : 0.12 + Math.random() * 0.2
      const len = pop ? 800 : 220
      for (let i = 0; i < len; i++) {
        data[at + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (len / 5))
      }
    }
    makeSeamless(data, sr)
    normalize(data, 0.6)
  })
}

/** café murmur: warm room-tone with slow voice-like swells and rare cup clinks */
function cafe(ctx: AudioContext): AudioBuffer {
  return noiseBuffer(ctx, 11.7, (data, sr, ch) => {
    // room tone
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    lowpass(data, sr, 600)
    // murmur: band-limited noise with slow, irregular amplitude swells
    let m1 = 0
    let m2 = 0
    const phase = ch === 0 ? 0 : 1.7
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      m1 = m1 + 0.09 * (white - m1)
      m2 = m2 + 0.05 * (m1 - m2)
      const t = i / sr
      const swell =
        0.5 +
        0.5 *
          Math.sin(t * 0.9 + phase) *
          Math.sin(t * 0.37 + phase * 2) *
          Math.sin(t * 1.31)
      data[i] += (m1 - m2) * 5.5 * swell
    }
    // cup clinks: tiny high pings, a couple per loop
    for (let k = 0; k < 3; k++) {
      const at = Math.floor(Math.random() * (data.length - 3000))
      const f = 1800 + Math.random() * 1400
      for (let i = 0; i < 2500; i++) {
        data[at + i] += Math.sin((i / sr) * f * 2 * Math.PI) * 0.05 * Math.exp(-i / 500)
      }
    }
    makeSeamless(data, sr)
    normalize(data, 0.5)
  })
}

/** night crickets: chirp trains over a faint airy bed */
function crickets(ctx: AudioContext): AudioBuffer {
  return noiseBuffer(ctx, 8.6, (data, sr, ch) => {
    // faint night air
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.02
    lowpass(data, sr, 900)
    // a cricket = train of short 4.2–4.9kHz pulses, chirping in bursts
    const crickets = 3
    for (let c = 0; c < crickets; c++) {
      const f = 4200 + c * 320 + (ch === 1 ? 60 : 0)
      const chirpGap = 0.45 + c * 0.17 // seconds between chirps
      const amp = 0.08 - c * 0.018
      let t = Math.random() * chirpGap
      while (t < data.length / sr - 0.3) {
        // one chirp = 3 quick pulses
        for (let p = 0; p < 3; p++) {
          const start = Math.floor((t + p * 0.055) * sr)
          const len = Math.floor(0.038 * sr)
          for (let i = 0; i < len && start + i < data.length; i++) {
            const env = Math.sin((i / len) * Math.PI)
            data[start + i] += Math.sin((i / sr) * f * 2 * Math.PI) * amp * env
          }
        }
        t += chirpGap + Math.random() * 0.25
      }
    }
    makeSeamless(data, sr, 0.25)
    normalize(data, 0.4)
  })
}

export const GENERATORS: Record<AmbienceLayerId, (ctx: AudioContext) => AudioBuffer> = {
  rain,
  fire,
  cafe,
  crickets,
}
