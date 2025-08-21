import { createServerSupabaseClient } from '@/lib/database/server'
import { SolutionV2 } from '@/types/solution'

export type SourceType = 'community_contributed' | 'ai_generated' | 'ai_enhanced' | 'expert_verified' | 'ai_foundation';

// Updated type for the new schema
export interface GoalSolutionWithVariants extends SolutionV2 {
  solution_fields?: Record<string, unknown> | null
  aggregated_fields?: Record<string, unknown> | null // Added for aligned display data
  variants: {
    id: string
    variant_name: string
    category_fields?: Record<string, unknown> | null
    effectiveness: number | null
    time_to_results: string | null
    cost_range: string | null
    created_at: string
    updated_at: string
    goal_links: {
      goal_id: string
      avg_effectiveness: number | null
      rating_count: number | null
      typical_application: string | null
      contraindications: string | null
      notes: string | null
      created_at: string
    }[]
  }[]
}

export async function getGoalSolutions(goalId: string): Promise<GoalSolutionWithVariants[]> {
  const supabase = await createServerSupabaseClient()

  console.log(`[DEBUG] Fetching solutions for goal: ${goalId}`)

  // Get all goal implementation links with their variants and solutions
  const { data: goalLinks, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      avg_effectiveness,
      rating_count,
      solution_fields,
      aggregated_fields,
      solution_variants!implementation_id (
        id,
        variant_name,
        amount,
        unit,
        form,
        is_default,
        solutions (
          id,
          title,
          description,
          solution_category,
          solution_model,
          parent_concept,
          source_type,
          is_approved
        )
      )
    `)
    .eq('goal_id', goalId)
    .eq('solution_variants.solutions.is_approved', true)

  if (error) {
    console.error('[DEBUG] Error fetching goal links:', error)
  }

  console.log(`[DEBUG] Goal links fetched:`, goalLinks?.length || 0)

  // Transform the data to group by solution
  const solutionsMap = new Map();

  goalLinks?.forEach(link => {
    const variant = link.solution_variants;
    const solution = variant.solutions;
    
    if (!solutionsMap.has(solution.id)) {
      solutionsMap.set(solution.id, {
        ...solution,
        solution_fields: link.solution_fields, // Legacy AI data
        aggregated_fields: link.aggregated_fields, // New aligned format for display
        variants: []
      });
    }
    
    solutionsMap.get(solution.id).variants.push({
      ...variant,
      effectiveness: link.avg_effectiveness,
      rating_count: link.rating_count,
      goal_links: [{
        avg_effectiveness: link.avg_effectiveness,
        rating_count: link.rating_count
      }]
    });
  });

  const solutions = Array.from(solutionsMap.values())
  console.log(`[DEBUG] Total unique solutions: ${solutions.length}`)
  
  return solutions
}