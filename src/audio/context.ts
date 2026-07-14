/**
 * Single shared AudioContext for the whole app (chime + ambience mixer).
 *
 * Autoplay policy: browsers only allow audio started from a user gesture,
 * and iOS suspends contexts aggressively. So the context is created lazily
 * and `unlockAudio()` must be called from gesture handlers (Start button,
 * slider touch); it also re-resumes on visibilitychange.
 */

let ctx: AudioContext | null = null
let unlocked = false

export function getAudioContext(): AudioContext | null {
  return ctx
}

/** Create/resume the shared context. Call only from a user-gesture handler. */
export function unlockAudio(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
  }
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
  if (!unlocked) {
    unlocked = true
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && ctx && ctx.state === 'suspended') {
        void ctx.resume()
      }
    })
  }
  return ctx
}
