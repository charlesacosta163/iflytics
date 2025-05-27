import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { GoCopilot } from 'react-icons/go'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const Loading = () => {
  return (
    <div className="p-4 flex flex-col gap-4">
      
      <h2 className="text-5xl font-black bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent py-0.5">
        Flights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />
        <Skeleton containerClassName="h-[150px] w-full bg-gray-500 animate-pulse rounded-[25px]" />

      </div>

    </div>
  )
}

export default Loading