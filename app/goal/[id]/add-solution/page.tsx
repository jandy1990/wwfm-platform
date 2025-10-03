// app/goal/[id]/add-solution/page.tsx

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'
import SolutionFormWithAutoCategory from '@/components/organisms/solutions/SolutionFormWithAutoCategory'
import { GoalPageTracker } from '@/components/tracking/GoalPageTracker'
import type { Tables } from '@/types/supabase'

export const metadata: Metadata = {
  title: 'Share What Worked | WWFM',
  description: 'Share your solution with the community'
}

interface PageProps {
  params: Promise<{ id: string }>
}

type GoalRow = Tables<'goals'>
type ArenaSummary = Pick<Tables<'arenas'>, 'id' | 'name' | 'slug'>
type CategoryWithArenaRow = Pick<Tables<'categories'>, 'id' | 'name' | 'slug' | 'arena_id'> & {
  arenas: ArenaSummary | ArenaSummary[] | null
}

type CategorySummary = {
  name: string
  slug: string
  arena_id: string | null
  arenas: ArenaSummary
}

export default async function AddSolutionPage({ params }: PageProps) {
  const resolvedParams = await params
  
  // Create Supabase client
  const supabase = await createServerSupabaseClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/signin?redirectTo=/goal/${resolvedParams.id}/add-solution`)
  }

  // Fetch the goal details (avoid relying on implicit FK metadata)
  const { data: goalRow, error: goalError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()
    .returns<GoalRow | null>()

  if (goalError || !goalRow) {
    notFound()
  }

  let categoryWithArena: CategorySummary | null = null

  if (goalRow.category_id) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        arena_id,
        arenas (
          id,
          name,
          slug
        )
      `)
      .eq('id', goalRow.category_id)
      .single()
      .returns<CategoryWithArenaRow | null>()

    if (!categoryError && category) {
      const arena = Array.isArray(category.arenas)
        ? category.arenas[0]
        : category.arenas

      const fallbackArena: ArenaSummary = {
        id: '',
        name: 'Unknown Arena',
        slug: ''
      }

      categoryWithArena = {
        name: category.name,
        slug: category.slug,
        arena_id: category.arena_id,
        arenas: arena ?? fallbackArena
      }
    }
  }

  const goal: GoalRow & { categories: CategorySummary | null } = {
    ...goalRow,
    categories: categoryWithArena
  }

  return (
    <>
      {goal.categories?.arenas && (
        <GoalPageTracker arenaName={goal.categories.arenas.name} arenaId={goal.categories.arenas.id} />
      )}
      <SolutionFormWithAutoCategory 
        goalId={resolvedParams.id}
        goalTitle={goal.title}  // Add this line to pass the goal title
        userId={user.id}
      />
    </>
  )
}
