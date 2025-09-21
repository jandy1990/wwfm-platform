import { createServerSupabaseClient } from '@/lib/database/server'
import { SolutionV2, SourceType } from '@/types/solution'
import { parseSolutionSlug } from '@/lib/utils/slugify'

// Correct variant type that matches actual database schema
export interface SolutionVariantActual {
  id: string
  solution_id: string
  variant_name: string
  amount?: number | null
  unit?: string | null
  form?: string | null
  legacy_implementation_id?: string | null
  is_default?: boolean | null
  display_order?: number | null
  created_at?: string
}

// Enhanced types for solution page data
export interface SolutionVariantWithGoalLinks extends SolutionVariantActual {
  goal_links: {
    goal_id: string
    avg_effectiveness: number
    rating_count: number
    typical_application?: string | null
    contraindications?: string | null
    notes?: string | null
    goals: {
      id: string
      title: string
      description?: string | null
      arena_id: string
      arenas: {
        id: string
        name: string
        slug: string
        icon: string
      }
    }
  }[]
}

export interface SolutionDetailWithGoals extends SolutionV2 {
  variants: SolutionVariantWithGoalLinks[]
  totalRatings: number
  avgEffectiveness: number
  goalCount: number
}

export interface SimilarSolution {
  id: string
  title: string
  description?: string | null
  solution_category: string
}

export interface GoalConnection {
  goal_id: string
  implementation_id: string
  avg_effectiveness: number
  rating_count: number
  typical_application?: string | null
  contraindications?: string | null
  notes?: string | null
  goals: {
    id: string
    title: string
    description?: string | null
    arena_id: string
    arenas: {
      id: string
      name: string
      slug: string
      icon: string
    }
  }
}

export async function getSolutionDetail(slugOrId: string): Promise<SolutionDetailWithGoals | null> {
  const supabase = await createServerSupabaseClient()

  console.log(`[DEBUG] Fetching solution for: ${slugOrId}`)

  let solutionId: string

  // Check if it's a full UUID (contains hyphens and is 36 chars)
  if (slugOrId.includes('-') && slugOrId.length === 36) {
    solutionId = slugOrId
  } else {
    // Parse slug to get partial UUID
    const shortId = parseSolutionSlug(slugOrId)
    if (!shortId) {
      console.error('[DEBUG] Invalid slug format:', slugOrId)
      return null
    }

    // For now, let's get all solutions and find matching one
    // This is temporary until we optimize the query
    const { data: allSolutions } = await supabase
      .from('solutions')
      .select('id, title')
      .eq('is_approved', true)

    const matchingSolution = allSolutions?.find(s =>
      s.id.replace(/-/g, '').toLowerCase().startsWith(shortId.toLowerCase())
    )

    if (!matchingSolution) {
      console.error('[DEBUG] No solution found for shortId:', shortId)
      return null
    }

    solutionId = matchingSolution.id
  }

  try {
    // 1. Get solution details using exact UUID
    const { data: solution, error: solutionError } = await supabase
      .from('solutions')
      .select('*')
      .eq('id', solutionId)
      .eq('is_approved', true)
      .single()

    if (solutionError || !solution) {
      console.error('[DEBUG] Solution not found:', solutionError)
      return null
    }

    console.log(`[DEBUG] Found solution: ${solution.title} (${solution.id})`)

    // 2. Get all variants for this solution
    const { data: variants, error: variantsError } = await supabase
      .from('solution_variants')
      .select('*')
      .eq('solution_id', solution.id)
      .order('display_order', { ascending: true, nullsLast: true })
      .order('variant_name', { ascending: true })

    if (variantsError) {
      console.error('[DEBUG] Error fetching variants:', variantsError)
      return null
    }

    console.log(`[DEBUG] Found ${variants?.length || 0} variants`)

    // 3. Get all goal connections for these variants
    const variantIds = variants?.map(v => v.id) || []

    const { data: goalConnections, error: goalsError } = await supabase
      .from('goal_implementation_links')
      .select(`
        goal_id,
        implementation_id,
        avg_effectiveness,
        rating_count,
        typical_application,
        contraindications,
        notes,
        goals!inner (
          id,
          title,
          description,
          arena_id,
          arenas (
            id,
            name,
            slug,
            icon
          )
        )
      `)
      .in('implementation_id', variantIds)
      .order('avg_effectiveness', { ascending: false })

    if (goalsError) {
      console.error('[DEBUG] Error fetching goal connections:', goalsError)
      return null
    }

    console.log(`[DEBUG] Found ${goalConnections?.length || 0} goal connections`)

    // 4. Process the data
    const variantsWithGoals: SolutionVariantWithGoalLinks[] = variants?.map(variant => ({
      ...variant,
      goal_links: goalConnections?.filter(gc => gc.implementation_id === variant.id) || []
    })) || []

    // 5. Calculate aggregated stats - deduplicate goals for proper counting
    const uniqueGoalIds = new Set(goalConnections?.map(gc => gc.goal_id) || [])
    const goalCount = uniqueGoalIds.size

    // Total ratings across all goal-variant combinations
    const totalRatings = goalConnections?.reduce((sum, gc) => sum + (gc.rating_count || 0), 0) || 0

    // For average effectiveness, we need to find the best variant per goal
    const bestVariantPerGoal = new Map()
    goalConnections?.forEach(gc => {
      const goalId = gc.goal_id
      if (!bestVariantPerGoal.has(goalId) || gc.avg_effectiveness > bestVariantPerGoal.get(goalId).avg_effectiveness) {
        bestVariantPerGoal.set(goalId, gc)
      }
    })

    // Calculate average effectiveness based on best variant per goal
    const avgEffectiveness = bestVariantPerGoal.size > 0
      ? Array.from(bestVariantPerGoal.values()).reduce((sum, gc) => sum + gc.avg_effectiveness, 0) / bestVariantPerGoal.size
      : 0

    return {
      ...solution,
      variants: variantsWithGoals,
      totalRatings,
      avgEffectiveness,
      goalCount
    }

  } catch (error) {
    console.error('[DEBUG] Error in getSolutionDetail:', error)
    return null
  }
}

export async function getSolutionGoalConnections(solutionId: string): Promise<GoalConnection[]> {
  const supabase = await createServerSupabaseClient()

  try {
    // Get variants first
    const { data: variants } = await supabase
      .from('solution_variants')
      .select('id')
      .eq('solution_id', solutionId)

    if (!variants?.length) return []

    const variantIds = variants.map(v => v.id)

    // Get goal connections
    const { data: connections, error } = await supabase
      .from('goal_implementation_links')
      .select(`
        goal_id,
        implementation_id,
        avg_effectiveness,
        rating_count,
        typical_application,
        contraindications,
        notes,
        goals!inner (
          id,
          title,
          description,
          arena_id,
          arenas (
            id,
            name,
            slug,
            icon
          )
        )
      `)
      .in('implementation_id', variantIds)
      .order('avg_effectiveness', { ascending: false })

    if (error) {
      console.error('[DEBUG] Error fetching goal connections:', error)
      return []
    }

    return connections || []
  } catch (error) {
    console.error('[DEBUG] Error in getSolutionGoalConnections:', error)
    return []
  }
}

export async function getSimilarSolutions(
  solutionCategory: string,
  excludeId: string,
  limit: number = 6
): Promise<SimilarSolution[]> {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: solutions, error } = await supabase
      .from('solutions')
      .select('id, title, description, solution_category')
      .eq('solution_category', solutionCategory)
      .eq('is_approved', true)
      .neq('id', excludeId)
      .limit(limit)

    if (error) {
      console.error('[DEBUG] Error fetching similar solutions:', error)
      return []
    }

    return solutions || []
  } catch (error) {
    console.error('[DEBUG] Error in getSimilarSolutions:', error)
    return []
  }
}

// Helper function to validate solution slug exists
export async function validateSolutionSlug(slug: string): Promise<boolean> {
  const solution = await getSolutionDetail(slug)
  return solution !== null
}

// Helper function to get all solution IDs for static generation
export async function getAllSolutionIds(): Promise<{ slug: string }[]> {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: solutions } = await supabase
      .from('solutions')
      .select('id, title')
      .eq('is_approved', true)

    if (!solutions) return []

    // Import slugify function for generating slugs
    const { generateSolutionSlug } = await import('@/lib/utils/slugify')

    return solutions.map(solution => ({
      slug: generateSolutionSlug(solution.title, solution.id)
    }))
  } catch (error) {
    console.error('[DEBUG] Error getting solution IDs:', error)
    return []
  }
}