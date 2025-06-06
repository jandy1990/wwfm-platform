// app/goal/[id]/add-solution/page.tsx

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import SolutionForm from '@/components/auth/solutions/SolutionForm'

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <a href="/browse" className="hover:text-blue-600">Browse</a>
          <span className="mx-2">→</span>
          <a href={`/arena/${goal.categories.arenas.slug}`} className="hover:text-blue-600">
            {goal.categories.arenas.name}
          </a>
          <span className="mx-2">→</span>
          <a href={`/category/${goal.categories.slug}`} className="hover:text-blue-600">
            {goal.categories.name}
          </a>
          <span className="mx-2">→</span>
          <a href={`/goal/${resolvedParams.id}`} className="hover:text-blue-600">
            {goal.title}
          </a>
          <span className="mx-2">→</span>
          <span className="text-gray-900 font-medium">Share Solution</span>
        </div>

        <SolutionForm 
          goalId={resolvedParams.id}
          goalTitle={goal.title}
          userId={session.user.id}
          goalSlug={goal.slug || goal.title.toLowerCase().replace(/\s+/g, '-')}
        />
      </div>
    </div>
  )
}