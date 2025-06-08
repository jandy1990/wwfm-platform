// app/browse/page.tsx

import { createSupabaseServerClient } from '@/lib/supabase-server'
import SearchableBrowse from '@/components/browse/SearchableBrowse'

// Type definitions
type Goal = {
  id: string
  title: string
  slug: string
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
  const supabase = await createSupabaseServerClient()
  
  // Fetch arenas with categories and all goal details for search
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
          slug,
          is_approved
        )
      )
    `)
    .eq('is_active', true)
    .eq('categories.goals.is_approved', true)
    .order('order_rank')

  if (error) {
    console.error('Error fetching arenas:', error)
    return { arenas: [], totalGoals: 0 }
  }

  // Calculate total goals and transform data
  let totalGoals = 0
  const transformedArenas = arenas.map(arena => {
    const arenaGoalCount = arena.categories?.reduce((acc: number, cat: Category) => 
      acc + (cat.goals?.length || 0), 0) || 0
    totalGoals += arenaGoalCount
    
    return {
      ...arena,
      _count: {
        categories: arena.categories?.length || 0,
        goals: arenaGoalCount
      }
    }
  })

  return { arenas: transformedArenas, totalGoals }
}

export default async function BrowsePage() {
  const { arenas, totalGoals } = await getArenasWithGoals()

  return <SearchableBrowse arenas={arenas} totalGoals={totalGoals} />
}