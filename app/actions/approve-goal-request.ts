'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'

interface ApproveGoalRequestData {
  requestId: string
  categoryId: string
  adminNotes?: string
}

interface ApproveGoalRequestResponse {
  success: boolean
  error?: string
  goalId?: string
  goalTitle?: string
}

export async function approveGoalRequest(
  data: ApproveGoalRequestData
): Promise<ApproveGoalRequestResponse> {
  try {
    const supabase = await createServerSupabaseClient()

    // 1. Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // 2. Verify user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser) {
      return {
        success: false,
        error: 'Unauthorized - Admin access required'
      }
    }

    // 3. Get the goal request details
    const { data: request, error: requestError } = await supabase
      .from('goal_suggestions')
      .select('*')
      .eq('id', data.requestId)
      .single()

    if (requestError || !request) {
      return {
        success: false,
        error: 'Goal request not found'
      }
    }

    // 4. Validate request is still pending
    if (request.status !== 'pending') {
      return {
        success: false,
        error: `This request has already been ${request.status}`
      }
    }

    // 5. Validate category exists and belongs to the arena
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, arena_id')
      .eq('id', data.categoryId)
      .single()

    if (categoryError || !category) {
      return {
        success: false,
        error: 'Invalid category selected'
      }
    }

    // 6. If request has an arena_id, verify category belongs to that arena
    if (request.arena_id && category.arena_id !== request.arena_id) {
      return {
        success: false,
        error: `Category "${category.name}" does not belong to the selected arena`
      }
    }

    // 7. Create the new goal
    const { data: newGoal, error: goalError } = await supabase
      .from('goals')
      .insert({
        title: request.title,
        description: request.description,
        category_id: data.categoryId,
        arena_id: category.arena_id, // Use category's arena_id
        created_by: request.suggested_by, // Credit the original requester
        is_approved: true
      })
      .select('id, title')
      .single()

    if (goalError) {
      console.error('Failed to create goal:', goalError)
      return {
        success: false,
        error: 'Failed to create goal. Please try again.'
      }
    }

    // 8. Update the request status (atomic with goal creation intent)
    const { error: updateError } = await supabase
      .from('goal_suggestions')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: data.adminNotes || null,
        created_goal_id: newGoal.id
      })
      .eq('id', data.requestId)

    if (updateError) {
      // Rollback: delete the created goal
      await supabase
        .from('goals')
        .delete()
        .eq('id', newGoal.id)

      console.error('Failed to update request status:', updateError)
      return {
        success: false,
        error: 'Failed to update request status. Goal creation rolled back.'
      }
    }

    // 9. TODO: Award points to requester (optional - future feature)
    // await awardPoints({
    //   userId: request.suggested_by,
    //   points: 50,
    //   reason: 'goal_request_approved'
    // })

    // 10. TODO: Send notification to requester (optional - Phase 2)
    // if (request.user_email) {
    //   await sendEmail({
    //     to: request.user_email,
    //     subject: `Your goal "${request.title}" was approved!`,
    //     template: 'goal-request-approved',
    //     data: {
    //       goalTitle: newGoal.title,
    //       goalUrl: `/goal/${newGoal.id}`
    //     }
    //   })
    // }

    // 11. Revalidate relevant pages
    revalidatePath('/admin')
    revalidatePath('/browse')
    revalidatePath(`/goal/${newGoal.id}`)

    return {
      success: true,
      goalId: newGoal.id,
      goalTitle: newGoal.title
    }

  } catch (error) {
    console.error('Unexpected error in approveGoalRequest:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

interface RejectGoalRequestData {
  requestId: string
  reason: string
  adminNotes?: string
}

export async function rejectGoalRequest(
  data: RejectGoalRequestData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // 1. Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // 2. Verify user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser) {
      return { success: false, error: 'Unauthorized - Admin access required' }
    }

    // 3. Get the request to validate it exists and is pending
    const { data: request, error: requestError } = await supabase
      .from('goal_suggestions')
      .select('id, status, title')
      .eq('id', data.requestId)
      .single()

    if (requestError || !request) {
      return { success: false, error: 'Goal request not found' }
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        error: `This request has already been ${request.status}`
      }
    }

    // 4. Update request status to rejected
    const { error: updateError } = await supabase
      .from('goal_suggestions')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: `${data.reason}${data.adminNotes ? `\n\n${data.adminNotes}` : ''}`
      })
      .eq('id', data.requestId)

    if (updateError) {
      console.error('Failed to reject request:', updateError)
      return { success: false, error: 'Failed to reject request' }
    }

    // 5. TODO: Notify requester (optional - Phase 2)
    // await sendEmail({
    //   to: request.user_email,
    //   subject: `Update on your goal request "${request.title}"`,
    //   template: 'goal-request-rejected',
    //   data: { reason: data.reason }
    // })

    // 6. Revalidate admin page
    revalidatePath('/admin')

    return { success: true }

  } catch (error) {
    console.error('Unexpected error in rejectGoalRequest:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
