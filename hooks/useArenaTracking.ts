import { useEffect } from 'react'
import { ArenaTimeTracker } from '@/lib/tracking/arena-time-tracker'

export function useArenaTracking(arenaName: string | null, arenaId?: string) {
  useEffect(() => {
    if (!arenaName) return

    const tracker = ArenaTimeTracker.getInstance()
    tracker.startTracking(arenaName, arenaId)

    return () => {
      tracker.stopTracking()
    }
  }, [arenaName, arenaId])
}