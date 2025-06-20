"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import FullScreenMap from "@/components/dashboard-ui/flights/maps/full-screen-map";
import {
  getFlightsFromServer,
} from "@/lib/actions";
import { customUserImages } from "@/lib/data";
import { BiSolidFaceMask } from "react-icons/bi";

import { aviationCompliments, alternator, unknownUserCompliments } from "@/lib/data";
import Link from "next/link";
import { FaRegFaceGrinBeam } from "react-icons/fa6";

const fetcher = () => getFlightsFromServer();

const MapDarkPage = () => {
  const {
    data: flights = [],
    error,
    isLoading,
  } = useSWR("flights", fetcher, {
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  // Add this helper function before the component
  const getConsistentEmojiForUser = (username: string) => {
    // Handle null/undefined usernames
    if (!username) {
      return "🧟"; // Return first emoji as fallback
    }

    // Simple hash function to convert username to a consistent number
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      const char = username.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Use absolute value and modulo to get consistent index
    return alternator[Math.abs(hash) % alternator.length];
  };

  // Roles:
  // Flyer: Not registered in IFlytics
  // User: Registered in IFlytics
  // Staff: Staff Member in Infinite Flight

  const findUserRole = (username: string) => {
    return (
      customUserImages.find((image) => image.username === username)?.role ||
      "flyer"
    );
  };

  // Memoize quirkyFlights to prevent constant recreation
  const quirkyFlights = useMemo(() => {
    return flights.map((flight: any) => ({
      ...flight,
      role: findUserRole(flight.username),
      emoji: getConsistentEmojiForUser(flight.username),
      compliment: flight.username 
        ? aviationCompliments[Math.abs(flight.username.split('').reduce((a: any, b: any) => a + b.charCodeAt(0), 0)) % aviationCompliments.length]
        : unknownUserCompliments[Math.floor(Math.random() * unknownUserCompliments.length)], // Random for unknown users
      customImage: customUserImages.find((image) => image.username === flight.username)?.image,
    }));
  }, [flights]); // Only recreate when flights data actually changes

  if (error) {
    return (
      <div className="h-[calc(100vh-120px)] w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load flight data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      {/* Loading overlay */}
      {isLoading && flights.length === 0 && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            Loading flights...
          </div>
        </div>
      )}


      {/* Live indicator */}
      <div className="absolute bottom-4 left-4 z-40 bg-[#FFEFD5]/50 backdrop-blur-sm px-3 py-2 rounded-lg ">
        <div className="flex items-center gap-2 w-[200px]">
          <div
            className={`w-2 h-2 rounded-full ${
              isLoading ? "bg-yellow-400" : "bg-green-400"
            } animate-pulse`}
          ></div>
          <span className="text-sm font-medium">
            {isLoading ? "Updating..." : "Expert Server"} • {flights.length}{" "}
            flights
          </span>
        </div>
      </div>

      {/* <Link href="/map/game">
        <div className="absolute bottom-4 right-4 z-50"> */}
          {/* Gradient border wrapper */}
          {/* <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 p-[4px] rounded-lg shadow-lg"> */}
            {/* Inner content */}
            {/* <div className="bg-gray-700 text-light backdrop-blur-sm rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-600 transition-colors">
              <BiSolidFaceMask className="text-light" />
              <h1 className="hidden sm:block tracking-tight font-bold">Find the Pilot</h1>
            </div>
          </div>
        </div>
      </Link> */}

      <FullScreenMap flights={quirkyFlights} styleUrl="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"/>
    </div>
  );
};

export default MapDarkPage;
