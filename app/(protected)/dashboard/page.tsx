import { getUser } from "@/lib/supabase/user-actions";
import { convertMinutesToHours, formatDate, cn } from "@/lib/utils";
import {
  getAircraftAndLivery,
  getUserFlights,
  getUserMostRecentFlight,
  getUserStats,
} from "@/lib/actions";
import { matchATCRankToTitle } from "@/lib/sync-actions";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import iflyticsLogo from "@/public/iflyticslight.svg";

// Icons
import { LuPlaneLanding, LuTowerControl } from "react-icons/lu";
import { TfiMedall } from "react-icons/tfi";
import { MdOutlineAirlines, MdOutlineLibraryBooks } from "react-icons/md";
import { PiShootingStarBold } from "react-icons/pi";
import { FaPlane, FaMapMarkerAlt, FaUsers, FaLightbulb, FaExternalLinkAlt, FaRegCalendarAlt } from "react-icons/fa";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { TbPlaneInflight, TbClock, TbBuildingAirport, TbBuildingStadium, TbBrandDiscord } from "react-icons/tb";
import { GoServer } from "react-icons/go";
import { HiOutlineGlobeAsiaAustralia } from "react-icons/hi2";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { BsPersonWorkspace } from "react-icons/bs";
import { SlActionUndo } from "react-icons/sl";
import { Badge } from "@/components/ui/badge";
import { getAggregatedFlights } from "@/lib/cache/flightdata";
import GradeProgressionCard from "@/components/dashboard-ui/grade-progression-card";
import { getPreviousMonthStats, getThisMonthStats } from "@/lib/monthly-stats-helpers";
import MonthlyStatsComparisonCard from "@/components/dashboard-ui/monthly-stats-comparison-card";
import { DivIcon } from "leaflet";
import SignupTracker from "@/components/dashboard-ui/misc/ga4/signup-tracker";
import { FaInstagram } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Dashboard - IFlytics | Your Infinite Flight Statistics",
  description:
    "View your Infinite Flight stats with advanced data visualization, thorough analysis of your favorite routes and aircraft, flight history, map tracker, and more! Join thousands of users exploring their Infinite Flight data.",
  keywords:
    "infinite flight, flight tracking, analytics, flight, aviation, pilot, stats, data, expert server, flight simulator, dashboard, flight history, airbus, boeing, leaderboard, map tracker, route analysis, aircraft analysis",
};

export default async function DashboardPage() {
  const { user_metadata: data } = await getUser();
  const flights = await getAggregatedFlights(data.ifcUserId) // Use for Grade Progression Table

  const userStats = await getUserStats(data.ifcUsername, data.ifcUserId);
  let userData = userStats.result[0];

  const previousMonthStats = getPreviousMonthStats(flights);
  const thisMonthStats = getThisMonthStats(flights);

  // Sample Object
  /*  {
  onlineFlights: 586,
  violations: 9,
  xp: 510841,
  landingCount: 943,
  flightTime: 38397,
  atcOperations: 234,
  atcRank: 0,
  grade: 3,
  hash: '2F082449',
  violationCountByLevel: { level1: 7, level2: 1, level3: 1 },
  roles: [ 53, 75 ],
  userId: '1577e4a9-98c7-4d61-9ff3-cf0d003284e4',
  virtualOrganization: 'Air Canada Virtual [ACVA]',
  discourseUsername: 'charlesacosta163',
  groups: [],
  errorCode: 0
  } */


  const recentFlight = await getUserMostRecentFlight() || {
    "id": "9aeb16a3-ac69-41d3-9dd4-d62be72b1525",
    "created": "2022-01-10T10:37:41.965626",
    "userId": "b0018209-e010-40a0-afe1-00ecd5856c5e",
    "aircraftId": "849366e1-cb11-4d72-9034-78b11cd026b0",
    "liveryId": "a071518d-995a-4b3c-b65b-656da0d6ed86",
    "callsign": "N/A",
    "server": "Casual Server",
    "dayTime": 0,
    "nightTime": 0,
    "totalTime": 0,
    "landingCount": 0,
    "originAirport": "NOPE",
    "destinationAirport": "NOPE",
    "xp": 0,
    "worldType": 1,
    "violations": [],
  }

  const { aircraftName, liveryName } = await getAircraftAndLivery(
    recentFlight.liveryId
  ) ;
  // Grade 5 - Amber
  // Grade 4 - Green
  // Grade 3 - Purple
  // Grade 2 - Blue
  // Default - Gray

  const gradeColorClass =
    userData.grade >= 5
      ? "bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-600/80 dark:to-yellow-700/80 border-4 border-amber-300 dark:border-amber-700"
      : userData.grade >= 4
      ? "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600/80 dark:to-green-700/80 border-4 border-green-300 dark:border-green-700"
      : userData.grade >= 3
      ? "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600/80 dark:to-purple-700/80 border-4 border-purple-300 dark:border-purple-700"
      : userData.grade >= 2
      ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600/80 dark:to-blue-700/80 border-4 border-blue-300 dark:border-blue-700"
      : "bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700/80 dark:to-gray-800/80 border-4 border-gray-300 dark:border-gray-700";

  const atcRank = matchATCRankToTitle(userData.atcRank.toString() || "Unknown");
  return (
    <div className="relative">

      <div className="relative z-10 space-y-4 md:space-y-6 pb-6">
        <SignupTracker />

        {/* Header */}
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
                "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <FaPlane className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-800 dark:text-gray-100">
                  Welcome back, {data.ifcUsername}!
                </h1>
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium ml-12 md:ml-[60px]">
              Your aviation dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 md:gap-3",
              "px-4 md:px-6 py-2.5 md:py-3",
              "rounded-[12px] md:rounded-[15px]",
              "border-2 w-full",
              gradeColorClass,
              "text-white",
              "shadow-md",
              "transition-transform hover:scale-105 duration-200"
            )}>
              <TfiMedall className="w-4 h-4 md:w-5 md:h-5" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold opacity-90">Current Grade</span>
                <span className="text-lg md:text-xl font-black">Grade {userData.grade}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Welcome Card - Large */}
          <Card className={`md:col-span-1 lg:col-span-2 ${gradeColorClass} text-white rounded-[25px]`}>
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
                Profile Overview
              </CardTitle>
              <CardDescription className="text-gray-100 text-sm md:text-base">
                Your general stats.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 px-4 md:px-6">
              <div
                className={`bg-white/15 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-md relative overflow-hidden`}
              >
                <div className="text-xl md:text-2xl font-bold tracking-tight">{userData.grade}</div>
                <div className="text-gray-100 text-xs md:text-sm flex items-center gap-1 font-medium">
                  <TfiMedall /> Grade
                </div>
                <div className="absolute top-4 right-4 opacity-10">
                  <TfiMedall className="text-[5rem] md:text-[6rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-md relative overflow-hidden">
                <div className="text-xl md:text-2xl font-bold tracking-tight">
                  {userData.onlineFlights}
                </div>
                <div className="text-gray-100 text-xs md:text-sm flex items-center gap-1 font-medium">
                  <HiOutlineStatusOnline /> Online Flights
                </div>
                <div className="absolute top-0 right-4 opacity-10">
                  <HiOutlineStatusOnline className="text-[7rem] md:text-[8rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-md relative overflow-hidden">
                <div className="text-xl md:text-2xl font-bold tracking-tight">
                  {userData.landingCount}
                </div>
                <div className="text-gray-100 text-xs md:text-sm flex items-center gap-1 font-medium">
                  <LuPlaneLanding /> Landings
                </div>
                <div className="absolute top-0 right-4 opacity-10">
                  <LuPlaneLanding className="text-[7rem] md:text-[8rem]" />
                </div>
              </div>
              <div
                className={`bg-white/15 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-md relative overflow-hidden`}
              >
                <div className="text-xl md:text-2xl font-bold tracking-tight">{userData.xp}</div>
                <div className="text-gray-100 text-xs md:text-sm flex items-center gap-1 font-medium">
                  <PiShootingStarBold /> XP
                </div>
                <div className="absolute top-4 right-4 opacity-10">
                  <PiShootingStarBold className="text-[5rem] md:text-[6rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-md relative overflow-hidden">
                <div className="text-xl md:text-2xl font-bold tracking-tight">
                  {convertMinutesToHours(userData.flightTime)}
                </div>
                <div className="text-gray-100 text-xs md:text-sm flex items-center gap-1 font-medium">
                  <TbClock /> Flight Time
                </div>
                <div className="absolute top-0 right-4 opacity-10">
                  <TbClock className="text-[7rem] md:text-[8rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-[20px] md:rounded-[25px] p-4 md:p-5 !pb-0 backdrop-blur-md relative overflow-hidden md:row-span-2">
                {/* Small screens - simplified view */}
                <div className="lg:hidden flex flex-col">
                  <span className="text-xl md:text-2xl font-bold tracking-tight">
                    {userData.atcOperations || 0}
                  </span>
                  <span className="text-xs md:text-sm flex items-center gap-1 font-medium">
                    <LuTowerControl /> {atcRank}
                  </span>
                </div>

                {/* Large screens - detailed view */}
                <div className="hidden lg:block">
                  <div className="flex items-center gap-1">
                    <LuTowerControl className="text-xl md:text-2xl" />
                    <div className="text-light text-xs md:text-sm font-bold tracking-tight">
                      ATC Summary
                    </div>
                  </div>

                  <div className="h-full flex flex-col justify-between !py-2">
                    <div className="flex flex-col">
                      <span className="text-xl md:text-2xl font-bold tracking-tight">
                        {userData.atcOperations || 0}
                      </span>
                      <span className="text-gray-100 text-xs md:text-sm flex items-center gap-1 font-medium">
                        <BsPersonWorkspace /> Operations
                      </span>
                    </div>

                    <span className="self-end font-bold text-light lg:text-3xl tracking-tight mt-4">
                      {atcRank}
                    </span>
                  </div>
                </div>

                <div className="absolute lg:-bottom-4 top-0 lg:top-auto right-0 opacity-10">
                  <LuTowerControl className="text-[7rem] md:text-[8rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-md col-span-2 relative overflow-hidden">
                <div className="text-xl md:text-2xl font-bold tracking-tight">
                  {userData.virtualOrganization || "Not In Organization"}
                </div>
                <div className="text-gray-100 text-xs md:text-sm flex items-center gap-1 font-medium">
                  <MdOutlineAirlines /> Virtual Organization
                </div>
                <div className="absolute top-0 right-4 opacity-10">
                  <MdOutlineAirlines className="text-[7rem] md:text-[8rem]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instagram */}
<Card
  className={cn(
    "md:col-span-1 lg:col-span-2 relative overflow-hidden",
    "rounded-[25px] shadow-none",
    "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    "text-white"
  )}
>
  <FaInstagram className="absolute -right-6 -bottom-8 text-[14rem] md:text-[18rem] text-white opacity-10 pointer-events-none" />

  <CardContent className="relative z-10 px-5 md:px-7 py-8 md:py-10 flex flex-col items-center justify-center gap-6 text-center min-h-[220px]">
    <div className="flex flex-col items-center gap-4 max-w-xl">
      <div className="flex items-center justify-center gap-2">
        <Image src={iflyticsLogo} alt="IFlytics Logo" width={32} height={32} />
        <Badge className="bg-white/20 hover:bg-white/20 text-white border-white/25 font-semibold text-sm">
          @iflyticsapp
        </Badge>
      </div>

      <div>
        <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          IFlytics is on Instagram
        </CardTitle>
        <CardDescription className="text-white/80 text-sm md:text-lg mt-3 font-medium max-w-lg mx-auto">
          Feature previews, product updates, and highlights from the Infinite Flight community.
        </CardDescription>
      </div>
    </div>

    <Link
      href="https://instagram.com/iflyticsapp"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2",
        "bg-white text-[#ee2a7b] hover:bg-white/90",
        "font-bold rounded-full px-6 py-2.5 text-sm md:text-base",
        "transition-all duration-200 hover:scale-105 shadow-lg"
      )}
    >
      <FaInstagram className="text-lg md:text-xl" />
      Follow on Instagram
      <FaExternalLinkAlt className="text-[10px] opacity-70" />
    </Link>
  </CardContent>
</Card>

          {/* Recent Flight + Arcade */}
          <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#FEEBF6] dark:bg-indigo-950 text-dark dark:text-gray-100 rounded-[25px] border-4 border-indigo-200 dark:border-indigo-700 shadow-none h-full">
              <CardHeader className="px-4 md:px-6 flex flex-row justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl md:text-2xl font-bold tracking-tight dark:text-gray-100 flex items-center gap-2">
                    <TbPlaneInflight className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                    Recent Flight
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base mt-2">
                    <Badge className="bg-gray-600 dark:bg-gray-700 text-white font-medium">
                      <FaRegCalendarAlt className="w-3 h-3 mr-1.5 inline" />
                      {formatDate(recentFlight.created)}
                    </Badge>
                  </CardDescription>
                </div>
                {recentFlight.id && (
                  <Link
                    className="bg-blue-500/30 dark:bg-blue-600/40 hover:bg-blue-600/50 dark:hover:bg-blue-500/60 py-2 px-4 rounded-full flex items-center justify-center gap-2 duration-200 transition-all text-gray-800 dark:text-gray-100 shrink-0"
                    href={`/dashboard/flights/${recentFlight.id}`}
                  >
                    <TbPlaneInflight className="text-lg md:text-xl" />
                    <span className="text-xs md:text-sm font-semibold">Info</span>
                  </Link>
                )}
              </CardHeader>

              <CardContent className="px-4 md:px-6 space-y-3 md:space-y-4 pb-5 md:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-white/50 dark:bg-gray-700/50 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-sm border dark:border-gray-600">
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Callsign</p>
                    <p className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100 truncate">
                      {recentFlight.callsign || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/50 dark:bg-gray-700/50 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-sm border dark:border-gray-600 sm:col-span-1">
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Route</p>
                    <p className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                      {recentFlight.originAirport || "????"} → {recentFlight.destinationAirport || "????"}
                    </p>
                  </div>

                  <div className="bg-white/50 dark:bg-gray-700/50 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-sm border dark:border-gray-600">
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Duration</p>
                    <p className="text-lg md:text-xl font-bold tracking-tight text-blue-500 dark:text-blue-400">
                      {convertMinutesToHours(Math.round(recentFlight.totalTime)) || "???"}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 dark:from-blue-950 dark:via-purple-950 dark:to-blue-950 rounded-[25px] md:rounded-[30px] p-4 flex items-center justify-between gap-4 border-2 border-blue-800/50 dark:border-blue-700/30">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold tracking-tight text-xl md:text-2xl truncate">
                      {aircraftName || "Unknown Aircraft"}
                    </h3>
                    <p className="text-gray-300 dark:text-gray-400 text-xs md:text-sm mt-1 font-medium truncate">
                      {liveryName || "Standard livery"}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Image
                      src={`/images/aircraft/${matchAircraftNameToImage(aircraftName || "")}`}
                      alt={aircraftName || "Aircraft"}
                      width={120}
                      height={90}
                      className="rounded-lg object-contain w-[80px] h-[60px] md:w-[110px] md:h-[80px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-[#A5B68D] dark:bg-green-900/40 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-md overflow-hidden relative border-2 border-green-700/30 dark:border-green-800/50">
                    <div className="text-xl md:text-2xl font-bold tracking-tight text-white tabular-nums">
                      {recentFlight.xp?.toLocaleString() ?? 0}
                    </div>
                    <div className="text-green-100 dark:text-green-300 text-xs md:text-sm font-medium">XP Earned</div>
                    <div className="absolute top-2 right-2 opacity-10 dark:opacity-20 pointer-events-none">
                      <PiShootingStarBold className="text-[5rem] md:text-[6rem]" />
                    </div>
                  </div>

                  <div className="bg-[#687FE5] dark:bg-blue-900/40 rounded-[20px] md:rounded-[25px] p-4 md:p-5 backdrop-blur-md overflow-hidden relative border-2 border-blue-700/30 dark:border-blue-800/50">
                    <div className="text-xl md:text-2xl font-bold tracking-tight text-white truncate">
                      {recentFlight.server?.replace(" Server", "") || "Unknown"}
                    </div>
                    <div className="text-blue-100 dark:text-blue-300 text-xs md:text-sm font-medium">Server</div>
                    <div className="absolute top-0 right-0 opacity-10 dark:opacity-20 pointer-events-none">
                      <GoServer className="text-[7rem] md:text-[8rem]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div
              className={cn(
                "relative overflow-hidden rounded-[25px] h-full min-h-[280px]",
                "border-4 border-yellow-400/50 dark:border-yellow-500/40"
              )}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/starfall-gif.gif)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-black/55" />
              <div className="relative z-10 flex flex-col items-center justify-center gap-5 p-6 h-full min-h-[280px] text-center">
                <div className="flex flex-col items-center gap-3 text-white max-w-lg">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                      IFlytics Arcade 🕹️
                    </span>
                    <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold border-none shrink-0">
                      NEW
                    </Badge>
                  </div>
                  <p className="text-white/65 text-sm md:text-base">
                    Take a break from the stats — play mini-games featuring real IFlytics community pilots as sprites.
                  </p>
                </div>
                <Link
                  href="/dashboard/games"
                  className="shrink-0 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-full px-6 py-2.5 text-sm transition-all duration-200 hover:scale-105 flex items-center gap-2"
                >
                  Open Arcade →
                </Link>
              </div>
            </div>
          </div>
          
          <MonthlyStatsComparisonCard previousMonthStats={previousMonthStats} thisMonthStats={thisMonthStats}/>


          { /* Grade Progression Table - Per the Infinite Flight Grade Table*/}
          <GradeProgressionCard userData={userData} flights={flights}/>


          {/* Quick Actions */}
          <Card className="dark:bg-[#381f17]/50 border-4 border-amber-500/30 dark:border-amber-700/30 bg-[#FCD8CD] text-dark backdrop-blur-xl rounded-[25px] shadow-none">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 text-light dark:bg-amber-700 bg-amber-500 px-4 py-1 rounded-full justify-center">
                <SlActionUndo className="text-xl md:text-2xl" /> Quick Actions
              </CardTitle>
             
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-light">
                <Link href="/dashboard/flights">
                  <div className="bg-[#9dbe7f] hover:bg-[#B1D690]/80 dark:bg-green-900/40 rounded-[25px] border-4 border-green-500/30 p-2 py-3 text-center transition-all duration-200 cursor-pointer hover:scale-105">
                    <TbPlaneInflight className="text-2xl mx-auto mb-1" />
                    <div className="text-sm font-medium">View Flights</div>
                  </div>
                </Link>

                <Link href="/map/dark">
                  <div className="bg-blue-400 hover:bg-blue-400/80 dark:bg-blue-900/40 rounded-[25px] border-4 border-blue-500/30 p-2 py-3 text-center transition-all duration-200 cursor-pointer hover:scale-105">
                    <HiOutlineGlobeAsiaAustralia className="text-2xl mx-auto mb-1" />
                    <div className="text-sm font-medium">Live Map</div>
                  </div>
                </Link>

                <Link href="/dashboard/profile">
                  <div className="bg-[#FFA24C] hover:bg-[#FFA24C]/80 dark:bg-orange-900/40 rounded-[25px] border-4 border-orange-500/30 p-2 py-3 text-center transition-all duration-200 cursor-pointer hover:scale-105">
                    <FaUsers className="text-2xl mx-auto mb-1" />
                    <div className="text-sm font-medium">Profile</div>
                  </div>
                </Link>

                <Link href="/directory">
                  <div className="bg-[#FF77B7] hover:bg-[#FF77B7]/80 dark:bg-pink-900/40 rounded-[25px] border-4 border-pink-500/30 p-2 py-3 text-center transition-all duration-200 cursor-pointer hover:scale-105">
                    <MdOutlineLibraryBooks className="text-2xl mx-auto mb-1" />
                    <div className="text-sm font-medium">Directory</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>


            <Card className="flex-1 bg-[#5865F2] relative overflow-hidden flex items-center justify-center rounded-[25px] shadow-none border-4 border-indigo-200 dark:border-indigo-400">
              <TbBrandDiscord className="text-[20rem] absolute top-8 left-0 text-white opacity-10" />

              <div className="flex flex-col gap-2 justify-center items-center z-[1]">
                <header className="text-xl md:text-2xl font-bold tracking-tight text-light flex items-center gap-1"><Image src={iflyticsLogo} alt="IFlytics Logo" width={24} height={24} className="" /> Join the Discord</header>
                <div className="text-gray-200 text-center text-sm md:text-base">
                  Join the IFlytics Discord to get the latest news and updates.
                </div>
                  {/* NEEDS TO BE UPDATED WEEKLY */}
                <Link href="https://discord.gg/xyAxzqPv" target="_blank" className="bg-[#404EED] hover:bg-[#404EED]/80 text-white rounded-full px-4 py-2 flex items-center gap-2 text-center text-sm font-bold z-[1] hover:scale-105 transition-all duration-200 self-center">
                  <TbBrandDiscord className="text-2xl" /> Join
                </Link>
              </div>

            </Card>
  
            

          <div className="md:col-span-1 relative group">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-400 to-green-500 blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse rounded-[25px]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-400 to-green-500 rounded-[25px]"></div>

            <div className="p-1 h-full">
              <Card className="relative bg-[url('/findthepilotimg.png')] bg-cover bg-top-left text-white rounded-[25px] !h-full overflow-hidden">
                {/* Dark overlay with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-black/60"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Header section */}
                  <div className="text-center mt-4">
                    <div className="inline-flex flex-col items-center gap-2 bg-black/40 backdrop-blur-md py-3 px-6 rounded-2xl border border-white/20 shadow-2xl">
                      <div className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 drop-shadow-lg">
                        Find The Pilot
                      </div>
                      <div className="text-gray-200 text-xs md:text-sm font-medium">
                        A game for the analysts 🧐
                      </div>
                    </div>
                  </div>

                  {/* Button section */}
                  <div className="flex justify-center pb-4 hover:scale-105">
                    <Link href="/map/game" className="group/btn">
                      <div className="relative">
                        {/* Button glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-70 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

                        {/* Animated border */}
                        <div className="relative p-0.5 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-500 rounded-full animate-bounce">
                          <Button className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full !font-bold text-lg px-8 py-3 border-none tracking-tight shadow-xl transform transition-transform duration-200">
                            <span className="flex items-center gap-2">
                              Play Game
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="dark:bg-gray-900 bg-gray-100 text-dark backdrop-blur-xl relative overflow-hidden rounded-[25px] shadow-none border-4 border-gray-200 dark:border-gray-700">

          <TbBuildingAirport className="text-[20rem] absolute top-8 left-0 text-amber-500 opacity-10" />
          
            <CardHeader className="">
              <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-gray dark:text-white">
                Infinite Flight Community
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <span className="text-gray-700 dark:text-white tracking-tight leading-relaxed font-medium text-sm md:text-base">
                Join thousands of virtual pilots sharing their passion for
                aviation!
              </span>

              <Link
                href="https://community.infiniteflight.com/"
                target="_blank"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 flex items-center gap-2 text-center text-sm font-bold self-start z-[1]" 
              >
                  Visit Community
                  <FaExternalLinkAlt/>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}