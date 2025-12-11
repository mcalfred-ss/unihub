'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'

interface FilePickerProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMB?: number
  error?: string
}

export const FilePicker: React.FC<FilePickerProps> = ({
  onFileSelect,
  accept = '.pdf,.png,.jpg,.jpeg,.docx',
  maxSizeMB = 25,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        return `File size exceeds ${maxSizeMB}MB limit`
      }

      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]

      if (!allowedTypes.includes(file.type)) {
        return 'Invalid file type. Please upload PDF, PNG, JPG, or DOCX files.'
      }

      return null
    },
    [maxSizeMB]
  )

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setDragError(validationError)
        return
      }
      setDragError(null)
      onFileSelect(file)
    },
    [validateFile, onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  return (
    <div className="w-full">
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          borderColor: isDragging ? 'rgba(0, 224, 214, 1)' : 'rgba(0, 224, 214, 0.3)',
          backgroundColor: isDragging ? 'rgba(230, 255, 251, 1)' : 'rgba(0, 0, 0, 0)',
        }}
        transition={{ duration: 0.2 }}
        className={`
          border-2 border-dashed rounded-2xl p-12
          text-center cursor-pointer
          ${isDragging ? 'border-primary bg-background' : 'border-primary/30'}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center gap-4"
          >
            <svg
              className="w-16 h-16 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold text-text">
                Drag & drop your file here
              </p>
              <p className="text-sm text-text/60 mt-2">
                or click to browse (PDF, PNG, JPG, DOCX up to {maxSizeMB}MB)
              </p>
            </div>
          </motion.div>
        </label>
      </motion.div>
      {(error || dragError) && (
        <p className="mt-2 text-sm text-red-500">{error || dragError}</p>
      )}
    </div>
  )
}

