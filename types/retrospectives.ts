// Type definitions for the Goal Retrospective feature
// These match the database schema created in the migration

export interface GoalRetrospective {
  id: string
  user_id: string
  rating_id: string
  goal_id: string
  solution_id?: string
  assessment_type: '6_month' | '12_month'
  achieved_date: string
  evaluated_date: string
  days_since_achievement: number
  counterfactual_impact?: number // 1-5 scale: how different life would be
  worth_pursuing?: boolean
  still_maintaining?: boolean
  unexpected_benefits?: string
  wisdom_note?: string
  life_domain_impacts?: {
    work?: number
    health?: number
    relationships?: number
    happiness?: number
  }
  response_time_seconds?: number
  reminder_count: number
  response_source?: 'in_app' | 'email' | 'magic_link'
  created_at: string
  updated_at: string
}

export interface RetrospectiveSchedule {
  id: string
  user_id: string
  rating_id: string
  goal_id: string
  solution_id?: string
  schedule_type: '6_month' | '12_month'
  scheduled_date: string // Date when retrospective is due
  status: 'pending' | 'sent' | 'responded' | 'expired' | 'dismissed'
  notification_sent_at?: string
  reminder_count: number
  last_reminder_at?: string
  responded_at?: string
  expired_at?: string
  dismissed_at?: string
  opted_in: boolean
  preferred_channel: 'in_app' | 'email' | 'both'
  created_at: string
  updated_at: string
}

export interface MailboxItem {
  id: string
  user_id: string
  retrospective_schedule_id: string
  goal_title: string
  solution_title: string
  achievement_date: string
  is_read: boolean
  is_dismissed: boolean
  priority: number
  created_at: string
  updated_at: string
}

export interface GoalWisdomScore {
  id: string
  goal_id: string
  lasting_value_score?: number // Average counterfactual impact (1-5)
  worth_pursuing_percentage?: number // % who say it was worth it
  maintenance_rate?: number // % still maintaining the achievement
  work_impact_avg?: number
  health_impact_avg?: number
  relationships_impact_avg?: number
  happiness_impact_avg?: number
  total_retrospectives: number
  retrospectives_6m: number
  retrospectives_12m: number
  common_benefits?: string[]
  wisdom_quotes?: string[]
  created_at: string
  updated_at: string
}

// Helper type for the counterfactual impact options
export interface ImpactOption {
  value: number
  emoji: string
  label: string
  description: string
}

export const IMPACT_OPTIONS: ImpactOption[] = [
  { value: 5, emoji: '🌟', label: 'Completely different', description: 'fundamental change' },
  { value: 4, emoji: '✨', label: 'Noticeably different', description: 'significant impact' },
  { value: 3, emoji: '💫', label: 'Somewhat different', description: 'moderate impact' },
  { value: 2, emoji: '⭐', label: 'Barely different', description: 'minor impact' },
  { value: 1, emoji: '○', label: 'No different', description: "didn't matter" }
]