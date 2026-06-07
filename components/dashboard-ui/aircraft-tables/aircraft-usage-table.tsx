"use client"

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
import { convertMinutesToHours, cn } from '@/lib/utils'
import { FaPlane } from 'react-icons/fa'
import { GiPathDistance } from 'react-icons/gi'
import { LuPlane, LuTimer, LuTrendingUp } from 'react-icons/lu'

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

const shortenNumber = (number: number) => {
  if (number < 1000) return number.toLocaleString()
  if (number < 1000000) return (number / 1000).toFixed(1) + "k"
  if (number < 1000000000) return (number / 1000000).toFixed(1) + "m"
  return (number / 1000000000).toLocaleString() + "b"
}

const Stat = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
}) => (
  <div className="min-w-0">
    <p className="flex items-center gap-1 text-[11px] leading-none text-gray-500 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </p>
    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight mt-1">
      {value}
    </p>
    {sub && (
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
    )}
  </div>
)

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

  const fleetMetrics = React.useMemo(() => {
    const stats = analysisData.aircraftStats as Array<{
      count: number
      totalDistance: number
      totalTime: number
    }>

    const fleetSize = stats.length
    const totalFlights = stats.reduce((sum, a) => sum + a.count, 0)
    const totalDistance = stats.reduce((sum, a) => sum + a.totalDistance, 0)
    const totalTime = stats.reduce((sum, a) => sum + a.totalTime, 0)

    const sortedByFlights = [...stats].sort((a, b) => b.count - a.count)
    const top3Flights = sortedByFlights
      .slice(0, 3)
      .reduce((sum, a) => sum + a.count, 0)
    const top3Share =
      totalFlights > 0
        ? ((top3Flights / totalFlights) * 100).toFixed(1)
        : "0"
    const singleUseCount = stats.filter((a) => a.count === 1).length

    return {
      fleetSize,
      totalFlights,
      totalDistance,
      totalTime,
      top3Share,
      singleUseCount,
    }
  }, [analysisData.aircraftStats])

  const displayedAircraft = showAll ? sortedAircraftStats : sortedAircraftStats.slice(0, 6);
  const hasMoreThan6 = sortedAircraftStats.length > 6;

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4",
        "bg-stone-50 dark:bg-stone-800/50",
        "rounded-[20px] md:rounded-[25px]",
        "p-4 md:p-5"
      )}
    >
      <header
        className={cn(
          "md:col-span-2",
          "flex md:flex-row flex-col items-start md:items-center justify-between",
          "gap-3 md:gap-4"
        )}
      >
        <div>
          <h3 className="flex items-center gap-1.5 text-lg font-semibold tracking-tighter text-gray-900 dark:text-gray-100">
            <LuPlane className={labelIconClass} />
            Frequently used aircraft
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            All aircraft types in your log and how often you fly each
          </p>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger
            className={cn(
              "w-[180px] md:w-[200px]",
              "h-8 text-xs font-medium",
              "bg-white dark:bg-gray-800",
              "border border-gray-200 dark:border-gray-700",
              "text-gray-800 dark:text-gray-100",
              "rounded-lg"
            )}
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent
            className={cn(
              "bg-white dark:bg-gray-800",
              "border border-gray-200 dark:border-gray-700",
              "rounded-lg"
            )}
          >
            <SelectItem value="flights" className="text-gray-800 dark:text-gray-100 text-xs">
              Sort by flights
            </SelectItem>
            <SelectItem value="distance" className="text-gray-800 dark:text-gray-100 text-xs">
              Sort by distance
            </SelectItem>
            <SelectItem value="time" className="text-gray-800 dark:text-gray-100 text-xs">
              Sort by flight time
            </SelectItem>
          </SelectContent>
        </Select>
      </header>

      <div
        className={cn(
          "md:col-span-2",
          "grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4",
          "pt-4 border-t border-gray-200 dark:border-gray-700"
        )}
      >
        <Stat
          label="Fleet size"
          value={fleetMetrics.fleetSize}
          sub={`${fleetMetrics.totalFlights} analyzed flights`}
          icon={<FaPlane className={labelIconClass} />}
        />
        <Stat
          label="Fleet flight time"
          value={convertMinutesToHours(Math.round(fleetMetrics.totalTime))}
          sub="Combined block time"
          icon={<LuTimer className={labelIconClass} />}
        />
        <Stat
          label="Fleet distance"
          value={`${shortenNumber(Math.round(fleetMetrics.totalDistance))} NM`}
          sub={`${shortenNumber(Math.round(fleetMetrics.totalDistance * 1.852))} km`}
          icon={<GiPathDistance className={labelIconClass} />}
        />
        <Stat
          label="Top 3 concentration"
          value={`${fleetMetrics.top3Share}%`}
          sub={`${fleetMetrics.singleUseCount} type${fleetMetrics.singleUseCount !== 1 ? "s" : ""} flown once`}
          icon={<LuTrendingUp className={labelIconClass} />}
        />
      </div>

      <div
        className={cn(
          "md:col-span-2",
          "flex items-center justify-between gap-2",
          "pt-1"
        )}
      >
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Showing {displayedAircraft.length} of {sortedAircraftStats.length} aircraft
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
          {flightsAmountRaw} log entries
        </p>
      </div>

      {displayedAircraft.length > 0 ? (
        displayedAircraft.map((aircraft: any, index: number) => (
          <FlightAircraftEntry
            key={aircraft.aircraftId}
            index={index}
            aircraft={aircraft}
            flightsAmountRaw={flightsAmountRaw}
            allFlightsWithDistances={allFlightsWithDistances}
          />
        ))
      ) : (
        <div
          className={cn(
            "md:col-span-2 flex justify-center py-8",
            "border border-dashed border-gray-200 dark:border-gray-600",
            "rounded-lg"
          )}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            No aircraft data available
          </p>
        </div>
      )}

      {hasMoreThan6 && (
        <div className="md:col-span-2 flex justify-center mt-1">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className={cn(
              "w-full md:w-auto px-6 h-9",
              "text-xs font-semibold",
              "border-gray-200 dark:border-gray-700",
              "text-gray-700 dark:text-gray-200",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "rounded-lg"
            )}
          >
            {showAll ? (
              <>
                Show less
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                Show more ({sortedAircraftStats.length - 6})
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default AircraftUsageTable
