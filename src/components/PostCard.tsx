import { useState } from 'react'
import { Post } from '@/types'
import { supabase } from '@/lib/supabaseClient'
import IconForType from '@/components/ui/IconForType'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate public URL for preview (fallback)
  const getPublicUrl = () => {
    const { data } = supabase.storage.from('uploads').getPublicUrl(post.storage_path)
    return data.publicUrl
  }

  // Get signed URL for download (works for both public and private buckets)
  const getSignedUrl = async (): Promise<string> => {
    try {
      const res = await fetch(`/api/posts/${post.id}/signed-url`)
      if (!res.ok) {
        const data = await res.json()
        const errorMsg = data.message || data.error || 'Failed to get download URL'
        console.error('Signed URL API error:', {
          status: res.status,
          error: errorMsg,
          postId: post.id,
          storagePath: post.storage_path,
        })
        throw new Error(errorMsg)
      }
      const data = await res.json()
      return data.url
    } catch (err) {
      console.error('Error getting signed URL:', err)
      throw err
    }
  }

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Try signed URL first (works for both public and private buckets)
      const url = await getSignedUrl()
      const link = document.createElement('a')
      link.href = url
      link.download = post.file_name || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to download'
      
      // Provide more specific error messages
      if (errorMessage.includes('Bucket not found')) {
        setError('Storage bucket not found. Please check Supabase Storage configuration.')
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setError('File not found in storage. The file may not have been uploaded yet.')
      } else {
        setError(`Download failed: ${errorMessage}`)
      }
      
      // Fallback to public URL if signed URL fails
      try {
        const publicUrl = getPublicUrl()
        console.log('Attempting fallback to public URL:', publicUrl)
        window.open(publicUrl, '_blank')
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fileUrl = getPublicUrl()

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 mt-1">
          <IconForType type={post.type || post.mime_type} className="text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {post.program_name}
          </h3>
          <div className="space-y-0.5 text-sm text-gray-600">
            {post.year && <p>Year: {post.year}</p>}
            {post.school && <p className="truncate">School: {post.school}</p>}
            {post.title && (
              <p className="font-medium text-gray-800 truncate">{post.title}</p>
            )}
          </div>
        </div>
      </div>

      {post.file_name && (
        <p className="text-xs text-gray-500 mb-3 truncate">{post.file_name}</p>
      )}

      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex space-x-2 mb-3">
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : (
            'Download'
          )}
        </button>
        {post.mime_type === 'application/pdf' && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-pastel-blue hover:bg-blue-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            Preview
          </a>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        {post.file_size && (
          <span>{(post.file_size / 1024 / 1024).toFixed(2)} MB</span>
        )}
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

