import { calculateDistanceBetweenAirports } from "@/lib/cache/flightinsightsdata";

export type FlightRouteData = {
  flightId: string;
  origin: string;
  destination: string;
  originCoordinates: { latitude: number; longitude: number };
  destinationCoordinates: { latitude: number; longitude: number };
  callsign?: string;
  created?: string;
  totalTime?: number;
  server?: string;
  xp?: number;
  distance?: number;
};

function hasValidCoordinates(
  coords: { latitude: number; longitude: number } | undefined
) {
  if (!coords) return false;
  const { latitude, longitude } = coords;
  if (latitude === 0 && longitude === 0) return false;
  return (
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export function buildFlightRoute(flight: {
  id: string;
  originAirport: string;
  destinationAirport: string;
  callsign?: string;
  created?: string;
  totalTime?: number;
  server?: string;
  xp?: number;
}): FlightRouteData | null {
  const { originAirport, destinationAirport } = flight;

  if (!originAirport || !destinationAirport) return null;
  if (originAirport === destinationAirport) return null;

  const { distance, originCoordinates, destinationCoordinates } =
    calculateDistanceBetweenAirports(originAirport, destinationAirport);

  if (
    !hasValidCoordinates(originCoordinates) ||
    !hasValidCoordinates(destinationCoordinates)
  ) {
    return null;
  }

  return {
    flightId: flight.id,
    origin: originAirport,
    destination: destinationAirport,
    originCoordinates,
    destinationCoordinates,
    callsign: flight.callsign,
    created: flight.created,
    totalTime: flight.totalTime,
    server: flight.server,
    xp: flight.xp,
    distance,
  };
}

export function buildFlightRoutes(
  flights: {
    id: string;
    originAirport: string;
    destinationAirport: string;
    callsign?: string;
    created?: string;
    totalTime?: number;
    server?: string;
    xp?: number;
  }[]
): FlightRouteData[] {
  return flights
    .map(buildFlightRoute)
    .filter((route): route is FlightRouteData => route !== null);
}
