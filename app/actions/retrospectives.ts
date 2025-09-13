'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { 
  MailboxItem 
} from '@/types/retrospectives'

/**
 * Get pending retrospectives for a user
 * This checks for any retrospectives that are due and creates mailbox items
 */
export async function getPendingRetrospectives(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }
  
  const today = new Date().toISOString().split('T')[0]
  
  // Get schedules that are due (scheduled_date <= today)
  const { data: schedules, error } = await supabase
    .from('retrospective_schedules')
    .select(`
      *,
      goals (title),
      solutions (title),
      ratings (created_at)
    `)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })
  
  if (error) {
    console.error('Error fetching retrospectives:', error)
    return []
  }
  
  // Create mailbox items for any due retrospectives that don't have one yet
  for (const schedule of schedules || []) {
    // Check if mailbox item already exists
    const { data: existing } = await supabase
      .from('mailbox_items')
      .select('id')
      .eq('retrospective_schedule_id', schedule.id)
      .single()
    
    if (!existing) {
      // Create new mailbox item
      await supabase
        .from('mailbox_items')
        .insert({
          user_id: userId,
          retrospective_schedule_id: schedule.id,
          goal_title: schedule.goals?.title || 'Unknown Goal',
          solution_title: schedule.solutions?.title || 'Unknown Solution',
          achievement_date: schedule.ratings?.created_at || schedule.created_at,
          is_read: false,
          is_dismissed: false,
          priority: 1
        })
    }
  }
  
  return schedules || []
}

/**
 * Get mailbox items for the current user
 */
export async function getMailboxItems(userId: string): Promise<MailboxItem[]> {
  const supabase = await createServerSupabaseClient()
  
  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }
  
  // First, ensure any due retrospectives have mailbox items
  await getPendingRetrospectives(userId)
  
  // Now get all non-dismissed mailbox items
  const { data, error } = await supabase
    .from('mailbox_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching mailbox items:', error)
    return []
  }
  
  return data || []
}

/**
 * Mark a mailbox item as read
 */
export async function markAsRead(itemId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { error } = await supabase
    .from('mailbox_items')
    .update({ 
      is_read: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)
    .eq('user_id', user.id) // Security: ensure user owns this item
  
  if (error) throw error
}

/**
 * Dismiss a retrospective (user clicked "Not now")
 */
export async function dismissRetrospective(scheduleId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const now = new Date().toISOString()
  
  // Update schedule status to dismissed
  await supabase
    .from('retrospective_schedules')
    .update({ 
      status: 'dismissed',
      dismissed_at: now,
      updated_at: now
    })
    .eq('id', scheduleId)
    .eq('user_id', user.id)
  
  // Also dismiss the mailbox item
  await supabase
    .from('mailbox_items')
    .update({ 
      is_dismissed: true,
      updated_at: now
    })
    .eq('retrospective_schedule_id', scheduleId)
    .eq('user_id', user.id)
}

/**
 * Submit a retrospective response
 */
export async function submitRetrospective(
  scheduleId: string,
  data: {
    counterfactual_impact: number
    worth_pursuing?: boolean
    benefits_lasted?: boolean
    unexpected_benefits?: string
    wisdom_note?: string
  }
) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Get the schedule details
  const { data: schedule, error: scheduleError } = await supabase
    .from('retrospective_schedules')
    .select('*, ratings(created_at)')
    .eq('id', scheduleId)
    .eq('user_id', user.id)
    .single()
  
  if (scheduleError || !schedule) {
    throw new Error('Schedule not found')
  }
  
  // Create the retrospective entry
  const { data: retrospective, error } = await supabase
    .from('goal_retrospectives')
    .insert({
      user_id: user.id,
      rating_id: schedule.rating_id,
      goal_id: schedule.goal_id,
      solution_id: schedule.solution_id,
      assessment_type: schedule.schedule_type,
      achieved_date: schedule.ratings.created_at,
      evaluated_date: new Date().toISOString(),
      counterfactual_impact: data.counterfactual_impact,
      worth_pursuing: data.worth_pursuing ?? (data.counterfactual_impact >= 3),
      benefits_lasted: data.benefits_lasted,
      unexpected_benefits: data.unexpected_benefits,
      wisdom_note: data.wisdom_note,
      response_source: 'in_app'
    })
    .select()
    .single()
  
  if (error) throw error
  
  const now = new Date().toISOString()
  
  // Update schedule status to responded
  await supabase
    .from('retrospective_schedules')
    .update({ 
      status: 'responded',
      responded_at: now,
      updated_at: now
    })
    .eq('id', scheduleId)
  
  // Dismiss the mailbox item
  await supabase
    .from('mailbox_items')
    .update({ 
      is_dismissed: true,
      updated_at: now
    })
    .eq('retrospective_schedule_id', scheduleId)
  
  // If this was a 6-month retrospective, schedule the 12-month follow-up
  if (schedule.schedule_type === '6_month') {
    const twelveMonthsFromOriginal = new Date(schedule.ratings.created_at)
    twelveMonthsFromOriginal.setMonth(twelveMonthsFromOriginal.getMonth() + 12)
    
    await supabase
      .from('retrospective_schedules')
      .insert({
        user_id: user.id,
        rating_id: schedule.rating_id,
        goal_id: schedule.goal_id,
        solution_id: schedule.solution_id,
        schedule_type: '12_month',
        scheduled_date: twelveMonthsFromOriginal.toISOString().split('T')[0],
        status: 'pending',
        opted_in: true,
        preferred_channel: 'in_app'
      })
  }

  // Update lasting benefit rate at the link level
  if (data.benefits_lasted !== undefined) {
    // Get the variant ID for this solution
    const { data: variant } = await supabase
      .from('solution_variants')
      .select('id')
      .eq('solution_id', schedule.solution_id)
      .eq('is_default', true)
      .single()
    
    if (variant) {
      // Get current maintenance stats
      const { data: link } = await supabase
        .from('goal_implementation_links')
        .select('lasting_benefit_rate, lasting_benefit_count')
        .eq('goal_id', schedule.goal_id)
        .eq('implementation_id', variant.id)
        .single()
      
      if (link) {
        // Calculate new maintenance rate
        const currentCount = link.lasting_benefit_count || 0
        const currentRate = link.lasting_benefit_rate || 0
        const currentWithBenefits = Math.round((currentRate / 100) * currentCount)
        const newCount = currentCount + 1
        const newWithBenefits = currentWithBenefits + (data.benefits_lasted ? 1 : 0)
        const newRate = (newWithBenefits / newCount) * 100
        
        // Update the link
        await supabase
          .from('goal_implementation_links')
          .update({
            lasting_benefit_rate: newRate,
            lasting_benefit_count: newCount
          })
          .eq('goal_id', schedule.goal_id)
          .eq('implementation_id', variant.id)
      }
    }
  }
  
  return retrospective
}

/**
 * Get unread retrospective count for header badge
 */
export async function getUnreadRetrospectiveCount(): Promise<number> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  
  // First ensure any due retrospectives have mailbox items
  await getPendingRetrospectives(user.id)
  
  // Count unread, non-dismissed items
  const { count } = await supabase
    .from('mailbox_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
    .eq('is_dismissed', false)
  
  return count || 0
}

/**
 * Get wisdom scores for a specific goal
 */
export async function getGoalWisdomScore(goalId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('goal_wisdom_scores')
    .select('*')
    .eq('goal_id', goalId)
    .single()
  
  if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
    console.error('Error fetching wisdom score:', error)
  }
  
  return data
}