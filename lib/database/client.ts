import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance for client-side usage
let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (browserClient) return browserClient
  
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return browserClient
}

// Backward compatibility - will be removed in future
export const supabase = createClient()

// Export the function with old name for gradual migration
export const createSupabaseBrowserClient = createClient