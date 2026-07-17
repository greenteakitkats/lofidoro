import { useEffect, useRef } from 'react'
import { useTimer } from '../state/TimerContext'
import { useSettings } from '../state/SettingsContext'
import { setFocusAudioLevel } from '../audio/mixer'
import type { SpotifyApi } from '../spotify/useSpotify'

/** ambience/Spotify level while ducked (not silenced) */
const DUCK_LEVEL = 0.35
const SPOTIFY_BASE_VOLUME = 80
const TICK_MS = 500

/**
 * Rides both the ambient mixer and Spotify down as a break approaches and
 * back up when focus resumes — one place, so "pause" / "lower volume" /
 * "leave it" behave the same for everything the user is hearing.
 *
 * The fade starts `fadeLeadSeconds` before the break so it's a gentle
 * heads-up rather than an abrupt cut. Spotify's SDK volume is stepped each
 * tick (coarser than the mixer's smooth ramp, but fine for a slow fade);
 * "pause" pauses at the boundary once the volume has already eased down.
 */
export function useBreakAudio(spotify: SpotifyApi): void {
  const { state } = useTimer()
  const { settings } = useSettings()

  // keep latest values in a ref so the interval stays stable
  const ref = useRef({ state, settings, spotify })
  ref.current = { state, settings, spotify }
  const spotifyPausedRef = useRef(false)

  useEffect(() => {
    const tick = () => {
      const { state: s, settings: cfg, spotify: sp } = ref.current
      const behavior = cfg.breakAudio
      const lead = Math.max(0, cfg.fadeLeadSeconds) * 1000

      let level = 1
      let inBreak = false

      if (s.status === 'running') {
        if (s.phase === 'focus') {
          const remaining = (s.phaseEndsAt ?? Number.POSITIVE_INFINITY) - Date.now()
          if (behavior !== 'nothing' && lead > 0 && remaining <= lead) {
            const progress = Math.min(1, Math.max(0, 1 - remaining / lead))
            const target = behavior === 'pause' ? 0 : DUCK_LEVEL
            level = 1 + (target - 1) * progress
          }
        } else {
          inBreak = true
          level = behavior === 'pause' ? 0 : behavior === 'duck' ? DUCK_LEVEL : 1
        }
      }

      // ambient mixer — smooth ramp
      setFocusAudioLevel(level, 0.6)

      // Spotify — only touch it if lofidoro sees it playing (don't surprise
      // someone who connected but isn't using it)
      if (sp.connected && (sp.nowPlaying?.isPlaying || spotifyPausedRef.current)) {
        if (behavior === 'pause') {
          if (inBreak && !spotifyPausedRef.current) {
            sp.pause()
            spotifyPausedRef.current = true
          } else if (!inBreak && spotifyPausedRef.current) {
            sp.play()
            spotifyPausedRef.current = false
          }
          if (sp.canDuck && !inBreak) sp.setVolume(Math.round(level * SPOTIFY_BASE_VOLUME))
        } else if (behavior === 'duck') {
          if (sp.canDuck) sp.setVolume(Math.round(level * SPOTIFY_BASE_VOLUME))
        } else if (sp.canDuck) {
          sp.setVolume(SPOTIFY_BASE_VOLUME)
        }
      }
    }

    tick()
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [])
}
