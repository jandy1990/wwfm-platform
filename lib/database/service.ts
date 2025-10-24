import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let serviceClient: SupabaseClient<Database> | null = null

export function getServiceSupabaseClient(): SupabaseClient<Database> {
  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase service credentials. Check SUPABASE_SERVICE_KEY and NEXT_PUBLIC_SUPABASE_URL.')
    }

    serviceClient = createClient<Database>(url, key)
  }

  return serviceClient
}
