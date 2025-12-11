import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client (optional)
 * Only works if SUPABASE_SERVICE_ROLE_KEY is provided via environment variable
 * 
 * WARNING: Service role key bypasses RLS. Only use for admin operations
 * that require elevated privileges (e.g., generating signed URLs).
 * 
 * If SUPABASE_SERVICE_ROLE_KEY is not set, this will return null and operations
 * should fail gracefully with MISSING_SERVICE_ROLE_KEY error.
 */
export function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
    )
  }

  if (!serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

