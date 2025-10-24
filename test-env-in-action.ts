'use server'

export async function testEnvVars() {
  console.log('=== ENV TEST IN SERVER ACTION ===')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY)
  console.log('SUPABASE_SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY?.length)
  console.log('SUPABASE_SERVICE_KEY starts:', process.env.SUPABASE_SERVICE_KEY?.substring(0, 30))
  
  return {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    keyLength: process.env.SUPABASE_SERVICE_KEY?.length
  }
}
