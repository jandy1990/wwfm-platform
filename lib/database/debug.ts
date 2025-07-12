// lib/supabase-debug.ts
import { createClient } from '@supabase/supabase-js'

export async function testRLSPolicies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('=== TESTING RLS POLICIES ===')
  
  // Test ratings access
  const { data: anonRatings, error: anonError } = await supabase
    .from('ratings')
    .select('*')
    .limit(1)
  
  console.log('Anonymous can see ratings:', anonRatings && anonRatings.length > 0 ? '✅' : '❌')
  if (anonError) console.log('Anonymous error:', anonError.message)
  
  // Test solutions access
  const { data: anonSolutions, error: solError } = await supabase
    .from('solutions')
    .select('*')
    .eq('is_approved', true)
    .limit(1)
  
  console.log('Anonymous can see solutions:', anonSolutions && anonSolutions.length > 0 ? '✅' : '❌')
  if (solError) console.log('Solutions error:', solError.message)
  
  // Test goals access
  const { data: anonGoals, error: goalError } = await supabase
    .from('goals')
    .select('*')
    .eq('is_approved', true)
    .limit(1)
  
  console.log('Anonymous can see goals:', anonGoals && anonGoals.length > 0 ? '✅' : '❌')
  if (goalError) console.log('Goals error:', goalError.message)
  
  console.log('=== END RLS TESTS ===')
}

// Function to test as a specific user
export async function testRLSAsUser(userId: string) {
  console.log(`=== TESTING RLS AS USER ${userId} ===`)
  // This would require auth tokens, so we'll implement this later
  console.log('User-specific testing not yet implemented')
  console.log('=== END USER RLS TESTS ===')
}