'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { revalidateFlightRoutes } from '@/lib/actions'
import { RefreshCw, Clock, Zap } from 'lucide-react'

interface RevalidateRoutesButtonProps {
  userId: string
}

export function RevalidateRoutesButton({ userId }: RevalidateRoutesButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [cooldownTime, setCooldownTime] = useState(0)
  const [isOnCooldown, setIsOnCooldown] = useState(false)

  // Check for existing cooldown on component mount
  useEffect(() => {
    const savedCooldownEnd = localStorage.getItem(`revalidate-cooldown-${userId}`)
    
    if (savedCooldownEnd) {
      const endTime = parseInt(savedCooldownEnd)
      const now = Date.now()
      
      if (endTime > now) {
        const remainingTime = Math.ceil((endTime - now) / 1000)
        setCooldownTime(remainingTime)
        setIsOnCooldown(true)
      } else {
        localStorage.removeItem(`revalidate-cooldown-${userId}`)
      }
    }
  }, [userId])

  // Countdown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(prev => {
          const newTime = prev - 1
          
          if (newTime <= 0) {
            setIsOnCooldown(false)
            localStorage.removeItem(`revalidate-cooldown-${userId}`)
            return 0
          }
          return newTime
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [cooldownTime, userId])

  const handleRevalidate = async () => {
    if (isOnCooldown || isLoading) return

    setIsLoading(true)
    setMessage('')
    
    try {
      const result = await revalidateFlightRoutes(userId)
      
      if (result.success) {
        setMessage('✅ ' + result.message)
        
        // Start 60-second cooldown
        const cooldownEndTime = Date.now() + 60000
        localStorage.setItem(`revalidate-cooldown-${userId}`, cooldownEndTime.toString())
        setCooldownTime(60)
        setIsOnCooldown(true)
        
        // Auto-clear success message after 4 seconds
        setTimeout(() => setMessage(''), 4000)
      } else {
        setMessage('❌ ' + result.message)
      }
    } catch (error) {
      setMessage('❌ An error occurred while refreshing')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  const isDisabled = isLoading || isOnCooldown

  return (
    <div className="flex flex-col gap-3 max-w-[250px] w-full">
      <div className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 ${
        isOnCooldown 
          ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
          : isLoading
          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
          : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
      }`}>
        <Button
          onClick={handleRevalidate}
          disabled={isDisabled}
          className={`w-full h-12 bg-transparent border-none text-white font-semibold shadow-none hover:bg-transparent transition-all duration-300 ${
            isDisabled ? 'cursor-not-allowed' : 'hover:scale-[1.02]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-white/20 backdrop-blur-sm ${
              isLoading ? 'animate-pulse' : ''
            }`}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isOnCooldown ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold">
                {isLoading ? 'Refreshing Routes...' : 
                 isOnCooldown ? `Cooldown ${formatTime(cooldownTime)}` : 
                 'Refresh Routes'}
              </span>
              <span className="text-xs text-white/80">
                {isLoading ? 'Updating cache' : 
                 isOnCooldown ? 'Please wait to refresh again' : 
                 'If errors persist'}
              </span>
            </div>
          </div>
        </Button>
        
        {/* Progress bar for cooldown */}
        {isOnCooldown && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
            <div 
              className="h-full bg-white/60 transition-all duration-1000 ease-linear"
              style={{ width: `${((60 - cooldownTime) / 60) * 100}%` }}
            />
          </div>
        )}
      </div>
      
      {message && (
        <div className={`p-3 rounded-lg border text-center font-medium text-sm transition-all duration-300 ${
          message.includes('✅') 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}