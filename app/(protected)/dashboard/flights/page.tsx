import React from "react";

import { getUser } from "@/lib/supabase/user-actions";
import {
  getFlightTimePerTimeFrame,
  getFlightOverviewStatsPerTimeFrame,
  getRecentFlightInsights,
  getAllPlayerAircraftUsageData,
  getMostVisitedOriginAndDestinationAirports,
  matchAircraftNameToImage,
  getFlightAveragesPerTimeFrame,
} from "@/lib/cache/flightinsightsdata";

import { FaPlane } from "react-icons/fa";
import { convertMinutesToHours } from "@/lib/utils";

import Image from "next/image";

import FlightRouteMapRenderer from "@/components/dashboard-ui/misc/flightroute-maprenderer";
import FlightActivityAreaChart from "@/components/dashboard-ui/charts/flight-activity-area-chart";
import { AircraftUsageDonutChart } from "@/components/dashboard-ui/charts/aircraft-usage-donut-chart";
import { getFlightsTimeFrame } from "@/lib/cache/flightdata";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import SelectTimeframeButton from "@/components/dashboard-ui/select-timeframe-button";
import { redirect } from "next/navigation";
// Move InfoCard outside the main component
const InfoCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col justify-between gap-2">
          <h3 className="text-lg font-bold">{title}</h3>
          <span className="text-sm text-gray-500">{value}</span>
        </div>
        {icon}
      </div>
    </div>
  );
};


  
const FlightsPage = async ({searchParams}: { searchParams: Promise < {
  [key: string]: string | string[] | undefined
}>}) => {
  const { user_metadata: data } = await getUser();

  
  const {timeframe} = await searchParams || "30"
  
  if (timeframe !== "1" && timeframe !== "7" && timeframe !== "30") {
    redirect("/dashboard/flights?timeframe=30");
  }

  const allFlights = await getFlightsTimeFrame(data.ifcUserId, parseInt(timeframe));

  const flightOverviewStats = getFlightOverviewStatsPerTimeFrame(allFlights);
  const flightAverages = getFlightAveragesPerTimeFrame(allFlights);
  const flightActivity = getFlightTimePerTimeFrame(allFlights);
  const recentFlightInsights = getRecentFlightInsights(allFlights);
  const mostVisitedOriginAndDestinationAirports =
    getMostVisitedOriginAndDestinationAirports(allFlights);
  const aircraftUsageData = await getAllPlayerAircraftUsageData(allFlights);

  return (
    <div className="flex flex-col gap-4">
      {/* <section
        className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[150px] 
      [&>div]:rounded-lg
      [&>div]:border
      [&>div]:border-gray-200
      [&>div]:shadow-sm
      [&>div]:p-4
      [&>div]:bg-white
      "
      >
        <InfoCard
          title="Flights"
          value={flightOverviewStats.totalFlights}
          icon={<FaPlane />}
        />
        <InfoCard
          title="Landings"
          value={flightOverviewStats.totalLandings}
          icon={<FaPlane />}
        />
        <InfoCard
          title="Flight Time"
          value={flightOverviewStats.totalTime}
          icon={<FaPlane />}
        />
        <InfoCard
          title="XP"
          value={flightOverviewStats.totalXp}
          icon={<FaPlane />}
        />
      </section> */}

      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-dark py-0.5 bg-clip-text text-transparent tracking-tight">
          Your Flight Activity
        </h2>
        <SelectTimeframeButton />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:col-span-1 col-span-2 [&>section]:bg-[#FFE8CD]">
          <section className="flex-1 flex flex-col gap-4 p-4 bg-white rounded-lg">
            <header>
              <h3 className="text-lg font-bold">Recent Flight Activity</h3>
              <p className="text-xs text-gray-500 font-medium">Last {timeframe} days</p>
            </header>

            <div
              className="flex flex-col gap-2
                      [&>div>#label]:text-sm
                      [&>div>#label]:font-medium
                      [&>div>#value]:text-xs
                      [&>div>#value]:px-2
                      [&>div>#value]:py-1
                      [&>div>#value]:font-bold
                      [&>div>#value]:rounded-full
                      [&>div>#value]:bg-[#FFD6BA]
                    "
            >
              <div className="flex justify-between gap-2 items-center">
                <div id="label">Flights</div>
                <div id="value">{flightOverviewStats.totalFlights}</div>
              </div>

              <div className="flex justify-between gap-2 items-center">
                <div id="label">Landings</div>
                <div id="value">{recentFlightInsights.totalLandings}</div>
              </div>

              <div className="flex justify-between gap-2 items-center">
                <div id="label">XP Earned</div>
                <div id="value">{recentFlightInsights.totalXp}</div>
              </div>

              <div className="flex justify-between gap-2 items-center">
                <div id="label">Flight Time</div>
                <div id="value">
                  {convertMinutesToHours(recentFlightInsights.totalTime)}
                </div>
              </div>
            </div>
          </section>

          <section className="flex-1 flex flex-col gap-4 p-4 bg-white rounded-lg">
            <header>
              <h3 className="text-lg font-bold">Flight Averages</h3>
              <p className="text-xs text-gray-500 font-medium">Last {timeframe} days</p>
            </header>

            <div
              className="grid grid-cols-2 gap-4 
                    [&>div]:h-full
                    [&>div]:flex
                    [&>div]:flex-col
                    [&>div]:items-center
                    [&>div>h3]:text-center
                    [&>div]:bg-[#FFD6BA]
                    [&>div]:py-1
                    [&>div]:rounded-lg
                  "
            >
              <div className="">
                <h3 className="text-sm font-medium">Flight Time</h3>
                <p className="text-xl font-bold">{convertMinutesToHours(flightAverages.avgFlightTime)}</p>
              </div>
              <div className="">
                <h3 className="text-sm font-medium">Landings/Day</h3>
                <p className="text-xl font-bold">{Math.round(flightAverages.avgLandingsPerFlight)}</p>
              </div>
              <div className="">
                <h3 className="text-sm font-medium">Avg XP Earned</h3>
                <p className="text-xl font-bold">{flightAverages.avgXpPerFlight}</p>
              </div>
              <div className="">
                <h3 className="text-sm font-medium">XP per Landing</h3>
                <p className="text-xl font-bold">{flightAverages.avgXpPerLanding}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:col-span-1 col-span-2 [&>section]:bg-[#FFE8CD]">
          <section className="flex-1 flex flex-col justify-between gap-4 p-4 bg-white rounded-lg ">
            <header>
              <h3 className="text-lg font-bold">Most Visited Origin Airport</h3>
              <p className="text-xs text-gray-500 font-medium">Last {timeframe} days</p>
            </header>

            <h3 className="text-4xl md:text-6xl font-black">
              {mostVisitedOriginAndDestinationAirports.topOrigin}
            </h3>
          </section>

          <section className="flex-1 flex flex-col justify-between gap-4 p-4 bg-white rounded-lg ">
            <header>
              <h3 className="text-lg font-bold">
                Most Visited Destination Airport
              </h3>
              <p className="text-xs text-gray-500 font-medium">Last {timeframe} days</p>
            </header>

            <h3 className="text-4xl md:text-6xl font-black">
              {mostVisitedOriginAndDestinationAirports.topDestination}
            </h3>
          </section>
        </div>

        {/* Display Flight Activity Data for a specific time frame */}
        {flightActivity.length > 0 ? (
        <FlightActivityAreaChart
          flightActivityData={flightActivity}
          timeframe={timeframe}
          className="col-span-2"
        />
        ) : (
          <Card className="col-span-2 bg-gray">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Flight Time Per Day</CardTitle>
              <CardDescription className="text-gray-100">
                Your flight time day by day for the last {timeframe} days
              </CardDescription>

              <CardContent className="flex justify-center items-center h-full">
                <p className="text-gray-100 font-bold text-4xl tracking-tight mt-10">No Data Available</p>
              </CardContent>
            </CardHeader>
          </Card>
        )}

        {aircraftUsageData.length > 0 ? (
          <AircraftUsageDonutChart
            aircraftUsageData={aircraftUsageData}
            timeframe={timeframe}
            className="lg:col-span-1 col-span-2"  
          />
        ) : (
          <Card className="lg:col-span-1 col-span-2 bg-dark">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Most Used Aircraft
              </CardTitle>
              <CardDescription className="text-gray-200">
                Your most used aircraft in the last {timeframe} days
              </CardDescription>

              <CardContent className="flex justify-center items-center h-full">
                <p className="text-gray-100 font-bold text-4xl tracking-tight mt-10">No Data Available</p>
              </CardContent>
            </CardHeader>
          </Card>
        )}

        <Card className="lg:col-span-1 col-span-2 bg-dark">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Your Top 3 Aircraft
            </CardTitle>
            <CardDescription className="text-gray-200">
              Your top 3 most used aircraft in the last {timeframe} days
            </CardDescription>
          </CardHeader>

          <div className="px-4 flex flex-col gap-4">
            {
              aircraftUsageData.length > 0 ? (
                aircraftUsageData
                  .sort((a, b) => b.count - a.count)
                  .slice(0,3)
            .map((aircraft, index) => (
              <CardContent
                key={index}
                className="flex md:flex-row flex-col-reverse justify-between items-center gap-2 bg-gray text-light rounded-lg"
              >
                <div className="flex flex-col gap-1 py-4 text-center md:text-left">
                  <p className={`${index === 0 && "text-amber-400"} ${index === 1 && "text-amber-200"} ${index === 2 && "text-amber-50"} text-4xl font-black`}>{aircraft.name}</p>
                  <span className="text-sm text-gray-400 font-medium">
                    Flights: {aircraft.count}
                  </span>
                </div>

                <Image
                  src={`/images/aircraft/${matchAircraftNameToImage(
                    aircraft.name
                  )}`}
                  alt="A220"
                  width={300}
                  height={200}
                />
              </CardContent>
            )) ): (
              <CardContent className="flex justify-center items-center h-full">
                <p className="text-gray-100 font-bold text-4xl tracking-tight mt-10">No Data Available</p>
              </CardContent>
            )}
          </div>
        </Card>

        {/* <Card>Hello AnotherCard</Card> */}
      </section>
      {/* <Card className="col-span-2">
        <FlightRouteMapRenderer />
      </Card> */}
    </div>
  );
};

export default FlightsPage;
