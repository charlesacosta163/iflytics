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
import { cn } from "@/lib/utils";


export const metadata: Metadata = {
  title: "Flights - IFlytics | Your Infinite Flight Statistics",
  description: "View your Infinite Flight stats with advanced data visualization, thorough analysis of your favorite routes and aircraft, flight history, map tracker, and more! Join thousands of users exploring their Infinite Flight data.",
  keywords: "infinite flight, flight tracking, analytics, flight, aviation, pilot, stats, data, expert server, flight simulator, dashboard, flight history, airbus, boeing, leaderboard, map tracker, route analysis, aircraft analysis",
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
  let allFlights = await getFlightsTimeFrame(data.ifcUserId, 800); // All flights for the timeframe

  const uniqueMonths = Array.from(
    new Set(
      allFlights.map(flight => {
        const date = new Date(flight.created);
        const month = date.getMonth() + 1; // JS months are 0-based
        const year = date.getFullYear().toString().slice(-2); // last 2 digits
        return `${month}_${year}`;
      })
    )
  );
    
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

  else if (frameType === "month") {
    if (!hasPremiumAccess(subscription as Subscription)) {
      redirect(`/dashboard/flights?timeframe=${DEFAULT_TIMEFRAME}`);
    }
    
    if (!uniqueMonths.includes(value)) {
      redirect(`/dashboard/flights?timeframe=${DEFAULT_TIMEFRAME}`);
    }

    allFlights = await getFlightsTimeFrame(data.ifcUserId, 0, 0, value as string);
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
      <div className={cn(
        "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6",
        "p-4 md:p-6",
        "bg-gray-50 dark:bg-gray-800",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[20px] md:rounded-[25px]"
      )}>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 md:p-3 rounded-[12px]",
              "bg-purple-100 dark:bg-purple-900/30"
            )}>
              <ImStatsDots className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-800 dark:text-gray-100">
              Your Flight Activity
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium ml-12 md:ml-[60px]">
            Your flight statistics and insights
          </p>
        </div>
        <div className="">
          <SelectTimeframeButton subscription={subscription as Subscription} months={uniqueMonths} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="routes" className="w-full">
      <TabsList className={cn(
        "w-full p-1.5 mb-3 md:mb-4",
        "bg-gray-200 dark:bg-gray-700",
        "rounded-[15px] md:rounded-[20px]"
      )}>
        <TabsTrigger 
          value="overview" 
          className={cn(
            "flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center",
            "px-2 sm:px-4 py-2",
            "rounded-[12px] md:rounded-[15px]",
            "font-bold text-xs sm:text-sm",
            "transition-all duration-200",
            "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
            "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
            "data-[state=active]:shadow-sm",
            "data-[state=inactive]:bg-transparent",
            "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
            "hover:bg-gray-100 dark:hover:bg-gray-600/50"
          )}
        >
          <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="flights" 
          className={cn(
            "flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center",
            "px-2 sm:px-4 py-2",
            "rounded-[12px] md:rounded-[15px]",
            "font-bold text-xs sm:text-sm",
            "transition-all duration-200",
            "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
            "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
            "data-[state=active]:shadow-sm",
            "data-[state=inactive]:bg-transparent",
            "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
            "hover:bg-gray-100 dark:hover:bg-gray-600/50"
          )}
        >
          <FaHistory className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Flight History</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="routes" 
          className={cn(
            "flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center",
            "px-2 sm:px-4 py-2",
            "rounded-[12px] md:rounded-[15px]",
            "font-bold text-xs sm:text-sm",
            "transition-all duration-200",
            "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
            "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
            "data-[state=active]:shadow-sm",
            "data-[state=inactive]:bg-transparent",
            "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
            "hover:bg-gray-100 dark:hover:bg-gray-600/50",
            !hasPremiumAccess(subscription as Subscription) && "data-[state=inactive]:text-yellow-600 dark:data-[state=inactive]:text-yellow-400"
          )}
        >
          {
            hasPremiumAccess(subscription as Subscription) ? (
              <>
                <FaRoute className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Routes</span>
              </>
            ) : (
              <>
                <FaLock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Routes</span>
              </>
            )
          }
        </TabsTrigger>
        
        <TabsTrigger 
          value="aircraft" 
          className={cn(
            "flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center",
            "px-2 sm:px-4 py-2",
            "rounded-[12px] md:rounded-[15px]",
            "font-bold text-xs sm:text-sm",
            "transition-all duration-200",
            "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
            "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
            "data-[state=active]:shadow-sm",
            "data-[state=inactive]:bg-transparent",
            "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
            "hover:bg-gray-100 dark:hover:bg-gray-600/50",
            !hasPremiumAccess(subscription as Subscription) && "data-[state=inactive]:text-yellow-600 dark:data-[state=inactive]:text-yellow-400"
          )}
        >
          {
            hasPremiumAccess(subscription as Subscription) ? (
              <>
                <FaPlane className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Aircraft</span>
              </>
            ) : (
              <>
                <FaLock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Aircraft</span>
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
          <div className="rounded-lg h-screen w-full flex flex-col items-center justify-center bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(/routeanalysis.png)` }}>
            
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
            <div className="rounded-lg h-screen w-full flex flex-col items-center justify-center bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(/aircraftanalysis.png)` }}>
            
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