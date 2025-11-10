// app/goal/[id]/page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'

// Cache for 3 minutes - goals update with new ratings frequently
export const revalidate = 180
import { getGoalSolutions, type GoalSolutionWithVariants } from '@/lib/solutions/goal-solutions'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import { createBreadcrumbs } from '@/lib/utils/breadcrumbs'
import GoalPageClient from '@/components/goal/GoalPageClient'
import { getRelatedGoals } from '@/lib/solutions/related-goals'
import { GoalPageTracker } from '@/components/tracking/GoalPageTracker'
import { GoalViewTracker } from '@/components/tracking/GoalViewTracker'
import { getGoalWisdomScore } from '@/app/actions/retrospectives'
import { getFollowStatus, getFollowerCount } from '@/app/actions/goal-following'
import BackButton from '@/components/atoms/BackButton'

type Goal = {
  id: string
  title: string
  description: string
  arena_id: string
  arenas: {
    id: string
    name: string
    slug: string
    icon: string
  }
  categories?: {
    id: string
    name: string
    slug: string
  } | null
}

async function getGoal(id: string): Promise<Goal | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      description,
      arena_id,
      arenas!inner (
        id,
        name,
        slug,
        icon
      ),
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .eq('is_approved', true)
    .single()

  if (error) {
    console.error('Error fetching goal:', error)
    return null
  }

  // Transform the data to match our Goal type since arenas comes as an array but we expect an object
  const transformedData = {
    ...data,
    arenas: Array.isArray(data.arenas) ? data.arenas[0] : data.arenas,
    categories: Array.isArray(data.categories) ? data.categories[0] : data.categories
  }
  
  return transformedData as Goal
}

export default async function GoalPage({ params }: { params: Promise<{ id: string }> }) {
  let goal: Goal | null = null
  let solutions: GoalSolutionWithVariants[] = []
  let relatedGoals: Awaited<ReturnType<typeof getRelatedGoals>> = []
  let wisdom: Awaited<ReturnType<typeof getGoalWisdomScore>> = null
  let followStatus: Awaited<ReturnType<typeof getFollowStatus>> = { isFollowing: false }
  let followerCount = 0
  let error: string | null = null

  try {
    const resolvedParams = await params
    goal = await getGoal(resolvedParams.id)

    if (!goal) {
      notFound()
    }

    // Get solutions using the new helper function
    try {
      solutions = await getGoalSolutions(resolvedParams.id)
    } catch (solutionError) {
      console.error('Error fetching solutions:', solutionError)
      error = 'Unable to load solutions at this time'
    }


    // Get related goals
    try {
      relatedGoals = await getRelatedGoals(resolvedParams.id)
    } catch (relatedError) {
      console.error('Error fetching related goals:', relatedError)
      // Don't set error for this - related goals are enhancement, not critical
    }

    // Get wisdom scores
    try {
      wisdom = await getGoalWisdomScore(resolvedParams.id)
    } catch (wisdomError) {
      console.error('Error fetching wisdom scores:', wisdomError)
      // Don't set error for this - wisdom scores are enhancement, not critical
    }

    // Get follow status and follower count
    try {
      followStatus = await getFollowStatus(resolvedParams.id)
      followerCount = await getFollowerCount(resolvedParams.id)
    } catch (followError) {
      console.error('Error fetching follow data:', followError)
      // Don't set error for this - following is enhancement, not critical
    }
  } catch (pageError) {
    console.error('Error loading goal page:', pageError)
    error = 'Unable to load this goal'
  }

  if (error && !goal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600">{error}</p>
          <Link href="/browse" className="mt-4 inline-block text-purple-600 hover:text-purple-700">
            Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  // Get arena name from the goal's category
  const arenaName = goal?.arenas?.name || 'Unknown'
  const arenaId = goal?.arenas?.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GoalPageTracker arenaName={arenaName} arenaId={arenaId} />
      <GoalViewTracker goalId={goal?.id || ''} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Back Button */}
        <BackButton fallbackHref={goal.categories ? `/category/${goal.categories.slug}` : '/browse'} className="mb-3" />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <Breadcrumbs
            items={createBreadcrumbs('goal', {
              category: goal.categories ? { name: goal.categories.name, slug: goal.categories.slug } : undefined,
              goal: { title: goal.title }
            })}
          />
        </nav>

        {/* Goal Page Client Content - This now handles ALL the display */}
        <GoalPageClient
          goal={goal}
          initialSolutions={solutions}
          wisdom={wisdom}
          error={error}
          relatedGoals={relatedGoals}
          followStatus={followStatus}
          followerCount={followerCount}
        />
      </div>
    </div>
  )
}