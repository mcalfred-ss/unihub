import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      // Check if it's a schema error
      if (
        error.message.includes('relation') ||
        error.message.includes('column')
      ) {
        return NextResponse.json(
          {
            error: 'DB_SCHEMA_MISSING',
            message:
              "The server expects table 'posts' with columns: id, program_name, year, school, storage_path, file_name, mime_type. Ask the DB engineer for the schema.sql and RLS policies.",
          },
          { status: 500 }
        )
      }

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          error: 'FETCH_FAILED',
          message: error.message,
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Fetch post error:', error)
    return NextResponse.json(
      {
        error: 'FETCH_FAILED',
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

