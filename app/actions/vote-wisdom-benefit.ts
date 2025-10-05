'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { logger } from '@/lib/utils/logger'

/**
 * Vote on (or un-vote) a wisdom benefit
 * Similar to discussion voting pattern
 */
export async function voteWisdomBenefit(
  goalId: string,
  benefitText: string
): Promise<{ success: boolean; hasVoted: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, hasVoted: false, error: 'Must be signed in to vote' }
    }

    // Check if user has already voted on this benefit
    const { data: existingVote } = await supabase
      .from('wisdom_benefit_votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('goal_id', goalId)
      .eq('benefit_text', benefitText)
      .single()

    if (existingVote) {
      // Remove vote (un-vote)
      const { error: deleteError } = await supabase
        .from('wisdom_benefit_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('goal_id', goalId)
        .eq('benefit_text', benefitText)

      if (deleteError) {
        logger.error('voteWisdomBenefit: error deleting vote', { error: deleteError, goalId, userId: user.id })
        return { success: false, hasVoted: true, error: 'Failed to remove vote' }
      }

      return { success: true, hasVoted: false }
    } else {
      // Add vote
      const { error: insertError } = await supabase
        .from('wisdom_benefit_votes')
        .insert({
          user_id: user.id,
          goal_id: goalId,
          benefit_text: benefitText
        })

      if (insertError) {
        logger.error('voteWisdomBenefit: error inserting vote', { error: insertError, goalId, userId: user.id })
        return { success: false, hasVoted: false, error: 'Failed to add vote' }
      }

      return { success: true, hasVoted: true }
    }
  } catch (error) {
    logger.error('voteWisdomBenefit: unexpected error', error instanceof Error ? error : { error })
    return { success: false, hasVoted: false, error: 'Unexpected error' }
  }
}

/**
 * Get vote counts for all benefits of a goal
 */
export async function getBenefitVoteCounts(
  goalId: string,
  benefits: string[]
): Promise<Record<string, number>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: votes } = await supabase
      .from('wisdom_benefit_votes')
      .select('benefit_text')
      .eq('goal_id', goalId)
      .in('benefit_text', benefits)

    if (!votes) return {}

    // Count votes per benefit
    const counts: Record<string, number> = {}
    for (const vote of votes) {
      counts[vote.benefit_text] = (counts[vote.benefit_text] || 0) + 1
    }

    return counts
  } catch (error) {
    logger.error('getBenefitVoteCounts: unexpected error', error instanceof Error ? error : { error, goalId })
    return {}
  }
}

/**
 * Get user's votes for a goal's benefits
 */
export async function getUserBenefitVotes(
  goalId: string,
  userId: string | undefined
): Promise<Set<string>> {
  if (!userId) return new Set()

  try {
    const supabase = await createServerSupabaseClient()

    const { data: votes } = await supabase
      .from('wisdom_benefit_votes')
      .select('benefit_text')
      .eq('user_id', userId)
      .eq('goal_id', goalId)

    if (!votes) return new Set()

    return new Set(votes.map(v => v.benefit_text))
  } catch (error) {
    logger.error('getUserBenefitVotes: unexpected error', error instanceof Error ? error : { error, goalId, userId })
    return new Set()
  }
}
