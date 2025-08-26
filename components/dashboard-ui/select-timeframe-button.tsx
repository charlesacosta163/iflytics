'use client'

import React, { useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { FaStar } from 'react-icons/fa6'
import { IoWarningOutline } from 'react-icons/io5'
import { hasPremiumAccess, Subscription } from '@/lib/subscription/helpers';
import { TbClock } from 'react-icons/tb'
import { LiaPlaneDepartureSolid } from 'react-icons/lia'

let ENABLE_CUSTOM_FLIGHT_FRAME = true;

const SelectTimeframeButton = ({ subscription }: { subscription: Subscription }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [timeframe, setTimeframe] = useState(searchParams.get('timeframe') || "day-30");
  const [customFlights, setCustomFlights] = useState("");
  const [error, setError] = useState("");

  const handleCustomFlights = () => {
    const flights = parseInt(customFlights);
    if (isNaN(flights) || flights <= 0 || flights > 800) {
      setError("Please enter a number between 1 and 800");
      return;
    }
    handleSelect(`flight-${flights}`);
    setError("");
    setCustomFlights("");
  };

  const handleSelect = (value: string) => {
    setTimeframe(value);
    router.push(`${pathname}?timeframe=${value}`);
  }

  // Helper function to format display text
  const getDisplayText = (value: string) => {
    const [type, count] = value.split('-');
    if (type === 'day') {
      return count === '1' ? 'Last 24 Hours' : `Last ${count} Days`;
    }
    return `Last ${count} Flights`;
  };

  return (
    <Select value={timeframe} onValueChange={handleSelect}>
      <SelectTrigger className="bg-white font-semibold border-none">
        <SelectValue>
          {timeframe && getDisplayText(timeframe)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="font-medium">
        <div className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-md text-center flex items-center gap-2 justify-center">Time Frames <TbClock className="text-gray-500" /></div>
        <SelectItem value="day-1">Last 24 Hours</SelectItem>
        <SelectItem value="day-7">Last 7 Days</SelectItem>
        <SelectItem value="day-30">Last 30 Days</SelectItem>
        <SelectItem value="day-90">Last 90 Days</SelectItem>
        
        {hasPremiumAccess(subscription) ? (
          <>
            <div className="text-xs text-gray-500 font-semibold bg-amber-200 px-2 py-1 rounded-md text-center flex items-center justify-center gap-2">
              Flight Frames <LiaPlaneDepartureSolid className="" />
            </div>
            
            <SelectItem value="flight-10">Last 10 Flights</SelectItem>
            <SelectItem value="flight-50">Last 50 Flights</SelectItem>
            <SelectItem value="flight-100">Last 100 Flights</SelectItem>
            <SelectItem value="flight-250">Last 250 Flights</SelectItem>
            <SelectItem value="flight-500">Last 500 Flights</SelectItem>
            <SelectItem value="flight-800">Last 800 Flights</SelectItem>

            {(ENABLE_CUSTOM_FLIGHT_FRAME || subscription.role === "tester" || subscription.role === "admin") && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Custom Flight Frame
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Custom Flight Frame</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Enter number of flights (1-800)</label>
                      <Input
                        type="number"
                        min="1"
                        max="800"
                        value={customFlights}
                        onChange={(e) => {
                          setCustomFlights(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter number of flights"
                        className="mt-1"
                      />
                      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    </div>
                    <Button 
                      onClick={handleCustomFlights}
                      className="w-full"
                    >
                      Apply
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        ) : (
          <div className="text-xs text-gray-500 px-2 py-1 rounded-md text-center bg-yellow-200">
            ⭐️ Upgrade to Premium for Flight Frames
          </div>
        )}
      </SelectContent>
    </Select>
  )
}

export default SelectTimeframeButton;