import { createServerSupabaseClient } from '@/lib/database/server'
import { SolutionV2 } from '@/types/solution'

export type SourceType = 'community_contributed' | 'ai_generated' | 'ai_enhanced' | 'expert_verified' | 'ai_foundation';

// Updated type for the new schema with AI transition support
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
      // AI to Human Transition fields
      human_rating_count: number | null
      data_display_mode: 'ai' | 'human' | null
      transition_threshold: number | null
      ai_snapshot?: Record<string, unknown> | null
      transitioned_at?: string | null
    }[]
  }[]
}

export async function getGoalSolutions(goalId: string): Promise<GoalSolutionWithVariants[]> {
  const supabase = await createServerSupabaseClient()

  console.log(`[DEBUG] Fetching solutions for goal: ${goalId}`)

  // Get all goal implementation links with their variants and solutions + transition data
  const { data: goalLinks, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      avg_effectiveness,
      rating_count,
      solution_fields,
      aggregated_fields,
      human_rating_count,
      data_display_mode,
      transition_threshold,
      ai_snapshot,
      transitioned_at,
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

  goalLinks?.forEach((link: any) => {
    const variant = link.solution_variants;
    const solution = variant?.solutions;
    
    if (!solution) return; // Skip invalid entries
    
    if (!solutionsMap.has(solution.id)) {
      solutionsMap.set(solution.id, {
        ...solution,
        solution_fields: link.solution_fields, // Legacy AI data
        aggregated_fields: link.aggregated_fields, // New aligned format for display
        variants: []
      });
    }
    
    const solutionData = solutionsMap.get(solution.id);
    if (solutionData) {
      solutionData.variants.push({
        ...variant,
        effectiveness: link.avg_effectiveness,
        rating_count: link.rating_count,
        goal_links: [{
          goal_id: goalId,
          avg_effectiveness: link.avg_effectiveness,
          rating_count: link.rating_count,
          typical_application: link.typical_application,
          contraindications: link.contraindications,
          notes: link.notes,
          created_at: link.created_at,
          // AI to Human Transition fields
          human_rating_count: link.human_rating_count || 0,
          data_display_mode: link.data_display_mode || 'ai',
          transition_threshold: link.transition_threshold || 3,
          ai_snapshot: link.ai_snapshot,
          transitioned_at: link.transitioned_at
        }]
      });
    }
  });

  const solutions = Array.from(solutionsMap.values())
  console.log(`[DEBUG] Total unique solutions: ${solutions.length}`)
  
  return solutions
}