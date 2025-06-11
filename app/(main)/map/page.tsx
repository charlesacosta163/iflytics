'use client'

import React from 'react'
import useSWR from 'swr'
import FullScreenMap from '@/components/dashboard-ui/flights/maps/full-screen-map'
import { getFlightsFromServer } from '@/lib/actions'

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
    <div className='flex flex-col gap-2'>
        <span className='text-center text-sm text-light bg-orange-500 rounded-full px-3 py-0.5 font-semibold self-center mt-4'>⚠️ The Map is currently an experimental feature.</span>
    <div className="h-[calc(100vh-120px)] w-full relative">
      {/* Loading overlay */}
      {isLoading && flights.length === 0 && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            Loading flights...
          </div>
        </div>
      )}

      {/* Live indicator */}
      <div className="absolute top-4 right-4 z-40 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
          <span className="text-sm font-medium">
            {isLoading ? 'Updating...' : 'Expert Server'} • {flights.length} flights
          </span>
        </div>
      </div>

      <FullScreenMap flights={flights} />
    </div>
    </div>
  )
}

export default MapPage