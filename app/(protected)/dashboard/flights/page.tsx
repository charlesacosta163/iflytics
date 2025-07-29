import React from "react";

import { getUser } from "@/lib/supabase/user-actions";
import {
  getFlightTimePerTimeFrame,
  getFlightOverviewStatsPerTimeFrame,
  getRecentFlightInsights,
  getAllPlayerAircraftUsageData,
  getMostVisitedOriginAndDestinationAirports,
  matchAircraftNameToImage,
  getFlightAveragesPerTimeFrame,
  calculateDistanceBetweenAirports,
} from "@/lib/cache/flightinsightsdata";

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VscCopilotWarning } from "react-icons/vsc";
import { ImStatsDots } from "react-icons/im";
import { getFlightsTimeFrame } from "@/lib/cache/flightdata";

import SelectTimeframeButton from "@/components/dashboard-ui/select-timeframe-button";
import { redirect } from "next/navigation";
import FlightsOverview from "@/components/dashboard-ui/flights/flights-overview";
import { getAirportCoordinates } from "@/lib/actions";
import FlightsDisplay from "@/components/dashboard-ui/flights/flights-display";
import FlightsRoutes from "@/components/dashboard-ui/flights/flights-routes";
import { FaHistory, FaPlane, FaRoute } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import { Metadata } from 'next'
import Link from "next/link";
import FlightsAircraft from "@/components/dashboard-ui/flights/flights-aircraft";
import { MdOutlineFlightTakeoff } from "react-icons/md";

let aircraftAnalysisMaintainance = false

export const metadata: Metadata = {
  title: "Flights - IFlytics | Your Infinite Flight Statistics",
  description: "View your Infinite Flight statistics with advanced data visualization, real-time flight maps, leaderboards, and interactive games. Join thousands of pilots exploring their aviation data.",
  keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history, iflytics flights",
}

const FlightsPage = async ({searchParams}: { searchParams: Promise < {
  [key: string]: string | string[] | undefined
}>}) => {
  const user = await getUser();
  const data = user.user_metadata;
  
  const {timeframe} = await searchParams || "day-30"
  
  let allFlights;
  
  const [ frameType, value ] = (Array.isArray(timeframe) ? timeframe[0] : timeframe || "day-30").split('-');

  if (!frameType || !value) {
    redirect("/dashboard/flights?timeframe=day-30");
  }
  if (frameType && frameType === "day" && ["1", "7", "30", "90"].includes(value as string)) {
    allFlights = await getFlightsTimeFrame(data.ifcUserId, parseInt(value as string));
  } else if (frameType && frameType == "flight" && ["10", "50", "100", "250", "500", "800"].includes(value as string)) {
    allFlights = await getFlightsTimeFrame(data.ifcUserId, 0, parseInt(value));
  } else {
    redirect("/dashboard/flights?timeframe=day-30");
  }
  
  const flightOverviewStats = getFlightOverviewStatsPerTimeFrame(allFlights);
  const flightAverages = getFlightAveragesPerTimeFrame(allFlights);
  const flightActivity = getFlightTimePerTimeFrame(allFlights);
  const recentFlightInsights = getRecentFlightInsights(allFlights);
  const mostVisitedOriginAndDestinationAirports =
    await getMostVisitedOriginAndDestinationAirports(allFlights);
  const aircraftUsageData = await getAllPlayerAircraftUsageData(allFlights);


  // allFlights.forEach((flight, index) => {
    
  //   if (flight.violations.length > 0) {
  //     console.log(`Violation ${index + 1}: `, flight.violations, "\n");
  //   }

  // })
 
  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold dark:text-light bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent tracking-tight">
            Your Flight Activity
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
            <ImStatsDots className="text-gray-500" />
            Your flight statistics and insights
          </p>
        </div>
        <SelectTimeframeButton />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="aircraft" className="w-full">
      <TabsList className="w-full bg-gray-500 p-1 rounded-full mb-2">
        <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex flex-col sm:flex-row gap-1 sm:gap-2 items-center px-2 sm:px-4">
          <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5 text-light" />
          <span className="hidden sm:inline text-xs sm:text-sm">Overview</span>
        </TabsTrigger>
        
        <TabsTrigger value="flights" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex flex-col sm:flex-row gap-1 sm:gap-2 items-center px-2 sm:px-4">
          <FaHistory className="w-4 h-4 sm:w-5 sm:h-5 text-light" />
          <span className="hidden sm:inline text-xs sm:text-sm">Flight History</span>
        </TabsTrigger>
        
        <TabsTrigger value="routes" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex flex-col sm:flex-row gap-1 sm:gap-2 items-center px-2 sm:px-4">
          <FaRoute className="w-4 h-4 sm:w-5 sm:h-5 text-light" />
          <span className="hidden sm:inline text-xs sm:text-sm">Routes</span>
        </TabsTrigger>
        
        {!aircraftAnalysisMaintainance && (
          <TabsTrigger value="aircraft" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex flex-col sm:flex-row gap-1 sm:gap-2 items-center px-2 sm:px-4">
            <FaPlane className="w-4 h-4 sm:w-5 sm:h-5 text-light" />
            <span className="hidden sm:inline text-xs sm:text-sm">Aircraft</span>
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="overview" className="space-y-8">
        <FlightsOverview 
          flightOverviewStats={flightOverviewStats}
          recentFlightInsights={recentFlightInsights}
          flightAverages={flightAverages}
          mostVisitedOriginAndDestinationAirports={mostVisitedOriginAndDestinationAirports}
          flightActivity={flightActivity}
          aircraftUsageData={aircraftUsageData}
          timeframe={timeframe as string}
        />
      </TabsContent>

      {/* Flights Display */}
      <TabsContent value="flights" className="space-y-6">
        <FlightsDisplay flights={allFlights} />
      </TabsContent>
      
      <TabsContent value="routes" className="space-y-6">
        <FlightsRoutes flights={allFlights} user={user} />
      </TabsContent>

      {!aircraftAnalysisMaintainance && (
        <TabsContent value="aircraft" className="space-y-6">
          <FlightsAircraft flights={allFlights} user={user} />
        </TabsContent>
      )}
    </Tabs>
    </div>
  );
};

export default FlightsPage;
