import { useEffect, useState } from 'react'
import { CURATED_PLAYLIST_IDS } from '../config'
import { getMyPlaylists, getPlaylist, type SpotifyPlaylist } from './api'

export function usePlaylists(connected: boolean) {
  const [curated, setCurated] = useState<SpotifyPlaylist[]>([])
  const [mine, setMine] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!connected) {
      setCurated([])
      setMine([])
      return
    }
    let cancelled = false
    setLoading(true)
    void Promise.all([
      Promise.all(CURATED_PLAYLIST_IDS.map((id) => getPlaylist(id).catch(() => null))),
      getMyPlaylists().catch(() => null),
    ]).then(([curatedResults, mineResult]) => {
      if (cancelled) return
      setCurated(curatedResults.filter((p): p is SpotifyPlaylist => p !== null))
      setMine(mineResult?.items ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [connected])

  return { curated, mine, loading }
}
