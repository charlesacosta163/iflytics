import { cn } from '@/lib/utils'
import React from 'react'

interface CircularProgressProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: string
}

// If 100% is passed, the progress circle will be green
export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  className = '',
  showPercentage = true,
  color = 'stroke-amber-500'
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-amber-200 dark:stroke-amber-900/30"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn(value >= 100 ? "stroke-green-500 dark:stroke-green-400" : color)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      {showPercentage && (
        <span className={cn(
          "absolute text-sm font-semibold dark:text-gray-200",
          value >= 100 ? "text-green-600 dark:text-green-400" : ""
        )}>
          {Math.round(value)}%
        </span>
      )}
    </div>
  )
}