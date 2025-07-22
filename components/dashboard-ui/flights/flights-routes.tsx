import React from "react";
import { VscCopilotWarning } from "react-icons/vsc";
import { Flight } from "@/lib/types";
import {
  calculateTotalDistance,
  getAllFlightRoutes,
  getFlightTimeCategorizerData,
  getTop5Countries,
  getUniqueRoutes,
} from "@/lib/cache/flightinsightsdata";
import { FaRoute } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import { RiCopilotFill, RiPinDistanceLine } from "react-icons/ri";

import { getUser } from "@/lib/supabase/user-actions";
import { customUserImages, continentCodes } from "@/lib/data";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableCaption,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { convertMinutesToHours } from "@/lib/utils";
import { RouteMap } from "./maps/route-map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FlightTimeCategorizerBarChart } from "../charts/flight-time-categorizer-barchart";
import { RevalidateRoutesButton } from "@/components/revalidate-routes-btn";

import { FlightHaulsPieChart } from "../charts/route-pies/flight-hauls-pie";
import { FlightContinentsPieChart } from "../charts/route-pies/flight-continents-pie";
import { FlightDomesticIntlPieChart } from "../charts/route-pies/flight-domestic-intl-pie";

let maintenanceMode = false;

const FlightsRoutes = async ({ flights, user }: { flights: Flight[], user: any}) => {
  // console.log(`🔄 FlightsRoutes called at ${new Date().toISOString()}`); --> Debugging

  // Based on THIS Data for user flights
  // Criteria: Flight has a totalTime > 10, originAirport, destinationAirport must be non-empty
  const validFlights = flights.filter((flight) => {
    return (
      flight.totalTime > 10 && flight.originAirport && flight.destinationAirport
    );
  });

  const userMetadata = user.user_metadata;

  const shortenNumber = (number: number) => {
    // 71200 -> 71.2k
    if (number < 1000) {
      return number.toLocaleString();
    } else if (number < 1000000) {
      return (number / 1000).toFixed(1) + "k";
    } else if (number < 1000000000) {
      return (number / 1000000).toFixed(1) + "m";
    } else {
      return (number / 1000000000).toLocaleString() + "b";
    }
  };

  // Get the flight routes with distances with the user ID for the cache key

  // const startTime = Date.now(); --> Debugging
  const routesWithDistances = await getAllFlightRoutes(validFlights, user.id);
  // const endTime = Date.now(); --> Debugging

  
  // console.log(`⏱️ Route calculation took ${endTime - startTime}ms`); --> Debugging
  
  const uniqueRoutes = getUniqueRoutes(
    routesWithDistances.map((route) => ({
      ...route,
      originIsoCountry: route.originIsoCountry || "US",
      destinationIsoCountry: route.destinationIsoCountry || "US",
      originContinent: route.originContinent || "NA",
      destinationContinent: route.destinationContinent || "NA",
    }))
  );

  // console.log(routesWithDistances[0])
  
  const totalDomesticRoutes = uniqueRoutes.filter(
    (route) => route.originIsoCountry === route.destinationIsoCountry
  ).length;
  const totalInternationalRoutes = uniqueRoutes.filter(
    (route) => route.originIsoCountry !== route.destinationIsoCountry
  ).length;

  const { totalDistanceTraveled, longestRouteInfo } =
    await calculateTotalDistance(validFlights);

  // Use ALL Flights Data
  const top5Countries = getTop5Countries(routesWithDistances);

  const flightTimeCategorizerData = getFlightTimeCategorizerData(validFlights);

  function getFlightHaulCategorizerData () {
    // Short Haul = <= 180
    // Medium Haul = > 180 && <=360
    // Long Haul = > 360

    const shortHaul = validFlights.filter((flight) => flight.totalTime <= 180);
    const mediumHaul = validFlights.filter((flight) => flight.totalTime > 180 && flight.totalTime <= 360);
    const longHaul = validFlights.filter((flight) => flight.totalTime > 360);

    return [{ 
       label: "Short Haul",
       value: shortHaul.length,
       fill: "#77DD77"
     }, {
       label: "Medium Haul",
       value: mediumHaul.length,
       fill: "#FDFD96"
     }, {
       label: "Long Haul",
       value: longHaul.length,
       fill: "#FF6961"
     }];
  }

  function getFlightContinentsFlewToData () {
    // Sample Flight Route data:
    // {
    //   flightId: '931999ef-911f-4a42-8f65-f7ec060dd1b8',
    //   created: '2025-07-21T02:41:02.727818Z',
    //   aircraftId: '64568366-b72c-47bd-8bf6-6fdb81b683f9',
    //   server: 'Expert',
    //   origin: 'KLAX',
    //   originIsoCountry: 'US',
    //   originContinent: 'NA',
    //   originCoordinates: { latitude: 33.942501, longitude: -118.407997 },
    //   destination: 'PHKO',
    //   destinationIsoCountry: 'US',
    //   destinationContinent: 'NA',
    //   destinationCoordinates: { latitude: 19.738783, longitude: -156.045603 },
    //   distance: 2173,
    //   totalTime: 295.57333
    // }

    const pastelFillColors = ["#87abff", "#ff8799", "#FDFD96", "#C3B1E1", "#77DD77", "#FFB347", "#FFD1DC", "#E4C692", "#92E1C0", "#D49CD0"]
    // Return array of unique continents flown to [{label: "EU", amount: 10},...]
    const continents = routesWithDistances.map((route) => route.destinationContinent).filter((continent) => continent !== undefined)
    const uniqueContinents = [...new Set(continents)];
    return uniqueContinents.map((continent) => ({
      label: continent,
      amount: continents.filter((c) => c === continent).length,
      fill: pastelFillColors[uniqueContinents.indexOf(continent)],
    }))
  }

  function getDomesticInternationalAmountsData () {
    // Return [{label: "Domestic", amount: 10}, {label: "International", amount: 10}]

    const domesticRoutes = routesWithDistances.filter((route) => route.originIsoCountry === route.destinationIsoCountry)
    const internationalRoutes = routesWithDistances.filter((route) => route.originIsoCountry !== route.destinationIsoCountry)

    return [{
      label: "Domestic",
      amount: domesticRoutes.length,
      fill: "#BB9AB1"
    }, {
      label: "International",
      amount: internationalRoutes.length,
      fill: "#EECEB9"
    }]
  }

  // console.log(getFlightContinentsFlewToData())
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3 border-2 border-yellow-200 bg-yellow-50 p-6 rounded-lg flex items-center gap-2">
        <VscCopilotWarning className="w-6 h-6 text-yellow-500" />
        <p className="text-sm sm:text-lg font-medium text-yellow-700">
          Note: The route analysis and summary stats are a{" "}
          <b>premium feature</b>. Currently free to use during development/early
          alpha
        </p>
      </div>
      <RevalidateRoutesButton userId={user.id} />

      <div className="grid grid-cols-1 lg:col-span-3 bg-white rounded-xl  p-4">
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_2fr_2fr] gap-4">
          <div className="border bg-gray-700 rounded-xl p-4 text-white flex flex-col gap-2 items-center justify-center h-full">
            {
              customUserImages.find((user: any) => user.username === userMetadata.ifcUsername)?.image ? (
                <img src={customUserImages.find((user: any) => user.username === userMetadata.ifcUsername)?.image} alt={userMetadata.ifcUsername} className="w-14 h-14 border-gray-400 border-2 rounded-full" />
              ) : (
                <RiCopilotFill className="w-12 h-12" />
              )
            }
            <p className="text-sm font-medium">@{userMetadata.ifcUsername}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-4xl font-bold tracking-tight">
                {uniqueRoutes.length} <span className="text-sm text-gray-500">Unique Routes</span>
              </h2>
              <p className="text-sm text-gray-500">
                <b className="text-lg font-bold">{totalDomesticRoutes}</b>{" "}
                Domestic
              </p>
              <p className="text-sm text-gray-500">
                <b className="text-lg font-bold">{totalInternationalRoutes}</b>{" "}
                International
              </p>
            </div>

            <div className="bg-gray-200 rounded-xl p-4 text-gray-700 flex flex-col gap-2 items-center justify-center h-full">
              <FaRoute className="w-12 h-12" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-4xl font-bold tracking-tight">{maintenanceMode
                  ? "Under Maintenance"
                  : shortenNumber(totalDistanceTraveled)} <span className="text-sm text-gray-500">Nautical Miles</span></h2>
              <p className="text-sm text-gray-500"><b className="text-lg font-bold">{shortenNumber(totalDistanceTraveled * 1.1508)}</b> Miles</p>
              <p className="text-sm text-gray-500"><b className="text-lg font-bold">{shortenNumber(totalDistanceTraveled * 1.852)}</b> Kilometers</p>
            </div>

            <div className="bg-gray-200 rounded-xl p-4 text-gray-700 flex flex-col gap-2 items-center justify-center h-full">
              <GiPathDistance className="w-12 h-12" />
            </div>
          </div>

          <div className="flex gap-4 flex-col">
            <div className="bg-gray-200 rounded-xl px-4 py-2 text-gray-700 flex gap-4 items-center justify-center h-full">
              {/* Average Route Length */}
              <span className="text-sm text-gray-500">Average Route Length</span>
              <div className="text-xs text-gray-500 font-medium flex flex-col flex-1 text-right"><b className="text-2xl font-bold">{Math.round((totalDistanceTraveled / uniqueRoutes.length) || 0) }</b> Nautical Miles</div>
        
            </div>
            <div className="bg-gray-200 rounded-xl px-4 py-2 text-gray-700 flex gap-4 items-center justify-center h-full">
              {/* Longest Route */}
              <span className="text-sm text-gray-500">Longest Route</span>
              <div className="flex flex-col gap-1 flex-1 text-right">
                <div><b>{longestRouteInfo.origin || "N/A"}</b> → <b>{longestRouteInfo.destination || "N/A"}</b></div>
                <div className="text-xs text-gray-500 font-medium"><b>{longestRouteInfo.distance || 0}</b> Nm</div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Summary Stats Cards (NEW 👆) */}
     

      {/* Route Map */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
        <RouteMap routes={uniqueRoutes} />
      </div>

      {/* Top 5 Countries List */}
      <Card className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-light">
            Top 5 Countries
          </CardTitle>
          <CardDescription className="text-sm text-gray-200">
            Countries you flew to the most
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-6">
            {maintenanceMode ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Under Maintenance</p>
                <p className="text-sm text-gray-400 mt-1">
                  We're working on it!
                </p>
              </div>
            ) : top5Countries.length > 0 ? (
              top5Countries.map((country: [string, number], index) => {
                // Calculate percentage based on the highest value for better visual distribution
                const [countryName, count] = country;

                const maxCount = Math.max(...top5Countries.map((c) => c[1]));
                const percentage = Math.round((count / maxCount) * 100);

                return (
                  <div key={countryName} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-light">
                            {countryName}
                          </p>
                          <p className="text-sm text-gray-200">
                            {count} flight{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-light">{count}</p>
                        <p className="text-xs text-gray-200">
                          {(
                            (count /
                              top5Countries.reduce((sum, c) => sum + c[1], 0)) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                    <Progress
                      // change progress bar color
                      value={percentage}
                      className="h-3 bg-gray-600"
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 font-medium">No countries found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 rounded-xl bg-transparent shadow-none">
        <div>
          <div className="text-xl font-bold text-gray-700">
            Flight Route Metrics
          </div>
          <div className="text-sm text-gray-500">
            Your flight route metrics by flight duration, continents, and domestic vs international flights
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="bg-transparent w-full">
          <FlightHaulsPieChart chartData={getFlightHaulCategorizerData()} />
        </div>
        <div className="bg-transparent w-full">
          <FlightContinentsPieChart chartData={getFlightContinentsFlewToData()} />
        </div>
        <div className="bg-transparent w-full">
          <FlightDomesticIntlPieChart chartData={getDomesticInternationalAmountsData()} />  
        </div>

        </div>
      </div>

      <div className="lg:col-span-3">
        <FlightTimeCategorizerBarChart
          flightTimeCategorizerData={flightTimeCategorizerData}
        />
      </div>
    </div>
  );
};

export default FlightsRoutes;
