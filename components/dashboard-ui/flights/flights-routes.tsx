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
import { customUserImages } from "@/lib/data";

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

let maintenanceMode = false;

const FlightsRoutes = async ({ flights }: { flights: Flight[] }) => {
  // console.log(`🔄 FlightsRoutes called at ${new Date().toISOString()}`); --> Debugging

  const validFlights = flights.filter((flight) => {
    return (
      flight.totalTime > 10 && flight.originAirport && flight.destinationAirport
    );
  });

  // Get the user ID for the cache key
  const user = await getUser();
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
  const routesWithDistances = await getAllFlightRoutes(flights, user.id);
  // const endTime = Date.now(); --> Debugging

  const totalDomesticRoutes = routesWithDistances.filter(
    (route) => route.originIsoCountry === route.destinationIsoCountry
  ).length;
  const totalInternationalRoutes = routesWithDistances.filter(
    (route) => route.originIsoCountry !== route.destinationIsoCountry
  ).length;

  // console.log(`⏱️ Route calculation took ${endTime - startTime}ms`); --> Debugging

  const uniqueRoutes = getUniqueRoutes(
    routesWithDistances.map((route) => ({
      ...route,
      originIsoCountry: route.originIsoCountry || "US",
      destinationIsoCountry: route.destinationIsoCountry || "US",
    }))
  );

  const { totalDistanceTraveled, longestRouteInfo } =
    await calculateTotalDistance(validFlights);

  const top5Countries = getTop5Countries(uniqueRoutes);

  const flightTimeCategorizerData = getFlightTimeCategorizerData(validFlights);

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
              <Dialog>
                <DialogTrigger className="text-light !text-xs py-1 px-2 font-medium bg-gray-700 rounded-full hover:bg-gray-800 transition-all duration-300 cursor-pointer self-start">
                  View All
                </DialogTrigger>

                <DialogContent className="min-h-[500px] max-h-[90svh] max-w-3xl overflow-y-auto bg-[#FFD6BA] !border-none">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      All Flight Routes
                    </DialogTitle>
                    <p className="text-gray-500 text-sm">
                      Complete overview of your unique flight routes and
                      distances
                    </p>

                    {/* Legend */}
                    <div className="flex flex-col items-center gap-2 mt-4 p-3 bg-[#fbe4d4] rounded-lg">
                      <h3 className="text-lg font-bold tracking-tight text-orange-700 flex gap-2 items-center">
                        <FaRoute className="w-4 h-4" /> Route Types (IATA)
                      </h3>
                      <div className="flex justify-center items-center gap-6 font-medium">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">
                              Short (≤3h)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">
                              Medium (3-6h)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">
                              Long (6h+)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="mt-4">
                    <Table>
                      <TableCaption>
                        Total of {uniqueRoutes.length} unique routes flown
                      </TableCaption>
                      <TableHeader>
                        <TableRow className="!rounded-lg border-b border-orange-300/50">
                          <TableHead className="w-[120px]">Origin</TableHead>
                          <TableHead className="w-[120px]">
                            Destination
                          </TableHead>
                          <TableHead className="text-center">Time</TableHead>
                          <TableHead className="text-right">Distance</TableHead>
                          <TableHead className="text-center w-[80px]">
                            Type
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uniqueRoutes.map((route, index) => {
                          // Calculate route type based on time
                          const getRouteType = (totalTime: number) => {
                            if (totalTime <= 180)
                              return {
                                label: "Short Haul",
                                color: "bg-green-500",
                                dotColor: "bg-green-500",
                              };
                            if (totalTime <= 360 && totalTime > 180)
                              return {
                                label: "Medium Haul",
                                color: "bg-yellow-500",
                                dotColor: "bg-yellow-500",
                              };
                            return {
                              label: "Long Haul",
                              color: "bg-red-500",
                              dotColor: "bg-red-500",
                            };
                          };

                          const routeType = getRouteType(route.totalTime || 0);

                          return (
                            <TableRow
                              key={index}
                              className="hover:bg-[#fbe4d4] !rounded-lg border-b border-orange-300/50"
                            >
                              <TableCell className="font-mono font-medium text-blue-600">
                                {route.origin}
                              </TableCell>
                              <TableCell className="font-mono font-medium text-blue-600">
                                {route.destination}
                              </TableCell>
                              <TableCell className="text-center">
                                {route.totalTime ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {convertMinutesToHours(route.totalTime)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    {maintenanceMode
                                      ? "Under Maintenance"
                                      : route.totalTime}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {route.distance ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {Math.round(
                                        route.distance
                                      ).toLocaleString()}{" "}
                                      nm
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {Math.round(
                                        route.distance * 1.852
                                      ).toLocaleString()}{" "}
                                      km
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    {maintenanceMode
                                      ? "Under Maintenance"
                                      : route.distance || "N/A"}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {/* Colored Circle instead of text badge */}
                                <div className="flex justify-center">
                                  <div
                                    className={`w-4 h-4 ${routeType.dotColor} rounded-full`}
                                    title={routeType.label} // Tooltip on hover
                                  ></div>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {/* Updated Summary Stats - using circles too */}
                    <div className="mt-6 p-4 bg-[#fbe4d4] rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Route Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {uniqueRoutes.length}
                          </div>
                          <div className="text-gray-600">Total Routes</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="text-xl font-bold text-green-600">
                              {
                                uniqueRoutes.filter(
                                  (r) => (r.totalTime || 0) <= 180
                                ).length
                              }
                            </div>
                          </div>
                          <div className="text-gray-600">Short Haul</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="text-xl font-bold text-yellow-600">
                              {
                                uniqueRoutes.filter(
                                  (r) =>
                                    (r.totalTime || 0) > 180 &&
                                    (r.totalTime || 0) <= 360
                                ).length
                              }
                            </div>
                          </div>
                          <div className="text-gray-600">Medium Haul</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="text-xl font-bold text-red-600">
                              {
                                uniqueRoutes.filter(
                                  (r) => (r.totalTime || 0) > 360
                                ).length
                              }
                            </div>
                          </div>
                          <div className="text-gray-600">Long Haul</div>
                        </div>
                      </div>

                      {/* Total Distance */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {uniqueRoutes
                              .reduce(
                                (total, route) => total + (route.distance || 0),
                                0
                              )
                              .toLocaleString()}{" "}
                            nm
                          </div>
                          <div className="text-gray-600">
                            Total Distance Covered
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(
                              uniqueRoutes.reduce(
                                (total, route) => total + (route.distance || 0),
                                0
                              ) * 1.852
                            ).toLocaleString()}{" "}
                            km
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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

      <div className="lg:col-span-3">
        <FlightTimeCategorizerBarChart
          flightTimeCategorizerData={flightTimeCategorizerData}
        />
      </div>
    </div>
  );
};

export default FlightsRoutes;
