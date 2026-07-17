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

/* ------------------------------------------------------------------------
   Event-based layers (typing, thunder, birds, lofi) precompute a schedule
   ONCE per buffer so both stereo channels hear the same events; per-channel
   randomness is reserved for texture (noise beds, vinyl pops). */

/**
 * Built-in lo-fi radio: a mellow 8-bar loop at 75 BPM (25.6s — exactly on
 * the beat grid, so it loops seamlessly). Rhodes-ish chords over a lazy
 * kick/hat/snare, soft bass, and a vinyl crackle bed. One polished loop,
 * no playlists — the no-login way to just sit down and focus.
 */
function lofi(ctx: AudioContext): AudioBuffer {
  const BPM = 75
  const beat = 60 / BPM // 0.8s
  const bar = beat * 4
  // Fmaj7 → Em7 → Dm7 → Cmaj7, twice
  const CHORDS: number[][] = [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [164.81, 196.0, 246.94, 293.66], // Em7
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [130.81, 164.81, 196.0, 246.94], // Cmaj7
  ]
  const bars = 8
  const seconds = bars * bar // 25.6

  return noiseBuffer(ctx, seconds, (data, sr, ch) => {
    const detune = ch === 0 ? 1 : 1.0015 // slight stereo width

    const addTone = (freq: number, start: number, dur: number, amp: number) => {
      const s0 = Math.floor(start * sr)
      const n = Math.floor(dur * sr)
      const w = 2 * Math.PI * freq * detune
      for (let i = 0; i < n && s0 + i < data.length; i++) {
        const t = i / sr
        const env = Math.min(t / 0.02, 1) * Math.exp(-t / (dur / 3.2))
        // fundamental + soft octave partial = electric-piano-ish
        data[s0 + i] += (Math.sin(w * t) + 0.35 * Math.sin(2 * w * t)) * amp * env
      }
    }

    for (let b = 0; b < bars; b++) {
      const chord = CHORDS[b % 4]
      const t0 = b * bar
      // chord stab on beat 1, softer re-hit on the and-of-3
      for (const f of chord) {
        addTone(f, t0, bar * 0.95, 0.055)
        addTone(f, t0 + 2.5 * beat, bar * 0.4, 0.028)
      }
      // bass: root an octave down, beats 1 and 3
      addTone(chord[0] / 2, t0, beat * 1.6, 0.11)
      addTone(chord[0] / 2, t0 + 2 * beat, beat * 1.4, 0.09)

      for (let k = 0; k < 4; k++) {
        const bt = t0 + k * beat
        // kick on 1 & 3: pitch-dropping thump
        if (k === 0 || k === 2) {
          const s0 = Math.floor(bt * sr)
          for (let i = 0; i < 0.14 * sr && s0 + i < data.length; i++) {
            const t = i / sr
            data[s0 + i] += Math.sin(2 * Math.PI * (58 - 90 * t) * t) * 0.16 * Math.exp(-t / 0.05)
          }
        }
        // soft snare on 2 & 4
        if (k === 1 || k === 3) {
          const s0 = Math.floor(bt * sr)
          for (let i = 0; i < 0.09 * sr && s0 + i < data.length; i++) {
            data[s0 + i] += (Math.random() * 2 - 1) * 0.05 * Math.exp(-i / sr / 0.03)
          }
        }
        // swung hats on the 8ths (offbeat pushed late)
        for (const off of [0, 0.58]) {
          const s0 = Math.floor((bt + off * beat) * sr)
          for (let i = 0; i < 0.025 * sr && s0 + i < data.length; i++) {
            data[s0 + i] += (Math.random() * 2 - 1) * 0.022 * Math.exp(-i / sr / 0.008)
          }
        }
      }
    }

    // warm the whole thing down, then lay the vinyl bed on top (unfiltered)
    lowpass(data, sr, 2600)
    for (let i = 0; i < data.length; i++) data[i] += (Math.random() * 2 - 1) * 0.004
    const pops = 22
    for (let p = 0; p < pops; p++) {
      const at = Math.floor(Math.random() * (data.length - 200))
      const amp = 0.02 + Math.random() * 0.035
      for (let i = 0; i < 120; i++) data[at + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / 25)
    }
    makeSeamless(data, sr, 0.08) // tiny fade: the loop already lands on the grid
    normalize(data, 0.55)
  })
}

/** quiet study-room typing: soft sparse key taps in bursts, never clicky */
function typing(ctx: AudioContext): AudioBuffer {
  const seconds = 16.3
  // schedule once so both channels hear the same typist
  const taps: Array<{ at: number; amp: number; len: number }> = []
  let t = 0.4
  while (t < seconds - 0.5) {
    const burstLen = 4 + Math.floor(Math.random() * 14)
    for (let k = 0; k < burstLen && t < seconds - 0.5; k++) {
      taps.push({
        at: t,
        amp: 0.035 + Math.random() * 0.04,
        len: 0.014 + Math.random() * 0.012,
      })
      t += 0.07 + Math.random() * 0.11
      if (Math.random() < 0.06) t += 0.25 // micro-hesitation
    }
    t += 0.6 + Math.random() * 1.6 // thinking pause
  }

  return noiseBuffer(ctx, seconds, (data, sr) => {
    for (const tap of taps) {
      const s0 = Math.floor(tap.at * sr)
      const n = Math.floor(tap.len * sr)
      // two-stage tap: press + slightly quieter release right after
      for (let i = 0; i < n && s0 + i < data.length; i++) {
        data[s0 + i] += (Math.random() * 2 - 1) * tap.amp * Math.exp(-i / (n / 2.2))
      }
      const r0 = s0 + Math.floor(0.035 * sr)
      for (let i = 0; i < n * 0.7 && r0 + i < data.length; i++) {
        data[r0 + i] += (Math.random() * 2 - 1) * tap.amp * 0.45 * Math.exp(-i / (n / 2.5))
      }
    }
    lowpass(data, sr, 1900) // soften — no harsh mechanical clicks
    makeSeamless(data, sr, 0.3)
    normalize(data, 0.4)
  })
}

/** wind: noise with slowly wandering brightness + a faint whistle on gusts */
function wind(ctx: AudioContext): AudioBuffer {
  return noiseBuffer(ctx, 10.7, (data, sr, ch) => {
    const dark = new Float32Array(data.length)
    const bright = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1
      dark[i] = w
      bright[i] = w
    }
    lowpass(dark, sr, 280)
    lowpass(bright, sr, 1100)
    const phase = ch === 0 ? 0 : 1.3
    for (let i = 0; i < data.length; i++) {
      const t = i / sr
      // gust LFO: two incommensurate sines so it wanders instead of pulsing
      const gust = 0.5 + 0.5 * Math.sin(t * 0.55 + phase) * Math.sin(t * 0.23 + phase * 2)
      data[i] = dark[i] * (1.3 - gust) + bright[i] * gust * 1.4
      // whistle only at the top of gusts
      data[i] += Math.sin(2 * Math.PI * 640 * t) * 0.025 * gust * gust * gust
    }
    makeSeamless(data, sr)
    normalize(data, 0.45)
  })
}

/** morning birds: airy bed + three birds trading little chirp phrases */
function birds(ctx: AudioContext): AudioBuffer {
  const seconds = 12.1
  // schedule chirps once; pan per bird
  const chirps: Array<{ at: number; f0: number; f1: number; dur: number; pan: number }> = []
  const birdsDef = [
    { f: 3100, pan: 0.25 },
    { f: 3600, pan: 0.75 },
    { f: 2700, pan: 0.5 },
  ]
  for (const bird of birdsDef) {
    let t = Math.random() * 2
    while (t < seconds - 0.6) {
      const phraseLen = 2 + Math.floor(Math.random() * 3)
      for (let k = 0; k < phraseLen; k++) {
        chirps.push({
          at: t + k * (0.14 + Math.random() * 0.08),
          f0: bird.f + Math.random() * 300,
          f1: bird.f + 500 + Math.random() * 500,
          dur: 0.06 + Math.random() * 0.06,
          pan: bird.pan,
        })
      }
      t += 1.6 + Math.random() * 2.8
    }
  }

  return noiseBuffer(ctx, seconds, (data, sr, ch) => {
    // gentle air
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.015
    lowpass(data, sr, 1000)
    for (const c of chirps) {
      const gain = ch === 0 ? 1 - c.pan : c.pan
      const s0 = Math.floor(c.at * sr)
      const n = Math.floor(c.dur * sr)
      for (let i = 0; i < n && s0 + i < data.length; i++) {
        const p = i / n
        const f = c.f0 + (c.f1 - c.f0) * p // upward sweep
        const env = Math.sin(p * Math.PI) ** 1.5
        data[s0 + i] += Math.sin(2 * Math.PI * f * (i / sr)) * 0.07 * env * gain
      }
    }
    makeSeamless(data, sr, 0.3)
    normalize(data, 0.4)
  })
}

/** forest stream: constant gentle flow, higher and softer than ocean waves */
function stream(ctx: AudioContext): AudioBuffer {
  return noiseBuffer(ctx, 11.9, (data, sr, ch) => {
    // bandpass ≈ bright pass minus dark pass
    const brightArr = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) brightArr[i] = Math.random() * 2 - 1
    const darkArr = Float32Array.from(brightArr)
    lowpass(brightArr, sr, 3200)
    lowpass(darkArr, sr, 700)
    // fast ripple: smoothed random gain wobble
    let ripple = 0.5
    const phase = ch === 0 ? 0 : 2.1
    for (let i = 0; i < data.length; i++) {
      ripple += 0.002 * (Math.random() - 0.5)
      ripple = Math.min(0.75, Math.max(0.25, ripple))
      const t = i / sr
      const flow = 0.85 + 0.15 * Math.sin(t * 1.7 + phase)
      data[i] = (brightArr[i] - darkArr[i]) * (0.5 + ripple) * flow
    }
    // bubbling: sparse tiny resonant blips
    const blips = 26
    for (let b = 0; b < blips; b++) {
      const at = Math.floor(Math.random() * (data.length - 2000))
      const f = 420 + Math.random() * 480
      const n = Math.floor(0.03 * sr)
      for (let i = 0; i < n; i++) {
        data[at + i] += Math.sin(2 * Math.PI * f * (i / sr)) * 0.05 * Math.sin((i / n) * Math.PI)
      }
    }
    makeSeamless(data, sr)
    normalize(data, 0.42)
  })
}

/** thunder: sparse distant rumbles over a whisper of storm air — layer over rain */
function thunder(ctx: AudioContext): AudioBuffer {
  const seconds = 17.9
  const events = [
    { at: 2.5 + Math.random() * 2, big: true },
    { at: 10.5 + Math.random() * 3, big: false },
  ]

  return noiseBuffer(ctx, seconds, (data, sr) => {
    // faint storm-air bed
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.01 * w) / 1.01
      data[i] = last * 1.4
    }
    lowpass(data, sr, 160)
    for (const ev of events) {
      const s0 = Math.floor(ev.at * sr)
      const dur = ev.big ? 4.2 : 2.6
      const n = Math.floor(dur * sr)
      // pre-crack on the big one
      if (ev.big) {
        const c0 = s0 - Math.floor(0.3 * sr)
        for (let i = 0; i < 0.15 * sr && c0 + i > 0 && c0 + i < data.length; i++) {
          data[c0 + i] += (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / sr / 0.04)
        }
      }
      // rumble: brown noise, fast attack, long decay, darkening as it fades
      let rl = 0
      for (let i = 0; i < n && s0 + i < data.length; i++) {
        const t = i / sr
        const w = Math.random() * 2 - 1
        rl = (rl + 0.02 * w) / 1.02
        const env = Math.min(t / 0.08, 1) * Math.exp(-t / (dur / 3))
        const amp = ev.big ? 0.85 : 0.5
        data[s0 + i] += rl * 4 * amp * env
      }
    }
    lowpass(data, sr, 320)
    makeSeamless(data, sr, 0.4)
    normalize(data, 0.62)
  })
}

/** ocean waves: slow swells with a foam hiss on the break */
function waves(ctx: AudioContext): AudioBuffer {
  return noiseBuffer(ctx, 13.4, (data, sr, ch) => {
    const body = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) body[i] = Math.random() * 2 - 1
    const foam = Float32Array.from(body)
    lowpass(body, sr, 850)
    lowpass(foam, sr, 2600)
    const period = 6.7
    const phase = ch === 0 ? 0 : 0.9
    for (let i = 0; i < data.length; i++) {
      const t = i / sr
      const cyc = ((t + phase) % period) / period // 0..1 through the swell
      const swell = 0.15 + 0.85 * Math.max(0, Math.sin(cyc * Math.PI)) ** 1.6
      // foam hisses as the wave breaks and recedes (back half of the cycle)
      const foamEnv = cyc > 0.45 ? Math.max(0, Math.sin((cyc - 0.45) * Math.PI * 1.8)) ** 2 : 0
      data[i] = body[i] * swell + foam[i] * foamEnv * 0.5
    }
    makeSeamless(data, sr)
    normalize(data, 0.5)
  })
}

export const GENERATORS: Record<AmbienceLayerId, (ctx: AudioContext) => AudioBuffer> = {
  lofi,
  rain,
  fire,
  typing,
  crickets,
  birds,
  waves,
  stream,
  thunder,
  wind,
}
