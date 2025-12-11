import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Post } from '@/types'
import PostCard from '@/components/PostCard'
import FilterBar from '@/components/FilterBar'

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [level, setLevel] = useState('')

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (fetchError) {
          throw fetchError
        }

        setPosts(data || [])
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Filter posts based on query, year, and level
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Search query filter
      if (query) {
        const searchLower = query.toLowerCase()
        const matchesQuery =
          post.program_name?.toLowerCase().includes(searchLower) ||
          post.file_name?.toLowerCase().includes(searchLower) ||
          post.title?.toLowerCase().includes(searchLower) ||
          post.school?.toLowerCase().includes(searchLower)
        if (!matchesQuery) return false
      }

      // Year filter
      if (year && post.year !== year) {
        return false
      }

      // Level filter (this is a placeholder - adjust based on your data structure)
      // You may need to extract level from program_name or add a level field
      if (level) {
        // For now, we'll skip level filtering as it's not in the Post type
        // You can add this logic when you have level data
      }

      return true
    })
  }, [posts, query, year, level])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-green to-pastel-pink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">
            Welcome to UniHub
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Find and share university resources with ease.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="max-w-4xl mx-auto mb-8 bg-white/80 rounded-xl shadow-md p-4">
          <FilterBar
            query={query}
            setQuery={setQuery}
            year={year}
            setYear={setYear}
            level={level}
            setLevel={setLevel}
          />
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading resources...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {posts.length === 0
                ? 'No resources found. Upload one to get started!'
                : 'No resources match your filters. Try adjusting your search.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

