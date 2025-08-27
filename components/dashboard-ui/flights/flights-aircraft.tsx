import React from 'react'
import { Plane, BarChart3 } from 'lucide-react'
import { getAllFlightRoutes, matchAircraftNameToImage } from '@/lib/cache/flightinsightsdata'
import Image from 'next/image'
import { Flight } from '@/lib/types'
import { convertMinutesToHours } from '@/lib/utils'

import { getAllAircraft } from '@/lib/actions'
import AircraftUsageTable from '../aircraft-tables/aircraft-usage-table'
import AircraftBrandsCard from '../aircraft-tables/aircraft-brands-card'
import { FaRegSadCry } from 'react-icons/fa'
import { LuPizza } from 'react-icons/lu'
import { VscCopilotWarning } from 'react-icons/vsc'
import AirlineAnalysisCard from '../aircraft-tables/airline-analysis-card'

// Mock data - replace with your actual data fetching
// const mockAircraftData = [
//   {
//     id: '1',
//     aircraftName: 'Boeing 737-800',
//     count: 45,
//     totalTime: 2340,
//     avgFlightTime: 52,
//     lastUsed: '2024-01-15'
//   },
//   {
//     id: '2', 
//     aircraftName: 'Airbus A320',
//     count: 32,
//     totalTime: 1890,
//     avgFlightTime: 59,
//     lastUsed: '2024-01-12'
//   },
//   {
//     id: '3',
//     aircraftName: 'Boeing 787-9',
//     count: 28,
//     totalTime: 3420,
//     avgFlightTime: 122,
//     lastUsed: '2024-01-10'
//   },
//   {
//     id: '4',
//     aircraftName: 'Airbus A350',
//     count: 15,
//     totalTime: 2100,
//     avgFlightTime: 140,
//     lastUsed: '2024-01-08'
//   },
//   {
//     id: '5',
//     aircraftName: 'Boeing 777-300',
//     count: 12,
//     totalTime: 1680,
//     avgFlightTime: 140,
//     lastUsed: '2024-01-05'
//   }
// ]

const shortenNumber = (number: number) => {
  // 71200 -> 71.2k
  if (number < 1000) {
    return number.toLocaleString();
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + "k";
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1) + "m";
  } else {
    return (number / 1000000000).toLocaleString() + "b";
  }
};

const FlightsAircraft = async ({ flights, user, role }: { flights: Flight[], user: any, role: string }) => {

  // ------------------------------ MOCK DATA STARTS HERE ------------------------------
  // const totalFlights = mockAircraftData.reduce((acc, aircraft) => acc + aircraft.count, 0)
  // const totalTime = mockAircraftData.reduce((acc, aircraft) => acc + aircraft.totalTime, 0)
  // const mostUsedAircraft = mockAircraftData[0]
  // const longestFlightAircraft = mockAircraftData.reduce((prev, current) => 
  //   (prev.avgFlightTime > current.avgFlightTime) ? prev : current
  // )
 // ------------------------------ MOCK DATA ENDS HERE ------------------------------

  // Based on THIS Data for user flights
  // const validFlights = flights.filter((flight) => {
  //   return (
  //     flight.totalTime > 5 && flight.originAirport && flight.destinationAirport
  //   );
  // });

  // Get the user ID for the cache key
  const userMetadata = user.user_metadata;

  // Get the flight routes with distances with the user ID for the cache key
  // const startTime = Date.now(); --> Debugging
  const routesWithDistances = await getAllFlightRoutes(flights, user.id);
  // const endTime = Date.now(); --> Debugging

 // console.log(routesWithDistances[0])
  {/* sample route with distance data
    {
  flightId: '931999ef-911f-4a42-8f65-f7ec060dd1b8',
  created: '2025-07-21T02:41:02.727818Z',
  origin: 'KLAX',
  originIsoCountry: 'US',
  originContinent: 'NA',
  originCoordinates: { latitude: 33.942501, longitude: -118.407997 },
  destination: 'PHKO',
  destinationIsoCountry: 'US',
  destinationContinent: 'NA',
  destinationCoordinates: { latitude: 19.738783, longitude: -156.045603 },
  distance: 2173,
  totalTime: 295.57333,
  aircraftId: '64568366-b72c-47bd-8bf6-6fdb81b683f9',
  server: 'Expert'
} */}

  // Chore: Create a function to get the overview values data
  // Includes: Unique aircraft used and most used aircraft

  let aircraftAnalysisData = async (): Promise<any> => {
    // Early return if no flights
    if (!routesWithDistances || routesWithDistances.length === 0) {
      return {
        uniqueAircraftIds: [],
        aircraftStats: [],
        mostUsedAircraft: null,
      };
    }

    const uniqueAircraftIds = [...new Set(routesWithDistances.map((route) => route.aircraftId))];
    const allAircraft = await getAllAircraft();

    // Initialize aircraft stats
    const aircraftStats: any = uniqueAircraftIds.reduce((acc, aircraftId) => {
      const aircraftInfo = allAircraft.result.find((a: any) => a.id === aircraftId);
      acc[aircraftId] = {
        aircraftId,
        name: aircraftInfo?.name || "Unknown Aircraft",
        count: 0,
        totalDistance: 0,
        totalTime: 0,
        lastUsed: null
      };
      return acc;
    }, {} as any);

    // Accumulate stats for each aircraft
    routesWithDistances.forEach((route) => {
      const stats = aircraftStats[route.aircraftId];
      if (stats) { // Add safety check
        stats.count++;
        stats.totalDistance += route.distance || 0;
        stats.totalTime += route.totalTime || 0;
        
        // Update lastUsed if this flight is more recent
        const flightDate = new Date(route.created);
        if (!stats.lastUsed || flightDate > new Date(stats.lastUsed)) {
          stats.lastUsed = route.created;
        }
      }
    });

    // Convert to array and sort by count to find most used
    const aircraftStatsArray = Object.values(aircraftStats).sort((a: any, b: any) => b.count - a.count);
    const mostUsedAircraft = aircraftStatsArray.length > 0 ? aircraftStatsArray[0] : null;

    return {
      uniqueAircraftIds,
      aircraftStats: aircraftStatsArray,
      mostUsedAircraft,
    };
  };

  const mostUsedAircraftData = async () => {
    const { mostUsedAircraft } = await aircraftAnalysisData();
    
    // Return fallback if no aircraft data
    if (!mostUsedAircraft) {
      return { id: 0, name: "No Aircraft Data", image: "/images/aircraft/placeholder.png" };
    }

    const aircraft = await getAllAircraft();
    const aircraftData = aircraft.result.find((aircraft: any) => aircraft.id === mostUsedAircraft.aircraftId);

    return aircraftData || { id: 0, name: "Unknown Aircraft", image: "/images/aircraft/placeholder.png" };
  };

  const analysisData = await aircraftAnalysisData();
  const aircraftData = await mostUsedAircraftData();
  // console.log(analysisData, aircraftData)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {/* <div className="lg:col-span-3 border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg flex items-center gap-2">
        <VscCopilotWarning className="w-6 h-6 text-yellow-500" />
        <p className="text-sm sm:text-lg font-medium dark:text-yellow-300 text-yellow-700">
          Note: The aircraft analysis is a{" "}
          <b>premium feature</b>. Currently <b className="underline">FREE ON OPEN BETA</b>.
        </p>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className='bg-[#2D336B] text-light rounded-lg'>
          <section className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-blue-500" />
              <span className="text-lg tracking-tight font-semibold">Unique Aircraft Used</span>
            </div>
            <div className="text-5xl font-black self-end">{analysisData.uniqueAircraftIds.length || "0"}</div>
          </section>
        </div>
        
        <div className='bg-[#7886C7] text-light rounded-lg'>
          <section className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="text-lg tracking-tight font-semibold">Total Flights</span>
            </div>
            <div className="text-5xl font-black self-end">{flights.length || "0"}</div>
          </section>
        </div>
        
        <div className="md:col-span-2 bg-gradient-to-br from-[#ff69a2] to-[#0065F8] flex flex-col gap-8 p-4 pb-2 rounded-lg">
          <header className='flex flex-col'>
            <div className='text-2xl font-black tracking-tight text-gray-200'>
              Most Used Aircraft
            </div>
            <span className='text-xs text-gray-300 font-medium'>
              {analysisData.mostUsedAircraft ? "The most used aircraft in your fleet" : "No flight data available"}
            </span>
          </header>
          
          {analysisData.mostUsedAircraft ? (
            <div className='flex flex-col-reverse md:flex-row items-center justify-between gap-2'>
              <div className='flex flex-col gap-2'>
                <span className='text-3xl font-black tracking-tight text-white'>
                  {aircraftData.name || "Unknown Aircraft"}
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className='text-xs bg-[#94bc71] text-light font-medium px-3 py-0.5 rounded-full'>
                    Flights: {analysisData.mostUsedAircraft.count}
                  </span>
                  <span className='text-xs bg-[#7886C7] text-light font-medium px-3 py-0.5 rounded-full'>
                    Total Time: {convertMinutesToHours(Math.round(analysisData.mostUsedAircraft.totalTime))}
                  </span>
                  <span className='text-xs bg-[#2D336B] text-light font-medium px-3 py-0.5 rounded-full'>
                    Distance: {shortenNumber(analysisData.mostUsedAircraft.totalDistance)} nm
                  </span>
                  <span className='text-xs bg-[#2D336B] text-light font-medium px-3 py-0.5 rounded-full'>
                    Last Used: {analysisData.mostUsedAircraft.lastUsed ? new Date(analysisData.mostUsedAircraft.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <Image src={`/images/aircraft/${matchAircraftNameToImage(aircraftData.name) || "placeholder.png"}`} alt="Most Used Aircraft" width={150} height={100} />
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-center h-32'>
              <div className='text-center text-white/70'>
                <LuPizza className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium">No flights recorded yet</p>
                <p className="text-sm">Start flying to see your aircraft statistics!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conditional rendering for tables */}
      {analysisData.aircraftStats.length > 0 ? (
        <>
          <AircraftUsageTable analysisData={analysisData} flightsAmountRaw={flights.length} allFlightsWithDistances={routesWithDistances} />

          <AirlineAnalysisCard routesWithDistances={routesWithDistances} />
          
          <AircraftBrandsCard allAircraft={analysisData.aircraftStats} />
        </>
      ) : (
        <div className="text-center py-12 rounded-lg">
          <FaRegSadCry className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Aircraft Data Available</h3>
          <p className="text-gray-500">Once you start flying, your aircraft analysis will appear here.</p>
        </div>
      )}
    </div>
  );
}

export default FlightsAircraft