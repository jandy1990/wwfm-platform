'use server';

import { createServerSupabaseClient } from '@/lib/database/server';
import { cookies } from 'next/headers';

export async function trackGoalView(goalId: string) {
  try {
    // Get or create session tracking cookie
    const cookieStore = await cookies();
    const viewedGoals = cookieStore.get('viewed_goals');
    const viewedList = viewedGoals ? JSON.parse(viewedGoals.value) : [];

    // Check if already viewed in this session
    if (viewedList.includes(goalId)) {
      return { success: true, skipped: true };
    }

    const supabase = await createServerSupabaseClient();

    // Increment view count using database function
    const { error } = await supabase
      .rpc('increment_goal_view_count', { goal_id: goalId });

    if (error) {
      console.error('Failed to track goal view:', error);
      return { success: false, error: 'Failed to track view' };
    }

    // Add to viewed list and update cookie (24 hour expiry)
    viewedList.push(goalId);
    cookieStore.set('viewed_goals', JSON.stringify(viewedList), {
      maxAge: 86400, // 24 hours
      httpOnly: true,
      sameSite: 'strict'
    });

    return { success: true };
  } catch (error) {
    console.error('View tracking error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}