'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { RiCopilotFill } from "react-icons/ri";


export default function SuccessPage() {
  const router = useRouter()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <Card className="max-w-[600px] w-full flex flex-col items-center bg-gradient-to-br from-gray to-dark text-light p-8 rounded-[25px]">
      <RiCopilotFill className='text-4xl font-bold text-green-500' />
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Success!</CardTitle>
        <CardDescription className='text-sm font-semibold'>Your username has been updated successfully.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-sm font-semibold text-gray-200'>Redirecting to dashboard in 5 seconds...</p>
      </CardContent>
    </Card>
  )
}