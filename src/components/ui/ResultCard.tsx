'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Post } from '@/types'

interface ResultCardProps {
  post: Post
  onPreview?: (post: Post) => void
}

export const ResultCard: React.FC<ResultCardProps> = ({ post, onPreview }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-xl font-semibold text-text font-display">
            {post.program_name || 'Untitled Document'}
          </h3>
          {post.year && (
            <p className="text-sm text-text/60 mt-1">Year: {post.year}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {post.school && (
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
              {post.school}
            </span>
          )}
          {post.mime_type && (
            <span className="px-3 py-1 bg-text/10 text-text rounded-full text-sm">
              {post.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
            </span>
          )}
        </div>

        {post.file_name && (
          <p className="text-sm text-text/50 truncate">{post.file_name}</p>
        )}

        <div className="flex gap-3 mt-2">
          <Link
            href={`/post/${post.id}`}
            className="flex-1 px-4 py-2 bg-primary text-text rounded-full font-medium text-center hover:opacity-90 transition-opacity"
          >
            View Details
          </Link>
          {onPreview && (
            <button
              onClick={() => onPreview(post)}
              className="px-4 py-2 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary/10 transition-colors"
            >
              Preview
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

