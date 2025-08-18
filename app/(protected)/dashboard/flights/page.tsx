import React from "react";

import { getUser, getUserProfile } from "@/lib/supabase/user-actions";
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

// Subscriptions
import { getUserSubscription } from "@/lib/subscription/subscription";
import { hasPremiumAccess, Subscription } from '@/lib/subscription/helpers';

let aircraftAnalysisMaintainance = false

export const metadata: Metadata = {
  title: "Flights - IFlytics | Your Infinite Flight Statistics",
  description: "View your Infinite Flight statistics with advanced data visualization, real-time flight maps, leaderboards, and interactive games. Join thousands of pilots exploring their aviation data.",
  keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history, iflytics flights",
}

const FlightsPage = async ({searchParams}: { searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) => {
  const user = await getUser();
  const data = user.user_metadata;

  // Get subscription data
  const subscription = await getUserSubscription(user.id) || {
    plan: "free",
    status: "active",
    created_at: new Date().toISOString(),
    ifc_user_id: user.id,
    role: "user",
  };

  // Default timeframe handling
  const DEFAULT_TIMEFRAME = "day-30";
  
  // Handle cases where timeframe is missing or invalid
  let timeframe = (await searchParams)?.timeframe || DEFAULT_TIMEFRAME;
  
  // Handle array case and ensure we have a string
  if (Array.isArray(timeframe)) {
    timeframe = timeframe[0] || DEFAULT_TIMEFRAME;
  }

  // Split and validate timeframe parts
  const [frameType, value] = timeframe.split('-');

  // Validate timeframe format and redirect if invalid
  if (!frameType || !value) {
    redirect(`/dashboard/flights?timeframe=${DEFAULT_TIMEFRAME}`);
  }

  // Validate day timeframe
  let allFlights; // All flights for the timeframe
  if (frameType === "day") {
    if (!["1", "7", "30", "90"].includes(value)) {
      redirect(`/dashboard/flights?timeframe=${DEFAULT_TIMEFRAME}`);
    }
    allFlights = await getFlightsTimeFrame(data.ifcUserId, parseInt(value));
  }
  // Validate flight timeframe
  else if (frameType === "flight") {
    // Check premium access first
    if (!hasPremiumAccess(subscription as Subscription)) {
      redirect(`/dashboard/flights?timeframe=${DEFAULT_TIMEFRAME}`);
    }
    
    const flightCount = parseInt(value);
    if (isNaN(flightCount) || flightCount <= 0 || flightCount > 800) {
      redirect(`/dashboard/flights?timeframe=${DEFAULT_TIMEFRAME}`);
    }
    allFlights = await getFlightsTimeFrame(data.ifcUserId, 0, flightCount);
  }
  // Invalid frame type
  else {
    redirect(`/dashboard/flights?timeframe=${DEFAULT_TIMEFRAME}`);
  }

  const flightOverviewStats = getFlightOverviewStatsPerTimeFrame(allFlights);
  const flightAverages = getFlightAveragesPerTimeFrame(allFlights);
  const flightActivity = getFlightTimePerTimeFrame(allFlights);
  const recentFlightInsights = getRecentFlightInsights(allFlights);
  const mostVisitedOriginAndDestinationAirports =
    await getMostVisitedOriginAndDestinationAirports(allFlights);
  const aircraftUsageData = await getAllPlayerAircraftUsageData(allFlights);
 
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
        <SelectTimeframeButton subscription={subscription as Subscription} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
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
        
          <TabsTrigger value="aircraft" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex flex-col sm:flex-row gap-1 sm:gap-2 items-center px-2 sm:px-4">
            <FaPlane className="w-4 h-4 sm:w-5 sm:h-5 text-light" />
            <span className="hidden sm:inline text-xs sm:text-sm">Aircraft</span>
          </TabsTrigger>
  
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
        {hasPremiumAccess(subscription as Subscription) ? (
          <FlightsRoutes flights={allFlights} user={user} subscription={subscription as Subscription} role={subscription.role}/>
        ) : (
          <div className="text-center text-gray-500">
            <p>You need to be a premium/lifetime user to access route analysis.</p>
          </div>
        )}
      </TabsContent>

        <TabsContent value="aircraft" className="space-y-6">
          {hasPremiumAccess(subscription as Subscription) ? (
            <FlightsAircraft flights={allFlights} user={user} role={subscription.role} />
          ) : (
            <div className="text-center text-gray-500">
              <p>You need to be a premium/lifetime user to access aircraft analysis.</p>
            </div>
          )}
        </TabsContent>
    </Tabs>
    </div>
  );
};

export default FlightsPage;
