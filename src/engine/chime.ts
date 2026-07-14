import { getAudioContext } from '../audio/context'

/**
 * Soft two-note synthesized chime — no asset, no load latency.
 * Focus start rises (E5 -> A5); break start falls (A5 -> E5).
 */
export function playChime(kind: 'focus' | 'break'): void {
  const ctx = getAudioContext()
  if (!ctx) return
  const notes = kind === 'focus' ? [659.25, 880] : [880, 659.25]
  notes.forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.22
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 1.3)
  })
}
