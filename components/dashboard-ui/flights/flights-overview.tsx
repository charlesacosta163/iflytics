import React from "react";
import {
  FaPlane,
  FaPlaneDeparture,
  FaRegClock,
  FaStar,
  FaMapMarkerAlt
} from "react-icons/fa";
import {
  BiSolidPlaneLand,
  BiTrendingUp
} from "react-icons/bi";
import { PiSparkle } from "react-icons/pi";
import { convertMinutesToHours, formatTimeframeText, getMonthAndYear, numberWithCommas } from "@/lib/utils";
import Image from "next/image";
import FlightActivityAreaChart from "@/components/dashboard-ui/charts/flight-activity-area-chart";
import { AircraftUsageDonutChart } from "@/components/dashboard-ui/charts/aircraft-usage-donut-chart";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isoCountryCodes } from "@/lib/data";
import { cn } from "@/lib/utils";
import { IoAirplaneOutline } from "react-icons/io5";
import { FaRegMoon, FaRegSun } from "react-icons/fa6";
import { StripedPattern } from "@/components/magicui/striped-pattern";

// Move the InfoCard component here or import it if it's elsewhere
const InfoCard = ({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-600",
    green: "from-green-500 to-green-600 text-green-600",
    purple: "from-purple-500 to-purple-600 text-purple-600",
    orange: "from-orange-500 to-orange-600 text-orange-600",
    red: "from-red-500 to-red-600 text-red-600",
  };

  return (
    <div className={cn(
      "bg-gray-50/70 dark:bg-gray-800/80 z-10",
      "text-gray-800 dark:text-gray-100",
      "rounded-[15px] sm:rounded-[20px] md:rounded-[25px]",
      "p-3 sm:p-4 md:p-6",
      "hover:shadow-lg transition-all duration-300",
      "transform hover:-translate-y-1",
      "min-w-0"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className={`inline-flex p-2 sm:p-3 rounded-[12px] sm:rounded-[15px] bg-gradient-to-r ${colorClasses[color].split(' ').slice(0, 2).join(' ')} mb-2 sm:mb-3 md:mb-4`}>
            <div className="text-white text-base sm:text-lg md:text-xl">
              {icon}
            </div>
          </div>
          <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">{title}</h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1 tracking-tight truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};

const AverageMetric = ({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: "blue" | "green" | "purple" | "orange"
}) => {
  const styles = {
    blue: {
      icon: "text-blue-500 dark:text-blue-400",
      value: "text-blue-600 dark:text-blue-400",
    },
    green: {
      icon: "text-green-500 dark:text-green-400",
      value: "text-green-600 dark:text-green-400",
    },
    purple: {
      icon: "text-purple-500 dark:text-purple-400",
      value: "text-purple-600 dark:text-purple-400",
    },
    orange: {
      icon: "text-orange-500 dark:text-orange-400",
      value: "text-orange-600 dark:text-orange-400",
    },
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        "bg-white/70 dark:bg-gray-800/50",
        "rounded-[20px]",
        "p-3 md:p-4 min-w-0"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("shrink-0 text-base md:text-lg", styles[color].icon)}>
          {icon}
        </span>
        <p className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 truncate">
          {label}
        </p>
      </div>
      <p className={cn("text-lg md:text-xl font-black tracking-tight shrink-0", styles[color].value)}>
        {value}
      </p>
    </div>
  )
}

interface FlightsOverviewProps {
  flightOverviewStats: any;
  recentFlightInsights: any;
  flightAverages: any;
  mostVisitedOriginAndDestinationAirports: any;
  flightActivity: any[];
  aircraftUsageData: any[];
  flights: { created: string }[];
  timeframe: string;
}

const FlightsOverview = ({
  flightOverviewStats,
  recentFlightInsights,
  flightAverages,
  mostVisitedOriginAndDestinationAirports,
  flightActivity,
  aircraftUsageData,
  flights,
  timeframe
}: FlightsOverviewProps) => {


  return (
    <>
      {/* Quick Stats Grid */}

      <div className="relative overflow-hidden bg-gray-100/70 dark:bg-gray-900/70 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 p-3 sm:p-4 rounded-[20px] md:rounded-[30px]">
      <StripedPattern className="stroke-[0.3] [stroke-dasharray:8,4] absolute inset-0 z-0" />

        <section className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 min-w-0">
          <InfoCard
            title="Total Flights"
            value={numberWithCommas(flightOverviewStats.totalFlights)}
            icon={<FaPlaneDeparture />}
            color="blue"
          />
          <InfoCard
            title="Landings"
            value={numberWithCommas(recentFlightInsights.totalLandings)}
            icon={<BiSolidPlaneLand />}
            color="green"
          />
          <InfoCard
            title="Flight Time"
            value={convertMinutesToHours(recentFlightInsights.totalTime)}
            icon={<FaRegClock />}
            color="purple"
          />
          <InfoCard
            title="XP Earned"
            value={numberWithCommas(recentFlightInsights.totalXp)}
            icon={<PiSparkle />}
            color="orange"
          />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 min-w-0">
          <div className="relative overflow-hidden rounded-[20px] md:rounded-[30px] bg-[url('https://i.pinimg.com/564x/22/44/7d/22447dcb936ca4927eea41a7ec97d977.jpg')] bg-cover bg-center min-h-[200px] sm:min-h-[240px] md:min-h-[280px] hover:scale-105 transition-all duration-300">

          <FaRegSun className="text-white text-4xl sm:text-5xl md:text-6xl absolute top-3 left-3 sm:top-4 sm:left-4" />

            {/* Bottom fade overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 sm:px-4 pb-3 sm:pb-4 pt-12 sm:pt-16 flex flex-col justify-end">
              <span className="text-white/70 text-xs sm:text-sm font-semibold">You Flew</span>
              <p className="text-white text-3xl sm:text-4xl md:text-5xl font-black">
                {convertMinutesToHours(flightOverviewStats.totalDayTime)}
              </p>
              <p className="text-white/70 text-xs">
                in the daytime
              </p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-[20px] md:rounded-[30px] bg-[url('https://png.pngtree.com/thumb_back/fh260/background/20201123/pngtree-cartoon-night-starry-background-image_498697.jpg')] bg-cover bg-center min-h-[200px] sm:min-h-[240px] md:min-h-[280px] hover:scale-105 transition-all duration-300">

          <FaRegMoon className="text-white text-4xl sm:text-5xl md:text-6xl absolute top-3 left-3 sm:top-4 sm:left-4" />

            {/* Bottom fade overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 sm:px-4 pb-3 sm:pb-4 pt-12 sm:pt-16 flex flex-col justify-end">
              <span className="text-white/70 text-xs sm:text-sm font-semibold">You Flew</span>
              <p className="text-white text-3xl sm:text-4xl md:text-5xl font-black">
                {convertMinutesToHours(flightOverviewStats.totalNightTime)}
              </p>
              <p className="text-white/70 text-xs">
                in the nighttime
              </p>
            </div>
          </div>
        </section>
        {/* Main Analytics Grid */}
        <section className="lg:col-span-2 flex flex-col gap-3 md:gap-4 min-w-0">

          {/* Flight Averages */}
          <Card className={cn(
            "bg-blue-50/70 dark:bg-blue-900/80 z-10",
            "!shadow-none",
            "rounded-[20px] md:rounded-[25px]"
          )}>
            <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-[12px] md:rounded-[15px] shrink-0">
                  <BiTrendingUp className="text-white text-lg md:text-xl" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-lg font-bold tracking-tight text-blue-900 dark:text-blue-100">Flight Averages</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-blue-700 dark:text-blue-300">Performance metrics {formatTimeframeText(timeframe)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                <AverageMetric
                  label="Avg Flight Time"
                  value={convertMinutesToHours(flightAverages.avgFlightTime)}
                  icon={<FaRegClock />}
                  color="blue"
                />
                <AverageMetric
                  label="Landings per Flight"
                  value={Math.round(flightAverages.avgLandingsPerFlight)}
                  icon={<BiSolidPlaneLand />}
                  color="green"
                />
                <AverageMetric
                  label="Avg XP per Flight"
                  value={flightAverages.avgXpPerFlight}
                  icon={<PiSparkle />}
                  color="purple"
                />
                <AverageMetric
                  label="XP per Landing"
                  value={flightAverages.avgXpPerLanding}
                  icon={<FaPlaneDeparture />}
                  color="orange"
                />
              </div>
            </CardContent>
          </Card>

           { /* Airport Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 min-w-0">
            <Card className={cn(
              "bg-red-50/70 dark:bg-red-900/80 z-10",
              "!shadow-none",
              "rounded-[20px] md:rounded-[25px]"
            )}>
              <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 bg-red-500 dark:bg-red-600 rounded-[12px] md:rounded-[15px] shrink-0">
                    <FaMapMarkerAlt className="text-white text-base md:text-lg" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base md:text-lg font-bold tracking-tight text-red-900 dark:text-red-100">Top Origin</CardTitle>
                    <CardDescription className="text-xs md:text-sm text-red-700 dark:text-red-300">Most departed from</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                <div className={cn(
                  "bg-white/70 dark:bg-gray-800/50 z-10",
                  "rounded-[20px]",
                  "p-4 md:p-5 flex flex-col gap-3"
                )}>
                  <p className="text-4xl md:text-5xl font-black tracking-tighter text-red-700 dark:text-red-300">
                    {mostVisitedOriginAndDestinationAirports.topOrigin || "N/A"}
                  </p>
                  <div className="min-w-0">
                    <p className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 truncate">
                      {mostVisitedOriginAndDestinationAirports.originAirportInfo?.name || "Unknown airport"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {isoCountryCodes.find((code: any) => code.isoCode === mostVisitedOriginAndDestinationAirports.originAirportInfo?.country)?.key || "—"}
                    </p>
                  </div>
                  <Badge className="self-start bg-red-500 dark:bg-red-600 text-white font-bold rounded-[12px] px-3 py-1.5">
                    Departed {mostVisitedOriginAndDestinationAirports.originCount} times
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "bg-orange-50/70 dark:bg-orange-900/80 z-10",
              "!shadow-none",
              "rounded-[20px] md:rounded-[25px]"
            )}>
              <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 bg-orange-500 dark:bg-orange-600 rounded-[12px] md:rounded-[15px] shrink-0">
                    <FaMapMarkerAlt className="text-white text-base md:text-lg" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base md:text-lg font-bold tracking-tight text-orange-900 dark:text-orange-100">Top Destination</CardTitle>
                    <CardDescription className="text-xs md:text-sm text-orange-700 dark:text-orange-300">Most arrived at</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                <div className={cn(
                  "bg-white/70 dark:bg-gray-800/50 z-10",
                  "rounded-[20px]",
                  "p-4 md:p-5 flex flex-col gap-3"
                )}>
                  <p className="text-4xl md:text-5xl font-black tracking-tighter text-orange-700 dark:text-orange-300">
                    {mostVisitedOriginAndDestinationAirports.topDestination || "N/A"}
                  </p>
                  <div className="min-w-0">
                    <p className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 truncate">
                      {mostVisitedOriginAndDestinationAirports.destinationAirportInfo?.name || "Unknown airport"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {isoCountryCodes.find((code: any) => code.isoCode === mostVisitedOriginAndDestinationAirports.destinationAirportInfo?.country)?.key || "—"}
                    </p>
                  </div>
                  <Badge className="self-start bg-orange-500 dark:bg-orange-600 text-white font-bold rounded-[12px] px-3 py-1.5">
                    Arrived {mostVisitedOriginAndDestinationAirports.destinationCount} times
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>


      {/* Charts Section */}
      <section className="flex flex-col gap-4 md:gap-6">
        {/* Flight Activity Chart */}
        {flightActivity.length > 0 ? (
          <FlightActivityAreaChart
            flightActivityData={flightActivity}
            timeframe={timeframe}
            totalFlights={flightOverviewStats.totalFlights}
            flights={flights}
          />
        ) : (
          <Card className={cn(
            "bg-gradient-to-br from-gray-100 to-gray-200",
            "dark:from-gray-800 dark:to-gray-900",
            "border-2 border-gray-200 dark:border-gray-700",
            "rounded-[20px] md:rounded-[25px]"
          )}>
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center gap-3">
                <FaPlane className="text-blue-500 dark:text-blue-400" />
                Flight Time Per Day
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Your flight time day by day {formatTimeframeText(timeframe)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
              <div className="text-5xl md:text-6xl text-gray-400 dark:text-gray-600 mb-4">✈️</div>
              <p className="text-gray-700 dark:text-gray-300 font-bold text-lg md:text-xl tracking-tight">No Flight Data Available</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs md:text-sm mt-2">Start flying to see your activity here!</p>
            </CardContent>
          </Card>
        )}

        {/* Aircraft Usage Chart */}
        {aircraftUsageData.length > 0 ? (
          <AircraftUsageDonutChart
            aircraftUsageData={aircraftUsageData}
            timeframe={timeframe}
          />
        ) : (
          <Card className={cn(
            "bg-gradient-to-br from-gray-100 to-gray-200",
            "dark:from-gray-800 dark:to-gray-900",
            "border-2 border-gray-200 dark:border-gray-700",
            "rounded-[20px] md:rounded-[25px]"
          )}>

            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center gap-3">
                <FaPlane className="text-purple-500 dark:text-purple-400" />
                Aircraft Usage
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Your most used aircraft {formatTimeframeText(timeframe)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
              <div className="text-3xl md:text-4xl text-gray-400 dark:text-gray-600 mb-4">🛩️</div>
              <p className="text-gray-700 dark:text-gray-300 font-bold tracking-tight">No Aircraft Data</p>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Aircraft */}
        <Card className={cn(
          "bg-gray-50 dark:bg-gray-800",
          "rounded-[20px] md:rounded-[25px] shadow-none"
        )}>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-amber-500 dark:bg-amber-600 rounded-[12px] md:rounded-[15px]">
                <FaStar className="text-white text-base md:text-lg" />
              </div>
              Your Top 3 Aircraft
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              Your top 3 most used aircraft {formatTimeframeText(timeframe)}
            </CardDescription>
          </CardHeader>

          <div className="px-4 md:px-6 flex flex-col gap-3 md:gap-4 pb-4 md:pb-6">
            {aircraftUsageData.length > 0 ? (
              aircraftUsageData
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((aircraft, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex md:flex-row flex-col-reverse justify-between items-center gap-3",
                      "bg-white dark:bg-gray-700",
                      "text-gray-800 dark:text-white",
                      "p-4 md:p-5",
                      "rounded-[15px] md:rounded-[20px]",
                      "relative"
                    )}
                  >
                    <div className="flex flex-col gap-1 text-center md:text-left">
                      <p className={cn(
                        "text-xl md:text-2xl font-black tracking-tight",
                        index === 0 && "text-amber-500 dark:text-amber-400",
                        index === 1 && "text-amber-400 dark:text-amber-300",
                        index === 2 && "text-amber-300 dark:text-amber-200"
                      )}>
                        {aircraft.name}
                      </p>
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold">
                        Flights: {aircraft.count}
                      </span>
                    </div>

                    <span className={cn(
                      "text-xs md:text-sm text-white font-bold",
                      "bg-gray-600 dark:bg-gray-500",
                      "w-7 h-7 md:w-8 md:h-8",
                      "rounded-[8px]",
                      "absolute top-2 right-2",
                      "flex items-center justify-center"
                    )}>
                      {index + 1}
                    </span>

                    <Image
                      src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name)}`}
                      alt={aircraft.name}
                      width={200}
                      height={120}
                      className="rounded-[12px] w-[150px] md:w-[200px] h-auto"
                    />
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 md:py-16">
                <div className="text-3xl md:text-4xl text-gray-400 dark:text-gray-600 mb-4">🛩️</div>
                <p className="text-gray-700 dark:text-gray-300 font-bold tracking-tight">No Aircraft Data</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs md:text-sm">Fly some aircraft to see your top 3!</p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  );
};

export default FlightsOverview;