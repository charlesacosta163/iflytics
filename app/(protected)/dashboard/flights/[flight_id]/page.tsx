import React from "react";
import { getUser } from "@/lib/supabase/user-actions";
import { getUserFlightInfo, getAircraftAndLivery, getInfiniteFlightAirportCoordinates, getInfiniteFlightRouteDistanceWithCoordinates } from "@/lib/actions";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import { convertMinutesToHours, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FaPlane,
  FaClock,
  FaMapMarkerAlt,
  FaServer,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSun,
  FaMoon,
  FaLandmark,
  FaRoute,
} from "react-icons/fa";
import {
  LuPlaneTakeoff,
  LuPlaneLanding,
  LuPlane,
  LuClock,
  LuMapPin,
} from "react-icons/lu";
import { IoSparklesOutline } from "react-icons/io5";
import { MdFlight } from "react-icons/md";
import UserFlightMap from "@/components/dashboard-ui/flights/maps/user-flight-map";

const FlightPage = async ({
  params,
}: {
  params: Promise<{ flight_id: string }>;
}) => {
  const { flight_id } = await params;

  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const ifcUserId = user.user_metadata.ifcUserId;

  const flight = await getUserFlightInfo(ifcUserId, flight_id);

  const { latitude_deg: originLatitude, longitude_deg: originLongitude } = await getInfiniteFlightAirportCoordinates(flight.originAirport);
  const { latitude_deg: destinationLatitude, longitude_deg: destinationLongitude } = await getInfiniteFlightAirportCoordinates(flight.destinationAirport);

  const distance = await getInfiniteFlightRouteDistanceWithCoordinates([originLongitude, originLatitude], [destinationLongitude, destinationLatitude]);

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="p-8 text-center">
              <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Flight Not Found
              </h1>
              <p className="text-gray-300 mb-4">
                The flight with ID {flight_id} could not be found.
              </p>
              <Link
                href="/dashboard/flights"
                className="bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Back to Flights
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fetch aircraft and livery data
  const aircraftData = await getAircraftAndLivery(
    flight.aircraftId,
    flight.liveryId
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 rounded-2xl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/flights"
            className="bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Flights
          </Link>
          <div className="border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
            Flight Details
          </div>
        </div>

        {/* Flight Header */}
        <Card className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border-blue-500/30 relative overflow-hidden">
          <MdFlight className="absolute -top-10 right-10 text-white/10 text-[12rem] rotate-45" />
          <CardHeader className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <FaPlane className="text-blue-400" />
                  {flight.callsign}
                </CardTitle>
                <p className="text-gray-300 mt-2 flex items-center gap-2">
                  <FaCalendarAlt className="w-4 h-4" />
                  {formatDate(flight.created)}
                </p>
              </div>
              <div className="flex  gap-2">
                <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FaServer className="w-3 h-3" />
                  {flight.server}
                </div>
                <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <IoSparklesOutline className="w-3 h-3" />
                  {flight.xp} XP
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Aircraft Info */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <LuPlane className="text-blue-400" />
                Aircraft
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Image
                  src={`/images/aircraft/${matchAircraftNameToImage(
                    aircraftData?.aircraftName || ""
                  )}`}
                  alt="Aircraft"
                  width={200}
                  height={150}
                  className="mx-auto rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-white font-semibold">
                    {aircraftData?.aircraftName || "Unknown Aircraft"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {aircraftData?.liveryName || "Unknown Livery"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Info */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-400" />
                Route
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 justify-between h-full">
              <div className="flex justify-between gap-4 items-center">
                <div className="flex items-center gap-3">
                  <LuPlaneTakeoff className="text-green-400 w-5 h-5" />
                  <div>
                    <p className="text-white font-bold tracking-tight text-xl">
                      {flight.originAirport}
                    </p>
                    <p className="text-gray-400 text-sm">Origin</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <LuPlaneLanding className="text-red-400 w-5 h-5" />
                  <div>
                    <p className="text-white font-bold tracking-tight text-xl">
                      {flight.destinationAirport}
                    </p>
                    <p className="text-gray-400 text-sm">Destination</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaRoute className="text-blue-400 w-4 h-4" />
                  <span className="text-gray-300 font-semibold">Distance</span>
                </div>
                <span className="text-white font-bold tracking-tight text-2xl">{distance.toFixed(2)} NM</span>
              </div>
              {flight.originAirport === flight.destinationAirport && (
                <div className="border border-yellow-500/30 text-yellow-400 w-full justify-center px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FaLandmark className="w-3 h-3" />
                  Pattern Work
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flight Time */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <FaClock className="text-purple-400" />
                Flight Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FaSun className="text-yellow-400 w-4 h-4" />
                    <span className="text-gray-300">Day Time</span>
                  </div>
                  <span className="text-white font-semibold">
                    {convertMinutesToHours(flight.dayTime)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FaMoon className="text-blue-400 w-4 h-4" />
                    <span className="text-gray-300">Night Time</span>
                  </div>
                  <span className="text-white font-semibold">
                    {convertMinutesToHours(flight.nightTime)}
                  </span>
                </div>

                <hr className="border-gray-600" />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <LuClock className="text-green-400 w-4 h-4" />
                    <span className="text-gray-300 font-semibold">
                      Total Time
                    </span>
                  </div>
                  <span className="text-white font-bold text-lg">
                    {convertMinutesToHours(flight.totalTime)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-500/30">
            <CardContent className="p-6 text-center">
              <LuPlaneLanding className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {flight.landingCount}
              </p>
              <p className="text-green-300 text-sm">Landings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <IoSparklesOutline className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{flight.xp}</p>
              <p className="text-yellow-300 text-sm">Experience Points</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <LuMapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {flight.worldType === 1
                  ? "Live"
                  : flight.worldType === 3
                  ? "Expert"
                  : "Training"}
              </p>
              <p className="text-blue-300 text-sm">Server</p>
            </CardContent>
          </Card>
        </div>

        {/* Violations */}
        {flight.violations && flight.violations.length > 0 && (
          <Card className="bg-red-900/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-xl text-red-400 flex items-center gap-2">
                <FaExclamationTriangle />
                Violations ({flight.violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flight.violations.map((violation: any, index: number) => (
                  <div
                    key={index}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="text-red-400 font-semibold">
                          {violation.type}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {violation.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                          Level {violation.level}
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatDate(violation.created)}
                        </p>
                        {violation.issuedBy && (
                          <p className="text-gray-500 text-xs">
                            by {violation.issuedBy.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
                  )}

          {/* Flight Route Map */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-400" />
                Flight Route
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 w-full">
                <UserFlightMap
                  flightId={flight.id}
                  originAirport={flight.originAirport}
                  destinationAirport={flight.destinationAirport}
                  originCoordinates={[originLongitude, originLatitude]}
                  destinationCoordinates={[destinationLongitude, destinationLatitude]}
                  className="rounded-b-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

export default FlightPage;
