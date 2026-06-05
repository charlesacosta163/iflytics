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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ImStatsDots } from "react-icons/im";
import { getFlightsTimeFrame } from "@/lib/cache/flightdata";

import SelectTimeframeButton from "@/components/dashboard-ui/select-timeframe-button";
import { redirect } from "next/navigation";
import FlightsOverview from "@/components/dashboard-ui/flights/flights-overview";
import { getAirportCoordinates } from "@/lib/actions";
import FlightsDisplay from "@/components/dashboard-ui/flights/flights-display";
import FlightsRoutes from "@/components/dashboard-ui/flights/flights-routes";
import { FaClock, FaGlobe, FaHistory, FaInfoCircle, FaLock, FaMapMarkedAlt, FaPlane, FaQuestionCircle, FaRoute, FaWrench } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import { Metadata } from 'next'
import Link from "next/link";
import FlightsAircraft from "@/components/dashboard-ui/flights/flights-aircraft";
import { MdAirlineSeatFlat, MdOutlineAirlines, MdOutlineFlightTakeoff, MdOutlineHistoryEdu } from "react-icons/md";
import { Safari } from "@/components/ui/safari";

// Subscriptions
import { getUserSubscription } from "@/lib/subscription/subscription";
import { hasPremiumAccess, Subscription } from '@/lib/subscription/helpers';
import { TbLock, TbBrain, TbFileTypeCsv } from "react-icons/tb";
import { LuPlane, LuRoute, LuWandSparkles } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import GroupedSubscriptionButtons from "@/components/dashboard-ui/grouped-sub-btns";
import PromoReminders from "@/components/dashboard-ui/stripe/promo-reminders";
import { cn } from "@/lib/utils";
import { PiAirplaneInFlightBold, PiAirTrafficControlFill } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import FloatingIcons from "@/components/dashboard-ui/floating-icons";
import { RiMap2Line } from "react-icons/ri";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { RxCookie } from "react-icons/rx";
import { SiChinaeasternairlines } from "react-icons/si";
import { GiCommercialAirplane } from "react-icons/gi";
import { GrPaint } from "react-icons/gr";

import Image from "next/image";
import routeMapImage from '@/public/subscriptions/route-cards/route-map.png';
import routeSummaryImage from '@/public/subscriptions/route-cards/route-summary.png';
import routeStatsImage from '@/public/subscriptions/route-cards/route-stats.png';
import routeContinentsImage from '@/public/subscriptions/route-cards/route-continents.png';
import routeCsvImage from '@/public/subscriptions/route-cards/route-csv.png';
import routeMyFr24Image from '@/public/subscriptions/route-cards/route-myfr24.png';
import routeVideoGif from '@/public/subscriptions/route-cards/route-vid1.gif';

import aircraftMostUsedImage from '@/public/subscriptions/aircraft-cards/aircraft-mostused.png';
import aircraftPlaneHistoryImage from '@/public/subscriptions/aircraft-cards/aircraft-planehistory.png';
import aircraftPlaneHistory2Image from '@/public/subscriptions/aircraft-cards/aircraft-planehistory2.png';
import aircraftTopAirlinesImage from '@/public/subscriptions/aircraft-cards/aircraft-topairlines.png';
import aircraftTopBrandRankImage from '@/public/subscriptions/aircraft-cards/aircraft-topbrandrank.png';
import aircraftVideoGif from '@/public/subscriptions/aircraft-cards/aircraft-vid1.gif';



export const metadata: Metadata = {
  title: "Flights - IFlytics | Your Infinite Flight Statistics",
  description: "View your Infinite Flight stats with advanced data visualization, thorough analysis of your favorite routes and aircraft, flight history, map tracker, and more! Join thousands of users exploring their Infinite Flight data.",
  keywords: "infinite flight, flight tracking, analytics, flight, aviation, pilot, stats, data, expert server, flight simulator, dashboard, flight history, airbus, boeing, leaderboard, map tracker, route analysis, aircraft analysis",
}

const FlightsPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
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
      <Tabs defaultValue="overview" className="">
        <TabsList className={cn(
          "flex justify-start w-auto p-1.5 mb-3 md:mb-4 overflow-x-scroll overflow-y-hidden gap-3",
          "bg-transparent",
          "rounded-[15px] md:rounded-[20px]"
        )}>
          <TabsTrigger
            value="overview"
            className={cn(
              "flex sm:flex-row gap-1 sm:gap-2 items-center justify-center",
              "px-2 sm:px-4 py-3",
              "rounded-[12px] md:rounded-[15px]",
              "font-bold text-xs sm:text-sm",
              "transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=active]:shadow-sm",
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:dark:bg-gray-900",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              "shadow-md"
            )}
          >
            <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="inline">Overview</span>
          </TabsTrigger>

          <TabsTrigger
            value="flights"
            className={cn(
              "flex sm:flex-row gap-1 sm:gap-2 items-center justify-center",
              "px-2 sm:px-4 py-3",
              "rounded-[12px] md:rounded-[15px]",
              "font-bold text-xs sm:text-sm",
              "transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=active]:shadow-sm",
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:dark:bg-gray-900",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              "shadow-md"
            )}
          >
            <FaHistory className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="inline">Flight History</span>
          </TabsTrigger>

          <TabsTrigger
            value="routes"
            className={cn(
              "flex sm:flex-row gap-1 sm:gap-2 items-center justify-center",
              "px-2 sm:px-4 py-3",
              "rounded-[12px] md:rounded-[15px]",
              "font-bold text-xs sm:text-sm",
              "transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=active]:shadow-sm",
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:dark:bg-gray-900",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              !hasPremiumAccess(subscription as Subscription) && "data-[state=inactive]:text-yellow-600 dark:data-[state=inactive]:text-yellow-400",
              "shadow-md"
            )}
          >
            {
              hasPremiumAccess(subscription as Subscription) ? (
                <>
                  <FaRoute className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="inline">Routes</span>
                </>
              ) : (
                <>
                  <FaLock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="inline">Routes</span>
                </>
              )
            }
          </TabsTrigger>

          <TabsTrigger
            value="aircraft"
            className={cn(
              "flex sm:flex-row gap-1 sm:gap-2 items-center justify-center",
              "px-2 sm:px-4 py-3",
              "rounded-[12px] md:rounded-[15px]",
              "font-bold text-xs sm:text-sm",
              "transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=active]:shadow-sm",
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:dark:bg-gray-900",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              !hasPremiumAccess(subscription as Subscription) && "data-[state=inactive]:text-yellow-600 dark:data-[state=inactive]:text-yellow-400",
              "shadow-md"
            )}
          >
            {
              hasPremiumAccess(subscription as Subscription) ? (
                <>
                  <FaPlane className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="inline">Aircraft</span>
                </>
              ) : (
                <>
                  <FaLock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="inline">Aircraft</span>
                </>
              )
            }
          </TabsTrigger>

          <TabsTrigger
            value="livery"
            className={cn(
              "flex sm:flex-row gap-1 sm:gap-2 items-center justify-center",
              "px-2 sm:px-4 py-3",
              "rounded-[12px] md:rounded-[15px]",
              "font-bold text-xs sm:text-sm",
              "transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=active]:shadow-sm",
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:dark:bg-gray-900",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              "opacity-50",
              "shadow-md"
            )}
          >
            <MdOutlineAirlines className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="inline">Livery</span>
          </TabsTrigger>

          <TabsTrigger
            value="atc"
            className={cn(
              "flex sm:flex-row gap-1 sm:gap-2 items-center justify-center",
              "px-2 sm:px-4 py-3",
              "rounded-[12px] md:rounded-[15px]",
              "font-bold text-xs sm:text-sm",
              "transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=active]:shadow-sm",
              "data-[state=inactive]:bg-gray-100 data-[state=inactive]:dark:bg-gray-900",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              "opacity-50",
              "shadow-md"
            )}
          >
            <PiAirTrafficControlFill className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="inline">ATC History</span>
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
            <FlightsRoutes flights={allFlights} user={user} subscription={subscription as Subscription} role={subscription.role} />
          ) : (
            // <div className="rounded-lg h-screen w-full flex flex-col items-center justify-center bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(/routeanalysis.png)` }}>

            <div className="relative w-full flex flex-col items-center justify-center bg-white/60 dark:bg-gray-800/20 py-16 px-4 rounded-[50px]">
                {/* Animated Floating Icons */}
                <FloatingIcons />
               

              <header className="flex flex-col gap-4 items-center justify-center">
                <h1 className="text-4xl lg:text-8xl font-bold tracking-tighter flex items-center gap-3">
                  <LuRoute className="text-[#ff879b] dark:text-[#0080ff]" />
                  <span className="bg-gradient-to-r from-[#ff879b] to-[#ffcba8] dark:from-[#0080ff] dark:via-light dark:to-light bg-clip-text text-transparent">
                    Route Analysis
                  </span>
                </h1>
                <p className="text-gray-800 dark:text-gray-300 text-lg font-semibold tracking-tight text-center">
                  A way to analyze your flight routes and your flight patterns in a detailed way.
                </p>

                {/* <blockquote className="text-gray-300 mt-4 text-sm font-bold">Requires <Badge className="bg-yellow-500 text-dark">Premium</Badge> or <Badge className="bg-green-600 text-light">Lifetime</Badge> Subscription</blockquote>

                  <GroupedSubscriptionButtons />
                  <br />
                  <PromoReminders /> */}

                <Button className="md:text-2xl text-lg font-bold tracking-tight !py-6 !px-12"> <a href="#route-analysis-features">See Features</a></Button>

                <Safari imageSrc={routeVideoGif.src} url="https://iflytics.app" className="max-w-[800px] w-full"/>
              </header>

              {/* <h2 className="text-2xl font-bold text-light">Features:</h2> */}

              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {routeAnalysisFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-gray-700/60 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-light">
                        {feature.icon}
                        <h3 className="text-lg font-bold text-light">{feature.title}</h3>
                      </div>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  ))}
                </div> */}

              <section id='route-analysis-features' className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8">

                <div className="group hover:scale-105 transition-all duration-200 md:row-span-2 bg-[#FFFAF0] dark:bg-gradient-to-br dark:bg-black/10 p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[300px] flex flex-col items-center justify-center gap-4">

                  <header className="flex flex-col gap-2">
                    <RiMap2Line className="text-3xl md:text-5xl text-gray-900 dark:text-gray-100" />

                    <h2 className="text-2xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white">Interactive Route Maps</h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Visualize every route you've flown with detailed route overlays and airport insights.</p>
                  </header>


                  <Image
                    src={routeMapImage}
                    alt="Route Map"
                    width={500}
                    height={500}
                    className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto mx-auto"
                    quality={100}
                  />
                </div>

                <div className="group hover:scale-105 transition-all duration-200 bg-[#FFF8DC] dark:bg-gradient-to-br dark:bg-[#16161d] p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[250px] flex flex-col gap-4">

                  <header className="flex flex-col gap-2">
                    <LuWandSparkles className="text-3xl md:text-4xl text-gray-900 dark:text-gray-100" />

                    <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">Flight Pattern Summary</h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Discover your most common routes, flight habits, and overall activity.</p>
                  </header>

                  <Image
                    src={routeSummaryImage}
                    alt="Route Summary"
                    width={200}
                    height={200}
                    className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto mx-auto"
                    quality={100}
                  />
                </div>

                <div className="group hover:scale-105 transition-all duration-200 bg-[#FDFAED] dark:bg-gradient-to-br dark:from-lime-950 dark:to-green-950 p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[250px] flex flex-col gap-4">

                  <header className="flex flex-col gap-2">
                    <HiOutlinePaperAirplane className="text-3xl md:text-4xl text-gray-900 dark:text-gray-100" />

                    <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">Distance & Mileage Insights</h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Track total distance traveled, average route length, and record-breaking flights.</p>
                  </header>

                  <Image
                    src={routeStatsImage}
                    alt="Route Stats"
                    width={160}
                    height={150}
                    className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto mx-auto"
                    quality={100}
                  />
                </div>

                <div className="group hover:scale-105 transition-all duration-200 col-span-1 md:col-span-2 md:row-span-3 bg-[#fff5ee] dark:bg-gradient-to-br dark:bg-[#32174d] p-6 md:p-8 rounded-[20px] flex flex-col md:flex-row justify-between items-center gap-6">

                  <header className="flex flex-col gap-2 w-full md:w-[40%]">
                    <TbBrain className="text-3xl md:text-4xl text-gray-900 dark:text-gray-100" />

                    <h2 className="text-2xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white">Route Intelligence</h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Discover where you fly most, how far you travel, and the patterns that define your virtual aviation journey.</p>


                    <Accordion
                      type="single"
                      collapsible
                      defaultValue="shipping"
                      className="max-w-lg bg-white/50 dark:bg-gray-800/50 rounded-[20px] py-2 px-4"
                    >
                      <AccordionItem value="shipping">
                        <AccordionTrigger className="font-semibold text-gray-900 dark:text-white">What is a Valid Flight?</AccordionTrigger>
                        <AccordionContent className="text-gray-600 dark:text-gray-400">
                          A valid flight is a flight that has a valid departure and arrival airport, and a valid aircraft per flight entry.
                        </AccordionContent>
                      </AccordionItem>

                    </Accordion>
                  </header>

                  <Image
                    src={routeContinentsImage}
                    alt="Route Stats"
                    width={600}
                    height={150}
                    className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto"
                    quality={100}
                  />
                </div>

                <div className="group hover:scale-105 transition-all duration-200 col-span-1 md:col-span-2 bg-gradient-to-br from-[#acdaff] to-blue-50 dark:bg-gradient-to-br dark:from-blue-950 dark:to-cyan-950 p-6 md:p-12 rounded-[20px] flex flex-col gap-6 md:gap-8 justify-between items-center w-full border-4 md:border-6 border-blue-200/50 dark:border-blue-600/60">

                  <header className="flex flex-col items-center gap-2 text-center">

                    <h2 className="text-2xl md:text-6xl font-bold tracking-tighter flex items-center gap-2 flex-wrap justify-center">
                      <TbFileTypeCsv className="inline text-blue-600 dark:text-blue-400" />
                      <span className="block sm:inline bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">CSV Export Compatibility</span>
                      <span className="block sm:inline bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">(MyFlightRadar24 support)</span>
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Export your flight data in CSV format for external analysis with MyFlightRadar24 compatibility.</p>

                    <Badge className="bg-green-600 dark:bg-green-700 text-light font-bold tracking-tight text-sm md:text-lg animate-pulse">LIFETIME PLAN EXCLUSIVE</Badge>



                  </header>

                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-center w-full">

                    <Image
                      src={routeCsvImage}
                      alt="CSV Export"
                      width={500}
                      height={200}
                      className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto"
                      quality={100}
                    />

                    <Image
                        src={routeMyFr24Image}
                      alt="MyFlightRadar24"
                      width={500}
                      height={200}
                      className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto"
                      quality={100}
                    />
                  </div>
                </div>

                {/* CTA Card */}
                <GroupedSubscriptionButtons />

              </section>



            </div>
          )}
        </TabsContent>

        <TabsContent value="aircraft" className="space-y-6">
          {hasPremiumAccess(subscription as Subscription) ? (
            <FlightsAircraft flights={allFlights} user={user} role={subscription.role} />
          ) : (
            // <div className="rounded-lg h-screen w-full flex flex-col items-center justify-center bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(/aircraftanalysis.png)` }}>

            //   <div className="absolute top-0 left-0 w-full h-full bg-black/80 p-8 flex flex-col gap-4 overflow-y-auto">

            //     <header>
            //       <h1 className="text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r dark:from-[#ff879b] dark:to-[#ffe4d2] from-[#0080ff] via-light to-light bg-clip-text text-transparent ">Aircraft Analysis</h1>
            //       <p className="text-gray-300">
            //         View your aircraft usage and analyze your flight patterns in a detailed way.
            //       </p>

            //       <blockquote className="text-gray-300 mt-4 text-sm font-bold">Requires <Badge className="bg-yellow-500 text-dark">Premium</Badge> or <Badge className="bg-green-600 text-light">Lifetime</Badge> Subscription</blockquote>

            //       <GroupedSubscriptionButtons />
            //       <br />
            //       <PromoReminders />
            //     </header>

            //     <h2 className="text-2xl font-bold text-light">Features:</h2>

            //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            //       {aircraftAnalysisFeatures.map((feature, index) => (
            //         <div key={index} className="flex flex-col gap-2 bg-gray-700/60 p-4 rounded-lg">
            //           <div className="flex items-center gap-2 text-light">
            //             {feature.icon}
            //             <h3 className="text-lg font-bold text-light">{feature.title}</h3>
            //           </div>
            //           <p className="text-gray-300">{feature.description}</p>
            //         </div>
            //       ))}
            //     </div>


            //   </div>
            // </div>

            <div className="relative w-full flex flex-col items-center justify-center bg-white/60 dark:bg-gray-800/20 py-16 px-4 rounded-[50px]">
                {/* Animated Floating Icons */}
                <FloatingIcons />
               

              <header className="flex flex-col gap-4 items-center justify-center w-full">
                <h1 className="text-4xl lg:text-8xl font-bold tracking-tighter flex items-center gap-3">
                  <LuPlane className="dark:text-[#ff879b] text-[#0080ff] rotate-45" />
                  <span className="bg-gradient-to-r dark:from-[#ff879b] dark:to-[#ffe4d2] from-[#0080ff] via-blue-200 to-blue-300 bg-clip-text text-transparent">
                    Aircraft Analysis
                  </span>
                </h1>
                <p className="text-gray-800 dark:text-gray-300 text-lg font-semibold tracking-tight text-center">
                Discover the aircraft that define your flying style through advanced fleet analytics, airline insights, and aircraft usage trends.
                </p>

                {/* <blockquote className="text-gray-300 mt-4 text-sm font-bold">Requires <Badge className="bg-yellow-500 text-dark">Premium</Badge> or <Badge className="bg-green-600 text-light">Lifetime</Badge> Subscription</blockquote>

                  <GroupedSubscriptionButtons />
                  <br />
                  <PromoReminders /> */}

                <Button className="md:text-2xl text-lg font-bold tracking-tight !py-6 !px-12"> <a href="#aircraft-analysis-features">See Features</a></Button>

                <Safari imageSrc={aircraftVideoGif.src} url="https://iflytics.app" className="max-w-[800px] w-full"/>
              </header>

              {/* <h2 className="text-2xl font-bold text-light">Features:</h2> */}

              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {routeAnalysisFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-gray-700/60 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-light">
                        {feature.icon}
                        <h3 className="text-lg font-bold text-light">{feature.title}</h3>
                      </div>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  ))}
                </div> */}

              <section id='aircraft-analysis-features' className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8">

                <div className="group hover:scale-105 transition-all duration-200 col-span-1 md:col-span-2 bg-[#FFFAF0] dark:bg-gradient-to-br dark:bg-black/10 p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[300px] flex flex-col md:flex-row items-center justify-between gap-4">

                  <header className="flex flex-col gap-2">
                    <PiAirplaneInFlightBold className="text-3xl md:text-5xl text-gray-900 dark:text-gray-100" />

                    <h2 className="text-2xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white">Fleet Intelligence</h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Discover your most flown aircraft, flight-hour leaders, distance champions, and fleet usage patterns.</p>
                  </header>


                  <Image
                    src={aircraftMostUsedImage}
                    alt="Aircraft Most Used"
                    width={500}
                    height={500}
                    className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto mx-auto"
                    quality={100}
                  />
                </div>

                <div className="group hover:scale-105 transition-all duration-200 bg-[#FFF8DC] dark:bg-gradient-to-br dark:bg-[#16161d] p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[250px] flex flex-col gap-4">

                  <header className="flex flex-col gap-2">
                    <MdOutlineHistoryEdu className="text-3xl md:text-4xl text-gray-900 dark:text-gray-100" />

                    <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">Comprehensive Histories</h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">View every flight completed with a specific aircraft, including routes, flight time, distance, and activity history.</p>
                  </header>

                  <div className="relative w-full h-[350px] flex items-center justify-center group/stack">
                    {/* Image 2 - Back */}
                    <Image
                      src={aircraftPlaneHistory2Image}
                      alt="Aircraft Plane History 2"
                      width={250}
                      height={250}
                      className="absolute border-4 md:border-6 dark:border-white border-gray-600 rounded-[20px] shadow-2xl w-[200px] md:w-[250px] transition-all duration-500 -rotate-6 group-hover/stack:rotate-12 group-hover/stack:translate-x-[-60px] group-hover/stack:translate-y-[-15px]"
                      quality={100}
                    />
                    
                    {/* Image 1 - Front */}
                    <Image
                      src={aircraftPlaneHistoryImage}
                      alt="Aircraft Plane History 1"
                      width={250}
                      height={250}
                      className="absolute border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl w-[200px] md:w-[250px] transition-all duration-500 rotate-6 group-hover/stack:-rotate-12 group-hover/stack:translate-x-[60px] group-hover/stack:translate-y-[-15px] z-10"
                      quality={100}
                    />
                  </div>
                </div>

                <div className="group hover:scale-105 transition-all duration-200 bg-[#FDFAED] dark:bg-[#081915] p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[250px] flex flex-col gap-4">

                  <header className="flex flex-col gap-2">
                    <SiChinaeasternairlines className="text-3xl md:text-4xl text-gray-900 dark:text-gray-100" />

                    <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">Discover Your Top Airlines</h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Identify your most frequent airlines used by your callsign, analyze flight patterns, and uncover hidden connections in your fleet.</p>
                  </header>

                  <Image
                    src={aircraftTopAirlinesImage}
                    alt="Aircraft Top Airlines"
                    width={200}
                    height={200}
                    className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto mx-auto"
                    quality={100}
                  />
                </div>

                <div className="group hover:scale-105 transition-all duration-200 col-span-1 md:col-span-2 md:row-span-3 bg-[#fff5ee] dark:bg-gradient-to-br dark:bg-[#470b2e] p-6 md:p-8 rounded-[20px] flex flex-col md:flex-row justify-between items-center gap-6">

                  <header className="flex flex-col gap-2 w-full md:w-[40%]">
                    <GiCommercialAirplane className="text-3xl md:text-7xl text-gray-900 dark:text-gray-100" />

                    <h2 className="text-2xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white">Manufacturer Loyalty</h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Discover your favorite aircraft manufacturers and how they perform across your fleet.</p>

                  </header>

                  <Image
                    src={aircraftTopBrandRankImage}
                    alt="Aircraft Top Brand Rank"
                    width={600}
                    height={150}
                    className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto"
                    quality={100}
                  />
                </div>

                <div className="group hover:scale-105 transition-all duration-200 col-span-1 md:col-span-2 bg-gradient-to-br from-[#acdaff] to-blue-50 dark:bg-gradient-to-br dark:from-blue-950 dark:to-cyan-950 p-6 md:p-12 rounded-[20px] flex flex-col gap-6 md:gap-8 justify-between items-center w-full border-4 md:border-6 border-blue-200/50 dark:border-blue-600/60 overflow-hidden">

                  <header className="flex flex-col items-center gap-2 text-center">

                    <h2 className="text-2xl md:text-6xl font-bold tracking-tighter flex items-center gap-2 flex-wrap justify-center">
                      <TbFileTypeCsv className="inline text-blue-600 dark:text-blue-400" />
                      <span className="block sm:inline bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">CSV Export Compatibility</span>
                      <span className="block sm:inline bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">(MyFlightRadar24 support)</span>
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Export your flight data in CSV format for external analysis with MyFlightRadar24 compatibility.</p>

                    <Badge className="bg-green-600 dark:bg-green-700 text-light font-bold tracking-tight text-sm md:text-lg animate-pulse">LIFETIME PLAN EXCLUSIVE</Badge>



                  </header>

                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-center w-full">

                    <Image
                      src={routeCsvImage}
                      alt="CSV Export"
                      width={500}
                      height={200}
                      className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto"
                      quality={100}
                    />

                    <Image
                        src={routeMyFr24Image}
                      alt="MyFlightRadar24"
                      width={500}
                      height={200}
                      className="border-4 md:border-6 border-white dark:border-gray-600 rounded-[20px] shadow-2xl group-hover:scale-105 transition-all duration-200 w-full md:w-auto"
                      quality={100}
                    />
                  </div>
                </div>

                {/* CTA Card */}
                <GroupedSubscriptionButtons />

              </section>



            </div>

            
          )}
        </TabsContent>

        <TabsContent value="livery" className="space-y-6 w-full">
          <div className="relative bg-white/50 dark:bg-black rounded-[50px] p-8 md:p-16 min-h-[600px] flex flex-col items-center justify-center">
            
            <header className="flex flex-col gap-4 items-center justify-center text-center">
              <h1 className="text-4xl lg:text-8xl font-bold tracking-tighter flex items-center gap-3 flex-wrap justify-center">
                <GrPaint className="text-amber-500 dark:text-amber-400" />
                <span className="bg-gradient-to-r from-amber-500 to-amber-300 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
                  Livery Analysis
                </span>
              </h1>
              <p className="text-gray-800 dark:text-gray-300 text-lg font-semibold tracking-tight max-w-2xl text-center">
                Track and analyze aircraft liveries and airline branding across your fleet.
              </p>
            </header>

            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="text-6xl text-amber-500 animate-pulse">
                <FaWrench />
              </div>
              
              <Badge className="bg-amber-500 text-white text-lg px-6 py-2 animate-pulse">
                COMING SOON
              </Badge>
              
              <p className="text-gray-700 dark:text-gray-300 font-bold text-xl">
                Available in v1.8.0
              </p>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-[20px] p-6 max-w-md">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  This feature will be exclusive to <Badge className="bg-yellow-500 text-white font-bold tracking-tight text-md uppercase mr-1">Premium</Badge> and <Badge className="bg-green-600 text-white font-bold tracking-tight text-md uppercase mr-1">Lifetime</Badge> subscribers.
                </p>
              </div>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="atc" className="space-y-6 w-full">
          <div className="relative bg-white/50 dark:bg-black rounded-[50px] p-8 md:p-16 min-h-[500px] flex flex-col items-center justify-center ">
            
            <header className="flex flex-col gap-4 items-center justify-center text-center">
              <h1 className="text-4xl lg:text-8xl font-bold tracking-tighter flex items-center gap-3 flex-wrap justify-center">
                <PiAirTrafficControlFill className="text-blue-600 dark:text-blue-400" />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                  ATC History
                </span>
              </h1>
              <p className="text-gray-800 dark:text-gray-300 text-lg font-semibold tracking-tight max-w-2xl">
                View your complete Air Traffic Control sessions history.
              </p>
            </header>

            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="text-6xl text-blue-600 dark:text-blue-400 animate-pulse">
                <FaWrench />
              </div>
              
              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg px-6 py-2 animate-pulse">
                COMING SOON
              </Badge>
              
              <p className="text-gray-700 dark:text-gray-300 font-bold text-xl">
                Available in v1.8.0
              </p>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-[20px] p-6 max-w-md">
                <Badge className="bg-blue-600 text-white font-bold tracking-tight text-md uppercase mr-2">Free</Badge> feature for all users.
              </div>
            </div>

          </div>
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
    icon: <MdOutlineAirlines />,
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