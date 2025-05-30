// app/goal/[id]/page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Types
type Solution = {
  id: string
  title: string
  description: string
  cost_estimate?: string
  time_investment?: string
  difficulty_level?: number
  avg_rating?: number
  rating_count?: number
}

type Goal = {
  id: string
  title: string
  description: string
  categories: {
    id: string
    name: string
    slug: string
    arenas: {
      id: string
      name: string
      slug: string
      icon: string
    }
  }
  solutions?: Solution[]
}

async function getGoalWithSolutions(id: string) {
  const supabase = createSupabaseServerClient()
  
  console.log('Fetching goal with ID:', id)
  
  // Get goal with category and arena info
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select(`
      *,
      categories!inner (
        id,
        name,
        slug,
        arenas!inner (
          id,
          name,
          slug,
          icon
        )
      )
    `)
    .eq('id', id)
    .eq('is_approved', true)
    .single()

  console.log('Goal query result:', { goal, error: goalError })

  if (goalError || !goal) {
    console.error('Goal fetch error:', goalError)
    return null
  }

  // Get solutions for this goal
  const { data: solutions, error: solutionsError } = await supabase
    .from('solutions')
    .select('*')
    .eq('goal_id', id)
    .eq('is_approved', true)

  if (solutionsError) {
    console.error('Solutions fetch error:', solutionsError)
  }

  return {
    ...goal,
    solutions: solutions || []
  } as Goal
}

export default async function GoalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const goal = await getGoalWithSolutions(resolvedParams.id)

  if (!goal) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm flex-wrap">
            <li>
              <Link href="/browse" className="text-gray-500 hover:text-gray-700">
                Browse
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link 
                href={`/arena/${goal.categories.arenas.slug}`} 
                className="text-gray-500 hover:text-gray-700"
              >
                {goal.categories.arenas.name}
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link 
                href={`/category/${goal.categories.slug}`} 
                className="text-gray-500 hover:text-gray-700"
              >
                {goal.categories.name}
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">{goal.title}</li>
          </ol>
        </nav>

        {/* Goal Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start">
            <span className="text-4xl mr-4">{goal.categories.arenas.icon}</span>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {goal.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {goal.description || `Achieve your goal: ${goal.title}`}
              </p>
            </div>
          </div>
        </div>

        {/* What Worked Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              What Worked for This Goal
            </h2>
            <span className="text-sm text-gray-500">
              {goal.solutions?.length || 0} approaches shared
            </span>
          </div>

          {/* Solutions Grid */}
          {goal.solutions && goal.solutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goal.solutions.map((solution) => (
                <div key={solution.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {solution.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {solution.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    {solution.time_investment && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span>{solution.time_investment}</span>
                      </div>
                    )}
                    {solution.cost_estimate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cost:</span>
                        <span>{solution.cost_estimate}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Effectiveness:</span>
                      <div className="flex items-center">
                        {solution.avg_rating ? (
                          <>
                            <span className="font-semibold text-green-600">
                              ⭐ {solution.avg_rating.toFixed(1)}
                            </span>
                            <span className="text-gray-400 ml-1">
                              ({solution.rating_count} ratings)
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">No ratings yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">
                No one has shared what worked for this goal yet.
              </p>
              <p className="text-sm text-gray-400">
                Be the first to help others!
              </p>
            </div>
          )}

          {/* Add What Worked CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Tried something for this goal?
            </h3>
            <p className="text-blue-700 mb-4">
              Share what worked (or didn't work) for you and help others on their journey.
            </p>
            <Link 
              href={`/goal/${goal.id}/add-solution`}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Share What Worked
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}