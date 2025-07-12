// app/browse/page.tsx

import { createServerSupabaseClient } from '@/lib/database/server'
import SearchableBrowse from '@/components/templates/SearchableBrowse'

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
  
  // First, let's check if we can connect to Supabase
  console.log('Fetching arenas from Supabase...')
  
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
    console.error('Error fetching arenas:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return { arenas: [], totalGoals: 0 }
  }
  
  console.log(`Raw arenas data: ${arenas?.length || 0} arenas found`)
  
  // If we got null or undefined data, return empty
  if (!arenas) {
    console.error('No arenas data returned from Supabase')
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
  
  console.log(`Found ${activeArenas.length} arenas with ${totalGoals} approved goals`)

  return { arenas: activeArenas, totalGoals }
}

export default async function BrowsePage() {
  // Add debug mode - check for empty data
  const { arenas, totalGoals } = await getArenasWithGoals()
  
  // If no data, let's do a simple query to check connection
  if (arenas.length === 0) {
    const supabase = await createServerSupabaseClient()
    
    // Check if arenas table exists and has data
    const { data: allArenas, error: arenaError } = await supabase
      .from('arenas')
      .select('id, name, is_active')
      .limit(5)
    
    console.log('Debug - Simple arena query:', {
      data: allArenas,
      error: arenaError
    })
    
    // Check if categories table exists
    const { data: allCategories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5)
      
    console.log('Debug - Simple category query:', {
      data: allCategories,
      error: catError
    })
    
    // Check if goals table exists
    const { data: allGoals, error: goalError } = await supabase
      .from('goals')
      .select('id, title, is_approved')
      .limit(5)
      
    console.log('Debug - Simple goal query:', {
      data: allGoals,
      error: goalError
    })
  }

  return <SearchableBrowse arenas={arenas} totalGoals={totalGoals} />
}