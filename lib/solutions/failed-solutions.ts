// lib/solutions/failed-solutions.ts

import { supabase } from '@/lib/database/client';

export interface FailedSolutionRating {
  solution_id: string;
  goal_id: string;
  user_id: string;
  rating: number;
  solution_name: string;
}

/**
 * Search all approved solutions in the database
 * @param searchTerm - The search term (min 3 characters)
 * @returns Array of matching solutions
 */
export async function searchAllSolutions(searchTerm: string) {
  if (searchTerm.length < 3) {
    return [];
  }

  console.log('[searchAllSolutions] Calling RPC with:', searchTerm);
  const { data, error } = await supabase.rpc('search_all_solutions', {
    search_term: searchTerm
  });

  if (error) {
    console.error('Error searching solutions:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a rating for a failed solution (what didn't work)
 * This allows negative ratings to properly affect solution scores
 */
export async function createFailedSolutionRating({
  solution_id,
  goal_id,
  user_id,
  rating,
  solution_name
}: FailedSolutionRating) {
  const { data, error } = await supabase.rpc('create_failed_solution_rating', {
    p_solution_id: solution_id,
    p_goal_id: goal_id,
    p_user_id: user_id,
    p_rating: rating,
    p_solution_name: solution_name
  });

  if (error) {
    console.error('Error creating failed solution rating:', error);
    throw error;
  }

  return data;
}

/**
 * Process failed solutions after form submission
 * - Creates ratings for existing solutions
 * - Returns text-only list for non-existing solutions
 */
export async function processFailedSolutions(
  failedSolutions: Array<{ id?: string; name: string; rating: number }>,
  goalId: string,
  userId: string
) {
  const results = {
    ratingsCreated: 0,
    textOnlyFailed: [] as Array<{ name: string; rating: number }>,
    errors: [] as string[]
  };

  for (const failed of failedSolutions) {
    if (failed.id) {
      // This is an existing solution - create a rating
      try {
        await createFailedSolutionRating({
          solution_id: failed.id,
          goal_id: goalId,
          user_id: userId,
          rating: failed.rating,
          solution_name: failed.name
        });
        results.ratingsCreated++;
      } catch (error) {
        results.errors.push(`Failed to rate ${failed.name}: ${error}`);
      }
    } else {
      // Non-existing solution - just store as text
      results.textOnlyFailed.push({
        name: failed.name,
        rating: failed.rating
      });
    }
  }

  return results;
}