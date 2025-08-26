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
import { FaClock, FaGlobe, FaHistory, FaLock, FaMapMarkedAlt, FaPlane, FaRoute } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import { Metadata } from 'next'
import Link from "next/link";
import FlightsAircraft from "@/components/dashboard-ui/flights/flights-aircraft";
import { MdAirlineSeatFlat, MdOutlineAirlines, MdOutlineFlightTakeoff } from "react-icons/md";

// Subscriptions
import { getUserSubscription } from "@/lib/subscription/subscription";
import { hasPremiumAccess, Subscription } from '@/lib/subscription/helpers';
import { TbLock } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import GroupedSubscriptionButtons from "@/components/dashboard-ui/grouped-sub-btns";
import PromoReminders from "@/components/dashboard-ui/stripe/promo-reminders";

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
      <Tabs defaultValue="routes" className="w-full">
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
          {
            hasPremiumAccess(subscription as Subscription) ? (
              <>
                <FaRoute className="w-4 h-4 sm:w-5 sm:h-5 text-light" />
                <span className="hidden sm:inline text-xs sm:text-sm">Routes</span>
              </>
            ) : (
              <>
                <FaLock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="hidden sm:inline text-xs sm:text-sm text-yellow-300">Routes</span>
              </>
            )
          }
        </TabsTrigger>
        
          <TabsTrigger value="aircraft" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex flex-col sm:flex-row gap-1 sm:gap-2 items-center px-2 sm:px-4">
            {
              hasPremiumAccess(subscription as Subscription) ? (
                <>
                  <FaPlane className="w-4 h-4 sm:w-5 sm:h-5 text-light" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Aircraft</span>
                </>
            ) : (
              <>
                <FaLock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="hidden sm:inline text-xs sm:text-sm text-yellow-300">Aircraft</span>
              </>
            )
          }
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
          <div className="rounded-lg h-screen w-full flex flex-col items-center justify-center dark:bg-[url('/images/subscriptions/routeanalysis.png')] bg-[url('/images/subscriptions/routeanalysislight.png')] bg-cover bg-center relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-full bg-black/80 p-8 flex flex-col gap-4 overflow-y-auto">

                <header>
                  <h1 className="text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#ff879b] to-[#ffe4d2] dark:from-[#0080ff] dark:via-light dark:to-light bg-clip-text text-transparent ">Route Analysis</h1>
                  <p className="text-gray-300">
                    View your flight routes and analyze your flight patterns in a detailed way.
                  </p>

                  <blockquote className="text-gray-300 mt-4 text-sm font-bold">Requires <Badge className="bg-yellow-500 text-dark">Premium</Badge> or <Badge className="bg-green-600 text-light">Lifetime</Badge> Subscription</blockquote>

                    <GroupedSubscriptionButtons />
                    <br />
                    <PromoReminders />
                </header>

                <h2 className="text-2xl font-bold text-light">Features:</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {routeAnalysisFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-gray-700/60 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-light">
                        {feature.icon}
                        <h3 className="text-lg font-bold text-light">{feature.title}</h3>
                      </div>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  ))}
                </div>
                
              
            </div>
          </div>
        )}
      </TabsContent>

        <TabsContent value="aircraft" className="space-y-6">
          {hasPremiumAccess(subscription as Subscription) ? (
            <FlightsAircraft flights={allFlights} user={user} role={subscription.role} />
          ) : (
            <div className="rounded-lg h-screen w-full flex flex-col items-center justify-center dark:bg-[url('/images/subscriptions/aircraftanalysis.png')] bg-[url('/images/subscriptions/aircraftanalysislight.png')] bg-cover bg-center relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-full bg-black/80 p-8 flex flex-col gap-4 overflow-y-auto">

                <header>
                  <h1 className="text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r dark:from-[#ff879b] dark:to-[#ffe4d2] from-[#0080ff] via-light to-light bg-clip-text text-transparent ">Aircraft Analysis</h1>
                  <p className="text-gray-300">
                    View your aircraft usage and analyze your flight patterns in a detailed way.
                  </p>

                  <blockquote className="text-gray-300 mt-4 text-sm font-bold">Requires <Badge className="bg-yellow-500 text-dark">Premium</Badge> or <Badge className="bg-green-600 text-light">Lifetime</Badge> Subscription</blockquote>

                  <GroupedSubscriptionButtons />
                  <br />
                  <PromoReminders />
                </header>

                <h2 className="text-2xl font-bold text-light">Features:</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aircraftAnalysisFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-gray-700/60 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-light">
                        {feature.icon}
                        <h3 className="text-lg font-bold text-light">{feature.title}</h3>
                      </div>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  ))}
                </div>
                
              
            </div>
          </div>
          )}
        </TabsContent>
    </Tabs>
    </div>
  );
};

export default FlightsPage;


const routeAnalysisFeatures = [
  {
    icon: <FaMapMarkedAlt />,
    title: "Interactive Route Map",
    description: "Visualize your flight routes on an interactive map with all your destinations.",
  },
  {
    icon: <FaRoute />,
    title: "Distance Analytics",
    description: "Track total distance traveled in nautical miles, miles, and kilometers with longest route details.",
  },
  {
    icon: <FaGlobe />,
    title: "Top Countries Analysis",
    description: "See your top 5 most visited countries with flight counts and percentages.",
  },
  {
    icon: <FaClock />,
    title: "Flight Duration Categories",
    description: "Analyze your flights by short, medium, and long haul categories with visual charts.",
  },
  {
    icon: <FaGlobe />,
    title: "Continental Breakdown",
    description: "View your flight distribution across different continents with color-coded charts.",
  },
  {
    icon: <FaGlobe />,
    title: "Domestic vs International",
    description: "Compare your domestic and international flight patterns with detailed statistics.",
  },
  {
    icon: <FaRoute />,
    title: "Route Frequency Analysis",
    description: "Identify your most frequently flown routes with detailed counts and patterns.",
  },
  {
    icon: <FaClock />,
    title: "Flight Time Categorization",
    description: "Break down your flights by time categories for better pattern recognition.",
  },
  {
    icon: <FaGlobe />,
    title: "Export Capabilities",
    description: "Download your route data in CSV format for external analysis. (EXCLUSIVE FOR LIFETIME SUBSCRIBERS)",
  },
  {
    icon: <FaClock />,
    title: "Real-time Updates",
    description: "Refresh your route data to get the latest flight information and statistics.",
  }
]

const aircraftAnalysisFeatures = [
  {
    icon: <FaPlane />,
    title: "Aircraft Usage Statistics",
    description: "Track how many unique aircraft you've flown and your total flight count across all aircraft.",
  },
  {
    icon: <FaChartLine />,
    title: "Most Used Aircraft Analysis",
    description: "Identify your favorite aircraft with detailed statistics including flight count, total time, and distance.",
  },
  {
    icon: <FaRoute />,
    title: "Aircraft Performance Metrics",
    description: "View comprehensive data on each aircraft including flight frequency, total distance, and last usage date.",
  },
  {
    icon: <FaGlobe />,
    title: "Aircraft Brands Breakdown",
    description: "Analyze your aircraft preferences by manufacturer with visual charts and statistics.",
  },
  {
    icon: <FaClock />,
    title: "Flight Time Tracking",
    description: "Monitor total time spent in each aircraft type and average flight duration per aircraft.",
  },
  {
    icon: <FaMapMarkedAlt />,
    title: "Distance Analysis",
    description: "Track total distance covered by each aircraft in nautical miles, miles, and kilometers.",
  },
  {
    icon: <MdOutlineAirlines   />,
    title: "Airline Analysis",
    description: "See all your top airlines with total flights, accounts CALLSIGN USED FOR THE FLIGHT.",
  },
  {
    icon: <FaHistory />,
    title: "Usage History",
    description: "View detailed history of when each aircraft was last used and your flying patterns over time.",
  },
  {
    icon: <FaChartLine />,
    title: "Performance Comparison",
    description: "Compare different aircraft types based on usage frequency, distance, and flight duration.",
  },
  {
    icon: <FaPlane />,
    title: "Aircraft Fleet Overview",
    description: "Get a comprehensive overview of your entire aircraft fleet with detailed statistics and insights.",
  },
  {
    icon: <FaGlobe />,
    title: "Advanced Analytics",
    description: "Access detailed charts and visualizations showing your aircraft usage patterns and preferences.",
  }
]