"use client";

import dynamic from "next/dynamic";
import type { FlightRouteData } from "@/lib/flight-route-utils";

const UserFlightMap = dynamic(
  () => import("@/components/dashboard-ui/flights/maps/user-flight-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded-[15px]" />
    ),
  }
);

const FlightRouteMapRenderer = ({ route }: { route: FlightRouteData }) => {
  const { originCoordinates, destinationCoordinates } = route;

  return (
    <div className="h-48 w-full rounded-[15px] overflow-hidden border border-gray-200 dark:border-gray-700">
      <UserFlightMap
        flightId={route.flightId}
        originAirport={route.origin}
        destinationAirport={route.destination}
        originCoordinates={[originCoordinates.longitude, originCoordinates.latitude]}
        destinationCoordinates={[
          destinationCoordinates.longitude,
          destinationCoordinates.latitude,
        ]}
        className="rounded-[15px]"
      />
    </div>
  );
};

export default FlightRouteMapRenderer;
