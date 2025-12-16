"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import React from 'react'
import FlightAircraftEntry from './flight-aircraft-entry'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'

const AircraftUsageTable = ({analysisData, flightsAmountRaw, allFlightsWithDistances}: {
  analysisData: any, 
  flightsAmountRaw: number,
  allFlightsWithDistances: any[]
}) => {
  const [sortBy, setSortBy] = React.useState("flights")
  const [showAll, setShowAll] = React.useState(false)

  const sortedAircraftStats = React.useMemo(() => {
    return [...analysisData.aircraftStats].sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return b.totalDistance - a.totalDistance;
        case "time":
          return b.totalTime - a.totalTime;
        case "flights":
        default:
          return b.count - a.count;
      }
    });
  }, [analysisData.aircraftStats, sortBy]);

  // Display first 6 aircrafts
  const displayedAircraft = showAll ? sortedAircraftStats : sortedAircraftStats.slice(0, 6);
  const hasMoreThan6 = sortedAircraftStats.length > 6;

  return (
    <Card className={cn(
      "grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4",
      "bg-gray-50 dark:bg-gray-800",
      "border-2 border-gray-200 dark:border-gray-700",
      "rounded-[20px] md:rounded-[25px]",
      "p-4 md:p-6"
    )}>
        <header className={cn(
          'md:col-span-2',
          'flex md:flex-row flex-col items-center justify-center md:justify-between',
          'gap-3 md:gap-4 mb-4 md:mb-6',
          'pb-3 md:pb-4',
          'border-b-2 border-gray-200 dark:border-gray-700'
        )}>
          <div className='text-center md:text-left'>
            <span className='text-xl md:text-2xl tracking-tight font-bold text-gray-800 dark:text-gray-100'>Frequently Used Aircraft</span>
            <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1'>
              List of all your aircraft and their usage
            </p>
          </div>

          <Select defaultValue="flights" onValueChange={setSortBy}>
            <SelectTrigger className={cn(
              "w-[180px] md:w-[200px]",
              "bg-white dark:bg-gray-700",
              "border-2 border-gray-200 dark:border-gray-600",
              "text-gray-800 dark:text-gray-100",
              "rounded-[12px] md:rounded-[15px]",
              "font-bold text-sm"
            )}>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className={cn(
              "bg-white dark:bg-gray-700",
              "border-2 border-gray-200 dark:border-gray-600",
              "rounded-[12px]"
            )}>
              <SelectItem value="flights" className="text-gray-800 dark:text-gray-100 font-medium">Sort by Flights</SelectItem>
              <SelectItem value="distance" className="text-gray-800 dark:text-gray-100 font-medium">Sort by Distance</SelectItem>
              <SelectItem value="time" className="text-gray-800 dark:text-gray-100 font-medium">Sort by Flight Time</SelectItem>
            </SelectContent>
          </Select>
        </header>

        {displayedAircraft.length > 0 ? displayedAircraft.map((aircraft: any, index: number) => (
          <FlightAircraftEntry 
            key={aircraft.aircraftId} 
            index={index} 
            aircraft={aircraft} 
            flightsAmountRaw={flightsAmountRaw}
            allFlightsWithDistances={allFlightsWithDistances} // Pass the actual data instead of empty array
          />
        )) : (
          <div className={cn(
            "md:col-span-2 flex justify-center py-8",
            "bg-white dark:bg-gray-700",
            "border-2 border-gray-200 dark:border-gray-600",
            "rounded-[15px] md:rounded-[20px]"
          )}>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No aircraft data available</p>
          </div>
        )}

        {hasMoreThan6 && (
          <div className="md:col-span-2 flex justify-center mt-2 md:mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
              className={cn(
                "w-auto px-6 py-3",
                "bg-white dark:bg-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-600",
                "border-2 border-gray-200 dark:border-gray-600",
                "text-gray-800 dark:text-gray-100",
                "rounded-[12px] md:rounded-[15px]",
                "font-bold text-sm md:text-base",
                "transition-all duration-200"
              )}
            >
              {showAll ? (
                <>
                  Show Less
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Show More ({sortedAircraftStats.length - 6})
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
  )
}

export default AircraftUsageTable