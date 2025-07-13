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
import { convertMinutesToHours, numberWithCommas } from "@/lib/utils";
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

// Move the InfoCard component here or import it if it's elsewhere
const InfoCard = ({
  title,
  value,
  icon,
  color = "blue",
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  subtitle?: string;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-600",
    green: "from-green-500 to-green-600 text-green-600", 
    purple: "from-purple-500 to-purple-600 text-purple-600",
    orange: "from-orange-500 to-orange-600 text-orange-600",
    red: "from-red-500 to-red-600 text-red-600",
  };

  return (
    <div className="bg-[#FFD6BA] rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colorClasses[color].split(' ').slice(0, 2).join(' ')} mb-4`}>
            <div className="text-white text-xl">
              {icon}
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

interface FlightsOverviewProps {
  flightOverviewStats: any;
  recentFlightInsights: any;
  flightAverages: any;
  mostVisitedOriginAndDestinationAirports: any;
  flightActivity: any[];
  aircraftUsageData: any[];
  timeframe: string;
}

const FlightsOverview = ({
  flightOverviewStats,
  recentFlightInsights,
  flightAverages,
  mostVisitedOriginAndDestinationAirports,
  flightActivity,
  aircraftUsageData,
  timeframe
}: FlightsOverviewProps) => {
  return (
    <>
      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title="Total Flights"
          value={numberWithCommas(flightOverviewStats.totalFlights)}
          icon={<FaPlaneDeparture />}
          color="blue"
          subtitle={`Last ${timeframe.startsWith("flight-") ? timeframe.split("-")[1] : timeframe} ${timeframe.startsWith("flight-") || ["10", "50", "100", "250", "500"].includes(timeframe) ? "flights" : "days"}`}
        />
        <InfoCard
          title="Landings"
          value={numberWithCommas(recentFlightInsights.totalLandings)}
          icon={<BiSolidPlaneLand />}
          color="green"
          subtitle="Successful touchdowns"
        />
        <InfoCard
          title="Flight Time"
          value={convertMinutesToHours(recentFlightInsights.totalTime)}
          icon={<FaRegClock />}
          color="purple"
          subtitle="Total flight time"
        />
        <InfoCard
          title="XP Earned"
          value={numberWithCommas(recentFlightInsights.totalXp)}
          icon={<PiSparkle />}
          color="orange"
          subtitle="Experience points"
        />
      </section>

      {/* Main Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Flight Averages */}
        <Card className="lg:col-span-1 bg-blue-100 !shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BiTrendingUp className="text-white text-xl" />
              </div>
              <div>
                <CardTitle className="text-blue-900">Flight Averages</CardTitle>
                <CardDescription className="text-blue-700">Performance metrics for last {timeframe.startsWith("flight-") ? timeframe.split("-")[1] : timeframe} {timeframe.startsWith("flight-") || ["10", "50", "100", "250", "500"].includes(timeframe) ? "flights" : "days"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg ">
                <p className="text-sm font-medium text-gray-600">Avg Flight Time</p>
                <p className="text-2xl font-bold text-blue-600">{convertMinutesToHours(flightAverages.avgFlightTime)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg ">
                <p className="text-sm font-medium text-gray-600">Landings/Flight</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(flightAverages.avgLandingsPerFlight)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg ">
                <p className="text-sm font-medium text-gray-600">Avg XP/Flight</p>
                <p className="text-2xl font-bold text-purple-600">{flightAverages.avgXpPerFlight}</p>
              </div>
              <div className="bg-white p-4 rounded-lg ">
                <p className="text-sm font-medium text-gray-600">XP/Landing</p>
                <p className="text-2xl font-bold text-orange-600">{flightAverages.avgXpPerLanding}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Airport Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br bg-[#FFDCDC] !shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <FaMapMarkerAlt className="text-white text-lg" />
                </div>
                <div>
                  <CardTitle className="text-red-900">Top Origin</CardTitle>
                  <CardDescription className="text-red-700">Most departed from</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="h-full flex items-end justify-start">
              <div className="flex flex-col gap-2">
                <p className="text-7xl font-black text-red-800">
                  {mostVisitedOriginAndDestinationAirports.topOrigin || "N/A"}
                </p>
                <span className="text-sm text-red-700 font-medium flex items-center gap-2">
                  {mostVisitedOriginAndDestinationAirports.originAirportInfo?.name}, &nbsp;
                  {isoCountryCodes.find((code: any) => code.isoCode === mostVisitedOriginAndDestinationAirports.originAirportInfo?.country)?.key}
                </span>
                <span className="text-sm text-white font-medium bg-red-500 px-2 py-1 rounded-md self-start">Departed <b>{mostVisitedOriginAndDestinationAirports.originCount}</b> times</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br bg-[#FFE8CD] !shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <FaMapMarkerAlt className="text-white text-lg" />
                </div>
                <div>
                  <CardTitle className="text-orange-900">Top Destination</CardTitle>
                  <CardDescription className="text-orange-700">Most arrived at</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full flex items-end justify-start">
              <div className="flex flex-col gap-2">
                <p className="text-7xl font-black text-orange-800">
                  <b>{mostVisitedOriginAndDestinationAirports.topDestination || "N/A"}</b>
                </p>
                <span className="text-sm text-orange-700 font-medium flex items-center gap-2">
                  {mostVisitedOriginAndDestinationAirports.destinationAirportInfo?.name}, &nbsp;
                  {isoCountryCodes.find((code: any) => code.isoCode === mostVisitedOriginAndDestinationAirports.destinationAirportInfo?.country)?.key}
                </span>
                <span className="text-sm text-white font-medium bg-orange-500 px-2 py-1 rounded-md self-start">Arrived <b>{mostVisitedOriginAndDestinationAirports.destinationCount}</b> times</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flight Activity Chart */}
        {flightActivity.length > 0 ? (
          <FlightActivityAreaChart
            flightActivityData={flightActivity}
            timeframe={timeframe}
            className="col-span-2"
          />
        ) : (
          <Card className="col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <FaPlane className="text-blue-400" />
                Flight Time Per Day
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your flight time day by day for the last {timeframe.startsWith("flight-") ? timeframe.split("-")[1] : timeframe} {timeframe.startsWith("flight-") || ["10", "50", "100", "250", "500"].includes(timeframe) ? "flights" : "days"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl text-gray-600 mb-4">✈️</div>
              <p className="text-gray-300 font-semibold text-xl">No Flight Data Available</p>
              <p className="text-gray-500 text-sm mt-2">Start flying to see your activity here!</p>
            </CardContent>
          </Card>
        )}

        {/* Aircraft Usage Chart */}
        {aircraftUsageData.length > 0 ? (
          <div className="relative">
            <Badge className="absolute -top-2 -right-2 bg-yellow-500 shadow-lg font-semibold text-lg">
             Premium
            </Badge>
            <AircraftUsageDonutChart
              aircraftUsageData={aircraftUsageData}
              timeframe={timeframe}
              className="lg:col-span-1"  
            />
          </div>
        ) : (
          <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 relative">
            <Badge className="absolute -top-2 -right-2 bg-yellow-500 shadow-lg font-semibold">
             Premium
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <FaPlane className="text-purple-400" />
                Aircraft Usage
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your most used aircraft in the last {timeframe.startsWith("flight-") ? timeframe.split("-")[1] : timeframe} {timeframe.startsWith("flight-") || ["10", "50", "100", "250", "500"].includes(timeframe) ? "flights" : "days"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-4xl text-gray-600 mb-4">🛩️</div>
              <p className="text-gray-300 font-semibold">No Aircraft Data</p>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Aircraft */}
        <Card className="lg:col-span-1 col-span-2 bg-dark relative">
          <Badge className="absolute -top-2 -right-2 bg-yellow-500 shadow-lg font-semibold text-lg">
            Premium
          </Badge>
          <CardHeader>  
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <FaStar className="text-white text-lg" />
              </div>
              Your Top 3 Aircraft
            </CardTitle>
            <CardDescription className="text-gray-300">
              Your top 3 most used aircraft in the last {timeframe.startsWith("flight-") ? timeframe.split("-")[1] : timeframe} {timeframe.startsWith("flight-") || ["10", "50", "100", "250", "500"].includes(timeframe) ? "flights" : "days"}
            </CardDescription>
          </CardHeader>

          <div className="px-4 flex flex-col gap-4 pb-4">
            {aircraftUsageData.length > 0 ? (
              aircraftUsageData
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((aircraft, index) => (
                  <div
                    key={index}
                    className="flex md:flex-row flex-col-reverse justify-between items-center gap-2 bg-gray-800 text-white p-4 rounded-lg relative"
                  >
                    <div className="flex flex-col gap-1 text-center md:text-left">
                      <p className={`${index === 0 && "text-amber-400"} ${index === 1 && "text-amber-200"} ${index === 2 && "text-amber-50"} text-2xl font-black`}>
                        {aircraft.name}
                      </p>
                      <span className="text-sm text-gray-400 font-medium">
                        Flights: {aircraft.count}
                      </span>
                    </div>

                    <span className="text-sm text-white font-bold bg-gray-500 w-8 h-8 rounded-md absolute top-2 right-2 flex items-center justify-center">
                      {index + 1}
                    </span>

                    <Image
                      src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name)}`}
                      alt={aircraft.name}
                      width={200}
                      height={120}
                      className="rounded-lg"
                    />
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-4xl text-gray-600 mb-4">🛩️</div>
                <p className="text-gray-300 font-semibold">No Aircraft Data</p>
                <p className="text-gray-500 text-sm">Fly some aircraft to see your top 3!</p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  );
};

export default FlightsOverview;