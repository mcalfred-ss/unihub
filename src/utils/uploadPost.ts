import { supabase } from '@/lib/supabaseClient'

export type UploadMeta = {
  program_name: string
  year: string
  school: string
  type: string
  title?: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
}

const BUCKET = 'uploads'

export async function uploadToStorage(path: string, file: File) {
  try {
    console.info('Uploading to storage path:', path)

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false })

    if (error) {
      // Improve diagnostics for bucket not found
      if (error?.message?.toLowerCase().includes('bucket not found') || error?.status === 404) {
        throw new Error('Bucket not found. Confirm a bucket named "uploads" exists in Supabase Storage.')
      }
      throw error
    }

    console.log('Storage upload succeeded:', data?.Key ?? data)
    return data
  } catch (err: any) {
    console.error('Storage upload error:', err)
    throw err
  }
}

export async function insertPostMetadataServer(meta: Omit<UploadMeta, 'uploader' | 'is_public'>) {
  // Calls server API route /api/posts/create
  console.info('CALLING /api/posts/create WITH METADATA', meta)
  const res = await fetch('/api/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error('SERVER INSERT FAILED', json)
    throw new Error(json?.error?.message ?? 'Server insert failed')
  }
  console.log('SERVER INSERT OK', json)
  return json
}

export async function uploadPost(
  file: File,
  fields: { program_name: string; year: string; school: string; type: string; title?: string }
) {
  const safeName = `${Date.now()}_${cryptoRandomString() || file.name}`
  const path = `posts/${fields.year}/${fields.school}/${safeName}`

  // 1) upload to storage
  await uploadToStorage(path, file)

  // 2) call server to insert metadata (server sets uploader=null and is_public=false)
  const meta = {
    program_name: fields.program_name,
    year: fields.year,
    school: fields.school,
    type: fields.type,
    title: fields.title || '',
    storage_path: path,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
  }
  return await insertPostMetadataServer(meta)
}

/** small helper for unique string (fallback) */
function cryptoRandomString() {
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
  } catch {
    return Math.random().toString(36).slice(2, 10)
  }
}
