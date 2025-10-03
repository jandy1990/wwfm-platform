'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import type { Json, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import { MailboxItem, GoalWisdomScore } from '@/types/retrospectives'

type RetrospectiveScheduleRow = Tables<'retrospective_schedules'>
type RetrospectiveScheduleWithRelations = RetrospectiveScheduleRow & {
  goals: Pick<Tables<'goals'>, 'title'> | null
  solutions: Pick<Tables<'solutions'>, 'title'> | null
  ratings: Pick<Tables<'ratings'>, 'created_at'> | null
}

type GoalRetrospectiveRow = Tables<'goal_retrospectives'>

/**
 * Get pending retrospectives for a user
 * This checks for any retrospectives that are due and creates mailbox items
 */
export async function getPendingRetrospectives(userId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: schedules, error } = await supabase
    .from('retrospective_schedules')
    .select(
      `
        *,
        goals (title),
        solutions (title),
        ratings (created_at)
      `
    )
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })
    .returns<RetrospectiveScheduleWithRelations[]>()

  if (error) {
    console.error('Error fetching retrospectives:', error)
    return []
  }

  for (const schedule of schedules ?? []) {
    const { data: existing } = await supabase
      .from('mailbox_items')
      .select('id')
      .eq('retrospective_schedule_id', schedule.id)
      .single()
      .returns<Pick<Tables<'mailbox_items'>, 'id'> | null>()

    if (!existing) {
      const achievementDate =
        schedule.ratings?.created_at ?? schedule.created_at ?? new Date().toISOString()

      const mailboxInsert: TablesInsert<'mailbox_items'> = {
        user_id: userId,
        retrospective_schedule_id: schedule.id,
        goal_title: schedule.goals?.title ?? 'Unknown Goal',
        solution_title: schedule.solutions?.title ?? 'Unknown Solution',
        achievement_date: achievementDate,
        is_read: false,
        is_dismissed: false,
        priority: 1
      }

      await supabase.from('mailbox_items').insert(mailboxInsert)
    }
  }

  return schedules ?? []
}

/**
 * Get mailbox items for the current user
 */
export async function getMailboxItems(userId: string): Promise<MailboxItem[]> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  await getPendingRetrospectives(userId)

  const { data, error } = await supabase
    .from('mailbox_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .returns<Tables<'mailbox_items'>[]>()

  if (error) {
    console.error('Error fetching mailbox items:', error)
    return []
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    user_id: item.user_id,
    retrospective_schedule_id: item.retrospective_schedule_id ?? '',
    goal_title: item.goal_title,
    solution_title: item.solution_title,
    achievement_date: item.achievement_date,
    is_read: item.is_read ?? false,
    is_dismissed: item.is_dismissed ?? false,
    priority: item.priority ?? 0,
    created_at: item.created_at ?? new Date().toISOString(),
    updated_at: item.updated_at ?? new Date().toISOString()
  }))
}

/**
 * Mark a mailbox item as read
 */
export async function markAsRead(itemId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const updatePayload: TablesUpdate<'mailbox_items'> = {
    is_read: true,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('mailbox_items')
    .update(updatePayload)
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Count unread retrospective mailbox items for the authenticated user
 */
export async function getUnreadRetrospectiveCount(): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  const { count, error } = await supabase
    .from('mailbox_items')
    .select('*', { head: true, count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_dismissed', false)
    .eq('is_read', false)

  if (error) {
    console.error('Error counting unread retrospectives:', error)
    return 0
  }

  return count ?? 0
}

/**
 * Dismiss a retrospective (user clicked "Not now")
 */
export async function dismissRetrospective(scheduleId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const now = new Date().toISOString()

  const scheduleUpdate: TablesUpdate<'retrospective_schedules'> = {
    status: 'dismissed',
    dismissed_at: now,
    updated_at: now
  }

  await supabase
    .from('retrospective_schedules')
    .update(scheduleUpdate)
    .eq('id', scheduleId)
    .eq('user_id', user.id)

  const mailboxUpdate: TablesUpdate<'mailbox_items'> = {
    is_dismissed: true,
    updated_at: now
  }

  await supabase
    .from('mailbox_items')
    .update(mailboxUpdate)
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

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: schedule, error: scheduleError } = await supabase
    .from('retrospective_schedules')
    .select('*, ratings ( created_at )')
    .eq('id', scheduleId)
    .eq('user_id', user.id)
    .single()
    .returns<
      (RetrospectiveScheduleRow & {
        ratings: Pick<Tables<'ratings'>, 'created_at'> | null
      }) | null
    >()

  if (scheduleError || !schedule) {
    throw new Error('Schedule not found')
  }

  const achievedDate = schedule.ratings?.created_at ?? schedule.created_at

  const retrospectiveInsert: TablesInsert<'goal_retrospectives'> = {
    user_id: user.id,
    rating_id: schedule.rating_id,
    goal_id: schedule.goal_id,
    solution_id: schedule.solution_id,
    assessment_type: schedule.schedule_type,
    achieved_date: achievedDate,
    evaluated_date: new Date().toISOString(),
    counterfactual_impact: data.counterfactual_impact,
    worth_pursuing: data.worth_pursuing ?? (data.counterfactual_impact >= 3),
    benefits_lasted: data.benefits_lasted ?? null,
    unexpected_benefits: data.unexpected_benefits ?? null,
    wisdom_note: data.wisdom_note ?? null,
    response_source: 'in_app'
  }

  const { data: retrospective, error } = await supabase
    .from('goal_retrospectives')
    .insert(retrospectiveInsert)
    .select()
    .single()
    .returns<GoalRetrospectiveRow | null>()

  if (error) throw error

  const now = new Date().toISOString()

  const scheduleUpdate: TablesUpdate<'retrospective_schedules'> = {
    status: 'responded',
    responded_at: now,
    updated_at: now
  }

  await supabase
    .from('retrospective_schedules')
    .update(scheduleUpdate)
    .eq('id', scheduleId)

  const mailboxUpdate: TablesUpdate<'mailbox_items'> = {
    is_dismissed: true,
    updated_at: now
  }

  await supabase
    .from('mailbox_items')
    .update(mailboxUpdate)
    .eq('retrospective_schedule_id', scheduleId)

  if (schedule.schedule_type === '6_month') {
    const twelveMonthsFromOriginal = new Date(achievedDate ?? now)
    twelveMonthsFromOriginal.setMonth(twelveMonthsFromOriginal.getMonth() + 12)

    const followUpInsert: TablesInsert<'retrospective_schedules'> = {
      user_id: user.id,
      rating_id: schedule.rating_id,
      goal_id: schedule.goal_id,
      solution_id: schedule.solution_id,
      schedule_type: '12_month',
      scheduled_date: twelveMonthsFromOriginal.toISOString().split('T')[0],
      status: 'pending',
      opted_in: true,
      preferred_channel: 'in_app'
    }

    await supabase.from('retrospective_schedules').insert(followUpInsert)
  }

  if (data.benefits_lasted !== undefined) {
    const { data: variant } = await supabase
      .from('solution_variants')
      .select('id')
      .eq('solution_id', schedule.solution_id)
      .eq('is_default', true)
      .single()
      .returns<Pick<Tables<'solution_variants'>, 'id'> | null>()

    if (variant) {
      const { data: link } = await supabase
        .from('goal_implementation_links')
        .select('lasting_benefit_rate, lasting_benefit_count')
        .eq('goal_id', schedule.goal_id)
        .eq('implementation_id', variant.id)
        .single()
        .returns<
          Pick<Tables<'goal_implementation_links'>, 'lasting_benefit_rate' | 'lasting_benefit_count'> | null
        >()

      if (link) {
        const currentCount = link.lasting_benefit_count ?? 0
        const currentRate = link.lasting_benefit_rate ?? 0
        const currentWithBenefits = Math.round((currentRate / 100) * currentCount)
        const newCount = currentCount + 1
        const newWithBenefits = currentWithBenefits + (data.benefits_lasted ? 1 : 0)
        const newRate = newCount === 0 ? 0 : (newWithBenefits / newCount) * 100

        const linkUpdate: TablesUpdate<'goal_implementation_links'> = {
          lasting_benefit_rate: newRate,
          lasting_benefit_count: newCount
        }

        await supabase
          .from('goal_implementation_links')
          .update(linkUpdate)
          .eq('goal_id', schedule.goal_id)
          .eq('implementation_id', variant.id)
      }
    }
  }

  return retrospective
}

/**
 * Get wisdom scores for a specific goal
 */
export async function getGoalWisdomScore(goalId: string): Promise<GoalWisdomScore | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('goal_wisdom_scores')
    .select('*')
    .eq('goal_id', goalId)
    .single()
    .returns<Tables<'goal_wisdom_scores'> | null>()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching wisdom score:', error)
  }

  if (!data) {
    return null
  }

  const row = data

  return {
    id: row.id,
    goal_id: row.goal_id,
    lasting_value_score: row.lasting_value_score ?? undefined,
    worth_pursuing_percentage: row.worth_pursuing_percentage ?? undefined,
    maintenance_rate: row.maintenance_rate ?? undefined,
    work_impact_avg: row.work_impact_avg ?? undefined,
    health_impact_avg: row.health_impact_avg ?? undefined,
    relationships_impact_avg: row.relationships_impact_avg ?? undefined,
    happiness_impact_avg: row.happiness_impact_avg ?? undefined,
    total_retrospectives: row.total_retrospectives,
    retrospectives_6m: row.retrospectives_6m,
    retrospectives_12m: row.retrospectives_12m,
    common_benefits: toStringArray(row.common_benefits),
    wisdom_quotes: toStringArray(row.wisdom_quotes),
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}
function toStringArray(value: Json | null | undefined): string[] | undefined {
  if (!value) return undefined
  if (!Array.isArray(value)) return undefined

  const strings = value.filter((entry): entry is string => typeof entry === 'string')
  return strings.length > 0 ? strings : undefined
}
