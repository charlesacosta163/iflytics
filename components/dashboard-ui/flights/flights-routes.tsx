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
import { RiCopilotFill } from "react-icons/ri";
import { cn } from "@/lib/utils";

import { customUserImages } from "@/lib/data";

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
import ExportFlightsCSVBtn from "../export-flights-csv-btn";
import { getAllAircraft } from "@/lib/actions";
import { hasLifetimeAccess, Subscription } from "@/lib/subscription/helpers";
import { MostFlownRoutesBarChart } from "../charts/most-flown-routes-bar";

let maintenanceMode = false;

const FlightsRoutes = async ({ flights, user , subscription, role}: { flights: Flight[], user: any, subscription: Subscription, role: string}) => {
  // console.log(`🔄 FlightsRoutes called at ${new Date().toISOString()}`); --> Debugging

  // Based on THIS Data for user flights
  // Criteria: Flight has a totalTime > 5, originAirport, destinationAirport must be non-empty
  const validFlights = flights.filter((flight) => {
    return (
      flight.totalTime > 5 && flight.originAirport && flight.destinationAirport && flight.originAirport !== flight.destinationAirport
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

  // console.log(routesWithDistances[0])
  
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
    //   callsign: 'Air Canada 123',
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

  const aircraftArray = await getAllAircraft();

  // Get unique origin and destination routes, and a count 
  // Data structure to be returned: [route: `KLAX-PHKO`, count: 10]

  // Process routes treating each direction as unique
  const flownRoutesData = validFlights.reduce((acc: { route: string; count: number }[], flight) => {
    const routeKey = `${flight.originAirport}-${flight.destinationAirport}`;
    const existingRoute = acc.find(r => r.route === routeKey);
    
    if (existingRoute) {
      existingRoute.count++;
    } else {
      acc.push({ route: routeKey, count: 1 });
    }
    
    return acc;
  }, [])

  // console.log(routesWithDistancesWithAircraftIcao[0])

  // console.log(getFlightContinentsFlewToData())
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* <div className="lg:col-span-3 border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg flex items-center gap-2">
        <VscCopilotWarning className="w-6 h-6 text-yellow-500" />
        <p className="text-sm sm:text-lg font-medium dark:text-yellow-300 text-yellow-700">
          Note: The route analysis and summary stats are a{" "}
          <b>premium feature</b>. Currently <b className="underline">FREE ON OPEN BETA</b>.
        </p>
      </div> */}

      <div className="flex gap-3 md:gap-4 items-center">
        <RevalidateRoutesButton userId={user.id} />

        <ExportFlightsCSVBtn
          routesWithDistances={routesWithDistances}
          aircraftArray={aircraftArray.result}
          subscription={subscription as Subscription}
        />
      </div>

      <div className={cn(
        "grid grid-cols-1 lg:col-span-3",
        "bg-gray-50 dark:bg-gray-800",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[20px] md:rounded-[25px]",
        "p-4 md:p-6"
      )}>
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_2fr_2fr] gap-3 md:gap-4">
          <div className={cn(
            "bg-transparent rounded-[15px] p-3 md:p-4",
            "text-gray-800 dark:text-white",
            "flex flex-col gap-2 items-center justify-center h-full"
          )}>
            {customUserImages.find(
              (user: any) => user.username === userMetadata.ifcUsername
            )?.image ? (
              <img
                src={
                  customUserImages.find(
                    (user: any) => user.username === userMetadata.ifcUsername
                  )?.image
                }
                alt={userMetadata.ifcUsername}
                className="max-w-16 md:max-w-20 w-full max-h-16 md:max-h-20 h-full border-gray-400 dark:border-gray-600 border-2 rounded-full"
              />
            ) : (
              <RiCopilotFill className="w-10 h-10 md:w-12 md:h-12" />
            )}
            <p className="text-xs md:text-sm font-bold tracking-tight">@{userMetadata.ifcUsername}</p>
          </div>

          <div className="flex justify-between items-center gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-800 dark:text-gray-100">
                {uniqueRoutes.length}{" "}
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-bold">
                  Unique Routes
                </span>
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                <b className="text-base md:text-lg font-black text-gray-800 dark:text-gray-200">{totalDomesticRoutes}</b>{" "}
                Domestic
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                <b className="text-base md:text-lg font-black text-gray-800 dark:text-gray-200">{totalInternationalRoutes}</b>{" "}
                International
              </p>
            </div>

            <div className={cn(
              "bg-blue-100 dark:bg-blue-900/30",
              "text-blue-600 dark:text-blue-400",
              "rounded-[12px] md:rounded-[15px]",
              "p-3 md:p-4",
              "flex flex-col gap-2 items-center justify-center h-full"
            )}>
              <FaRoute className="w-10 h-10 md:w-12 md:h-12" />
            </div>
          </div>
          <div className="flex justify-between items-center gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-800 dark:text-gray-100">
                {maintenanceMode
                  ? "Under Maintenance"
                  : shortenNumber(totalDistanceTraveled)}{" "}
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-bold">
                  Nautical Miles
                </span>
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                <b className="text-base md:text-lg font-black text-gray-800 dark:text-gray-200">
                  {shortenNumber(totalDistanceTraveled * 1.1508)}
                </b>{" "}
                Miles
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                <b className="text-base md:text-lg font-black text-gray-800 dark:text-gray-200">
                  {shortenNumber(totalDistanceTraveled * 1.852)}
                </b>{" "}
                Kilometers
              </p>
            </div>

            <div className={cn(
              "bg-green-100 dark:bg-green-900/30",
              "text-green-600 dark:text-green-400",
              "rounded-[12px] md:rounded-[15px]",
              "p-3 md:p-4",
              "flex flex-col gap-2 items-center justify-center h-full"
            )}>
              <GiPathDistance className="w-10 h-10 md:w-12 md:h-12" />
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 flex-col">
            <div className={cn(
              "bg-white dark:bg-gray-700",
              "border-2 border-gray-200 dark:border-gray-600",
              "rounded-[12px] md:rounded-[15px]",
              "px-3 md:px-4 py-2 md:py-3",
              "flex gap-3 items-center justify-between h-full"
            )}>
              {/* Average Route Length */}
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-bold">
                Average Route
              </span>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium flex flex-col text-right">
                <b className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100">
                  {Math.round(totalDistanceTraveled / uniqueRoutes.length || 0)}
                </b>{" "}
                <span className="text-xs font-bold">NM</span>
              </div>
            </div>
            <div className={cn(
              "bg-white dark:bg-gray-700",
              "border-2 border-gray-200 dark:border-gray-600",
              "rounded-[12px] md:rounded-[15px]",
              "px-3 md:px-4 py-2 md:py-3",
              "flex gap-3 items-center justify-between h-full"
            )}>
              {/* Longest Route */}
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-bold">
                Longest Route
              </span>
              <div className="flex flex-col gap-0.5 text-right">
                <div className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-100">
                  <b>{longestRouteInfo.origin || "N/A"}</b> →{" "}
                  <b>{longestRouteInfo.destination || "N/A"}</b>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                  {longestRouteInfo.distance || 0} NM
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Summary Stats Cards (NEW 👆) */}

      {/* Route Map */}
      <div className={cn(
        "lg:col-span-2",
        "bg-white dark:bg-gray-800",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[20px] md:rounded-[25px]",
        "min-h-[500px]",
        "overflow-hidden"
      )}>
        <RouteMap routes={uniqueRoutes} />
      </div>

      {/* Top 5 Countries List */}
      <Card className={cn(
        "bg-gradient-to-br from-purple-500 to-indigo-600",
        "dark:from-purple-600 dark:to-indigo-700",
        "border-2 border-purple-400 dark:border-purple-700",
        "rounded-[20px] md:rounded-[25px]"
      )}>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl font-bold tracking-tight text-white">
            Top 5 Countries
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-white/90 font-semibold">
            Countries you flew to the most
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4 md:pb-6">
          <div className="space-y-4 md:space-y-6">
            {maintenanceMode ? (
              <div className="text-center py-8">
                <div className="text-white/70 mb-2">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 mx-auto"
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
                <p className="text-white font-bold">Under Maintenance</p>
                <p className="text-sm text-white/80 mt-1 font-medium">
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
                  <div key={countryName} className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={cn(
                          "flex items-center justify-center",
                          "w-7 h-7 md:w-8 md:h-8",
                          "rounded-full",
                          "bg-white dark:bg-white/95",
                          "text-purple-600",
                          "text-xs md:text-sm font-black"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm md:text-base text-white tracking-tight">
                            {countryName}
                          </p>
                          <p className="text-xs md:text-sm text-white/90 font-semibold">
                            {count} flight{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base md:text-lg font-black text-white">{count}</p>
                        <p className="text-xs text-white/90 font-bold">
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
                      className="h-2 md:h-3 bg-white/30"
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70 font-bold">No countries found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <MostFlownRoutesBarChart chartData={flownRoutesData} />
      </div>

      <div className={cn(
        "lg:col-span-3",
        "bg-gray-50 dark:bg-gray-800",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[20px] md:rounded-[25px]",
        "p-4 md:p-6"
      )}>
        <div className="mb-4 md:mb-6">
          <div className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            Flight Route Metrics
          </div>
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
            Your flight route metrics by flight duration, continents, and
            domestic vs international flights
          </div>
        </div>

        { flights.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-transparent w-full">
            <FlightHaulsPieChart chartData={getFlightHaulCategorizerData()} />
          </div>
          <div className="bg-transparent w-full">
            <FlightContinentsPieChart
              chartData={getFlightContinentsFlewToData()}
            />
          </div>
          <div className="bg-transparent w-full">
            <FlightDomesticIntlPieChart
              chartData={getDomesticInternationalAmountsData()}
            />
          </div>
        </div>
        ) : (
          <div className={cn(
            "text-center py-8",
            "bg-white dark:bg-gray-700",
            "border-2 border-gray-200 dark:border-gray-600",
            "rounded-[15px] md:rounded-[20px]"
          )}>
            <p className="text-gray-500 dark:text-gray-400 font-bold">No flight routes found</p>
          </div>
        )}
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
