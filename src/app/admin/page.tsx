'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ResultsList, Post } from '@/components/ui/ResultsList'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
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

      // Check admin role (stubbed - actual RBAC enforced by DB)
      // In production, this would check user metadata or a roles table
      const userRole = session.user.user_metadata?.role
      if (userRole === 'admin') {
        setIsAdmin(true)
        loadAllPosts()
      } else {
        setError('Access denied. Admin role required.')
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  async function loadAllPosts() {
    try {
      setIsLoading(true)
      setError(null)

      // Attempt to fetch all posts for moderation
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
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
          : 'Failed to load posts. Please check if the database schema is set up correctly.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch('/api/moderate/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed')
      }

      // Remove from local state
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Access Denied
              </h2>
              <p className="text-red-600">{error || 'Admin role required'}</p>
              <Link
                href="/"
                className="mt-4 inline-block px-4 py-2 bg-primary text-text rounded-full font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-text font-display">
              Uni Hub Admin
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-text hover:text-primary transition-colors"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text font-display mb-8">
            Moderation Dashboard
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                If this is a schema or RLS policy error, please contact the DB
                engineer for the required database schema and RLS policies.
              </p>
            </div>
          )}

          {!error && (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-6 shadow-md flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text">
                      {post.program_name || 'Untitled'}
                    </h3>
                    <p className="text-sm text-text/60">
                      {post.school} • {post.year}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/post/${post.id}`}
                      className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium hover:bg-primary/30 transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {posts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-text/60 text-lg">No posts to moderate</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

