import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { supabase } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // First, get the post to find the storage path
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (postError) {
      if (
        postError.message.includes('relation') ||
        postError.message.includes('column')
      ) {
        return NextResponse.json(
          {
            error: 'DB_SCHEMA_MISSING',
            message:
              "The server expects table 'posts' with column 'storage_path'. Ask the DB engineer for the schema.sql and RLS policies.",
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (!post || !post.storage_path) {
      return NextResponse.json(
        { error: 'Post storage path not found' },
        { status: 404 }
      )
    }

    // Get server client for signed URL generation
    const serverClient = getSupabaseServer()

    if (!serverClient) {
      return NextResponse.json(
        {
          error: 'MISSING_SERVICE_ROLE_KEY',
          message:
            'Add SUPABASE_SERVICE_ROLE_KEY (service role) to server env/secret store and restart server.',
        },
        { status: 403 }
      )
    }

    // Verify bucket exists
    const { data: buckets, error: bucketsError } = await serverClient.storage.listBuckets()
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
    } else {
      const uploadsBucket = buckets?.find((b) => b.name === 'uploads')
      if (!uploadsBucket) {
        console.error('Bucket "uploads" not found. Available buckets:', buckets?.map((b) => b.name))
        return NextResponse.json(
          {
            error: 'BUCKET_NOT_FOUND',
            message:
              'Bucket "uploads" not found in Supabase Storage. Please create it in the Supabase Dashboard → Storage → Files.',
            availableBuckets: buckets?.map((b) => b.name) || [],
          },
          { status: 404 }
        )
      }
      console.log('Bucket "uploads" found:', { id: uploadsBucket.id, public: uploadsBucket.public })
    }

    // Generate signed URL (valid for 1 hour)
    console.log('Attempting to create signed URL for:', {
      bucket: 'uploads',
      path: post.storage_path,
      postId: id,
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

      return NextResponse.json(
        {
          error: 'SIGNED_URL_FAILED',
          message: errorMessage,
          details: {
            bucket: 'uploads',
            path: post.storage_path,
            originalError: urlError.message,
          },
        },
        { status: statusCode }
      )
    }

    if (!urlData?.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { url: urlData.signedUrl },
      { status: 200 }
    )
  } catch (error) {
    console.error('Signed URL unexpected error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: 'SIGNED_URL_FAILED',
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? { stack: error.stack } : undefined,
      },
      { status: 500 }
    )
  }
}

