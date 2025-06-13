'use client'

import React, { useMemo } from 'react'
import useSWR from 'swr'
import FullScreenMap from '@/components/dashboard-ui/flights/maps/full-screen-map'
import { getFlightsFromServer } from '@/lib/actions'

import { aviationCompliments, alternator } from '@/lib/data'

const fetcher = () => getFlightsFromServer()

const MapPage = () => {
  const { data: flights = [], error, isLoading } = useSWR(
    'flights',
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  // Memoize quirkyFlights to prevent constant recreation
  const quirkyFlights = useMemo(() => {
    return flights.map((flight: any) => ({
      ...flight,
      emoji: alternator[Math.floor(Math.random() * alternator.length)],
      compliment: aviationCompliments[Math.floor(Math.random() * aviationCompliments.length)]
    }))
  }, [flights]) // Only recreate when flights data actually changes

  if (error) {
    return (
      <div className="h-[calc(100vh-120px)] w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load flight data</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full relative">
      {/* Loading overlay */}
      {isLoading && flights.length === 0 && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            Loading flights...
          </div>
        </div>
      )}

      {/* Live indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg ">
        <div className="flex items-center gap-2 w-[200px]">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
          <span className="text-sm font-medium">
            {isLoading ? 'Updating...' : 'Expert Server'} • {flights.length} flights
          </span>
        </div>
      </div>

      <FullScreenMap flights={quirkyFlights} />
    </div>
  )
}

export default MapPage