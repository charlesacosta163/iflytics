'use client'

import React, { useState, useEffect } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaStar } from 'react-icons/fa6'

const SelectTimeframeButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timeframe, setTimeframe] = useState(searchParams.get('timeframe') || "30");

  // Update state when URL params change
  useEffect(() => {
    const currentTimeframe = searchParams.get('timeframe');
    if (currentTimeframe) {
      setTimeframe(currentTimeframe);
    }
  }, [searchParams]);

  // Add query params to the url
  const handleSelect = (value: string) => {
    setTimeframe(value); // Update state
    router.push(`/dashboard/flights?timeframe=${value}`);
    // router.refresh();
  }

  return (
    <Select value={timeframe} onValueChange={handleSelect}>
        <SelectTrigger className="bg-white font-semibold border-none">
        <SelectValue placeholder="Select a time frame" />
        </SelectTrigger>
        <SelectContent className="font-medium">
        <div className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-md text-center">Time Frames</div>
            <SelectItem value="1">Last 24 Hours</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <div className="text-xs text-gray-500 font-semibold bg-amber-200 px-2 py-1 rounded-md text-center flex items-center justify-center gap-2">Flight Frames <FaStar className="text-yellow-500" /></div>
            <SelectItem value="flight-50">Last 50 Flights</SelectItem>
            <SelectItem value="flight-100">Last 100 Flights</SelectItem>
            <SelectItem value="flight-250">Last 250 Flights</SelectItem>
            <SelectItem value="flight-500">Last 500 Flights</SelectItem>
            
        </SelectContent>
    </Select>
  )
}

export default SelectTimeframeButton;