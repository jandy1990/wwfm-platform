import { createSupabaseServerClient } from '@/lib/supabase-server'
import { SolutionV2, SolutionVariant, SolutionWithVariants } from '@/types/solution'

export type SourceType = 'community_contributed' | 'ai_generated' | 'ai_enhanced' | 'expert_verified' | 'ai_foundation';

// Updated type for the new schema
export interface GoalSolutionWithVariants extends SolutionV2 {
  variants: {
    id: string
    variant_name: string
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
  const supabase = await createSupabaseServerClient()

  console.log(`[DEBUG] Fetching solutions for goal: ${goalId}`)

  // Get all goal implementation links with their variants and solutions
  const { data: goalLinks, error: linksError } = await supabase
    .from('goal_implementation_links')
    .select(`
      goal_id,
      implementation_id,
      avg_effectiveness,
      rating_count,
      typical_application,
      contraindications,
      notes,
      created_at,
      solution_variants!implementation_id (
        id,
        variant_name,
        solution_id,
        created_at,
        solutions!solution_id (
          id,
          title,
          description,
          solution_category,
          source_type,
          solution_model,
          parent_concept,
          created_at,
          updated_at,
          is_approved
        )
      )
    `)
    .eq('goal_id', goalId)
    .not('implementation_id', 'is', null)

  if (linksError) {
    console.error('[DEBUG] Error fetching goal links:', linksError)
  }

  console.log(`[DEBUG] Goal links fetched:`, goalLinks?.length || 0)

  // Transform the data to match our interface
  const solutionMap = new Map<string, GoalSolutionWithVariants>()
  
  // Process all goal links
  goalLinks?.forEach((link: any) => {
    const variant = link.solution_variants as any
    if (!variant || !variant.solutions) {
      console.error('[DEBUG] Missing variant or solution data:', link)
      return
    }
    
    const solution = variant.solutions
    const solutionId = solution.id
    
    // Skip unapproved solutions
    if (!solution.is_approved) {
      return
    }
    
    if (!solutionMap.has(solutionId)) {
      solutionMap.set(solutionId, {
        ...solution,
        variants: []
      })
    }
    
    const existingSolution = solutionMap.get(solutionId)!
    
    // Check if this variant already exists
    const existingVariantIndex = existingSolution.variants.findIndex(v => v.id === variant.id)
    
    if (existingVariantIndex === -1) {
      // New variant
      existingSolution.variants.push({
        id: variant.id,
        variant_name: variant.variant_name,
        effectiveness: null,
        time_to_results: null,
        cost_range: null,
        created_at: variant.created_at,
        updated_at: variant.created_at,
        goal_links: [{
          goal_id: link.goal_id,
          avg_effectiveness: link.avg_effectiveness,
          rating_count: link.rating_count,
          typical_application: link.typical_application,
          contraindications: link.contraindications,
          notes: link.notes,
          created_at: link.created_at
        }]
      })
    } else {
      // Existing variant - add this goal link
      existingSolution.variants[existingVariantIndex].goal_links.push({
        goal_id: link.goal_id,
        avg_effectiveness: link.avg_effectiveness,
        rating_count: link.rating_count,
        typical_application: link.typical_application,
        contraindications: link.contraindications,
        notes: link.notes,
        created_at: link.created_at
      })
    }
  })

  const solutions = Array.from(solutionMap.values())
  console.log(`[DEBUG] Total unique solutions: ${solutions.length}`)
  
  return solutions
}