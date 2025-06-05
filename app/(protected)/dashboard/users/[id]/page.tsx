import React from "react";
import { getUserProfileById } from "@/lib/supabase/user-actions";
import { getPilotServerSessions, getUserStats, matchATCRankToTitle } from "@/lib/actions";
import { FaStar, FaPlane, FaPlaneDeparture, FaArrowLeft, FaPlus } from "react-icons/fa";
import { BiSolidPlaneLand } from "react-icons/bi";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegClock } from "react-icons/fa";
import { PiArrowFatLineUpBold } from "react-icons/pi";
import { PiAirTrafficControlBold } from "react-icons/pi";
import { GiCaptainHatProfile } from "react-icons/gi";
import { convertMinutesToHours, numberWithCommas } from "@/lib/utils";
import Link from "next/link";

const ViewUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const userProfile = await getUserProfileById(id);
  const pilotServerSession = await getPilotServerSessions(userProfile.ifc_game_id);

  if (!userProfile) {
    return <div>User not found</div>;
  }

  const stats = await getUserStats(
    userProfile.ifc_username,
    userProfile.ifc_game_id
  );
  const userStats = stats?.result?.[0]; // Get the first (and likely only) user from results

  return (
    <main className="flex flex-col items-center gap-4 min-h-full w-full py-6">
      <header className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-dark py-0.5 bg-clip-text text-transparent tracking-tight">
          {userProfile.display_name}'s Profile
        </h1>
        <p className="text-gray-600">
          View their flight statistics and profile information
        </p>
      </header>
      <section className="flex justify-center items-center h-full w-full">
        <div className="flex flex-col md:flex-row gap-4 max-w-[1000px] w-full">
          <div className="flex-1 flex flex-col gap-4">
            <div className="self-start flex-1 flex flex-col gap-4 max-w-[500px] w-full px-4 bg-white rounded-lg shadow p-8">
              <header>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-dark py-0.5 bg-clip-text text-transparent tracking-tight">
                  {userProfile.display_name}
                </h2>
                <span className="text-gray-500 text-xs font-medium">
                  @{userProfile.ifc_username}
                </span>
              </header>

              <p className="p-4 bg-gray-100 rounded-lg text-gray-700 font-medium">
                {userProfile.bio ? userProfile.bio : "No bio for me 🤷‍♂️"}
              </p>

              <span className="text-gray-500 text-xs font-medium">
                Joined on{" "}
                {new Date(userProfile.created_at).toLocaleDateString()}
              </span>

              <Link
                href="/dashboard/users"
                className="text-light text-xs font-semibold bg-gray-800 rounded-lg px-4 py-2 text-center flex items-center justify-center gap-2 self-start"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back to Users
              </Link>
            </div>

            <div className="flex-1 flex flex-col gap-4 max-w-[500px] w-full px-4 bg-white rounded-lg shadow p-8">
              {pilotServerSession ? (
                <div className="space-y-4">
                  {/* Live Flight Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">
                        Currently Flying
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Expert Server</span>
                  </div>

                  {/* Infinite Flight Flight Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">Callsign</p>
                      <p className="font-bold text-blue-600">
                        {pilotServerSession.callsign}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">Altitude</p>
                      <p className="font-bold text-green-600">
                        {Math.round(
                          pilotServerSession.altitude
                        ).toLocaleString()}{" "}
                        ft
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600">Speed</p>
                      <p className="font-bold text-purple-600">
                        {Math.round(pilotServerSession.speed)} kts
                      </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-600">Heading</p>
                      <p className="font-bold text-orange-600">
                        {Math.round(pilotServerSession.heading)}°
                      </p>
                    </div>
                    
                    {
                      pilotServerSession.isConnected ? (
                        <div className="col-span-2 bg-gray-100 text-gray-600 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                          Currently Flying Live <FaLocationDot className="text-gray-600"/>
                        </div>
                      ) : (
                        <div className="col-span-2 bg-blue-400 text-white p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                          Powered with<b>Autopilot Plus</b> <FaPlus className="text-white"/>
                        </div>
                      )
                    }
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🛬</div>
                  <h3 className="text-lg font-semibold text-gray-600">
                    Not Flying
                  </h3>
                  <p className="text-sm text-gray-500">
                    User is not currently on Expert Server
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 max-w-[500px] w-full px-4 bg-gray-800 rounded-lg shadow p-8">
            {userStats ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-4xl font-bold text-white mb-4 tracking-tight text-center">
                  Infinite Flight Stats
                </h3>

                {/* Grade and Basic Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      userStats.grade === 5
                        ? "bg-yellow-500"
                        : userStats.grade === 4
                        ? "bg-green-500"
                        : userStats.grade === 3
                        ? "bg-purple-500"
                        : userStats.grade === 2
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  >
                    <FaStar className="text-2xl text-white" />
                    <div>
                      <p className="text-sm text-white font-medium">Grade</p>
                      <p className="text-xl font-bold text-white">
                        {userStats.grade}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg">
                    <FaPlaneDeparture className="text-2xl text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-300 font-medium">
                        Flights
                      </p>
                      <p className="text-xl font-bold text-white">
                        {numberWithCommas(userStats.onlineFlights)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flight Time and Landings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg">
                    <FaRegClock className="text-2xl text-green-400" />
                    <div>
                      <p className="text-sm text-gray-300 font-medium">
                        Flight Time
                      </p>
                      <p className="text-xl font-bold text-white">
                        {convertMinutesToHours(userStats.flightTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg">
                    <BiSolidPlaneLand className="text-2xl text-orange-400" />
                    <div>
                      <p className="text-sm text-gray-300 font-medium">
                        Landings
                      </p>
                      <p className="text-xl font-bold text-white">
                        {numberWithCommas(userStats.landingCount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* XP and Violations */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg">
                    <PiArrowFatLineUpBold className="text-2xl text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-300 font-medium">XP</p>
                      <p className="text-xl font-bold text-white">
                        {numberWithCommas(userStats.xp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg">
                    <FaPlane className="text-2xl text-red-400" />
                    <div>
                      <p className="text-sm text-gray-300 font-medium">
                        Violations
                      </p>
                      <p className="text-xl font-bold text-white">
                        {userStats.violations}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ATC Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg">
                    <PiAirTrafficControlBold className="text-2xl text-indigo-400" />
                    <div>
                      <p className="text-sm text-gray-300 font-medium">
                        ATC Operations
                      </p>
                      <p className="text-xl font-bold text-white">
                        {numberWithCommas(userStats.atcOperations)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-600 rounded-lg">
                    <GiCaptainHatProfile className="text-2xl text-amber-400" />
                    <div>
                      <p className="text-sm text-gray-300 font-medium">
                        ATC Rank
                      </p>
                      <p className="text-xl font-bold text-white">
                        {await matchATCRankToTitle(userStats.atcRank.toString())}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Virtual Organization */}
                {userStats.virtualOrganization ? (
                  <div className="mt-4 p-4 bg-gray-600 rounded-lg border-4 border-light">
                    <p className="text-sm text-gray-300 font-medium mb-1">
                      Virtual Organization
                    </p>
                    <p className="text-lg font-bold text-light">
                      {userStats.virtualOrganization}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-gray-600 rounded-lg border-4 border-light">
                    <p className="text-sm text-gray-300 font-medium mb-1">
                      Virtual Organization
                    </p>
                    <p className="text-lg font-bold text-light">N/A</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FaPlane className="text-4xl mb-2 opacity-50" />
                <p className="text-lg font-medium">
                  No flight statistics available
                </p>
                <p className="text-sm">
                  This user may not have any recorded flights
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ViewUserPage;
