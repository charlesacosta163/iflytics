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
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full lg:w-[500px]">
      <TabsList className={cn(
        "grid w-full grid-cols-3",
        "bg-gray-200 dark:bg-gray-700",
        "",
        "rounded-[20px] md:rounded-[25px]"
      )}>
        <TabsTrigger 
          value="general" 
          className={cn(
            "text-gray-700 dark:text-gray-300",
            "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
            "rounded-[15px] md:rounded-[20px]",
            "transition-all", 
            "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
            "data-[state=active]:font-bold",
            "hover:bg-gray-300 dark:hover:bg-gray-600",
            "flex gap-2 items-center justify-center",
            "text-sm md:text-base"
          )}
        >
          <LuBookUser className='w-4 h-4 md:w-5 md:h-5 hidden lg:block' />
          General
        </TabsTrigger>
        <TabsTrigger 
          value="flights" 
          className={cn(
            "text-gray-700 dark:text-gray-300",
            "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
            "rounded-[15px] md:rounded-[20px]",
            "transition-all", 
            "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
            "data-[state=active]:font-bold",
            "hover:bg-gray-300 dark:hover:bg-gray-600",
            "flex gap-2 items-center justify-center",
            "text-sm md:text-base"
          )}
        > 
          <LuPlane className='w-4 h-4 md:w-5 md:h-5 hidden lg:block'/>
          Flights
        </TabsTrigger>
        <TabsTrigger 
          value="atc" 
          className={cn(
            "text-gray-700 dark:text-gray-300",
            "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
            "rounded-[15px] md:rounded-[20px]",
            "transition-all", 
            "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
            "data-[state=active]:font-bold",
            "hover:bg-gray-300 dark:hover:bg-gray-600",
            "flex gap-2 items-center justify-center",
            "text-sm md:text-base"
          )}
        >
          <LuTowerControl className='w-4 h-4 md:w-5 md:h-5 hidden lg:block'/>
          <span className="hidden sm:inline">ATC Sessions</span>
          <span className="sm:hidden">ATC</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default UserNavigation 