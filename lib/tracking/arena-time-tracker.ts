import { createClient } from '@/lib/database/client'
import type { Database } from '@/types/database.types'

interface TimeEntry {
  arena_name: string
  arena_id?: string
  date: string
  seconds: number
  visits: number
}

export class ArenaTimeTracker {
  private static instance: ArenaTimeTracker
  private startTime: number | null = null
  private currentArena: string | null = null
  private currentArenaId: string | null = null
  private syncInterval: NodeJS.Timeout | null = null
  private isTracking: boolean = false
  
  private readonly STORAGE_KEY = 'wwfm_arena_time'
  private readonly LAST_SYNC_KEY = 'wwfm_last_sync'
  private readonly SYNC_INTERVAL = 60 * 60 * 1000 // 1 hour

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTracking()
    }
  }

  static getInstance(): ArenaTimeTracker {
    if (!ArenaTimeTracker.instance) {
      ArenaTimeTracker.instance = new ArenaTimeTracker()
    }
    return ArenaTimeTracker.instance
  }

  private initializeTracking() {
    // Start sync interval
    this.startSyncInterval()
    
    // Save when leaving page
    window.addEventListener('beforeunload', () => {
      this.saveCurrentSession()
    })
    
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveCurrentSession()
      } else if (this.currentArena) {
        // Resume tracking when tab becomes visible
        this.startTime = Date.now()
      }
    })
  }

  startTracking(arenaName: string, arenaId?: string) {
    // Save any previous session
    this.saveCurrentSession()

    // Start new tracking session
    this.currentArena = arenaName
    this.currentArenaId = arenaId || null
    this.startTime = Date.now()
    this.isTracking = true
  }

  stopTracking() {
    this.saveCurrentSession()
    this.currentArena = null
    this.currentArenaId = null
    this.startTime = null
    this.isTracking = false
  }

  private saveCurrentSession() {
    if (!this.startTime || !this.currentArena || !this.isTracking) return

    const seconds = Math.floor((Date.now() - this.startTime) / 1000)
    if (seconds < 1) return // Ignore very short visits

    const today = new Date().toISOString().split('T')[0]
    const storageKey = `${this.STORAGE_KEY}_${today}`
    
    // Get existing data for today
    const existing = this.getLocalData(today)
    
    // Update or create arena entry
    const arenaKey = this.currentArena
    if (!existing[arenaKey]) {
      existing[arenaKey] = {
        arena_name: this.currentArena,
        arena_id: this.currentArenaId,
        date: today,
        seconds: 0,
        visits: 0
      }
    }
    
    existing[arenaKey].seconds += seconds
    existing[arenaKey].visits += 1
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(existing))
    } catch (e) {
      console.error('Failed to save time tracking:', e)
    }

    // Reset timer for continued tracking
    this.startTime = Date.now()
  }

  private getLocalData(date: string): Record<string, TimeEntry> {
    const storageKey = `${this.STORAGE_KEY}_${date}`
    try {
      const data = localStorage.getItem(storageKey)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  private startSyncInterval() {
    // Initial sync
    this.checkAndSync()

    // Periodic sync
    this.syncInterval = setInterval(() => {
      this.checkAndSync()
    }, this.SYNC_INTERVAL)
  }

  async checkAndSync() {
    try {
      const lastSync = localStorage.getItem(this.LAST_SYNC_KEY)
      const now = Date.now()
      
      // Check if enough time has passed
      if (lastSync) {
        const timeSinceSync = now - parseInt(lastSync)
        if (timeSinceSync < this.SYNC_INTERVAL) {
          return
        }
      }

      // Check authentication
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        this.clearOldLocalData()
        return
      }

      // Gather all unsync'd data
      const entries: TimeEntry[] = []
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_KEY + '_'))
      
      for (const key of keys) {
        const dateStr = key.replace(this.STORAGE_KEY + '_', '')
        const dayData = this.getLocalData(dateStr)
        
        Object.values(dayData).forEach(entry => {
          entries.push(entry)
        })
      }

      if (entries.length === 0) return

      // Sync to database using batch function
      const { error } = await supabase.rpc('batch_sync_arena_time', {
        p_user_id: user.id,
        p_entries: entries
      })

      if (!error) {
        // Clear synced data
        keys.forEach(key => localStorage.removeItem(key))
        localStorage.setItem(this.LAST_SYNC_KEY, now.toString())
      }
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  private clearOldLocalData() {
    // Clear data older than 7 days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_KEY + '_'))
    
    keys.forEach(key => {
      const dateStr = key.replace(this.STORAGE_KEY + '_', '')
      const date = new Date(dateStr)
      if (date < cutoff) {
        localStorage.removeItem(key)
      }
    })
  }

  // Cleanup method
  destroy() {
    this.saveCurrentSession()
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}