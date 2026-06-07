import React from 'react'
import { getAllFlightRoutes, matchAircraftNameToImage } from '@/lib/cache/flightinsightsdata'
import Image from 'next/image'
import { Flight } from '@/lib/types'
import { convertMinutesToHours, cn } from '@/lib/utils'

import { getAllAircraft } from '@/lib/actions'
import AircraftUsageTable from '../aircraft-tables/aircraft-usage-table'
import AircraftBrandsCard from '../aircraft-tables/aircraft-brands-card'
import { FaRegSadCry, FaPlane } from 'react-icons/fa'
import { GiPathDistance } from 'react-icons/gi'
import { LuList, LuPlane, LuTimer, LuTrendingUp, LuCalendar } from 'react-icons/lu'
import { RiCopilotFill } from 'react-icons/ri'
import AirlineAnalysisCard from '../aircraft-tables/airline-analysis-card'
import { customUserImages } from '@/lib/data'

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

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
    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight">
      {value}
    </p>
    {sub && (
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
    )}
  </div>
)

// Mock data - 
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
    const allAircraftList: any[] = allAircraft ?? [];

    // Initialize aircraft stats
    const aircraftStats: any = uniqueAircraftIds.reduce((acc, aircraftId) => {
      const aircraftInfo = allAircraftList.find((a: any) => a.id === aircraftId);
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
    const aircraftData = aircraft?.find((aircraft: any) => aircraft.id === mostUsedAircraft.aircraftId);

    return aircraftData || { id: 0, name: "Unknown Aircraft", image: "/images/aircraft/placeholder.png" };
  };

  const analysisData = await aircraftAnalysisData();
  const aircraftData: any = await mostUsedAircraftData();

  const totalAnalyzed = routesWithDistances.length
  const uniqueCount = analysisData.uniqueAircraftIds.length
  const avgPerAircraft =
    uniqueCount > 0 ? (totalAnalyzed / uniqueCount).toFixed(1) : "0"
  const mostUsed = analysisData.mostUsedAircraft
  const mostUsedShare =
    mostUsed && totalAnalyzed > 0
      ? ((mostUsed.count / totalAnalyzed) * 100).toFixed(1)
      : "0"

  const userImage = customUserImages.find(
    (u: { username: string }) => u.username === userMetadata.ifcUsername
  )?.image

  return (
    <div className="space-y-4 md:space-y-6">

      <div
        className={cn(
          "bg-yellow-50 dark:bg-blue-800/50",
          "rounded-[20px] md:rounded-[25px]",
          "p-4 md:p-5"
        )}
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl tracking-tighter font-semibold text-gray-900 dark:text-gray-100">
              Aircraft Summary
            </h2>
            <p className="text-xs text-gray-500 font-medium dark:text-gray-400 mt-0.5">
              {totalAnalyzed} flight{totalAnalyzed !== 1 ? "s" : ""} analyzed across your fleet
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500 dark:text-gray-400">
            {userImage ? (
              <img
                src={userImage}
                alt={userMetadata.ifcUsername}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <RiCopilotFill className="w-4 h-4" />
            )}
            <span>@{userMetadata.ifcUsername}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
          <Stat
            label="Unique aircraft"
            value={uniqueCount}
            sub={`${flights.length} total flight log entries`}
            icon={<LuPlane className={labelIconClass} />}
          />
          <Stat
            label="Total flights"
            value={flights.length}
            sub={`${totalAnalyzed} with route data`}
            icon={<LuList className={labelIconClass} />}
          />
          <Stat
            label="Avg per aircraft"
            value={`${avgPerAircraft}×`}
            sub="Flights per unique type"
            icon={<FaPlane className={labelIconClass} />}
          />
          <Stat
            label="Top aircraft share"
            value={mostUsed ? `${mostUsedShare}%` : "—"}
            sub={mostUsed ? aircraftData.name || "Unknown" : "No data yet"}
            icon={<LuTrendingUp className={labelIconClass} />}
          />
        </div>

        {mostUsed ? (
          <div
            className={cn(
              "mt-5 pt-5 border-t border-gray-200 dark:border-gray-700",
              "flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
            )}
          >
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <p className="flex items-center gap-1 text-[11px] leading-none text-gray-500 dark:text-gray-400">
                  <LuPlane className={labelIconClass} />
                  <span>Most used aircraft</span>
                </p>
                <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight mt-1">
                  {aircraftData.name || "Unknown Aircraft"}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                <Stat
                  label="Flights"
                  value={mostUsed.count}
                  sub={`${mostUsedShare}% of analyzed flights`}
                  icon={<LuList className={labelIconClass} />}
                />
                <Stat
                  label="Total time"
                  value={convertMinutesToHours(Math.round(mostUsed.totalTime))}
                  icon={<LuTimer className={labelIconClass} />}
                />
                <Stat
                  label="Distance"
                  value={`${shortenNumber(mostUsed.totalDistance)} NM`}
                  sub={`${shortenNumber(Math.round(mostUsed.totalDistance * 1.852))} km`}
                  icon={<GiPathDistance className={labelIconClass} />}
                />
                <Stat
                  label="Last used"
                  value={
                    mostUsed.lastUsed
                      ? new Date(mostUsed.lastUsed).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"
                  }
                  icon={<LuCalendar className={labelIconClass} />}
                />
              </div>
            </div>
            <div className="shrink-0 self-center md:self-auto">
              <Image
                src={`/images/aircraft/${matchAircraftNameToImage(aircraftData.name) || "placeholder.png"}`}
                alt={aircraftData.name || "Most used aircraft"}
                width={150}
                height={100}
                className="w-[120px] md:w-[140px] h-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "mt-5 pt-5 border-t border-gray-200 dark:border-gray-700",
              "text-center py-8",
              "border border-dashed border-gray-200 dark:border-gray-600 rounded-lg"
            )}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              No flights recorded yet
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              Start flying to see your aircraft statistics
            </p>
          </div>
        )}
      </div>

      {/* Conditional rendering for tables */}
      {analysisData.aircraftStats.length > 0 ? (
        <>
          <AircraftUsageTable analysisData={analysisData} flightsAmountRaw={flights.length} allFlightsWithDistances={routesWithDistances} />

          <AirlineAnalysisCard routesWithDistances={routesWithDistances} />
          
          <AircraftBrandsCard allAircraft={analysisData.aircraftStats} />
        </>
      ) : (
        <div className={cn(
          "text-center py-12",
          "bg-gray-50 dark:bg-gray-800",
          "border-2 border-gray-200 dark:border-gray-700",
          "rounded-[20px] md:rounded-[25px]"
        )}>
          <FaRegSadCry className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-700 dark:text-gray-300 mb-2">No Aircraft Data Available</h3>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Once you start flying, your aircraft analysis will appear here.</p>
        </div>
      )}
    </div>
  );
}

export default FlightsAircraft