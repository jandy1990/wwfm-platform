// app/browse/page.tsx

import { createServerSupabaseClient } from '@/lib/database/server'
import HybridBrowse from '@/components/templates/HybridBrowse'
import { BrowsePageTracker } from '@/components/tracking/BrowsePageTracker'

// Cache browse page for 60 seconds - frequently accessed
export const revalidate = 60

// Type definitions
type Goal = {
  id: string
  title: string
  is_approved: boolean
}

type Category = {
  id: string
  name: string
  slug: string
  goals?: Goal[]
}

/* Unused Arena type
type Arena = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  categories?: Category[]
  _count?: {
    categories: number
    goals: number
  }
}
*/

async function getArenasWithGoals() {
  const supabase = await createServerSupabaseClient()

  // Fetch arenas with categories and approved goals
  // Note: Supabase doesn't support nested filtering like .eq('categories.goals.is_approved', true)
  // We need to filter goals after fetching
  const { data: arenas, error } = await supabase
    .from('arenas')
    .select(`
      *,
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
    return { arenas: [], totalGoals: 0 }
  }

  // If we got null or undefined data, return empty
  if (!arenas) {
    return { arenas: [], totalGoals: 0 }
  }

  // Filter and transform data - only include approved goals
  let totalGoals = 0
  const transformedArenas = arenas.map(arena => {
    // Filter categories to only include approved goals
    const categoriesWithApprovedGoals = arena.categories?.map((cat: Category) => ({
      ...cat,
      goals: cat.goals?.filter((goal: Goal) => goal.is_approved) || []
    })) || []
    
    // Only include categories that have at least one approved goal
    const nonEmptyCategories = categoriesWithApprovedGoals.filter((cat: Category) => 
      cat.goals && cat.goals.length > 0
    )
    
    const arenaGoalCount = nonEmptyCategories.reduce((acc: number, cat: Category) => 
      acc + (cat.goals?.length || 0), 0)
    totalGoals += arenaGoalCount
    
    return {
      ...arena,
      categories: nonEmptyCategories,
      _count: {
        categories: nonEmptyCategories.length,
        goals: arenaGoalCount
      }
    }
  })
  
  // Only return arenas that have at least one category with approved goals
  const activeArenas = transformedArenas.filter(arena => arena.categories.length > 0)

  return { arenas: activeArenas, totalGoals }
}

export default async function BrowsePage() {
  const { arenas, totalGoals} = await getArenasWithGoals()

  return (
    <>
      <BrowsePageTracker />
      <HybridBrowse arenas={arenas} totalGoals={totalGoals} />
    </>
  )
}