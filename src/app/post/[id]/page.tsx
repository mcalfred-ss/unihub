'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { PreviewModal } from '@/components/ui/PreviewModal'
import { Post } from '@/components/ui/ResultCard'
import Link from 'next/link'

async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`)
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to fetch post')
  }
  return res.json()
}

async function getSignedUrl(id: string): Promise<string> {
  const res = await fetch(`/api/posts/${id}/signed-url`)
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to get download URL')
  }
  const data = await res.json()
  return data.url
}

export default function PostPage() {
  const params = useParams()
  const id = params?.id ? (typeof params.id === 'string' ? params.id : params.id[0]) : ''
  
  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Post ID required</p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    async function loadPost() {
      try {
        const postData = await fetchPost(id)
        setPost(postData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setIsLoading(false)
      }
    }
    loadPost()
  }, [id])

  const handleDownload = async () => {
    if (!post) return

    setIsDownloading(true)
    try {
      const url = await getSignedUrl(id)
      setDownloadUrl(url)

      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = post.file_name || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-red-600">{error || 'Post not found'}</p>
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
                href="/dashboard"
                className="px-4 py-2 text-text hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="text-primary hover:underline mb-4 inline-block"
          >
            ← Back to Search
          </Link>

          <div className="bg-white rounded-2xl p-8 shadow-md">
            <h1 className="text-3xl font-bold text-text font-display mb-4">
              {post.program_name || 'Untitled Document'}
            </h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {post.school && (
                <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium">
                  {post.school}
                </span>
              )}
              {post.year && (
                <span className="px-4 py-2 bg-text/10 text-text rounded-full text-sm">
                  Year: {post.year}
                </span>
              )}
              {post.mime_type && (
                <span className="px-4 py-2 bg-text/10 text-text rounded-full text-sm">
                  {post.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              )}
            </div>

            {post.file_name && (
              <p className="text-text/60 mb-6">File: {post.file_name}</p>
            )}

            {post.created_at && (
              <p className="text-sm text-text/50 mb-6">
                Uploaded: {new Date(post.created_at).toLocaleDateString()}
              </p>
            )}

            <div className="flex gap-4">
              <PrimaryButton
                onClick={() => setShowPreview(true)}
                className="flex-1"
              >
                Preview
              </PrimaryButton>
              <PrimaryButton
                onClick={handleDownload}
                isLoading={isDownloading}
                className="flex-1"
              >
                Download
              </PrimaryButton>
            </div>
          </div>
        </div>
      </main>

      {post && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          fileUrl={post.storage_path || ''}
          fileName={post.file_name || 'Preview'}
          mimeType={post.mime_type || 'application/pdf'}
        />
      )}
    </div>
  )
}

