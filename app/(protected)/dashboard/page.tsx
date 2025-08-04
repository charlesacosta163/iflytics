import { getUser } from "@/lib/supabase/user-actions";
import { convertMinutesToHours } from "@/lib/utils";
import {
  getAircraftAndLivery,
  getUselessFactToday,
  getUserFlights,
  getUserStats,
} from "@/lib/actions";
import { matchATCRankToTitle } from "@/lib/sync-actions";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// Icons
import { LuPlaneLanding, LuTowerControl } from "react-icons/lu";
import { TfiMedall } from "react-icons/tfi";
import { MdOutlineAirlines, MdOutlineLibraryBooks } from "react-icons/md";
import { PiShootingStarBold } from "react-icons/pi";
import { FaPlane, FaMapMarkerAlt, FaUsers, FaLightbulb, FaExternalLinkAlt } from "react-icons/fa";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { TbPlaneInflight, TbClock, TbBuildingAirport, TbBuildingStadium, TbBrandDiscord } from "react-icons/tb";
import { GoServer } from "react-icons/go";
import { HiOutlineGlobeAsiaAustralia } from "react-icons/hi2";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import { BsPersonWorkspace } from "react-icons/bs";
import { SlActionUndo } from "react-icons/sl";

export const metadata: Metadata = {
  title: "Dashboard - IFlytics | Your Infinite Flight Statistics",
  description:
    "View your Infinite Flight statistics with advanced data visualization, real-time flight maps, leaderboards, and interactive games. Join thousands of pilots exploring their aviation data.",
  keywords:
    "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history",
};

export default async function DashboardPage() {
  const { user_metadata: data } = await getUser();
  // const uselessFact = await getUselessFactToday();
  // const flights = await getAggregatedFlights(data.ifcUserId)

  const userStats = await getUserStats(data.ifcUsername, data.ifcUserId);
  const userFlights = await getUserFlights(data.ifcUsername);

  const userData = userStats.result[0];
  const recentFlight = userFlights?.data.result.data[0];

  const { aircraftName, liveryName } = await getAircraftAndLivery(
    recentFlight.aircraftId,
    recentFlight.liveryId
  );
  // Grade 5 - Amber
  // Grade 4 - Green
  // Grade 3 - Purple
  // Grade 2 - Blue
  // Default - Gray

  const gradeColorClass =
    userData.grade >= 5
      ? "bg-gradient-to-r from-amber-500/50 to-yellow-600/60"
      : userData.grade >= 4
      ? "bg-gradient-to-r from-green-500/50 to-green-600/60"
      : userData.grade >= 3
      ? "bg-gradient-to-r from-purple-500/50 to-purple-600/60"
      : userData.grade >= 2
      ? "bg-gradient-to-r from-blue-500/50 to-blue-600/60"
      : "bg-gradient-to-r from-gray-600/50 to-dark/50";

  const atcRank = matchATCRankToTitle(userData.atcRank.toString() || "Unknown");
  return (
    <div className="relative">
      {/* Liquid Glass Background */}
      {/* <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 dark:bg-gradient-to-br from-slate-900 via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-t from-black/20 to-transparent"></div>
      </div> */}

      <div className="relative z-10 space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold dark:text-light bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent tracking-tight">
              Welcome back, {data.ifcUsername}!
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <FaPlane className="text-gray-400" />
              Your aviation dashboard
            </p>
          </div>
          <div
            className={`flex items-center self-start sm:self-end gap-2 ${gradeColorClass} text-white px-4 py-2 rounded-full`}
          >
            <span className="font-bold">Grade {userData.grade}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Welcome Card - Large */}
          <Card className="md:col-span-1 lg:col-span-2 bg-[#687FE5] text-white backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Profile Overview
              </CardTitle>
              <CardDescription className="text-gray-200">
                Your general stats.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                className={`bg-white/15 ${gradeColorClass} rounded-xl p-4 backdrop-blur-md relative overflow-hidden`}
              >
                <div className="text-2xl font-bold">{userData.grade}</div>
                <div className="text-blue-100 text-sm flex items-center gap-1">
                  <TfiMedall /> Grade
                </div>
                <div className="absolute top-4 right-4 opacity-10">
                  <TfiMedall className="text-[6rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-xl p-4 backdrop-blur-md relative overflow-hidden">
                <div className="text-2xl font-bold">
                  {userData.onlineFlights}
                </div>
                <div className="text-blue-100 text-sm flex items-center gap-1">
                  <HiOutlineStatusOnline /> Online Flights
                </div>
                <div className="absolute top-0 right-4 opacity-10">
                  <HiOutlineStatusOnline className="text-[8rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-xl p-4 backdrop-blur-md relative overflow-hidden">
                <div className="text-2xl font-bold">
                  {userData.landingCount}
                </div>
                <div className="text-blue-100 text-sm flex items-center gap-1">
                  <LuPlaneLanding /> Landings
                </div>
                <div className="absolute top-0 right-4 opacity-10">
                  <LuPlaneLanding className="text-[8rem]" />
                </div>
              </div>
              <div
                className={`bg-white/15 rounded-xl p-4 backdrop-blur-md relative overflow-hidden`}
              >
                <div className="text-2xl font-bold">{userData.xp}</div>
                <div className="text-blue-100 text-sm flex items-center gap-1">
                  <PiShootingStarBold /> XP
                </div>
                <div className="absolute top-4 right-4 opacity-10">
                  <PiShootingStarBold className="text-[6rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-xl p-4 backdrop-blur-md relative overflow-hidden">
                <div className="text-2xl font-bold">
                  {convertMinutesToHours(userData.flightTime)}
                </div>
                <div className="text-blue-100 text-sm flex items-center gap-1">
                  <TbClock /> Flight Time
                </div>
                <div className="absolute top-0 right-4 opacity-10">
                  <TbClock className="text-[8rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-xl p-4 !pb-0 backdrop-blur-md relative overflow-hidden md:row-span-2">
                {/* Small screens - simplified view */}
                <div className="lg:hidden flex flex-col">
                  <span className="text-2xl font-bold">
                    {userData.atcOperations || 0}
                  </span>
                  <span className="text-sm flex items-center gap-1">
                    <LuTowerControl /> {atcRank}
                  </span>
                </div>

                {/* Large screens - detailed view */}
                <div className="hidden lg:block">
                  <div className="flex items-center gap-1">
                    <LuTowerControl className="text-2xl" />
                    <div className="text-light text-sm font-bold tracking-tight">
                      ATC Summary
                    </div>
                  </div>

                  <div className="h-full flex flex-col justify-between !py-2">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">
                        {userData.atcOperations || 0}
                      </span>
                      <span className="text-blue-100 text-sm flex items-center gap-1">
                        <BsPersonWorkspace /> Operations
                      </span>
                    </div>

                    <span className="self-end font-bold text-light lg:text-3xl tracking-tight mt-4">
                      {atcRank}
                    </span>
                  </div>
                </div>

                <div className="absolute lg:-bottom-4 top-0 lg:top-auto right-0 opacity-10">
                  <LuTowerControl className="text-[8rem]" />
                </div>
              </div>
              <div className="bg-white/15 rounded-xl p-4 backdrop-blur-md col-span-2 relative overflow-hidden">
                <div className="text-2xl font-bold">
                  {userData.virtualOrganization}
                </div>
                <div className="text-blue-100 text-sm flex items-center gap-1">
                  <MdOutlineAirlines /> Virtual Organization
                </div>
                <div className="absolute top-0 right-4 opacity-10">
                  <MdOutlineAirlines className="text-[8rem]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Flight */}
          <Card className="md:col-span-1 lg:col-span-2 !pb-0 bg-[#FEEBF6] text-dark backdrop-blur-xl">
            <CardHeader className="flex justify-between gap-2 items-center">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Recent Flight
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your recent flight.
                </CardDescription>
              </div>
              <Link
                className="bg-blue-500/30 hover:bg-blue-600/50 py-1 px-4 rounded-full flex items-center justify-center gap-2 duration-200 transition-all"
                href={`/dashboard/flights/${recentFlight.id}`}
              >
                <TbPlaneInflight className="text-2xl" />
                <span className="text-sm font-semibold">Info</span>
              </Link>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 justify-between h-full bg-[#f2e1ff] rounded-xl p-4 backdrop-blur-xl">
              <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Callsign</span>
                  <span className="font-bold text-gray-800">
                    {recentFlight.callsign}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Route</span>
                  <span className="font-bold">
                    {recentFlight.originAirport || "????"} →{" "}
                    {recentFlight.destinationAirport || "????"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Duration</span>
                  <span className="font-bold text-blue-500">
                    {convertMinutesToHours(
                      Math.round(recentFlight.totalTime)
                    ) || "???"}
                  </span>
                </div>

                <div className="flex-1 flex gap-4 items-center px-4 py-3 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 rounded-lg">
                  <div className="flex-1 flex flex-col gap-1 ">
                    <div className="text-white font-bold tracking-tight text-2xl">
                      {aircraftName}
                    </div>
                    <div className="text-gray-400 text-sm">{liveryName}</div>
                  </div>
                  {/* Aircraft Image */}
                  <Image
                    src={`/images/aircraft/${matchAircraftNameToImage(
                      aircraftName || ""
                    )}`}
                    alt={aircraftName || "Aircraft"}
                    width={120}
                    height={90}
                    className="rounded-lg object-contain"
                  />
                </div>
              </section>

              <section className="grid grid-cols-2 gap-4">
                <div className="bg-[#A5B68D] rounded-xl p-4 backdrop-blur-md overflow-hidden relative">
                  <div className="text-2xl font-bold text-green-100">
                    {recentFlight.xp}
                  </div>
                  <div className="text-green-200 text-sm">XP Earned</div>
                  <div className="absolute top-2 right-2 opacity-10">
                    <PiShootingStarBold className="text-[6rem]" />
                  </div>
                </div>

                <div className="bg-[#687FE5] rounded-xl p-4 backdrop-blur-md overflow-hidden relative">
                  <div className="text-2xl font-bold text-blue-100">
                    {recentFlight.server}
                  </div>
                  <div className="text-blue-300 text-sm">Server</div>
                  <div className="absolute top-0 right-0 opacity-10">
                    <GoServer className="text-[8rem]" />
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className=" dark:bg-[#381f17]/50 bg-[#FCD8CD] text-dark backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2 text-light dark:bg-amber-700 bg-amber-500 px-4 py-1 rounded-full justify-center">
                <SlActionUndo className="text-2xl" /> Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-center">
                Quick actions to help you get started.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-light">
                <Link href="/dashboard/flights">
                  <div className="bg-[#9dbe7f] hover:bg-[#B1D690]/80 rounded-xl p-2 py-3 text-center transition-all duration-200 cursor-pointer hover:scale-105">
                    <TbPlaneInflight className="text-2xl mx-auto mb-1" />
                    <div className="text-sm font-medium">View Flights</div>
                  </div>
                </Link>

                <Link href="/map/dark">
                  <div className="bg-blue-400 hover:bg-blue-400/80 rounded-xl p-2 py-3 text-center transition-all duration-200 cursor-pointer hover:scale-105">
                    <HiOutlineGlobeAsiaAustralia className="text-2xl mx-auto mb-1" />
                    <div className="text-sm font-medium">Live Map</div>
                  </div>
                </Link>

                <Link href="/dashboard/profile">
                  <div className="bg-[#FFA24C] hover:bg-[#FFA24C]/80 rounded-xl p-2 py-3 text-center transition-all duration-200 cursor-pointer hover:scale-105">
                    <FaUsers className="text-2xl mx-auto mb-1" />
                    <div className="text-sm font-medium">Profile</div>
                  </div>
                </Link>

                <Link href="/directory">
                  <div className="bg-[#FF77B7] hover:bg-[#FF77B7]/80 rounded-xl p-2 py-3 text-center transition-all duration-200 cursor-pointer hover:scale-105">
                    <MdOutlineLibraryBooks className="text-2xl mx-auto mb-1" />
                    <div className="text-sm font-medium">Directory</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Flight Arena Coming Soon */}
          <Card className="md:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 text-white backdrop-blur-xl shadow-lg overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400"></div>

            <CardHeader className="">
              <div className="flex items-center gap-2">
              <TbBuildingStadium className="text-2xl text-amber-500" />
                <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent flex flex-col gap-1 ">
                  The Flight Arena
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold self-start">
                    Coming in 2026
                  </span>
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-2 justify-between">

                <span className="text-gray-300 text-sm leading-relaxed">
                  <strong className="text-white">Compete with pilots</strong>{" "}
                  with gamified Infinite Flight Stats, earn badges, and climb
                  the leaderboard.
                </span>

                {/* Mini feature indicators */}
                <div className="flex gap-1 mt-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>

                  <Link href="https://youtu.be/dQw4w9WgXcQ?si=g_taiME19X9XZnzo" target="_blank" className="self-start mt-2 cursor-pointer">
                    <Button className="flex items-center gap-2 text-light bg-[#424549] hover:bg-[#424549]/80 rounded-full !px-5">
                      <TbBrandDiscord className="text-2xl" /> IFlytics Discord Soon
                    </Button>
                  </Link>
            </CardContent>
          </Card>

          <div className="md:col-span-1 relative group">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-400 to-green-500 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-400 to-green-500 rounded-lg"></div>

            <div className="p-1 h-full">
              <Card className="relative bg-[url('/findthepilotimg.png')] bg-cover bg-top-left text-white rounded-lg !h-full overflow-hidden">
                {/* Dark overlay with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-black/60"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Header section */}
                  <div className="text-center mt-4">
                    <div className="inline-flex flex-col items-center gap-2 bg-black/40 backdrop-blur-md py-3 px-6 rounded-2xl border border-white/20 shadow-2xl">
                      <div className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 drop-shadow-lg">
                        Find The Pilot
                      </div>
                      <div className="text-gray-200 text-sm font-medium">
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

          <Card className="dark:bg-gray-900 bg-gray-100 text-dark backdrop-blur-xl relative overflow-hidden">

          <TbBuildingAirport className="text-[20rem] absolute top-8 left-0 text-amber-500 opacity-10" />
          
            <CardHeader className="">
              <CardTitle className="text-2xl font-bold tracking-tight text-gray dark:text-white">
                Infinite Flight Community
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-400">
                Connect with pilots worldwide
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <span className="text-gray-700 dark:text-white tracking-tight leading-relaxed font-medium">
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
