'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface UserNavigationProps {
  username: string
}

const UserNavigation = ({ username }: UserNavigationProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<string>("general")

  // Determine the active tab based on current path
  useEffect(() => {
    if (pathname.endsWith('/flights')) {
      setActiveTab('flights')
    } else {
      setActiveTab('general')
    }
  }, [pathname])

  const handleTabChange = (value: string) => {
    if (value === 'general') {
      router.push(`/user/${username}`)
    } else {
      router.push(`/user/${username}/${value}`)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full max-w-xs grid-cols-2 bg-gray-700 rounded-lg p-1">
        <TabsTrigger 
          value="general" 
          className={cn(
            "text-white data-[state=active]:text-white",
            "rounded-md transition-all", 
            "data-[state=active]:bg-gray",
            "data-[state=active]:font-bold",
            "hover:bg-gray-600"
          )}
        >
          General
        </TabsTrigger>
        <TabsTrigger 
          value="flights" 
          className={cn(
            "text-white data-[state=active]:text-white",
            "rounded-md transition-all", 
            "data-[state=active]:bg-gray",
            "data-[state=active]:font-bold",
            "hover:bg-gray-600"
          )}
        >
          Flights
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default UserNavigation 