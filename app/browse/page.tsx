// app/browse/page.tsx

import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Arena type definition
type Arena = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  _count?: {
    categories: number
    goals: number
  }
}

async function getArenas() {
  const supabase = createSupabaseServerClient()
  
  // Fetch arenas with counts of categories and goals
  const { data: arenas, error } = await supabase
    .from('arenas')
    .select(`
      *,
      categories (
        id,
        goals (
          id
        )
      )
    `)
    .eq('is_active', true)
    .order('order_rank')

  if (error) {
    console.error('Error fetching arenas:', error)
    return []
  }

  // Transform data to include counts
  return arenas.map(arena => ({
    ...arena,
    _count: {
      categories: arena.categories?.length || 0,
      goals: arena.categories?.reduce((acc: number, cat: any) => 
        acc + (cat.goals?.length || 0), 0) || 0
    }
  }))
}

export default async function BrowsePage() {
  const arenas = await getArenas()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Browse Goals by Life Area
          </h1>
          <p className="mt-2 text-gray-600">
            Discover what has worked for others in achieving their goals
          </p>
        </div>

        {/* Arena Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arenas.map((arena) => (
            <Link
              key={arena.id}
              href={`/arena/${arena.slug}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">{arena.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {arena.name}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  {arena.description}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{arena._count?.categories || 0} categories</span>
                  <span>{arena._count?.goals || 0} goals</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {arenas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No areas available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}