import { getAudioContext } from '../audio/context'

/**
 * Soft synthesized chime — no asset, no load latency. A clear two-note
 * motif with a warm sub-octave underneath for body so it carries over
 * music and ambience without being harsh. Focus rises (E5 → B5);
 * break settles (B5 → E5).
 */
export function playChime(kind: 'focus' | 'break'): void {
  const ctx = getAudioContext()
  if (!ctx) return
  const notes = kind === 'focus' ? [659.25, 987.77] : [987.77, 659.25]

  notes.forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.26

    // main tone (sine) with a quiet triangle partial for a little shimmer
    const osc = ctx.createOscillator()
    const partial = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    partial.type = 'triangle'
    osc.frequency.value = freq
    partial.frequency.value = freq * 2
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.42, t + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
    const partialGain = ctx.createGain()
    partialGain.gain.value = 0.12
    osc.connect(gain).connect(ctx.destination)
    partial.connect(partialGain).connect(gain)
    osc.start(t)
    partial.start(t)
    osc.stop(t + 1.7)
    partial.stop(t + 1.7)

    // warm sub-octave for body
    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()
    sub.type = 'sine'
    sub.frequency.value = freq / 2
    subGain.gain.setValueAtTime(0.0001, t)
    subGain.gain.exponentialRampToValueAtTime(0.16, t + 0.02)
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
    sub.connect(subGain).connect(ctx.destination)
    sub.start(t)
    sub.stop(t + 1.2)
  })
}
