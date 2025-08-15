'use client'

import { useArenaTracking } from '@/hooks/useArenaTracking'

interface GoalPageTrackerProps {
  arenaName: string
  arenaId?: string
}

export function GoalPageTracker({ arenaName, arenaId }: GoalPageTrackerProps) {
  useArenaTracking(arenaName, arenaId)
  return null
}