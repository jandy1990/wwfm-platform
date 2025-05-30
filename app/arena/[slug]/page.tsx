// app/arena/[slug]/page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Types - Updated to match your database structure
type Goal = {
  id: string
  title: string
  description: string | null
  slug: string
  solution_count: number
  view_count: number
}

type Arena = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  goals?: Goal[]
}

async function getArenaWithGoals(slug: string) {
  const supabase = createSupabaseServerClient()
  
  console.log('Looking for arena with slug:', slug)
  
  // Updated query to fetch goals directly (no categories)
  const { data: arena, error } = await supabase
    .from('arenas')
    .select(`
      *,
      goals (
        id,
        title,
        description,
        slug,
        solution_count,
        view_count
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  console.log('Arena query result:', { arena, error })
  console.log('Number of goals found:', arena?.goals?.length || 0)

  if (error || !arena) {
    return null
  }

  return arena as Arena
}

export default async function ArenaPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const arena = await getArenaWithGoals(resolvedParams.slug)

  if (!arena) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/browse" className="text-gray-500 hover:text-gray-700">
                Browse
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">{arena.name}</li>
          </ol>
        </nav>

        {/* Arena Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <span className="text-5xl mr-4">{arena.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {arena.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {arena.description}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Grid - Updated to show goals directly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arena.goals?.map((goal) => (
            <Link
              key={goal.id}
              href={`/goal/${goal.id}`}  // Direct link to goal page
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {goal.title}
              </h3>
              {goal.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {goal.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{goal.solution_count || 0} solutions</span>
                <span className="text-blue-600">View solutions →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {(!arena.goals || arena.goals.length === 0) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No goals available in this arena yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}