import React from 'react'
import { getUser } from '@/lib/supabase/user-actions'
import { getFlightsTimeFrame } from '@/lib/cache/flightdata'
import { redirect } from 'next/navigation'
import FlightsRoutes from '@/components/dashboard-ui/flights/flights-routes'
import SelectTimeframeButton from '@/components/dashboard-ui/select-timeframe-button'
import { FaArrowLeft, FaRoute } from 'react-icons/fa'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Flight Routes - IFlytics | Your Infinite Flight Statistics",
  description: "Explore your flight routes with interactive maps, distance analysis, and route statistics. Visualize your aviation journey across the world.",
  keywords: "flight routes, aviation maps, infinite flight routes, flight path visualization, pilot routes, flight statistics, route analysis, flight mapping"
}

const RoutesPage = async ({searchParams}: { searchParams: Promise < {
  [key: string]: string | string[] | undefined
}>}) => {
  const { user_metadata: data } = await getUser();
  
  const {timeframe} = await searchParams || "30"
  
  let allFlights;
  
  if (typeof timeframe === 'string' && timeframe.startsWith('flight-')) {
    // Flight-frame logic
    const flightCount = parseInt(timeframe.replace('flight-', ''));
    
    if (![10, 50, 100, 250, 500].includes(flightCount)) {
      redirect("/dashboard/flights/routes?timeframe=30");
    }
    
    allFlights = await getFlightsTimeFrame(data.ifcUserId, 0, flightCount);
  } else {
    // Time-frame logic
    if (!["1", "7", "30"].includes(timeframe as string)) {
      redirect("/dashboard/flights/routes?timeframe=30");
    }
    
    allFlights = await getFlightsTimeFrame(data.ifcUserId, parseInt(timeframe as string));
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-full w-full">
      <div className="w-full max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent tracking-tight">
              Flight Routes
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <FaRoute className="text-gray-500" />
              Explore your flight paths and route statistics
            </p>

            <div className="self-start mt-2">
                <Link href="/dashboard/flights" className="flex gap-2 items-center justify-center text-sm text-light rounded-md bg-gray-700 px-2 py-1 font-semibold">
                <FaArrowLeft className="w-4 h-4 text-light" />
                Back to Flights
                </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <SelectTimeframeButton />
          </div>
        </div>

        {/* Routes Content */}
        <div className="space-y-6">
          <FlightsRoutes flights={allFlights} />
        </div>
        
      </div>
    </main>
  )
}

export default RoutesPage