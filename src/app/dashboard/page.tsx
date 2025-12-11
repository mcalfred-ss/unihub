'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ResultsList, Post } from '@/components/ui/ResultsList'
import { PreviewModal } from '@/components/ui/PreviewModal'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewPost, setPreviewPost] = useState<Post | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      loadUserPosts(session.user.id)
    }

    checkAuth()
  }, [router])

  async function loadUserPosts(userId: string) {
    try {
      setIsLoading(true)
      setError(null)

      // Attempt to fetch user's posts
      // Note: This assumes a 'posts' table with a 'user_id' column
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        // Check if it's a schema error
        if (
          fetchError.message.includes('relation') ||
          fetchError.message.includes('column')
        ) {
          setError(
            'Database schema not configured. Please contact the DB engineer for schema.sql and RLS policies.'
          )
          return
        }
        throw fetchError
      }

      setPosts(data || [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load your uploads. Please check if the database schema is set up correctly.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-text font-display">
              Uni Hub
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-text hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/upload"
                className="px-4 py-2 text-text hover:text-primary transition-colors"
              >
                Upload
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-text font-display">
              My Uploads
            </h1>
            <Link
              href="/upload"
              className="px-6 py-3 bg-primary text-text rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              + Upload New
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                If this is a schema error, please contact the DB engineer for the
                required database schema and RLS policies.
              </p>
            </div>
          )}

          {!error && (
            <ResultsList
              posts={posts}
              hasMore={false}
              onPreview={(post) => setPreviewPost(post)}
            />
          )}

          {!error && posts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-text/60 text-lg mb-4">
                You haven&apos;t uploaded any resources yet
              </p>
              <Link
                href="/upload"
                className="inline-block px-6 py-3 bg-primary text-text rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Upload Your First Resource
              </Link>
            </div>
          )}
        </div>
      </main>

      {previewPost && (
        <PreviewModal
          isOpen={!!previewPost}
          onClose={() => setPreviewPost(null)}
          fileUrl={previewPost.storage_path || ''}
          fileName={previewPost.file_name || 'Preview'}
          mimeType={previewPost.mime_type || 'application/pdf'}
        />
      )}
    </div>
  )
}

