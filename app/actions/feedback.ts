'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import type { FeedbackData } from '@/types/feedback'
import type { Json, TablesInsert } from '@/types/supabase'
import { logger } from '@/lib/utils/logger'

type UserFeedbackInsert = TablesInsert<'user_feedback'>

export async function submitFeedback(data: FeedbackData) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    const sessionData: Json | null = data.sessionData
      ? (JSON.parse(JSON.stringify(data.sessionData)) as Json)
      : null

    const submission: UserFeedbackInsert = {
      rating: data.rating,
      feedback_text: data.feedbackText ?? null,
      page_url: data.pageUrl,
      page_path: data.pagePath,
      goal_id: data.pageContext.goal_id ?? null,
      solution_id: data.pageContext.solution_id ?? null,
      page_type: data.pageContext.page_type,
      user_id: user?.id ?? null,
      is_authenticated: Boolean(user),
      user_email: data.userEmail ?? user?.email ?? null,
      session_data: sessionData
    }

    const { error } = await supabase.from('user_feedback').insert(submission)

    if (error) {
      logger.error('feedback submission failed', { error })
      return { success: false, error: 'Failed to submit feedback' }
    }

    return { success: true }
  } catch (error) {
    logger.error('feedback submission unexpected error', error instanceof Error ? error : { error })
    return { success: false, error: 'An unexpected error occurred' }
  }
}
