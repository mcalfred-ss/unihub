'use client'

import React from 'react'
import { motion } from 'framer-motion'

export interface FilterOption {
  label: string
  value: string
}

interface FilterChipsProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  label,
  options,
  selected,
  onToggle,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text mb-3">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(option.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  isSelected
                    ? 'bg-primary text-text'
                    : 'bg-white border-2 border-primary/30 text-text hover:border-primary'
                }
              `}
            >
              {option.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

