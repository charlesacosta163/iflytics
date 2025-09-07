'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { LuBookUser, LuPlane, LuTowerControl } from 'react-icons/lu'

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
    } else if (pathname.endsWith('/atc')) {
      setActiveTab('atc')
    } else {
      setActiveTab('general')
    }
  }, [pathname])

  const handleTabChange = (value: string) => {
    if (value === 'general') {
      router.push(`/user/${username}`)
    } else if (value === 'atc') {
      router.push(`/user/${username}/atc`)
    } else {
      router.push(`/user/${username}/${value}`)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="lg:w-[500px]">
      <TabsList className="grid w-full grid-cols-3 bg-gray-700 p-1">
        <TabsTrigger 
          value="general" 
          className={cn(
            "text-white data-[state=active]:text-white",
            "rounded-[25px] transition-all", 
            "data-[state=active]:bg-gray",
            "data-[state=active]:font-bold",
            "hover:bg-gray-600",
          )}
        >
          <LuBookUser className='hidden lg:block' />
          General
        </TabsTrigger>
        <TabsTrigger 
          value="flights" 
          className={cn(
            "text-white data-[state=active]:text-white",
            "rounded-[25px] transition-all", 
            "data-[state=active]:bg-gray",
            "data-[state=active]:font-bold",
            "hover:bg-gray-600 flex gap-2 items-center"
          )}
        > 
          <LuPlane className='hidden lg:block'/>
          Flights
        </TabsTrigger>
        <TabsTrigger 
          value="atc" 
          className={cn(
            "text-white data-[state=active]:text-white",
            "rounded-[25px] transition-all", 
            "data-[state=active]:bg-gray",
            "data-[state=active]:font-bold",
            "hover:bg-gray-600 flex gap-2 items-center"
          )}
        >
          <LuTowerControl className='hidden lg:block'/>
          ATC Sessions
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default UserNavigation 