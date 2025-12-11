import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SuccessToastProps {
  message: string
  onClose?: () => void
  autoHide?: boolean
  duration?: number
}

export default function SuccessToast({
  message,
  onClose,
  autoHide = true,
  duration = 3000,
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) {
          setTimeout(onClose, 300) // Wait for fade-out animation
        }
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoHide, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[300px]">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-800 text-sm font-medium flex-1">{message}</p>
            {onClose && (
              <button
                onClick={() => {
                  setIsVisible(false)
                  if (onClose) {
                    setTimeout(onClose, 300)
                  }
                }}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

