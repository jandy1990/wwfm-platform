import { createSupabaseServerClient } from '@/lib/supabase-server'

export type SourceType = 'community_contributed' | 'ai_generated' | 'ai_enhanced' | 'expert_verified';

export interface SolutionWithImplementations {
  id: string
  title: string
  description: string | null
  solution_type: string
  source_type: SourceType
  created_at: string
  updated_at: string
  implementations: {
    id: string
    name: string
    details: Record<string, unknown> | null
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

export async function getGoalSolutions(goalId: string): Promise<SolutionWithImplementations[]> {
  const supabase = await createSupabaseServerClient()

  console.log(`[DEBUG] Fetching solutions for goal: ${goalId}`)

  // First approach: Get all links for this goal, then fetch related data
  const { data: goalLinks, error: linksError } = await supabase
    .from('goal_implementation_links')
    .select(`
      goal_id,
      solution_implementation_id,
      avg_effectiveness,
      rating_count,
      typical_application,
      contraindications,
      notes,
      created_at,
      solution_implementations!inner (
        id,
        name,
        details,
        created_at,
        updated_at,
        solution_id,
        solutions!inner (
          id,
          title,
          description,
          solution_type,
          source_type,
          created_at,
          updated_at,
          is_approved
        )
      )
    `)
    .eq('goal_id', goalId)
    .eq('solution_implementations.solutions.is_approved', true)

  if (linksError) {
    console.error('[DEBUG] Error fetching goal links:', linksError)
    console.error('[DEBUG] Error details:', JSON.stringify(linksError, null, 2))
    return []
  }

  console.log(`[DEBUG] Goal links fetched:`, goalLinks?.length || 0, 'links')

  // Transform the data to group by solution
  const solutionMap = new Map<string, SolutionWithImplementations>()
  
  goalLinks?.forEach(link => {
    const impl = link.solution_implementations
    const solution = impl.solutions
    
    if (!solutionMap.has(solution.id)) {
      solutionMap.set(solution.id, {
        id: solution.id,
        title: solution.title,
        description: solution.description,
        solution_type: solution.solution_type,
        source_type: solution.source_type as SourceType,
        created_at: solution.created_at,
        updated_at: solution.updated_at,
        implementations: []
      })
    }
    
    const solutionEntry = solutionMap.get(solution.id)!
    
    // Check if this implementation already exists
    const existingImpl = solutionEntry.implementations.find(i => i.id === impl.id)
    if (!existingImpl) {
      solutionEntry.implementations.push({
        id: impl.id,
        name: impl.name,
        details: impl.details,
        created_at: impl.created_at,
        updated_at: impl.updated_at,
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
    }
  })
  
  const data = Array.from(solutionMap.values())
  console.log(`[DEBUG] Transformed solutions:`, data.length)
  console.log(`[DEBUG] First solution sample:`, data[0])
  
  return data
}

export async function getGoalSolutionsByEffectiveness(goalId: string): Promise<SolutionWithImplementations[]> {
  const solutions = await getGoalSolutions(goalId)
  
  // Sort by highest effectiveness rating first
  return solutions.sort((a, b) => {
    const aMaxRating = Math.max(...a.implementations.flatMap(impl => 
      impl.goal_links.map(link => link.avg_effectiveness || 0)
    ))
    const bMaxRating = Math.max(...b.implementations.flatMap(impl => 
      impl.goal_links.map(link => link.avg_effectiveness || 0)
    ))
    return bMaxRating - aMaxRating
  })
}