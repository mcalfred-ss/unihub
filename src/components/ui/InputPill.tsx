import React from 'react'
import { motion } from 'framer-motion'

interface InputPillProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const InputPill = React.forwardRef<HTMLInputElement, InputPillProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text mb-2">
            {label}
          </label>
        )}
        <motion.div
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <input
            ref={ref}
            className={`
              w-full px-6 py-4 rounded-full border-2
              ${error ? 'border-red-500' : 'border-primary/30'}
              focus:border-primary focus:outline-none
              bg-white text-text placeholder:text-text/50
              transition-colors duration-200
              ${className}
            `}
            {...props}
          />
        </motion.div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

InputPill.displayName = 'InputPill'

