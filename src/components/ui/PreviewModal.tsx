'use client'

import React, { useEffect, useState, lazy, Suspense } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'

// Lazy load PDF viewer only when needed
const PDFViewer = lazy(() => import('./PDFViewer').then((mod) => ({ default: mod.PDFViewer })))

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  mimeType: string
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  mimeType,
}) => {
  const [isImage, setIsImage] = useState(false)
  const [isPDF, setIsPDF] = useState(false)

  useEffect(() => {
    if (mimeType.startsWith('image/')) {
      setIsImage(true)
      setIsPDF(false)
    } else if (mimeType === 'application/pdf') {
      setIsPDF(true)
      setIsImage(false)
    } else {
      setIsImage(false)
      setIsPDF(false)
    }
  }, [mimeType])

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <Dialog.Title className="text-lg font-semibold text-text">
                  {fileName}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-text/60 hover:text-text transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4 max-h-[80vh] overflow-auto">
                <AnimatePresence mode="wait">
                  {isImage && (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <img
                        src={fileUrl}
                        alt={fileName}
                        className="w-full h-auto rounded-lg"
                      />
                    </motion.div>
                  )}

                  {isPDF && (
                    <motion.div
                      key="pdf"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                          </div>
                        }
                      >
                        <PDFViewer url={fileUrl} />
                      </Suspense>
                    </motion.div>
                  )}

                  {!isImage && !isPDF && (
                    <motion.div
                      key="unsupported"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-96 text-text/60"
                    >
                      <p>Preview not available for this file type</p>
                      <p className="text-sm mt-2">File: {fileName}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

