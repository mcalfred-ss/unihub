import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body
  console.log('API /api/posts/create called — body:', body)

  try {
    const supabaseAdmin = getSupabaseAdmin() // should use SUPABASE_SERVICE_ROLE_KEY
    console.log('USING_SERVICE_ROLE:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    const insertPayload = {
      uploader: null, // server sets null for anonymous uploads
      program_name: body.program_name,
      year: body.year,
      school: body.school,
      type: body.type,
      title: body.title ?? '',
      storage_path: body.storage_path,
      file_name: body.file_name,
      file_size: body.file_size,
      mime_type: body.mime_type,
      is_public: false,
    }

    console.log('Server inserting post:', JSON.stringify(insertPayload, null, 2))
    const { data, error } = await supabaseAdmin.from('posts').insert(insertPayload).select().single()

    if (error) {
      console.error('INSERT ERROR (server):', error)
      return res.status(500).json({ error })
    }

    console.log('Database insert completed successfully')
    return res.status(201).json({ data })
  } catch (err) {
    console.error('API /api/posts/create error', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

