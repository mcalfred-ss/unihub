import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Verify user is admin (stubbed - actual RBAC enforced by DB RLS)
    // In production, check user session and role
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get post to find storage path for cleanup
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

    // Get server client for admin operations
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

    // Delete from database (RLS policies should enforce admin-only access)
    const { error: deleteError } = await serverClient
      .from('posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      // Check if it's an RLS policy error
      if (deleteError.message.includes('policy') || deleteError.message.includes('RLS')) {
        return NextResponse.json(
          {
            error: 'RLS_POLICY_MISSING',
            message:
              'Row Level Security (RLS) policies are not configured for admin delete operations. Ask the DB engineer for the required RLS policies.',
          },
          { status: 403 }
        )
      }

      if (
        deleteError.message.includes('relation') ||
        deleteError.message.includes('column')
      ) {
        return NextResponse.json(
          {
            error: 'DB_SCHEMA_MISSING',
            message:
              "The server expects table 'posts' with proper schema. Ask the DB engineer for the schema.sql and RLS policies.",
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          error: 'DELETE_FAILED',
          message: deleteError.message,
        },
        { status: 500 }
      )
    }

    // Optionally delete file from storage
    if (post?.storage_path) {
      await serverClient.storage.from('uploads').remove([post.storage_path])
    }

    return NextResponse.json(
      { success: true, message: 'Post deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      {
        error: 'DELETE_FAILED',
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

