// app/goal/[id]/add-solution/page.tsx

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'
import SolutionFormWithAutoCategory from '@/components/organisms/solutions/SolutionFormWithAutoCategory'
import { GoalPageTracker } from '@/components/tracking/GoalPageTracker'

export const metadata: Metadata = {
  title: 'Share What Worked | WWFM',
  description: 'Share your solution with the community'
}

interface PageProps {
  params: Promise<{ id: string }>
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

  if (goalError || !goalRow) {
    notFound()
  }

  let categoryWithArena: {
    name: string
    slug: string
    arena_id: string
    arenas: { id: string; name: string; slug: string }
  } | null = null

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

    if (!categoryError && category) {
      categoryWithArena = {
        name: category.name,
        slug: category.slug,
        arena_id: category.arena_id,
        arenas: category.arenas
      }
    }
  }

  const goal = {
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
