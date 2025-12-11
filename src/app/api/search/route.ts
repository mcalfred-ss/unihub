import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const schools = searchParams.get('schools')?.split(',').filter(Boolean) || []
    const years = searchParams.get('years')?.split(',').filter(Boolean) || []
    const types = searchParams.get('types')?.split(',').filter(Boolean) || []

    // Build Supabase query
    let supabaseQuery = supabase.from('posts').select('*')

    // Apply text search on program_name
    if (query) {
      // Tokenize query - extract years and program names
      const tokens = query.split(/\s+/).filter(Boolean)
      const yearTokens = tokens.filter((t) => /^\d{4}$/.test(t))
      const programTokens = tokens.filter((t) => !/^\d{4}$/.test(t))

      if (programTokens.length > 0) {
        const programSearch = programTokens.join(' & ')
        supabaseQuery = supabaseQuery.ilike('program_name', `%${programSearch}%`)
      }

      // If year tokens found, add to years filter
      if (yearTokens.length > 0) {
        years.push(...yearTokens)
      }
    }

    // Apply filters
    if (schools.length > 0) {
      supabaseQuery = supabaseQuery.in('school', schools)
    }

    if (years.length > 0) {
      const yearNumbers = years.map((y) => parseInt(y, 10)).filter((y) => !isNaN(y))
      if (yearNumbers.length > 0) {
        supabaseQuery = supabaseQuery.in('year', yearNumbers)
      }
    }

    if (types.length > 0) {
      const mimeTypeFilters = types.map((type) => {
        switch (type.toLowerCase()) {
          case 'pdf':
            return 'application/pdf'
          case 'image':
            return ['image/png', 'image/jpeg', 'image/jpg']
          case 'document':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          default:
            return null
        }
      }).filter(Boolean).flat()

      if (mimeTypeFilters.length > 0) {
        supabaseQuery = supabaseQuery.in('mime_type', mimeTypeFilters)
      }
    }

    // Limit results and order by date
    supabaseQuery = supabaseQuery
      .order('created_at', { ascending: false })
      .limit(20)

    const { data, error } = await supabaseQuery

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
              "The server expects table 'posts' with columns: program_name, year, school, storage_path, file_name, mime_type. Ask the DB engineer for the schema.sql and RLS policies.",
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          error: 'SEARCH_FAILED',
          message: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        posts: data || [],
        hasMore: (data || []).length === 20,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        error: 'SEARCH_FAILED',
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

