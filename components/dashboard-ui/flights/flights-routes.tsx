import React from "react";
import { VscCopilotWarning } from "react-icons/vsc";
import { Flight } from "@/lib/types";
import {
  calculateDistanceBetweenAirports,
  calculateTotalDistance,
  getAllUniqueFlightRoutes,
} from "@/lib/cache/flightinsightsdata";
import { FaRoute } from "react-icons/fa";
import { RiPinDistanceLine } from "react-icons/ri";

import { Button } from "@/components/ui/button";
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

const FlightsRoutes = async ({ flights }: { flights: Flight[] }) => {
  const validFlights = flights.filter((flight) => {
    return (
      flight.totalTime > 10 && flight.originAirport && flight.destinationAirport
    );
  });

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
  }
  const uniqueRoutes = await getAllUniqueFlightRoutes(validFlights);

  const { totalDistanceTraveled, longestRouteInfo } =
    await calculateTotalDistance(validFlights);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3 border-2 border-yellow-200 bg-yellow-50 p-6 rounded-lg flex items-center gap-2">
        <VscCopilotWarning className="w-6 h-6 text-yellow-500" />
        <p className="text-sm text-yellow-700">
          Note: The route analysis and summary stats are a{" "}
          <b>premium feature</b>. Currently free to use during development/early
          alpha
        </p>
      </div>
      {/* Summary Stats Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Total Unique Routes
              </p>
              <p className="text-3xl font-bold">{uniqueRoutes.length}</p>
            </div>
            <div className="bg-blue-400/30 p-3 rounded-full">
              <FaRoute className="w-6 h-6 text-blue-100" />
            </div>
          </div>
          <Dialog>
            <DialogTrigger className="text-blue-100 !text-xs py-1 px-2 font-medium bg-blue-400/30 rounded-full hover:bg-blue-400/50 transition-all duration-300 cursor-pointer self-start">
              View All
            </DialogTrigger>

            <DialogContent className="min-h-[500px] max-h-[700px] max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  All Flight Routes
                </DialogTitle>
                <p className="text-gray-500 text-sm">
                  Complete overview of your unique flight routes and distances
                </p>
              </DialogHeader>

              <div className="mt-4">
                <Table>
                  <TableCaption>
                    Total of {uniqueRoutes.length} unique routes flown
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Origin</TableHead>
                      <TableHead className="w-[120px]">Destination</TableHead>
                      <TableHead className="text-right">Distance</TableHead>
                      <TableHead className="text-center">Route Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueRoutes.map((route, index) => {
                      // Calculate route type based on distance
                      const getRouteType = (distance: number) => {
                        if (distance < 500)
                          return {
                            label: "Short Haul",
                            color: "bg-green-100 text-green-800",
                          };
                        if (distance < 1500)
                          return {
                            label: "Medium Haul",
                            color: "bg-yellow-100 text-yellow-800",
                          };
                        return {
                          label: "Long Haul",
                          color: "bg-red-100 text-red-800",
                        };
                      };

                      const routeType = getRouteType(route.distance || 0);

                      return (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-mono font-medium text-blue-600">
                            {route.origin}
                          </TableCell>
                          <TableCell className="font-mono font-medium text-blue-600">
                            {route.destination}
                          </TableCell>
                          <TableCell className="text-right">
                            {route.distance ? (
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {Math.round(route.distance).toLocaleString()}{" "}
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
                                <span className="text-gray-400 italic">Calculating...</span> 
                            )
                        
                        
                        }
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${routeType.color}`}
                            >
                              {routeType.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Summary Stats at Bottom */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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
                      <div className="text-xl font-bold text-green-600">
                        {
                          uniqueRoutes.filter((r) => (r.distance || 0) < 500)
                            .length
                        }
                      </div>
                      <div className="text-gray-600">Short Haul</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-yellow-600">
                        {
                          uniqueRoutes.filter(
                            (r) =>
                              (r.distance || 0) >= 500 &&
                              (r.distance || 0) < 1500
                          ).length
                        }
                      </div>
                      <div className="text-gray-600">Medium Haul</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">
                        {
                          uniqueRoutes.filter((r) => (r.distance || 0) >= 1500)
                            .length
                        }
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

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Total Distance
              </p>
              <p className="text-3xl font-bold">{shortenNumber(totalDistanceTraveled)}</p>
              <p className="text-green-100 text-xs">nautical miles</p>
            </div>
            <div className="bg-green-400/30 p-3 rounded-full">
              <RiPinDistanceLine className="w-6 h-6 text-green-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Avg Route Length
              </p>
              <p className="text-3xl font-bold">
                {shortenNumber(Math.round(totalDistanceTraveled / validFlights.length))}
              </p>
              <p className="text-purple-100 text-xs">nautical miles</p>
            </div>
            <div className="bg-purple-400/30 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                Longest Route
              </p>
              <p className="text-2xl font-bold">
                {longestRouteInfo.origin}-{longestRouteInfo.destination}
              </p>
              <p className="text-orange-100 text-xs">
                {longestRouteInfo.distance} nm
              </p>
            </div>
            <div className="bg-orange-400/30 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Route Map */}
      {/* <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Route Map</h3>
                <div className="flex items-center gap-2">
                  <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                    <option>All Routes</option>
                    <option>Most Frequent</option>
                    <option>Longest Distance</option>
                    <option>Recent Routes</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6"> */}
      {/* Placeholder for the map */}
      {/* <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Interactive Route Map</h4>
                  <p className="text-gray-500 text-sm">
                    Visual representation of your flight routes<br />
                    with interactive markers and flight paths
                  </p>
                </div>
                 */}
      {/* Simulated route lines */}
      {/* <div className="absolute inset-0">
                  <svg className="w-full h-full">
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.6"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d="M50,100 Q200,50 350,150" 
                      stroke="url(#routeGradient)" 
                      strokeWidth="3" 
                      fill="none"
                      className="animate-pulse"
                    />
                    <path 
                      d="M100,250 Q250,150 400,200" 
                      stroke="url(#routeGradient)" 
                      strokeWidth="3" 
                      fill="none"
                      className="animate-pulse"
                      style={{animationDelay: '1s'}}
                    />
                    <path 
                      d="M150,320 Q300,200 450,280" 
                      stroke="url(#routeGradient)" 
                      strokeWidth="3" 
                      fill="none"
                      className="animate-pulse"
                      style={{animationDelay: '2s'}}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div> */}

      {/* Top Routes List */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Most Frequent Routes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { from: 'KJFK', to: 'EGLL', flights: 12, distance: '3,459 nm', popular: true },
                  { from: 'KLAX', to: 'KSFO', flights: 8, distance: '347 nm', popular: false },
                  { from: 'KORD', to: 'KATL', flights: 6, distance: '606 nm', popular: false },
                  { from: 'KDEN', to: 'KPHX', flights: 5, distance: '602 nm', popular: false },
                  { from: 'KBOS', to: 'KDCA', flights: 4, distance: '399 nm', popular: false }
                ].map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium text-gray-900">{route.from}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-mono text-sm font-medium text-gray-900">{route.to}</span>
                      </div>
                      {route.popular && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{route.flights} flights</div>
                      <div className="text-xs text-gray-500">{route.distance}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
                View All Routes →
              </button>
            </div>
          </div> */}

      {/* Route Analytics */}
      {/* <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6"> */}

      {/* Distance Distribution Chart */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Route Distance Distribution</h3>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">Bar Chart</p>
                    <p className="text-gray-500 text-xs">Short/Medium/Long haul distribution</p>
                  </div>
                </div>
              </div>
            </div> */}

      {/* Route Frequency Over Time */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Routes Over Time</h3>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">Line Chart</p>
                    <p className="text-gray-500 text-xs">Route frequency trends</p>
                  </div>
                </div>
              </div>
            </div> */}
    </div>
  );
};

export default FlightsRoutes;
