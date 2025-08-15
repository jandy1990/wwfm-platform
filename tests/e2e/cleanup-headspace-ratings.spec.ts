import { test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

test('Cleanup Headspace ratings', async () => {
  console.log('🔥 Cleaning up ratings for Headspace solution')
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!
  
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  const solutionId = '899a3b77-6f61-41a1-9f62-2a1a91091fae'
  const goalId = '56e2801e-0d78-4abd-a795-869e5b780ae7'
  
  // Delete ratings for this solution-goal combination
  const { error } = await supabase
    .from('goal_implementation_links')
    .delete()
    .eq('solution_id', solutionId)
    .eq('goal_id', goalId)
  
  if (error) {
    console.log('Error cleaning up ratings:', error)
  } else {
    console.log('✅ Cleaned up ratings for Headspace solution')
  }
  
  // Also delete any variant links
  await supabase
    .from('goal_implementation_variants')
    .delete()
    .eq('solution_id', solutionId)
    .eq('goal_id', goalId)
  
  console.log('✅ Cleanup complete')
})
