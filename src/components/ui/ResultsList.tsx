'use client'

import React, { useEffect, useRef } from 'react'
import { ResultCard } from './ResultCard'
import { Post } from '@/types'

interface ResultsListProps {
  posts: Post[]
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  onPreview?: (post: Post) => void
}

export const ResultsList: React.FC<ResultsListProps> = ({
  posts,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onPreview,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && onLoadMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, isLoading, onLoadMore])

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text/60 text-lg">No results found</p>
        <p className="text-text/40 text-sm mt-2">
          Try adjusting your search filters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <ResultCard key={post.id} post={post} onPreview={onPreview} />
      ))}

      {hasMore && (
        <div ref={observerTarget} className="py-4 text-center">
          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

