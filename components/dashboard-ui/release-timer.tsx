'use client'

import React, { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useCountdown } from '@/hooks/use-countdown'

const ReleaseTimer = () => {
  // Calculate the time difference in seconds between now and August 25th
  const targetDate = new Date('2025-08-25T00:00:00')
  const now = new Date()
  const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000)

  const [count, { startCountdown }] = useCountdown({
    countStart: diffInSeconds,
    intervalMs: 1000,
  })

  useEffect(() => {
    startCountdown()
  }, [startCountdown])

  // Convert seconds to days, hours, minutes, and seconds
  const days = Math.floor(count / (24 * 60 * 60))
  const hours = Math.floor((count % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((count % (60 * 60)) / 60)
  const seconds = count % 60

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-[#ff879b] to-[#ffc49c] dark:from-[#1e90ff] dark:to-[#99badd] text-white font-bold tracking-tight px-4 py-2 flex items-center gap-1 md:gap-2 md:flex-row flex-col backdrop-blur-sm shadow-lg transition-all duration-200 rounded-lg">
        <span className="text-[#fffde2] font-bold tracking-tighter">IFlytics Official in:</span>
      <div className="flex gap-2 items-center text-sm">
        <div className="flex items-baseline gap-1">
          <span className="font-mono">{days}</span>
          <span className="text-[10px] opacity-75">d</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono">{hours}</span>
          <span className="text-[10px] opacity-75">h</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono">{minutes}</span>
          <span className="text-[10px] opacity-75">m</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono">{seconds}</span>
          <span className="text-[10px] opacity-75">s</span>
        </div>
      </div>
    </div>
  )
}

export default ReleaseTimer