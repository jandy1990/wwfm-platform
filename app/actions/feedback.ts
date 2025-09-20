'use server';

import { createServerSupabaseClient } from '@/lib/database/server';
import { FeedbackData } from '@/types/feedback';

export async function submitFeedback(data: FeedbackData) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get user if authenticated (optional)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Prepare submission data
    const submission = {
      rating: data.rating,
      feedback_text: data.feedbackText || null,
      page_url: data.pageUrl,
      page_path: data.pagePath,
      goal_id: data.pageContext.goal_id || null,
      solution_id: data.pageContext.solution_id || null,
      page_type: data.pageContext.page_type,
      user_id: user?.id || null,
      is_authenticated: !!user,
      user_email: data.userEmail || user?.email || null,
      session_data: data.sessionData || {}
    };
    
    // Insert feedback
    const { error } = await supabase
      .from('user_feedback')
      .insert(submission);
    
    if (error) {
      console.error('Failed to submit feedback:', error);
      return { success: false, error: 'Failed to submit feedback' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Feedback submission error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// End of file

