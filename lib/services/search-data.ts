import { supabase } from '@/lib/database/client'
import type { Arena, Category, Goal } from '@/lib/hooks/useGoalSearch'

/**
 * Fetch searchable goals data for header search
 * Lightweight query - only fetches necessary fields for search autocomplete
 * Result is ~15-20KB compressed for 228 goals
 */
export async function getSearchableGoals(): Promise<{
  arenas: Arena[]
  totalGoals: number
  error: Error | null
}> {
  try {
    const { data: arenas, error } = await supabase
      .from('arenas')
      .select(`
        id,
        name,
        slug,
        icon,
        categories (
          id,
          name,
          slug,
          goals (
            id,
            title,
            is_approved
          )
        )
      `)
      .eq('is_active', true)
      .order('order_rank')

    if (error) {
      console.error('Error fetching searchable goals:', error)
      return { arenas: [], totalGoals: 0, error }
    }

    if (!arenas) {
      return { arenas: [], totalGoals: 0, error: null }
    }

    // Filter to only include approved goals
    let totalGoals = 0
    const transformedArenas: Arena[] = arenas.map(arena => {
      const categoriesWithApprovedGoals = arena.categories?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        goals: cat.goals?.filter((goal: any) => goal.is_approved) || []
      })) || []

      // Only include categories that have at least one approved goal
      const nonEmptyCategories = categoriesWithApprovedGoals.filter(
        (cat) => cat.goals && cat.goals.length > 0
      )

      const arenaGoalCount = nonEmptyCategories.reduce(
        (acc, cat) => acc + (cat.goals?.length || 0),
        0
      )
      totalGoals += arenaGoalCount

      return {
        id: arena.id,
        name: arena.name,
        slug: arena.slug,
        icon: arena.icon,
        categories: nonEmptyCategories
      }
    }).filter(arena => arena.categories && arena.categories.length > 0)

    return { arenas: transformedArenas, totalGoals, error: null }
  } catch (err) {
    console.error('Exception fetching searchable goals:', err)
    return {
      arenas: [],
      totalGoals: 0,
      error: err instanceof Error ? err : new Error('Unknown error')
    }
  }
}

/**
 * Get trending goals for empty search state
 * Returns top goals by view count
 */
export async function getTrendingGoals(limit: number = 5): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('id, title, is_approved, view_count')
      .eq('is_approved', true)
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.error('Error fetching trending goals:', error)
      return []
    }

    return data.map(g => ({
      id: g.id,
      title: g.title,
      is_approved: g.is_approved
    }))
  } catch (err) {
    console.error('Exception fetching trending goals:', err)
    return []
  }
}
