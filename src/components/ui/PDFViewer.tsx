'use client'

import React, { useEffect, useRef } from 'react'

interface PDFViewerProps {
  url: string
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simple iframe-based PDF viewer
    // For production, you might want to use pdf.js for better control
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      const iframe = document.createElement('iframe')
      iframe.src = url
      iframe.className = 'w-full h-[80vh] border-0 rounded-lg'
      iframe.title = 'PDF Preview'
      containerRef.current.appendChild(iframe)
    }
  }, [url])

  return <div ref={containerRef} className="w-full" />
}

