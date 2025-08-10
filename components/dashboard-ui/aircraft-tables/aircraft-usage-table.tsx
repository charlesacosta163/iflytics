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
    <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-transparent border-none shadow-none">
        <header className='md:col-span-2 flex md:flex-row flex-col items-center justify-center md:justify-between gap-4 mb-4'>
          <div className='text-center md:text-left'>
            <span className='text-2xl tracking-tight font-bold'>Frequently Used Aircraft</span>
            <p className='text-xs dark:text-gray-300 text-gray-500 font-medium'>
              List of all your aircraft and their usage
            </p>
          </div>

          <Select defaultValue="flights" onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flights">Sort by Flights</SelectItem>
              <SelectItem value="distance">Sort by Distance</SelectItem>
              <SelectItem value="time">Sort by Flight Time</SelectItem>
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
          <div className="md:col-span-2 flex justify-center mt-4">
            <p className="text-gray-400">No aircraft data available</p>
          </div>
        )}

        {hasMoreThan6 && (
          <div className="md:col-span-2 flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
              className="w-auto"
            >
              {showAll ? (
                <>
                  Show Less
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Show More ({sortedAircraftStats.length - 6})
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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