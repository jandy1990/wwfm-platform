'use client'

import { useArenaTracking } from '@/hooks/useArenaTracking'

export function BrowsePageTracker() {
  // Track time on browse page as "General Browsing"
  useArenaTracking('General Browsing')
  return null
}