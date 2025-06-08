// app/arena/[slug]/page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Breadcrumbs, { createBreadcrumbs } from '@/components/ui/Breadcrumbs'
import EmptyState from '@/components/ui/EmptyState'

// Types - Updated to match actual database columns
type Goal = {
  id: string
  title: string
  description: string | null
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
  const supabase = await createSupabaseServerClient()
  
  console.log('Looking for arena with slug:', slug)
  
  // First, get the arena
  const { data: arena, error: arenaError } = await supabase
    .from('arenas')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (arenaError || !arena) {
    console.log('Arena fetch error:', arenaError)
    return null
  }
  
  console.log('Arena found:', arena.name, 'with ID:', arena.id)
  
  // Then, get goals for this arena - only select columns that exist
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      description,
      arena_id,
      is_approved
    `)
    .eq('arena_id', arena.id)
    .eq('is_approved', true)
  
  console.log('Goals fetch result:', { 
    count: goals?.length || 0, 
    error: goalsError 
  })
  
  return {
    ...arena,
    goals: goals || []
  } as Arena
}

export default async function ArenaPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const arena = await getArenaWithGoals(resolvedParams.slug)

  if (!arena) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs 
          items={createBreadcrumbs('arena', {
            arena: { name: arena.name, slug: arena.slug }
          })}
        />

        {/* Arena Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 flex-col sm:flex-row text-center sm:text-left">
            <span className="text-4xl sm:text-5xl mb-2 sm:mb-0 sm:mr-4">{arena.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {arena.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                {arena.description}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {arena.goals?.map((goal) => (
            <Link
              key={goal.id}
              href={`/goal/${goal.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 sm:p-6 min-h-[120px] flex flex-col focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex-1">
                {goal.title}
              </h3>
              {goal.description && (
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-1">
                  {goal.description}
                </p>
              )}
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-auto">
                View solutions →
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {(!arena.goals || arena.goals.length === 0) && (
          <EmptyState
            icon="🚧"
            heading="Coming soon to this arena!"
            subtext="We're working on adding goals and solutions for this life area. Check back soon for updates."
            actionButton={{
              text: "Browse Other Areas",
              href: "/browse",
              variant: "secondary"
            }}
          />
        )}
      </div>
    </div>
  )
}