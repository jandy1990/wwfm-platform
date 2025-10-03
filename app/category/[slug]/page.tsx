// app/category/[slug]/page.tsx

// Make the page dynamic to prevent caching issues with browser navigation
export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'
import Breadcrumbs, { createBreadcrumbs } from '@/components/molecules/Breadcrumbs'
import EmptyState from '@/components/molecules/EmptyState'
import { GoalPageTracker } from '@/components/tracking/GoalPageTracker'
import { getSuperCategoryForCategory, SUPER_CATEGORY_COLORS } from '@/lib/navigation/super-categories'

// Types
type Goal = {
  id: string
  title: string
  description: string | null
  emoji: string | null
  view_count: number
  solution_count: number
  is_approved?: boolean
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  arena_id: string
  arenas: {
    id: string
    name: string
    slug: string
    icon: string
  }
  goals?: Goal[]
}

type CategoryRow = Category & {
  arenas: Category['arenas']
}

type GoalRow = {
  id: string
  title: string
  description: string | null
  emoji: string | null
  view_count: number | null
  is_approved: boolean
  goal_implementation_links: { id: string }[] | null
}

async function getCategoryWithGoals(slug: string) {
  const supabase = await createServerSupabaseClient()

  console.log('Looking for category with slug:', slug)

  // Get category with arena info
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select(`
      *,
      arenas!inner (
        id,
        name,
        slug,
        icon
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (categoryError || !category) {
    console.log('Category fetch error:', categoryError)
    return null
  }

  console.log('Category found:', category.name)

  // Get goals with solution counts
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      description,
      emoji,
      view_count,
      is_approved,
      goal_implementation_links!left(id)
    `)
    .eq('category_id', category.id)
    .eq('is_approved', true)

  if (goalsError) {
    console.log('Goals fetch error:', goalsError)
    return { ...category, goals: [] }
  }

  // Process goals to add solution counts
  const processedGoals = (goals as GoalRow[] | null)?.map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    emoji: goal.emoji,
    view_count: goal.view_count ?? 0,
    solution_count: goal.goal_implementation_links?.length ?? 0,
    is_approved: goal.is_approved
  })) ?? []

  return {
    ...(category as CategoryRow),
    goals: processedGoals
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryWithGoals(params.slug)

  if (!category) {
    notFound()
  }

  // Get super-category colors for this category
  const superCategory = getSuperCategoryForCategory(category.name)
  const colors = superCategory ? SUPER_CATEGORY_COLORS[superCategory.color as keyof typeof SUPER_CATEGORY_COLORS] : SUPER_CATEGORY_COLORS.blue

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GoalPageTracker arenaName={category.arenas.name} arenaId={category.arenas.id} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={createBreadcrumbs('arena', {
            arena: { name: category.arenas.name, slug: category.arenas.slug }
          })}
        />

        {/* Category Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 flex-col sm:flex-row text-center sm:text-left">
            <span className="text-4xl sm:text-5xl mb-2 sm:mb-0 sm:mr-4">{category.arenas.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {category.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                <span className="text-gray-500 dark:text-gray-400">{category.arenas.name} Category</span>
                {category.description && (
                  <>
                    <span className="text-gray-500 dark:text-gray-400 mx-2">•</span>
                    <span>{category.description}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {category.goals?.map((goal) => (
            <Link
              key={goal.id}
              href={`/goal/${goal.id}`}
              className={`${colors.bg} ${colors.border} border rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 sm:p-6 min-h-[120px] flex flex-col focus:ring-2 focus:ring-blue-500 focus:outline-none ${colors.hover}`}
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
                <span className="text-blue-600 dark:text-blue-400">View solutions →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {(!category.goals || category.goals.length === 0) && (
          <EmptyState
            icon="🚧"
            heading="Coming soon to this category!"
            subtext="We're working on adding goals for this category. Check back soon for updates."
            actionButton={{
              text: "Browse Other Categories",
              href: `/arena/${category.arenas.slug}`,
              variant: "secondary"
            }}
          />
        )}
      </div>
    </div>
  )
}
