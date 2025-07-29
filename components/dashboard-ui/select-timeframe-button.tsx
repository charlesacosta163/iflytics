'use client'

import React, { useState, useEffect } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { FaStar } from 'react-icons/fa6'
import { IoWarningOutline } from 'react-icons/io5'

const SelectTimeframeButton = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const searchParams = useSearchParams();
  const [timeframe, setTimeframe] = useState(searchParams.get('timeframe') || "30");

  // Update state when URL params change
  useEffect(() => {
    const currentTimeframe = searchParams.get('timeframe');
    if (currentTimeframe) {
      setTimeframe(currentTimeframe);
    }
  }, [searchParams]);

  // Add query params to the url while preserving current path
  const handleSelect = (value: string) => {
    setTimeframe(value); // Update state
    
    // Preserve current pathname and only change timeframe
    router.push(`${pathname}?timeframe=${value}`);
    // router.refresh();
  }

  return (
    <Select value={timeframe} onValueChange={handleSelect}>
        <SelectTrigger className="bg-white font-semibold border-none">
        <SelectValue placeholder="Select a time frame" />
        </SelectTrigger>
        <SelectContent className="font-medium">
        <div className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-md text-center">Time Frames</div>
            <SelectItem value="day-1">Last 24 Hours</SelectItem>
            <SelectItem value="day-7">Last 7 Days</SelectItem>
            <SelectItem value="day-30">Last 30 Days</SelectItem>
            <SelectItem value="day-90">Last 90 Days</SelectItem>
            <div className="text-xs text-gray-500 font-semibold bg-amber-200 px-2 py-1 rounded-md text-center flex items-center justify-center gap-2">Flight Frames <FaStar className="text-yellow-500" /></div>
            <SelectItem value="flight-10">Last 10 Flights</SelectItem>
            <SelectItem value="flight-50">Last 50 Flights</SelectItem>
            <SelectItem value="flight-100">Last 100 Flights</SelectItem>
            <SelectItem value="flight-250">Last 250 Flights</SelectItem>
            <SelectItem value="flight-500">Last 500 Flights</SelectItem>
            <SelectItem value="flight-800" className="flex items-center gap-1">Last 800 Flights <IoWarningOutline className="text-yellow-500" /></SelectItem>
            
        </SelectContent>
    </Select>
  )
}

export default SelectTimeframeButton;