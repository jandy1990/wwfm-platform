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

  // Fetch the goal details
  const { data: goal, error } = await supabase
    .from('goals')
    .select(`
      *,
      categories (
        name,
        slug,
        arena_id,
        arenas (
          id,
          name,
          slug
        )
      )
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (error || !goal) {
    notFound()
  }

  return (
    <>
      <GoalPageTracker arenaName={goal.categories.arenas.name} arenaId={goal.categories.arenas.id} />
      <SolutionFormWithAutoCategory 
        goalId={resolvedParams.id}
        goalTitle={goal.title}  // Add this line to pass the goal title
        userId={user.id}
      />
    </>
  )
}