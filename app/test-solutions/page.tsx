import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function TestSolutions() {
  const supabase = await createSupabaseServerClient()

  // Test 1: Check goal_implementation_links table
  const { data: links, error: linksError } = await supabase
    .from('goal_implementation_links')
    .select('*')
    .limit(10)

  // Test 2: Check solutions_v2 table
  const { data: solutions, error: solutionsError } = await supabase
    .from('solutions_v2')
    .select('*')
    .eq('is_approved', true)
    .limit(10)

  // Test 3: Check solution_variants table
  const { data: variants, error: variantsError } = await supabase
    .from('solution_variants')
    .select('*')
    .limit(10)

  // Test 4: Check if any goal_implementation_links exist for a specific goal
  const { data: specificGoalLinks, error: specificError } = await supabase
    .from('goal_implementation_links')
    .select('*')
    .limit(5)

  // Test 5: Check the exact query structure from goal-solutions.ts
  const { data: measuredTest, error: measuredTestError } = await supabase
    .from('goal_implementation_links')
    .select(`
      goal_id,
      solution_id,
      implementation_id,
      avg_effectiveness,
      rating_count,
      solution_variants!inner (
        id,
        name,
        solutions_v2!inner (
          id,
          title,
          description,
          solution_model,
          is_approved
        )
      )
    `)
    .eq('solution_variants.solutions_v2.is_approved', true)
    .eq('solution_variants.solutions_v2.solution_model', 'measured')
    .not('implementation_id', 'is', null)
    .limit(5)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Goal Implementation Links:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ 
              count: links?.length || 0, 
              error: linksError?.message || null,
              sample: links?.slice(0, 2) || []
            }, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Solutions V2:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ 
              count: solutions?.length || 0, 
              error: solutionsError?.message || null,
              sample: solutions?.slice(0, 2) || []
            }, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Solution Variants:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ 
              count: variants?.length || 0, 
              error: variantsError?.message || null,
              sample: variants?.slice(0, 2) || []
            }, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Specific Goal Links:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ 
              count: specificGoalLinks?.length || 0, 
              error: specificError?.message || null,
              sample: specificGoalLinks?.slice(0, 2) || []
            }, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Measured Solutions Join Test:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ 
              count: measuredTest?.length || 0, 
              error: measuredTestError?.message || null,
              sample: measuredTest?.slice(0, 2) || []
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}