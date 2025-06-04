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


import { ImStatsDots } from "react-icons/im";
import { getFlightsTimeFrame } from "@/lib/cache/flightdata";

import SelectTimeframeButton from "@/components/dashboard-ui/select-timeframe-button";
import FlightsTabsWrapper from "@/components/dashboard-ui/flights/flights-tabs-wrapper";
import { redirect } from "next/navigation";
import FlightsOverview from "@/components/dashboard-ui/flights/flights-overview";

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
    await getMostVisitedOriginAndDestinationAirports(allFlights);
  const aircraftUsageData = await getAllPlayerAircraftUsageData(allFlights);

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent tracking-tight">
            Your Flight Activity
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <ImStatsDots className="text-gray-500" />
            Your flight statistics and insights
          </p>
        </div>
        <SelectTimeframeButton />
      </div>

      {/* Tabs */}
      <FlightsTabsWrapper>
        <FlightsOverview
          flightOverviewStats={flightOverviewStats}
          recentFlightInsights={recentFlightInsights}
          flightAverages={flightAverages}
          mostVisitedOriginAndDestinationAirports={mostVisitedOriginAndDestinationAirports}
          flightActivity={flightActivity}
          aircraftUsageData={aircraftUsageData}
          timeframe={timeframe}
        />
      </FlightsTabsWrapper>
    </div>
  );
};

export default FlightsPage;
