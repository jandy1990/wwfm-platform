// app/category/[slug]/page.tsx

// Make the page dynamic to prevent caching issues with browser navigation
export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Breadcrumbs, { createBreadcrumbs } from '@/components/ui/Breadcrumbs'
import EmptyState from '@/components/ui/EmptyState'

// Types
type Goal = {
  id: string
  title: string
  description: string | null
  slug: string
  solution_count: number
  view_count: number
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

async function getCategoryWithGoals(slug: string) {
  const supabase = await createSupabaseServerClient()
  
  console.log('Looking for category with slug:', slug)
  
  // Get category with arena info and goals
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select(`
      *,
      arenas!inner (
        id,
        name,
        slug,
        icon
      ),
      goals (
        id,
        title,
        description,
        slug,
        solution_count,
        view_count,
        is_approved
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
  
  // Filter to only include approved goals
  const filteredCategory = {
    ...category,
    goals: category.goals?.filter((goal: any) => goal.is_approved) || []
  }
  
  return filteredCategory as Category
}

// Add cache control
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  
  // Add error handling for params
  if (!resolvedParams?.slug) {
    console.error('No slug provided to category page')
    notFound()
  }
  
  const category = await getCategoryWithGoals(resolvedParams.slug)

  if (!category) {
    console.error(`Category not found for slug: ${resolvedParams.slug}`)
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs 
          items={createBreadcrumbs('category', {
            arena: { name: category.arenas.name, slug: category.arenas.slug },
            category: { name: category.name, slug: category.slug }
          })}
        />

        {/* Category Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 flex-col sm:flex-row text-center sm:text-left">
            <span className="text-4xl sm:text-5xl mb-2 sm:mb-0 sm:mr-4">{category.arenas.icon}</span>
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>{category.arenas.name}</span>
                <span>•</span>
                <span>Category</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {category.goals?.map((goal) => (
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
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-auto">
                <span>{goal.solution_count || 0} solutions</span>
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