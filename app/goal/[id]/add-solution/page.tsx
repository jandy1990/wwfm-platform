// app/goal/[id]/add-solution/page.tsx

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import TypeFormSolutionForm from '@/components/auth/solutions/TypeFormSolutionForm'

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
  const supabase = await createSupabaseServerClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
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
        arenas (
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
    <TypeFormSolutionForm 
      goalId={resolvedParams.id}
      goalTitle={goal.title}
      userId={session.user.id}
      goalSlug={goal.slug || goal.title.toLowerCase().replace(/\s+/g, '-')}
    />
  )
}