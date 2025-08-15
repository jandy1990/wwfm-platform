import { test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

test('Cleanup Headspace Test solution', async () => {
  console.log('🔥 Running aggressive cleanup for Headspace (Test)')
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!
  
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  // Find the Headspace (Test) solution
  const { data: solutions } = await supabase
    .from('solutions')
    .select('id')
    .eq('name', 'Headspace (Test)')
  
  if (solutions && solutions.length > 0) {
    const solutionId = solutions[0].id
    console.log(`Found solution ID: ${solutionId}`)
    
    // Delete all related data
    await supabase.from('goal_implementation_links').delete().eq('solution_id', solutionId)
    await supabase.from('goal_implementation_variants').delete().eq('solution_id', solutionId)
    await supabase.from('failed_solutions_by_users').delete().eq('solution_id', solutionId)
    await supabase.from('solution_variant_lookups').delete().eq('solution_id', solutionId)
    await supabase.from('solutions').delete().eq('id', solutionId)
    
    console.log('✅ Cleaned up all Headspace (Test) data')
  } else {
    console.log('No Headspace (Test) solution found')
  }
})
