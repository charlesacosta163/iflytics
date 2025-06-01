'use client'

import React, { useState, useEffect } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'

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
            <SelectItem value="1">Last 24 Hours</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
        </SelectContent>
    </Select>
  )
}

export default SelectTimeframeButton;