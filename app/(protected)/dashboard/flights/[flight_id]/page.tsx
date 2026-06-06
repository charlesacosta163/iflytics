import React from "react";
import { getUser } from "@/lib/supabase/user-actions";
import {
  getUserFlightInfo,
  getAircraftAndLivery,
  getInfiniteFlightAirportCoordinates,
  getInfiniteFlightRouteDistanceWithCoordinates,
} from "@/lib/actions";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import { convertMinutesToHours, formatDate, cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaPlane,
  FaMapMarkerAlt,
  FaServer,
  FaRegCalendarAlt,
  FaExclamationTriangle,
  FaArrowLeft,
  FaRegClock,
  FaLandmark,
  FaRoute,
} from "react-icons/fa";
import { FaRegMoon, FaRegSun } from "react-icons/fa6";
import {
  LuPlaneTakeoff,
  LuPlaneLanding,
  LuPlane,
  LuMapPin,
} from "react-icons/lu";
import { IoSparklesOutline } from "react-icons/io5";
import { BiSolidPlaneLand } from "react-icons/bi";
import UserFlightMap from "@/components/dashboard-ui/flights/maps/user-flight-map";

const MetricTile = ({
  label,
  value,
  icon,
  color = "green",
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: "green" | "amber" | "blue"
}) => {
  const styles = {
    green: {
      card: "bg-green-50/70 dark:bg-green-900/20",
      icon: "bg-green-500 dark:bg-green-600",
      value: "text-green-600 dark:text-green-400",
      label: "text-green-700 dark:text-green-300",
    },
    amber: {
      card: "bg-amber-50/70 dark:bg-amber-900/20",
      icon: "bg-amber-500 dark:bg-amber-600",
      value: "text-amber-600 dark:text-amber-400",
      label: "text-amber-700 dark:text-amber-300",
    },
    blue: {
      card: "bg-blue-50/70 dark:bg-blue-900/20",
      icon: "bg-blue-500 dark:bg-blue-600",
      value: "text-blue-600 dark:text-blue-400",
      label: "text-blue-700 dark:text-blue-300",
    },
  }

  const s = styles[color]

  return (
    <Card className={cn(s.card, "!shadow-none rounded-[20px] md:rounded-[25px] border-0")}>
      <CardContent className="p-4 md:p-6 flex flex-col items-center gap-2 text-center">
        <div className={cn("p-2.5 rounded-[12px] text-white", s.icon)}>{icon}</div>
        <p className={cn("text-2xl md:text-3xl font-black tracking-tight", s.value)}>{value}</p>
        <p className={cn("text-xs md:text-sm font-semibold", s.label)}>{label}</p>
      </CardContent>
    </Card>
  )
}

const TimeRow = ({
  label,
  value,
  icon,
  color = "green",
}: {
  label: string
  value: string
  icon: React.ReactNode
  color?: "yellow" | "blue" | "green"
}) => {
  const iconColors = {
    yellow: "text-amber-500 dark:text-amber-400",
    blue: "text-blue-500 dark:text-blue-400",
    green: "text-green-500 dark:text-green-400",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        "bg-white dark:bg-gray-800/50",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[15px] md:rounded-[18px]",
        "p-3 md:p-4"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("shrink-0 text-base", iconColors[color])}>{icon}</span>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="text-sm md:text-base font-black text-gray-900 dark:text-gray-100 shrink-0">
        {value}
      </span>
    </div>
  )
}

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

  if (!flight) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-50/70 dark:bg-red-900/20 !shadow-none rounded-[20px] md:rounded-[25px] border-0">
            <CardContent className="p-8 text-center">
              <FaExclamationTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                Flight Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The flight with ID {flight_id} could not be found.
              </p>
              <Link
                href="/dashboard/flights"
                className={cn(
                  "inline-flex items-center gap-2",
                  "bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500",
                  "text-white font-semibold",
                  "px-4 py-2 rounded-[12px] md:rounded-[15px] text-sm"
                )}
              >
                <FaArrowLeft className="w-4 h-4" />
                Back to Flights
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { latitude_deg: originLatitude, longitude_deg: originLongitude } =
    await getInfiniteFlightAirportCoordinates(flight.originAirport);
  const { latitude_deg: destinationLatitude, longitude_deg: destinationLongitude } =
    await getInfiniteFlightAirportCoordinates(flight.destinationAirport);

  const distance = await getInfiniteFlightRouteDistanceWithCoordinates(
    [originLongitude, originLatitude],
    [destinationLongitude, destinationLatitude]
  );

  const aircraftData = await getAircraftAndLivery(flight.liveryId);

  const worldTypeLabel =
    flight.worldType === 1 ? "Live" : flight.worldType === 3 ? "Expert" : "Training";

  const isPatternWork = flight.originAirport === flight.destinationAirport;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link
            href="/dashboard/flights"
            className={cn(
              "inline-flex items-center gap-2",
              "bg-white dark:bg-gray-800/50",
              "border-2 border-gray-200 dark:border-gray-700",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "text-gray-700 dark:text-gray-200 font-semibold",
              "px-4 py-2 rounded-[12px] md:rounded-[15px] text-sm"
            )}
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Flights
          </Link>
          <Badge
            variant="outline"
            className="border-2 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 font-bold rounded-[12px] px-3 py-1"
          >
            Flight Details
          </Badge>
        </div>

        {/* Flight Header */}
        <Card className="bg-sky-50/70 dark:bg-sky-900/20 !shadow-none rounded-[20px] md:rounded-[25px] border-0 overflow-hidden">
          <CardHeader className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 bg-sky-500 dark:bg-sky-600 rounded-[12px] md:rounded-[15px] shrink-0">
                  <FaPlane className="text-white text-xl md:text-2xl" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100 truncate">
                    {flight.callsign}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <FaRegCalendarAlt className="w-4 h-4 shrink-0" />
                    {formatDate(flight.created)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500 dark:bg-green-600 text-white font-bold rounded-[12px] px-3 py-1.5 flex items-center gap-1.5">
                  <FaServer className="w-3.5 h-3.5" />
                  {flight.server}
                </Badge>
                <Badge className="bg-amber-500 dark:bg-amber-600 text-white font-bold rounded-[12px] px-3 py-1.5 flex items-center gap-1.5">
                  <IoSparklesOutline className="w-3.5 h-3.5" />
                  {flight.xp} XP
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Aircraft Info */}
          <Card className="bg-purple-50/70 dark:bg-purple-900/20 !shadow-none rounded-[20px] md:rounded-[25px] border-0">
            <CardHeader className="px-4 md:px-6 pb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-purple-500 dark:bg-purple-600 rounded-[12px] shrink-0">
                  <LuPlane className="text-white text-lg" />
                </div>
                <CardTitle className="text-base md:text-lg font-bold text-purple-900 dark:text-purple-100">
                  Aircraft
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6 space-y-4">
              <div
                className={cn(
                  "bg-white dark:bg-gray-800/50",
                  "border-2 border-gray-200 dark:border-gray-700",
                  "rounded-[20px] p-4 text-center"
                )}
              >
                <Image
                  src={`/images/aircraft/${matchAircraftNameToImage(
                    aircraftData?.aircraftName || ""
                  )}`}
                  alt="Aircraft"
                  width={200}
                  height={150}
                  className="mx-auto rounded-[12px]"
                />
              </div>
              <div
                className={cn(
                  "bg-white dark:bg-gray-800/50",
                  "border-2 border-gray-200 dark:border-gray-700",
                  "rounded-[20px] p-4"
                )}
              >
                <p className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100">
                  {aircraftData?.aircraftName || "Unknown Aircraft"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {aircraftData?.liveryName || "Unknown Livery"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Route Info */}
          <Card className="bg-red-50/70 dark:bg-red-900/20 !shadow-none rounded-[20px] md:rounded-[25px] border-0">
            <CardHeader className="px-4 md:px-6 pb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-red-500 dark:bg-red-600 rounded-[12px] shrink-0">
                  <FaMapMarkerAlt className="text-white text-lg" />
                </div>
                <CardTitle className="text-base md:text-lg font-bold text-red-900 dark:text-red-100">
                  Route
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6 flex flex-col gap-3 h-full">
              <div
                className={cn(
                  "bg-white dark:bg-gray-800/50",
                  "border-2 border-gray-200 dark:border-gray-700",
                  "rounded-[20px] p-4"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <LuPlaneTakeoff className="text-green-500 dark:text-green-400 w-4 h-4" />
                      <p className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Origin
                      </p>
                    </div>
                    <p className="text-xl md:text-2xl font-black tracking-tighter text-red-600 dark:text-red-400 truncate">
                      {flight.originAirport}
                    </p>
                  </div>
                  <div className="text-gray-300 dark:text-gray-600 text-lg shrink-0">→</div>
                  <div className="flex-1 min-w-0 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <LuPlaneLanding className="text-orange-500 dark:text-orange-400 w-4 h-4" />
                      <p className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Destination
                      </p>
                    </div>
                    <p className="text-xl md:text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-400 truncate">
                      {flight.destinationAirport}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "flex items-center justify-between",
                  "bg-white dark:bg-gray-800/50",
                  "border-2 border-gray-200 dark:border-gray-700",
                  "rounded-[15px] md:rounded-[18px]",
                  "p-3 md:p-4"
                )}
              >
                <div className="flex items-center gap-2">
                  <FaRoute className="text-blue-500 dark:text-blue-400 w-4 h-4" />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Distance</span>
                </div>
                <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-gray-100">
                  {distance.toFixed(2)} NM
                </span>
              </div>

              {isPatternWork && (
                <Badge className="w-full justify-center bg-amber-500 dark:bg-amber-600 text-white font-bold rounded-[12px] px-3 py-2 flex items-center gap-2">
                  <FaLandmark className="w-3.5 h-3.5" />
                  Pattern Work
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Flight Time */}
          <Card className="bg-blue-50/70 dark:bg-blue-900/20 !shadow-none rounded-[20px] md:rounded-[25px] border-0">
            <CardHeader className="px-4 md:px-6 pb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-[12px] shrink-0">
                  <FaRegClock className="text-white text-lg" />
                </div>
                <CardTitle className="text-base md:text-lg font-bold text-blue-900 dark:text-blue-100">
                  Flight Time
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6 space-y-2 md:space-y-3">
              <TimeRow
                label="Day Time"
                value={convertMinutesToHours(flight.dayTime)}
                icon={<FaRegSun className="w-4 h-4" />}
                color="yellow"
              />
              <TimeRow
                label="Night Time"
                value={convertMinutesToHours(flight.nightTime)}
                icon={<FaRegMoon className="w-4 h-4" />}
                color="blue"
              />
              <TimeRow
                label="Total Time"
                value={convertMinutesToHours(flight.totalTime)}
                icon={<FaRegClock className="w-4 h-4" />}
                color="green"
              />
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <MetricTile
            label="Landings"
            value={flight.landingCount}
            icon={<BiSolidPlaneLand className="w-6 h-6" />}
            color="green"
          />
          <MetricTile
            label="Experience Points"
            value={flight.xp}
            icon={<IoSparklesOutline className="w-6 h-6" />}
            color="amber"
          />
          <MetricTile
            label="Server"
            value={worldTypeLabel}
            icon={<LuMapPin className="w-6 h-6" />}
            color="blue"
          />
        </div>

        {/* Violations */}
        {flight.violations && flight.violations.length > 0 && (
          <Card className="bg-red-50/70 dark:bg-red-900/20 !shadow-none rounded-[20px] md:rounded-[25px] border-0">
            <CardHeader className="px-4 md:px-6 pb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-red-500 dark:bg-red-600 rounded-[12px] shrink-0">
                  <FaExclamationTriangle className="text-white text-lg" />
                </div>
                <CardTitle className="text-base md:text-lg font-bold text-red-700 dark:text-red-300">
                  Violations ({flight.violations.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="space-y-3">
                {flight.violations.map((violation: any, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "bg-white dark:bg-gray-800/50",
                      "border-2 border-red-200 dark:border-red-800/50",
                      "rounded-[15px] md:rounded-[18px]",
                      "p-4"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-red-600 dark:text-red-400 font-bold">
                          {violation.type}
                        </h3>
                        {violation.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {violation.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-left md:text-right">
                        <Badge className="bg-red-500 dark:bg-red-600 text-white font-bold rounded-[10px]">
                          Level {violation.level}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatDate(violation.created)}
                        </p>
                        {violation.issuedBy && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
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
        <Card className="bg-gray-50/70 dark:bg-gray-800/50 !shadow-none rounded-[20px] md:rounded-[25px] border-0 overflow-hidden">
          <CardHeader className="px-4 md:px-6 pb-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 bg-sky-500 dark:bg-sky-600 rounded-[12px] shrink-0">
                <FaMapMarkerAlt className="text-white text-lg" />
              </div>
              <CardTitle className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">
                Flight Route
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 md:h-80 w-full">
              <UserFlightMap
                flightId={flight.id}
                originAirport={flight.originAirport}
                destinationAirport={flight.destinationAirport}
                originCoordinates={[originLongitude, originLatitude]}
                destinationCoordinates={[destinationLongitude, destinationLatitude]}
                className="rounded-b-[20px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlightPage;
