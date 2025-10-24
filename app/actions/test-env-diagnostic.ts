'use server'

/**
 * Minimal diagnostic action to test environment variable access in Next.js 15 server actions
 * This bypasses all other logic to isolate the env var access issue
 */
export async function testEnvDiagnostic() {
  console.log('=== ENV DIAGNOSTIC START ===')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY)
  console.log('SUPABASE_SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY?.length)
  console.log('SUPABASE_SERVICE_KEY first 30 chars:', process.env.SUPABASE_SERVICE_KEY?.substring(0, 30))

  // Try to create service client
  try {
    const { getServiceSupabaseClient } = await import('@/lib/database/service')
    const client = getServiceSupabaseClient()
    console.log('✅ Service client created successfully')

    // Try a simple SELECT to verify it works
    const { data, error } = await client.from('ratings').select('id').limit(1)
    if (error) {
      console.log('❌ Service client query failed:', error.code, error.message)
    } else {
      console.log('✅ Service client query succeeded, rows:', data?.length)
    }
  } catch (err) {
    console.log('❌ Service client creation failed:', err)
  }

  console.log('=== ENV DIAGNOSTIC END ===')

  return {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    keyLength: process.env.SUPABASE_SERVICE_KEY?.length
  }
}
