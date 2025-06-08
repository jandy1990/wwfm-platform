import { createSupabaseServerClient } from '@/lib/supabase-server'

export type SourceType = 'community_contributed' | 'ai_generated' | 'ai_enhanced' | 'expert_verified';

export interface SolutionWithImplementations {
  id: string
  title: string
  description: string | null
  solution_type: string
  source_type: SourceType
  category_id: string | null
  created_at: string
  updated_at: string
  implementations: {
    id: string
    variant_name: string
    description: string | null
    implementation_details: Record<string, unknown> | null
    created_at: string
    updated_at: string
    goal_links: {
      goal_id: string
      effectiveness_rating: number | null
      context_notes: string | null
      created_at: string
    }[]
  }[]
}

export async function getGoalSolutions(goalId: string): Promise<SolutionWithImplementations[]> {
  const supabase = await createSupabaseServerClient()

  // Fetch solutions linked to this goal through the three-table structure
  const { data, error } = await supabase
    .from('solutions')
    .select(`
      id,
      title,
      description,
      solution_type,
      source_type,
      category_id,
      created_at,
      updated_at,
      solution_implementations (
        id,
        variant_name,
        description,
        implementation_details,
        created_at,
        updated_at,
        goal_implementation_links!inner (
          goal_id,
          effectiveness_rating,
          context_notes,
          created_at
        )
      )
    `)
    .eq('solution_implementations.goal_implementation_links.goal_id', goalId)
    .eq('is_approved', true)

  if (error) {
    console.error('Error fetching goal solutions:', error)
    return []
  }

  // Filter implementations to only include those linked to this specific goal
  const solutionsWithFilteredImplementations = data?.map(solution => ({
    ...solution,
    implementations: solution.solution_implementations.filter(impl => 
      impl.goal_implementation_links.some(link => link.goal_id === goalId)
    ).map(impl => ({
      ...impl,
      goal_links: impl.goal_implementation_links.filter(link => link.goal_id === goalId)
    }))
  })) || []

  return solutionsWithFilteredImplementations as SolutionWithImplementations[]
}

export async function getGoalSolutionsByEffectiveness(goalId: string): Promise<SolutionWithImplementations[]> {
  const solutions = await getGoalSolutions(goalId)
  
  // Sort by highest effectiveness rating first
  return solutions.sort((a, b) => {
    const aMaxRating = Math.max(...a.implementations.flatMap(impl => 
      impl.goal_links.map(link => link.effectiveness_rating || 0)
    ))
    const bMaxRating = Math.max(...b.implementations.flatMap(impl => 
      impl.goal_links.map(link => link.effectiveness_rating || 0)
    ))
    return bMaxRating - aMaxRating
  })
}