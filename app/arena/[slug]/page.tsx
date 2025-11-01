// app/arena/[slug]/page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'

// Cache for 5 minutes - arena pages are relatively static
export const revalidate = 300
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import { createBreadcrumbs } from '@/lib/utils/breadcrumbs'
import EmptyState from '@/components/molecules/EmptyState'
import { GoalPageTracker } from '@/components/tracking/GoalPageTracker'
import BackButton from '@/components/atoms/BackButton'

// Types - Updated to match actual database columns
type Goal = {
  id: string
  title: string
  description: string | null
  emoji: string | null
  view_count: number
  solution_count: number
}

type Arena = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  goals?: Goal[]
}

type GoalRow = {
  id: string
  title: string
  description: string | null
  emoji: string | null
  view_count: number | null
  goal_implementation_links: { id: string }[] | null
}

async function getArenaWithGoals(slug: string) {
  const supabase = await createServerSupabaseClient()
  
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
  
  // Then, get goals for this arena with solution counts
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      description,
      emoji,
      view_count,
      arena_id,
      is_approved,
      goal_implementation_links!left(id)
    `)
    .eq('arena_id', arena.id)
    .eq('is_approved', true)
  
  console.log('Goals fetch result:', {
    count: goals?.length || 0,
    error: goalsError
  })

  // Process goals to add solution counts
  const processedGoals = (goals as GoalRow[] | null)?.map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    emoji: goal.emoji,
    view_count: goal.view_count ?? 0,
    solution_count: goal.goal_implementation_links?.length ?? 0
  })) ?? []

  return {
    ...arena,
    goals: processedGoals
  } as Arena
}

type ArenaPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ArenaPage({ params }: ArenaPageProps) {
  const { slug } = await params
  const arena = await getArenaWithGoals(slug)

  if (!arena) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GoalPageTracker arenaName={arena.name} arenaId={arena.id} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Back Button */}
        <BackButton fallbackHref="/browse" className="mb-3" />

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
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 sm:p-6 min-h-[120px] flex flex-col focus:ring-2 focus:ring-purple-500 focus:outline-none border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-3">
                {goal.emoji && (
                  <span className="text-3xl flex-shrink-0">{goal.emoji}</span>
                )}
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {goal.title}
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-auto">
                <span>{goal.solution_count} solution{goal.solution_count !== 1 ? 's' : ''} • {goal.view_count || 0} views</span>
                <span className="text-purple-600 dark:text-purple-400">View solutions →</span>
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
