import React from "react";
import { Metadata } from "next";
import { getUserProfileById } from "@/lib/supabase/user-actions";
import {
  getPilotServerSessions,
  getUserStats,
  matchATCRankToTitle,
} from "@/lib/actions";
import {
  FaStar,
  FaPlane,
  FaPlaneDeparture,
  FaArrowLeft,
  FaPlus,
  FaChartLine,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { BiSolidPlaneLand } from "react-icons/bi";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegClock } from "react-icons/fa";
import { PiArrowFatLineUpBold } from "react-icons/pi";
import { PiAirTrafficControlBold } from "react-icons/pi";
import { GiCaptainHatProfile } from "react-icons/gi";
import { convertMinutesToHours, numberWithCommas, cn } from "@/lib/utils";
import { customUserImages } from "@/lib/data";
import Link from "next/link";
import ProfileUserFlightMap from "@/components/dashboard-ui/flights/maps/profile-user-flight-map";
import { Card } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch user data in the metadata function
    const userProfile = await getUserProfileById(id);
    const displayName =
      userProfile?.display_name || userProfile?.ifc_game_id || "Unknown Pilot";

    return {
      title: `${displayName} - Profile | IFlytics`,
      description: `View ${displayName}'s Infinite Flight statistics including flight hours, landings, XP, grade level, and ATC operations. Track pilot performance and aviation achievements on IFlytics.`,
      keywords: `infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history, ${displayName}, iflytics user`,
      openGraph: {
        title: `${displayName} - IFlytics Pilot Profile`,
        description: `View ${displayName}'s comprehensive Infinite Flight statistics and aviation achievements.`,
        type: "profile",
        url: `/dashboard/users/${id}`,
      },
      twitter: {
        card: "summary",
        title: `${displayName} - IFlytics Pilot Profile`,
        description: `View ${displayName}'s Infinite Flight statistics and aviation achievements.`,
      },
    };
  } catch (error) {
    // Fallback metadata if user data can't be fetched
    return {
      title: "Pilot Profile - IFlytics",
      description:
        "View pilot statistics and aviation achievements on IFlytics.",
      keywords:
        "infinite flight, flight tracking, aviation analytics, pilot statistics",
    };
  }
}

const ViewUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const userProfile = await getUserProfileById(id);
  const pilotServerSession = await getPilotServerSessions(
    userProfile.ifc_game_id
  );

  // console.log(pilotServerSession)

  if (!userProfile) {
    return <div>User not found</div>;
  }

  const stats = await getUserStats(
    userProfile.ifc_username,
    userProfile.ifc_game_id
  );
  const userStats = stats?.result?.[0]; // Get the first (and likely only) user from results
  const userImage = customUserImages.find(
    (image) => image.username === userProfile.ifc_username
  )?.image;

  return (
    <main className="flex flex-col items-center gap-4 min-h-full w-full py-4 md:py-6 px-2 md:px-4">
      <Card className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-[20px] md:rounded-[25px] p-4 md:p-6 w-full max-w-[1000px]">
        <header className="flex flex-col items-center gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-800 dark:text-gray-100 text-center">
            {userProfile.display_name}'s Profile
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium text-center">
            View their flight statistics and profile information
          </p>
        </header>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[1000px]">
        <section className="col-span-2 flex justify-center items-center h-full w-full">
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="flex-1 flex flex-col gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800/30 rounded-[20px] md:rounded-[25px] p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex gap-3 md:gap-4 items-center mb-4">
                  <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userProfile.display_name}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full"
                      />
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-3xl md:text-4xl">
                        🤨
                      </div>
                    )}
                  </div>
                  <header>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-800 dark:text-gray-100">
                      {userProfile.display_name}
                    </h2>
                    <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-bold">
                      @{userProfile.ifc_username}
                    </span>
                  </header>
                </div>

                <p className="p-3 md:p-4 bg-white/60 dark:bg-gray-700/50 rounded-[12px] md:rounded-[15px] text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base border border-blue-200 dark:border-blue-800/30">
                  {userProfile.bio ? userProfile.bio : "No bio for me 🤷‍♂️"}
                </p>

                <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-bold mt-2">
                  Joined on{" "}
                  {new Date(userProfile.created_at).toLocaleDateString()}
                </span>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4">
                  <Link
                    href="/dashboard/users"
                    className="text-white text-xs md:text-sm font-bold bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-[12px] md:rounded-[15px] px-4 py-2.5 md:py-3 text-center flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                    Back to Users
                  </Link>
                  <Link
                    target="_blank"
                    href={`https://community.infiniteflight.com/u/${userProfile.ifc_username}/summary`}
                    className="text-white text-xs md:text-sm font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-[12px] md:rounded-[15px] px-4 py-2.5 md:py-3 text-center flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaExternalLinkAlt className="w-3 h-3 md:w-4 md:h-4" />
                    View on IFC
                  </Link>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800/30 rounded-[20px] md:rounded-[25px] p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                {pilotServerSession ? (
                  <div className="space-y-3 md:space-y-4">
                    {/* Live Flight Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm md:text-base font-bold text-green-600 dark:text-green-400">
                          Currently Flying
                        </span>
                      </div>
                      <span className="text-xs md:text-sm font-bold bg-white/60 dark:bg-gray-700/50 px-3 py-1 rounded-[8px] text-gray-700 dark:text-gray-300 border border-green-200 dark:border-green-800/30">
                        Expert Server
                      </span>
                    </div>

                    {/* Infinite Flight Flight Info */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <div className="text-center p-3 md:p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20 rounded-[12px] md:rounded-[15px] border-2 border-blue-300 dark:border-blue-700/30">
                        <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-bold">Callsign</p>
                        <p className="text-base md:text-lg font-black text-blue-600 dark:text-blue-400 tracking-tight">
                          {pilotServerSession.callsign}
                        </p>
                      </div>
                      <div className="text-center p-3 md:p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-500/20 dark:to-green-600/20 rounded-[12px] md:rounded-[15px] border-2 border-green-300 dark:border-green-700/30">
                        <p className="text-xs md:text-sm text-green-700 dark:text-green-300 font-bold">Altitude</p>
                        <p className="text-base md:text-lg font-black text-green-600 dark:text-green-400 tracking-tight">
                          {Math.round(
                            pilotServerSession.altitude
                          ).toLocaleString()}{" "}
                          ft
                        </p>
                      </div>
                      <div className="text-center p-3 md:p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 rounded-[12px] md:rounded-[15px] border-2 border-purple-300 dark:border-purple-700/30">
                        <p className="text-xs md:text-sm text-purple-700 dark:text-purple-300 font-bold">Speed</p>
                        <p className="text-base md:text-lg font-black text-purple-600 dark:text-purple-400 tracking-tight">
                          {Math.round(pilotServerSession.speed)} kts
                        </p>
                      </div>
                      <div className="text-center p-3 md:p-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-600/20 rounded-[12px] md:rounded-[15px] border-2 border-orange-300 dark:border-orange-700/30">
                        <p className="text-xs md:text-sm text-orange-700 dark:text-orange-300 font-bold">Heading</p>
                        <p className="text-base md:text-lg font-black text-orange-600 dark:text-orange-400 tracking-tight">
                          {Math.round(pilotServerSession.heading)}°
                        </p>
                      </div>

                      {pilotServerSession.isConnected ? (
                        <div className="col-span-2 bg-white/60 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 p-3 rounded-[12px] md:rounded-[15px] flex items-center justify-center gap-2 text-sm md:text-base font-bold border-2 border-gray-300 dark:border-gray-600">
                          Currently Flying Live{" "}
                          <FaLocationDot className="text-gray-700 dark:text-gray-300" />
                        </div>
                      ) : (
                        <div className="col-span-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white p-3 rounded-[12px] md:rounded-[15px] flex items-center justify-center gap-2 text-sm md:text-base font-bold border-2 border-blue-400 dark:border-blue-500 shadow-md">
                          Powered with <b>Autopilot Plus</b>{" "}
                          <FaPlus className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <div className="text-4xl md:text-5xl mb-3">🛬</div>
                    <h3 className="text-base md:text-lg font-black text-gray-700 dark:text-gray-300 tracking-tight">
                      Not Flying
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                      User is not currently on Expert Server
                    </p>
                  </div>
                )}
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800/30 rounded-[20px] md:rounded-[25px] p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
              {userStats ? (
                <div className="flex flex-col gap-3 md:gap-4">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-800 dark:text-gray-100 mb-2 md:mb-4 tracking-tight text-center flex items-center flex-wrap justify-center gap-2">
                    <FaChartLine className="text-amber-600 dark:text-amber-400" /> Infinite Flight{" "}
                    <span className="text-amber-600 dark:text-amber-400">Stats</span>
                  </h3>

                  {/* Grade and Basic Stats */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div
                      className={cn(
                        "flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-[12px] md:rounded-[15px] border-2 shadow-md",
                        userStats.grade === 5
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 border-yellow-500 dark:border-yellow-600"
                          : userStats.grade === 4
                          ? "bg-gradient-to-br from-green-400 to-green-500 dark:from-green-500 dark:to-green-600 border-green-500 dark:border-green-600"
                          : userStats.grade === 3
                          ? "bg-gradient-to-br from-purple-400 to-purple-500 dark:from-purple-500 dark:to-purple-600 border-purple-500 dark:border-purple-600"
                          : userStats.grade === 2
                          ? "bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 border-blue-500 dark:border-blue-600"
                          : "bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600 border-gray-500 dark:border-gray-600"
                      )}
                    >
                      <FaStar className="text-xl md:text-2xl text-white shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm text-white font-bold">Grade</p>
                        <p className="text-lg md:text-xl font-black text-white tracking-tight">
                          {userStats.grade}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20 rounded-[12px] md:rounded-[15px] border-2 border-blue-300 dark:border-blue-700/30">
                      <FaPlaneDeparture className="text-xl md:text-2xl text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-bold">
                          Flights
                        </p>
                        <p className="text-lg md:text-xl font-black text-blue-700 dark:text-blue-300 tracking-tight">
                          {numberWithCommas(userStats.onlineFlights)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Flight Time and Landings */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-500/20 dark:to-green-600/20 rounded-[12px] md:rounded-[15px] border-2 border-green-300 dark:border-green-700/30">
                      <FaRegClock className="text-xl md:text-2xl text-green-600 dark:text-green-400 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm text-green-700 dark:text-green-300 font-bold">
                          Flight Time
                        </p>
                        <p className="text-lg md:text-xl font-black text-green-700 dark:text-green-300 tracking-tight">
                          {convertMinutesToHours(userStats.flightTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-600/20 rounded-[12px] md:rounded-[15px] border-2 border-orange-300 dark:border-orange-700/30">
                      <BiSolidPlaneLand className="text-xl md:text-2xl text-orange-600 dark:text-orange-400 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm text-orange-700 dark:text-orange-300 font-bold">
                          Landings
                        </p>
                        <p className="text-lg md:text-xl font-black text-orange-700 dark:text-orange-300 tracking-tight">
                          {numberWithCommas(userStats.landingCount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* XP and Violations */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 rounded-[12px] md:rounded-[15px] border-2 border-purple-300 dark:border-purple-700/30">
                      <PiArrowFatLineUpBold className="text-xl md:text-2xl text-purple-600 dark:text-purple-400 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm text-purple-700 dark:text-purple-300 font-bold">XP</p>
                        <p className="text-lg md:text-xl font-black text-purple-700 dark:text-purple-300 tracking-tight">
                          {numberWithCommas(userStats.xp)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-500/20 dark:to-red-600/20 rounded-[12px] md:rounded-[15px] border-2 border-red-300 dark:border-red-700/30 overflow-hidden">
                      <FaPlane className="text-xl md:text-2xl text-red-600 dark:text-red-400 shrink-0" />
                      <div className="">
                        <p className="text-xs md:text-sm text-red-700 dark:text-red-300 font-bold">
                          Violations
                        </p>
                        <p className="text-lg md:text-xl font-black text-red-700 dark:text-red-300 tracking-tight">
                          {userProfile.ifc_username.toLowerCase() === "daeng-e" ? 3391713237872622 : 
                          userProfile.ifc_username.toLowerCase() === "veloist" ? 724223372373727 : 
                          userProfile.ifc_username.toLowerCase() === "ka77" ? 551335555555555 : 
                          userProfile.ifc_username.toLowerCase() === "vanillacakepeople" ? 462672632626233 : 
                          userProfile.ifc_username.toLowerCase() === "charlesacosta163" ? "User is Banned" : 
                          userProfile.ifc_username.toLowerCase() === "jeppyg" ? 266326263626162 : 
                          userProfile.ifc_username.toLowerCase() === "tintin" ? 5626173232246247 : 
                          userStats.violations}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ATC Stats */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-600/20 rounded-[12px] md:rounded-[15px] border-2 border-indigo-300 dark:border-indigo-700/30">
                      <PiAirTrafficControlBold className="text-xl md:text-2xl text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm text-indigo-700 dark:text-indigo-300 font-bold">
                          ATC Operations
                        </p>
                        <p className="text-lg md:text-xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
                          {numberWithCommas(userStats.atcOperations)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-500/20 dark:to-amber-600/20 rounded-[12px] md:rounded-[15px] border-2 border-amber-300 dark:border-amber-700/30">
                      <GiCaptainHatProfile className="text-xl md:text-2xl text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm text-amber-700 dark:text-amber-300 font-bold">
                          ATC Rank
                        </p>
                        <p className="text-lg md:text-xl font-black text-amber-700 dark:text-amber-300 tracking-tight">
                          {await matchATCRankToTitle(
                            userStats.atcRank.toString()
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Virtual Organization */}
                  {userStats.virtualOrganization ? (
                    <div className="mt-2 md:mt-4 p-3 md:p-4 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-500/20 dark:to-cyan-600/20 rounded-[12px] md:rounded-[15px] border-2 border-cyan-300 dark:border-cyan-700/30">
                      <p className="text-xs md:text-sm text-cyan-700 dark:text-cyan-300 font-bold mb-1">
                        Virtual Organization
                      </p>
                      <p className="text-base md:text-lg font-black text-cyan-700 dark:text-cyan-300 tracking-tight">
                        {userStats.virtualOrganization}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 md:mt-4 p-3 md:p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600/20 dark:to-gray-700/20 rounded-[12px] md:rounded-[15px] border-2 border-gray-300 dark:border-gray-600/30">
                      <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-bold mb-1">
                        Virtual Organization
                      </p>
                      <p className="text-base md:text-lg font-black text-gray-700 dark:text-gray-300 tracking-tight">N/A</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400 py-6 md:py-8">
                  <FaPlane className="text-4xl md:text-5xl mb-3 opacity-50" />
                  <p className="text-base md:text-lg font-black tracking-tight">
                    No flight statistics available
                  </p>
                  <p className="text-sm md:text-base font-medium">
                    This user may not have any recorded flights
                  </p>
                </div>
              )}
            </Card>
            {/* {pilotServerSession && (
              <div className="flex-1 flex flex-col gap-4 max-w-[500px] w-full px-4 bg-white rounded-lg shadow p-8">
                <ProfileUserFlightMap flightData={pilotServerSession} userDisplayName={userProfile.display_name} />
              </div>
            )} */}
          </div>
        </section>
        {pilotServerSession && (
          <section className="col-span-2 flex justify-center items-center h-full w-full">
            <Card className="flex-1 flex flex-col gap-4 w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800/30 rounded-[20px] md:rounded-[25px] p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow max-w-[1000px] h-[400px] md:h-[500px]">
              <ProfileUserFlightMap
                flightData={pilotServerSession}
                userDisplayName={userProfile.display_name}
              />
            </Card>
          </section>
        )}
      </div>
    </main>
  );
};

export default ViewUserPage;
