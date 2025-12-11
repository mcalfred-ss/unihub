import { createClient } from '@supabase/supabase-js'

/**
 * Utility function to list available Supabase storage buckets
 * 
 * Can be used in browser console or imported in components:
 * 
 * @example
 * ```ts
 * import { listBuckets } from '@/lib/checkBuckets'
 * await listBuckets()
 * ```
 */
export async function listBuckets() {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!SUPA_URL || !SUPA_KEY) {
    console.error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
    return null
  }

  const supabase = createClient(SUPA_URL, SUPA_KEY)

  const { data, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('listBuckets error', error)
    return null
  }

  console.log('Buckets visible via anon key:', data.map((b) => b.name))
  return data
}

