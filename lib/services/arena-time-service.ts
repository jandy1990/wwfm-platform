import { createClient } from '@/lib/database/client'

export interface ArenaStats {
  arena_name: string
  total_seconds: number
  visit_count: number
  last_visited: string
  first_visited: string
  days_active: number
}

export interface TimeSummary {
  total_seconds: number
  total_visits: number
  unique_arenas: number
  most_visited_arena: string | null
  most_visited_seconds: number | null
  least_visited_arena: string | null
  least_visited_seconds: number | null
  average_session_length: number
}

export class ArenaTimeService {
  private supabase = createClient()

  async getUserArenaStats(days?: number): Promise<ArenaStats[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await this.supabase.rpc('get_user_arena_stats', {
      p_user_id: user.id,
      p_days: days || null
    })

    if (error) {
      if (error.code === '42P01' || error.code === '42883') {
        console.warn('Arena stats RPC unavailable; skipping analytics block')
        return []
      }
      console.error('Failed to fetch arena stats:', error)
      return []
    }

    return data || []
  }

  async getUserTimeSummary(days?: number): Promise<TimeSummary | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await this.supabase.rpc('get_user_time_summary', {
      p_user_id: user.id,
      p_days: days || null
    })

    if (error) {
      if (error.code === '42P01' || error.code === '42883') {
        console.warn('Arena time summary RPC unavailable; skipping analytics block')
        return null
      }
      console.error('Failed to fetch time summary:', error)
      return null
    }

    return data?.[0] || null
  }

  formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}
