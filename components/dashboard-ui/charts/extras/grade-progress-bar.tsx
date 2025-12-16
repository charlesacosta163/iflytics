import React from 'react'
import { cn } from '@/lib/utils'

interface GradeProgressBarProps {
  value: number // 0-100
  className?: string
  height?: string
}

export function GradeProgressBar({
  value,
  className = '',
  height = 'h-3'
}: GradeProgressBarProps) {
  // Cap value between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn('relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600', height, className)}>
      <div
        className={cn(
          "h-full transition-all duration-500 ease-out rounded-full",
          normalizedValue >= 100 
            ? "bg-green-500 dark:bg-green-400" 
            : "bg-gradient-to-r from-amber-300 to-amber-500 dark:from-amber-400 dark:to-amber-600"
        )}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
}