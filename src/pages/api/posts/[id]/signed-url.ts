import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    const postId = Array.isArray(id) ? id[0] : id

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' })
    }

    // First, get the post to find the storage path
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('storage_path')
      .eq('id', postId)
      .single()

    if (postError) {
      if (
        postError.message.includes('relation') ||
        postError.message.includes('column')
      ) {
        return res.status(500).json({
          error: 'DB_SCHEMA_MISSING',
          message:
            "The server expects table 'posts' with column 'storage_path'. Ask the DB engineer for the schema.sql and RLS policies.",
        })
      }

      return res.status(404).json({ error: 'Post not found' })
    }

    if (!post || !post.storage_path) {
      return res.status(404).json({ error: 'Post storage path not found' })
    }

    // Get server client for signed URL generation
    const serverClient = getSupabaseServer()

    if (!serverClient) {
      return res.status(403).json({
        error: 'MISSING_SERVICE_ROLE_KEY',
        message:
          'Add SUPABASE_SERVICE_ROLE_KEY (service role) to server env/secret store and restart server.',
      })
    }

    // Verify bucket exists
    const { data: buckets, error: bucketsError } = await serverClient.storage.listBuckets()
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
    } else {
      const uploadsBucket = buckets?.find((b) => b.name === 'uploads')
      if (!uploadsBucket) {
        console.error('Bucket "uploads" not found. Available buckets:', buckets?.map((b) => b.name))
        return res.status(404).json({
          error: 'BUCKET_NOT_FOUND',
          message:
            'Bucket "uploads" not found in Supabase Storage. Please create it in the Supabase Dashboard → Storage → Files.',
          availableBuckets: buckets?.map((b) => b.name) || [],
        })
      }
      console.log('Bucket "uploads" found:', { id: uploadsBucket.id, public: uploadsBucket.public })
    }

    // Generate signed URL (valid for 1 hour)
    console.log('Attempting to create signed URL for:', {
      bucket: 'uploads',
      path: post.storage_path,
      postId: postId,
    })

    const { data: urlData, error: urlError } = await serverClient.storage
      .from('uploads')
      .createSignedUrl(post.storage_path, 3600)

    if (urlError) {
      console.error('Signed URL creation error:', {
        message: urlError.message,
        statusCode: urlError.statusCode,
        error: urlError,
        bucket: 'uploads',
        path: post.storage_path,
      })

      // Provide more specific error messages
      let errorMessage = urlError.message || 'Failed to generate signed URL'
      let statusCode = 500

      if (
        urlError.message?.toLowerCase().includes('bucket not found') ||
        urlError.statusCode === 404
      ) {
        errorMessage =
          'Bucket "uploads" not found. Please create the bucket in Supabase Storage dashboard.'
        statusCode = 404
      } else if (urlError.message?.toLowerCase().includes('not found')) {
        errorMessage = `File not found at path: ${post.storage_path}. The file may not exist in storage.`
        statusCode = 404
      }

      return res.status(statusCode).json({
        error: 'SIGNED_URL_FAILED',
        message: errorMessage,
        details: {
          bucket: 'uploads',
          path: post.storage_path,
          originalError: urlError.message,
        },
      })
    }

    if (!urlData?.signedUrl) {
      return res.status(500).json({ error: 'Failed to generate signed URL' })
    }

    return res.status(200).json({ url: urlData.signedUrl })
  } catch (error) {
    console.error('Signed URL unexpected error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return res.status(500).json({
      error: 'SIGNED_URL_FAILED',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
      details: error instanceof Error ? { stack: error.stack } : undefined,
    })
  }
}

