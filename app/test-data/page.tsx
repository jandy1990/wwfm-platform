import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function TestDataPage() {
  const supabase = await createSupabaseServerClient()
  
  console.log('🔍 Testing database tables...')
  
  // Test all tables
  const tests = {
    arenas: null,
    categories: null,
    goals: null,
    solutions_v2: null,
    solution_variants: null,
    goal_implementation_links: null,
    ratings: null
  }
  
  try {
    // Test arenas - try different column combinations
    const { data: arenas, error: arenasError } = await supabase
      .from('arenas')
      .select('*')
      .limit(5)
    tests.arenas = { count: arenas?.length || 0, data: arenas, error: arenasError?.message }
    
    // Test categories  
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    tests.categories = { count: categories?.length || 0, data: categories, error: categoriesError?.message }
    
    // Test goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .limit(5)
    tests.goals = { count: goals?.length || 0, data: goals, error: goalsError?.message }
    
    // Test solutions_v2
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions_v2')
      .select('id, title, solution_category, solution_model, is_approved')
      .eq('is_approved', true)
      .limit(5)
    tests.solutions_v2 = { count: solutions?.length || 0, data: solutions, error: solutionsError?.message }
    
    // Test solution_variants
    const { data: variants, error: variantsError } = await supabase
      .from('solution_variants')
      .select('*')
      .limit(5)
    tests.solution_variants = { count: variants?.length || 0, data: variants, error: variantsError?.message }
    
    // Test goal_implementation_links
    const { data: implementations, error: implementationsError } = await supabase
      .from('goal_implementation_links')
      .select('*')
      .limit(5)
    tests.goal_implementation_links = { count: implementations?.length || 0, data: implementations, error: implementationsError?.message }
    
    // Test ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .limit(5)
    tests.ratings = { count: ratings?.length || 0, data: ratings, error: ratingsError?.message }
    
  } catch (error) {
    console.error('Test error:', error)
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Database Test Results</h1>
      
      <div className="space-y-6">
        {Object.entries(tests).map(([table, result]) => (
          <div key={table} className="bg-white border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">{table}</h2>
            
            {result?.error ? (
              <div className="text-red-600 bg-red-50 p-2 rounded">
                ❌ Error: {result.error}
              </div>
            ) : (
              <div className="text-green-600 bg-green-50 p-2 rounded mb-2">
                ✅ Count: {result?.count || 0} records
              </div>
            )}
            
            {result?.data && result.data.length > 0 && (
              <div className="mt-2">
                <h3 className="font-medium mb-1">Sample Data:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Test URLs to try:</h2>
        <ul className="space-y-1 text-sm">
          <li>• <a href="/" className="text-blue-600 hover:underline">/ (Home)</a></li>
          <li>• <a href="/browse" className="text-blue-600 hover:underline">/browse</a></li>
          <li>• <a href="/auth/signin" className="text-blue-600 hover:underline">/auth/signin</a></li>
          <li>• <a href="/auth/signup" className="text-blue-600 hover:underline">/auth/signup</a></li>
          {tests.arenas?.data?.[0] && (
            <li>• <a href={`/arena/${tests.arenas.data[0].slug}`} className="text-blue-600 hover:underline">/arena/{tests.arenas.data[0].slug}</a></li>
          )}
          {tests.categories?.data?.[0] && (
            <li>• <a href={`/category/${tests.categories.data[0].slug}`} className="text-blue-600 hover:underline">/category/{tests.categories.data[0].slug}</a></li>
          )}
          {tests.goals?.data?.[0] && (
            <li>• <a href={`/goal/${tests.goals.data[0].id}`} className="text-blue-600 hover:underline">/goal/{tests.goals.data[0].id}</a></li>
          )}
        </ul>
      </div>
    </div>
  )
}