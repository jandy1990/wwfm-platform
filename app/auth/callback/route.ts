// app/auth/callback/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// Create a Supabase client configured for server-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  // Get the URL parameters
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // Check if we have the required parameters
  if (token_hash && type) {
    // Only handle email-based auth types
    if (['signup', 'recovery', 'email_change'].includes(type)) {
      // Verify the token with Supabase
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'signup' | 'recovery' | 'email_change',
      })

      if (!error) {
        // Success! Redirect to dashboard or specified page
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    }
  }

  // Something went wrong, redirect to signin with error message
  return NextResponse.redirect(
    new URL('/auth/signin?error=Could not verify email. Please try again.', requestUrl.origin)
  )
}