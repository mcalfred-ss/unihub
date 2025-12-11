/**
 * Utility script to check available Supabase storage buckets
 * 
 * Usage:
 *   node scripts/check-buckets.js
 * 
 * Or in browser console:
 *   import { listBuckets } from '@/lib/checkBuckets'
 *   await listBuckets()
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPA_URL || !SUPA_KEY) {
  console.error(
    '❌ Missing Supabase environment variables.'
  )
  console.error(
    '   Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  )
  process.exit(1)
}

const supabase = createClient(SUPA_URL, SUPA_KEY)

async function listBuckets() {
  console.log('🔍 Checking Supabase storage buckets...\n')

  const { data, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ Error listing buckets:', error.message)
    console.error('   Full error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No buckets found.')
    console.log('   You may need to create a bucket in your Supabase dashboard.')
    console.log('   The application expects a bucket named "files" (or update the code to use a different name).\n')
    return
  }

  console.log('✅ Available buckets:')
  data.forEach((bucket) => {
    console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
  })

  const hasUploadsBucket = data.some((b) => b.name === 'uploads')
  if (!hasUploadsBucket) {
    console.log('\n⚠️  Warning: No "uploads" bucket found.')
    console.log('   The application expects a bucket named "uploads".')
    console.log('   Create it in Supabase Dashboard → Storage → New bucket\n')
  } else {
    console.log('\n✅ "uploads" bucket found!\n')
  }
}

listBuckets()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  })

