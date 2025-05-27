'use client'

import React from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { LuLoader } from 'react-icons/lu'
import { FaRegPaperPlane } from "react-icons/fa";

interface SearchUserButtonProps {
  className?: string
}

export function SearchUserButton({ className }: SearchUserButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className={`w-full ${className}`}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <LuLoader className="animate-spin" />
          Searching...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <FaRegPaperPlane className="text-lg" />
          View My Stats
        </span>
      )}
    </Button>
  )
} 