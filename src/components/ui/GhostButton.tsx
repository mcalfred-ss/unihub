import React from 'react'
import { motion } from 'framer-motion'

interface GhostButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export const GhostButton: React.FC<GhostButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-8 py-4 rounded-full border-2 border-primary text-primary
        font-semibold text-lg bg-transparent
        hover:bg-primary/10 transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}

