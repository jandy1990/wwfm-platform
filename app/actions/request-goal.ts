'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'

interface RequestGoalData {
  title: string
  description: string
  arena_id: string | null
  notify: boolean
}

interface RequestGoalResponse {
  success: boolean
  error?: string
  message?: string
  isDuplicate?: boolean
}

export async function requestGoal(data: RequestGoalData): Promise<RequestGoalResponse> {
  try {
    const supabase = await createServerSupabaseClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be signed in to request goals. Please sign in or create an account.'
      }
    }

    // 2. Check email verification
    if (!user.email_confirmed_at) {
      return {
        success: false,
        error: 'Please verify your email before requesting goals. Check your inbox for a verification link.'
      }
    }

    // 3. Validate input - Title
    const trimmedTitle = data.title?.trim()
    if (!trimmedTitle) {
      return { success: false, error: 'Goal title is required' }
    }

    if (trimmedTitle.length < 10) {
      return {
        success: false,
        error: 'Goal title must be at least 10 characters. Please be more specific.'
      }
    }

    if (trimmedTitle.length > 200) {
      return {
        success: false,
        error: 'Goal title must be less than 200 characters'
      }
    }

    // 4. Validate input - Description
    const trimmedDescription = data.description?.trim()
    if (!trimmedDescription) {
      return { success: false, error: 'Description is required' }
    }

    if (trimmedDescription.length < 20) {
      return {
        success: false,
        error: 'Please provide a more detailed description (at least 20 characters)'
      }
    }

    if (trimmedDescription.length > 500) {
      return {
        success: false,
        error: 'Description must be less than 500 characters'
      }
    }

    // 5. Check rate limit (5 requests per 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('goal_suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('suggested_by', user.id)
      .gte('created_at', oneDayAgo)

    if (countError) {
      console.error('Rate limit check failed:', countError)
      return {
        success: false,
        error: 'Failed to check request limit. Please try again.'
      }
    }

    if (count && count >= 5) {
      return {
        success: false,
        error: 'You can submit up to 5 goal requests per day. Please try again tomorrow.'
      }
    }

    // 6. Normalize title for duplicate detection
    const titleNormalized = trimmedTitle.toLowerCase().trim()

    // 7. Validate arena_id if provided
    if (data.arena_id) {
      const { data: arena, error: arenaError } = await supabase
        .from('arenas')
        .select('id')
        .eq('id', data.arena_id)
        .single()

      if (arenaError || !arena) {
        return {
          success: false,
          error: 'Invalid arena selected. Please try again.'
        }
      }
    }

    // 8. Insert request (database handles duplicate prevention via UNIQUE constraint)
    const { error: insertError } = await supabase
      .from('goal_suggestions')
      .insert({
        title: trimmedTitle,
        title_normalized: titleNormalized,
        description: trimmedDescription,
        arena_id: data.arena_id || null,
        suggested_by: user.id,
        user_email: user.email || '',
        status: 'pending'
      })

    if (insertError) {
      // Handle duplicate error (UNIQUE constraint violation)
      if (insertError.code === '23505') {
        // Check if there's a pending request with this title
        const { data: existingRequest } = await supabase
          .from('goal_suggestions')
          .select('id, title, status')
          .eq('title_normalized', titleNormalized)
          .eq('status', 'pending')
          .single()

        if (existingRequest) {
          return {
            success: false,
            error: `The goal "${existingRequest.title}" has already been requested and is pending review.`,
            isDuplicate: true
          }
        }

        // Otherwise it might be a different status
        return {
          success: false,
          error: 'A similar goal request already exists.',
          isDuplicate: true
        }
      }

      console.error('Failed to insert goal request:', insertError)
      return {
        success: false,
        error: 'Failed to submit request. Please try again.'
      }
    }

    // 9. Revalidate admin page cache so new request appears
    revalidatePath('/admin')

    // 10. Success!
    const message = data.notify
      ? 'Request submitted! We\'ll email you when it\'s reviewed.'
      : 'Request submitted! We\'ll review it soon.'

    return {
      success: true,
      message
    }

  } catch (error) {
    console.error('Unexpected error in requestGoal:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Helper function to check if a goal request already exists
 * Useful for showing request count in UI
 */
export async function checkGoalRequestExists(searchQuery: string): Promise<{
  exists: boolean
  count?: number
}> {
  try {
    const supabase = await createServerSupabaseClient()
    const titleNormalized = searchQuery.toLowerCase().trim()

    const { count, error } = await supabase
      .from('goal_suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('title_normalized', titleNormalized)
      .eq('status', 'pending')

    if (error) {
      console.error('Failed to check existing request:', error)
      return { exists: false }
    }

    return {
      exists: (count || 0) > 0,
      count: count || 0
    }
  } catch (error) {
    console.error('Unexpected error checking request:', error)
    return { exists: false }
  }
}
