import React from 'react'
import { motion } from 'framer-motion'

// Workaround: framer-motion / React types mismatch in production build
// Cast motion.button to any here so we avoid the MotionProps vs HTML props type conflict
const MotionButton: any = motion.button

interface GhostButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export const GhostButton: React.FC<GhostButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <MotionButton
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
    </MotionButton>
  )
}

