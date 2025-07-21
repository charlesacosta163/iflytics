import { Flight, FlightRoute } from "../types";
import { getAircraft, getAirport } from "../actions";
import { getAirportLocally } from "../sync-actions";
import { aircraftImages } from "../data";
import { unstable_cache as cache, unstable_cache } from "next/cache";
import { getAircraftCached } from "./flightdata";
import { isoCountryCodes } from "../data";
import { airports } from '../airports-lib';

/*
getAircraftAndLivery(aircraftId: string, liveryId: string)
sample response:
{
  id: 'cfa7fde0-b5c3-40a9-862d-cd7baf3e4fb0',
  aircraftID: 'af055734-aaed-44ad-a2d0-5b9046f29d0d',
  aircraftName: 'E175',
  liveryName: 'United Airlines'
}


Sample flight object:
{
    id: '43cd3c61-96ef-468a-98ae-b8e7900e49ca',
    created: '2025-05-28T03:52:22.674607Z',
    userId: '1577e4a9-98c7-4d61-9ff3-cf0d003284e4',
    aircraftId: '958486b0-1ef4-4efd-bee0-ea94e96f6c96',
    liveryId: '5af2afed-51a9-45de-a442-709f949a5443',
    callsign: 'Air Canada 8575',
    server: 'Expert',
    dayTime: 45.495136,
    nightTime: 0,
    totalTime: 142.74648,
    landingCount: 1,
    originAirport: 'KLAX',
    destinationAirport: 'CYVR',
    xp: 1647,
    worldType: 3,
    violations: []
  }
*/

export function getFlightOverviewStatsPerTimeFrame(flights: Flight[]) {
  const totalFlights = flights.length;
  const totalTime = Math.round(
    flights.reduce((acc, flight) => acc + flight.totalTime, 0)
  );
  const totalLandings = flights.reduce(
    (acc, flight) => acc + flight.landingCount,
    0
  );
  const totalXp = flights.reduce((acc, flight) => acc + flight.xp, 0);

  return {
    totalFlights,
    totalTime,
    totalLandings,
    totalXp,
  };
}

export function getFlightTimePerTimeFrame(flights: Flight[]) {
  // Get the flight activity in a specific time frame
  // Adhere to shadcn/ui Area Chart requirements

  const dailyTotals = new Map();

  flights.forEach((flight) => {
    // Extract date (without time) from the flight's created timestamp
    const flightDate = new Date(flight.created).toISOString().split("T")[0];

    // Get current total for this day or initialize to 0
    const currentTotal = dailyTotals.get(flightDate) || 0;

    // Add this flight's time to the daily total
    dailyTotals.set(flightDate, currentTotal + flight.totalTime);
  });

  // Convert to array of objects for easier use
  return Array.from(dailyTotals.entries())
    .map(([date, totalTime]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      }),
      totalTime,
    }))
    .reverse();

  /* SOME IMPORTANT NOTES:
    - If timeframe is last 30 days, return the last 30 days of data
    - If timeframe is is last 12 months, return the last 12 months of data
    - If timeframe is 2025, return the months of 2025 total flight time
    - If timeframe is 2024, return the months of 2024 total flight time
  */
}

export function getRecentFlightInsights(flights: Flight[]) {
  // Goal: Get the total landing count, total xp, total flight time in the specified time frame

  const totalLandings = flights.reduce(
    (acc, flight) => acc + flight.landingCount,
    0
  );
  const totalXp = flights.reduce((acc, flight) => acc + flight.xp, 0);
  const totalTime = Math.round(
    flights.reduce((acc, flight) => acc + flight.totalTime, 0)
  );

  return {
    totalLandings,
    totalXp,
    totalTime,
  };
}

export function getFlightAveragesPerTimeFrame(flights: Flight[]) {
  // Return early with zeros if there are no flights
  if (!flights.length) {
    return {
      avgFlightTime: 0,
      avgLandingsPerFlight: 0,
      avgXpPerFlight: 0,
      avgXpPerLanding: 0,
    };
  }

  // Calculate totals first
  const totalFlights = flights.length;
  const totalTime = Math.round(
    flights.reduce((acc, flight) => acc + flight.totalTime, 0)
  );
  const totalLandings = flights.reduce(
    (acc, flight) => acc + flight.landingCount,
    0
  );
  const totalXp = flights.reduce((acc, flight) => acc + flight.xp, 0);

  // Calculate averages with proper fallbacks to avoid division by zero
  const avgFlightTime = Math.round(totalTime / totalFlights) || 0;
  const avgLandingsPerFlight = totalLandings / totalFlights || 0;
  const avgXpPerFlight = Math.round(totalXp / totalFlights) || 0;
  const avgXpPerLanding = totalLandings
    ? Math.round(totalXp / totalLandings)
    : 0;

  return {
    avgFlightTime,
    avgLandingsPerFlight,
    avgXpPerFlight,
    avgXpPerLanding,
  };
}

export async function getAllPlayerAircraftUsageData(flights: Flight[]) {
  try {
    // Steps 1 & 2 are correct
    const allAircraftIds = flights.map((flight) => flight.aircraftId);
    const uniqueAircraftIds = [...new Set(allAircraftIds)];

    const aircraftUsageCount = allAircraftIds.reduce((acc, aircraftId) => {
      acc[aircraftId] = (acc[aircraftId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Process in smaller batches to avoid overwhelming the API
    const processBatch = async (ids: string[], batchSize = 5) => {
      const results = [];
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (aircraftId) => {
            try {
              // Use cached aircraft data
              const aircraft = await getAircraftCached(aircraftId);

              return {
                name:
                  aircraft?.name || `Unknown Aircraft`,
                count: aircraftUsageCount[aircraftId],
                id: aircraftId, // Store the ID for debugging
              };
            } catch (innerError) {
              console.error(
                `Error processing aircraft ${aircraftId}:`,
                innerError
              );
              return {
                name: `Aircraft ${aircraftId.substring(0, 6)}...`,
                count: aircraftUsageCount[aircraftId],
                id: aircraftId,
                error: true,
              };
            }
          })
        );
        results.push(...batchResults);
      }
      return results;
    };

    const aircraftUsageData = await processBatch(uniqueAircraftIds);

    // Sort by usage count (most used first)
    return aircraftUsageData.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error in getAllPlayerAircraftUsageData:", error);
    // Return a sensible fallback
    return [{ name: "Data unavailable", count: 0, error: true }];
  }
}

export async function getMostVisitedOriginAndDestinationAirports(
  flights: Flight[]
) {
  // Filter out flights with null/undefined airports
  const validFlights = flights.filter(
    (flight) => flight.originAirport && flight.destinationAirport
  );

  // Get all valid origin and destination airports
  const allOrigins = validFlights.map((flight) => flight.originAirport);
  const allDestinations = validFlights.map(
    (flight) => flight.destinationAirport
  );

  // Create a frequency map of origin and destination airports
  const originAirportCount = allOrigins.reduce((acc, airport) => {
    acc[airport] = (acc[airport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const destinationAirportCount = allDestinations.reduce((acc, airport) => {
    acc[airport] = (acc[airport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by usage count (most visited first)
  const sortedOrigins = Object.entries(originAirportCount).sort(
    (a, b) => b[1] - a[1]
  );
  const sortedDestinations = Object.entries(destinationAirportCount).sort(
    (a, b) => b[1] - a[1]
  );

  // Handle case where there might be no valid airports
  if (sortedOrigins.length === 0 || sortedDestinations.length === 0) {
    return {
      topOrigin: "N/A",
      topDestination: "N/A",
    };
  }

  // Get the top most visited airports
  const topOrigin = sortedOrigins[0];
  const topDestination = sortedDestinations[0];

  const originAirportInfo = getAirportLocally(topOrigin[0]);
  const destinationAirportInfo = getAirportLocally(topDestination[0]);

  //console.log(originAirportInfo)
  //console.log(destinationAirportInfo)

  return {
    topOrigin: topOrigin[0],
    originAirportInfo: originAirportInfo,
    originCount: topOrigin[1],
    topDestination: topDestination[0],
    destinationAirportInfo: destinationAirportInfo,
    destinationCount: topDestination[1],
  };
}

export function matchAircraftNameToImage(aircraftName: string) {
  // Image name sample: a220.png
  // Aircraft name sample: Airbus A319

  const image = aircraftImages.find((image) =>
    aircraftName.toLowerCase().includes(image.key.toLowerCase())
  );

  return image?.image || "placeholder.png";
}

// Cache the Flight Route Data
function createUserFlightRoutesCache(userId: string) {
  return unstable_cache(
    async (flights: Flight[]) => {
      // console.log(`⏳ Calculating routes for user ${userId} - ${flights.length} flights...`); --> Debugging
      
      const routePairs = flights.map(flight => ({
        flightId: flight.id,
        created: flight.created,
        origin: flight.originAirport,
        destination: flight.destinationAirport,
        aircraftId: flight.aircraftId,
        server: flight.server,
        totalTime: flight.totalTime,
      }));

      const routesWithDistances = await Promise.all(
        routePairs.map(async (route) => {
          const { distance, originCoordinates, destinationCoordinates, originIsoCountry, destinationIsoCountry, originContinent, destinationContinent } = calculateDistanceBetweenAirports(route.origin, route.destination);
          return {
            flightId: route.flightId,
            created: route.created,
            origin: route.origin || "????",
            originIsoCountry: originIsoCountry,
            originContinent: originContinent,
            originCoordinates: originCoordinates,
            destination: route.destination || "????",
            destinationIsoCountry: destinationIsoCountry,
            destinationContinent: destinationContinent,
            destinationCoordinates: destinationCoordinates,
            distance: distance,
            totalTime: route.totalTime,
            aircraftId: route.aircraftId,
            server: route.server,
          };
        })
      );

      // console.log(`✅ Calculated ${routesWithDistances.length} routes for user ${userId}`); --> Debugging
      // Add also total domestic and international routes
      return routesWithDistances;
    },
    [`flight-routes-${userId}`], // Now userId is in scope!
    {
      revalidate: 3 * 60 * 60, // 3 hours
      tags: [`flight-routes`, `user-${userId}`],
    }
  );
}

// Usage:
export async function getAllFlightRoutes(flights: Flight[], userId: string) {
  const cachedFunction = createUserFlightRoutesCache(userId);
  return cachedFunction(flights);
}

// export async function getAllFlightRoutes(flights: Flight[]) {
//   // First, get unique route combinations
//   const routePairs = flights.map(flight => ({
//     flightId: flight.id,
//     created: flight.created,
//     origin: flight.originAirport,
//     destination: flight.destinationAirport,
//     aircraftId: flight.aircraftId,
//     server: flight.server,
//     totalTime: flight.totalTime,
//   }));

//   // Then calculate distances for each unique route
//   const routesWithDistances = await Promise.all(
//     routePairs.map(async (route) => {
//       const { distance, originCoordinates, destinationCoordinates } = await calculateDistanceBetweenAirports(route.origin, route.destination);
//       return {
//         flightId: route.flightId,
//         created: route.created,
//         origin: route.origin,
//         originCoordinates: originCoordinates,
//         destination: route.destination,
//         destinationCoordinates: destinationCoordinates,
//         distance: distance,
//         totalTime: route.totalTime,
//         aircraftId: route.aircraftId,
//         server: route.server,
//       };
//     })
//   );

//   return routesWithDistances;
// }

export function getUniqueRoutes(routesWithDistances: {
  flightId: string;
  created: string;
  origin: string;
  originIsoCountry: string;
  originContinent: string;
  originCoordinates: {
    latitude: number;
    longitude: number;
  };
  destination: string;
  destinationIsoCountry: string;
  destinationContinent: string;
  destinationCoordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  totalTime: number;
  aircraftId: string;
  server: string;
}[]) {
  // Create a Map to store unique route combinations
  const uniqueRoutesMap = new Map<string, any>();
  
  routesWithDistances.forEach(route => {
    // Create a unique key for each route combination (origin-destination)
    const routeKey = `${route.origin}-${route.destination}`;
    
    // Only keep the first occurrence of each unique route
    if (!uniqueRoutesMap.has(routeKey)) {
      uniqueRoutesMap.set(routeKey, {
        flightId: route.flightId,
        created: route.created,
        aircraftId: route.aircraftId,
        server: route.server,
        origin: route.origin,
        originIsoCountry: route.originIsoCountry,
        originContinent: route.originContinent,
        originCoordinates: route.originCoordinates,
        destination: route.destination,
        destinationIsoCountry: route.destinationIsoCountry,
        destinationContinent: route.destinationContinent,
        destinationCoordinates: route.destinationCoordinates,
        distance: route.distance,
        totalTime: route.totalTime,
      });
    }
  });
  
  // Convert Map values to array and filter out same origin-destination routes
  return Array.from(uniqueRoutesMap.values()).filter(route => route.origin !== route.destination);
}

export async function calculateTotalDistance(validFlights: Flight[]) {
  let totalDistanceTraveled = 0;
  let longestRouteInfo = {
    origin: "",
    destination: "",
    distance: 0,
  };

  for (const flight of validFlights) {
    const { distance } = calculateDistanceBetweenAirports(
      flight.originAirport,
      flight.destinationAirport
    );

    if (distance > longestRouteInfo.distance) {
      longestRouteInfo.origin = flight.originAirport;
      longestRouteInfo.destination = flight.destinationAirport;
      longestRouteInfo.distance = distance;
    }

    totalDistanceTraveled += distance;
  }
  return {
    totalDistanceTraveled,
    longestRouteInfo,
  };
};

/*
    Route Data Object: {
            flightId: route.flightId,
            created: route.created,
            origin: route.origin,
            originCoordinates: originCoordinates,
            destination: route.destination,
            destinationCoordinates: destinationCoordinates,
            distance: distance,
            totalTime: route.totalTime,
            aircraftId: route.aircraftId,
            server: route.server,
          };

    Sample Route Data Object:
     {
      flightId: '43cd3c61-96ef-468a-98ae-b8e7900e49ca',
      created: '2025-05-28T03:52:22.674607Z',
      origin: 'KJFK',
      originCoordinates: {
        latitude: 40.639722,
        longitude: -73.778889
      },
      destination: 'EGLL',
      destinationCoordinates: {
        latitude: 51.4775,
        longitude: -0.461389
      },
      distance: 3480,
      totalTime: 142.74648,
      aircraftId: '958486b0-1ef4-4efd-bee0-ea94e96f6c96',
      server: 'Expert'
    }
  */

// Functions Needed: getInfiniteFlightAirportCoordinates

export function calculateDistanceBetweenAirports(
  originAirport: string,
  destinationAirport: string
) {
  try {
    // Remove await since getAirportLocally is now synchronous
    const originData = getAirportLocally(originAirport);
    const destinationData = getAirportLocally(destinationAirport);

    if (!originData || !destinationData) {
      return {
        distance: 0,
        originCoordinates: { latitude: 0, longitude: 0 },
        destinationCoordinates: { latitude: 0, longitude: 0 },
        originIsoCountry: 'US',
        destinationIsoCountry: 'US'
      };
    }

    const { latitude: originLatitude, longitude: originLongitude, country: originIsoCountry, continent: originContinent } = originData;
    const { latitude: destinationLatitude, longitude: destinationLongitude, country: destinationIsoCountry, continent: destinationContinent } = destinationData;

    // In Nautical Miles
    const R = 3959; // Miles

    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const dLat = toRadians(destinationLatitude - originLatitude);
    const dLon = toRadians(destinationLongitude - originLongitude);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(originLatitude)) *
        Math.cos(toRadians(destinationLatitude)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.floor(R * c * 0.868976);

    return {
      distance,
      originCoordinates: {
        latitude: originLatitude,
        longitude: originLongitude,
      },
      destinationCoordinates: {
        latitude: destinationLatitude,
        longitude: destinationLongitude,
      },
      originIsoCountry: originIsoCountry,
      destinationIsoCountry: destinationIsoCountry,
      originContinent: originContinent,
      destinationContinent: destinationContinent,
    };
  } catch (error) {
    return {
      distance: 0,
      originCoordinates: { latitude: 0, longitude: 0 },
      destinationCoordinates: { latitude: 0, longitude: 0 },
      originIsoCountry: 'US',
      destinationIsoCountry: 'US',
      originContinent: 'NA',
      destinationContinent: 'NA'
    };
  }
}
// Utilize the 
export function getTop5Countries(routes: FlightRoute[]) {
   // Count destinations by country

   const isoCodeToCountry = (isoCode: string) => {
    const country = isoCountryCodes.find(c => c.isoCode === isoCode);
    return country?.key || "Unknown";
   }
   

   const countryCounts = routes.reduce((acc: { [key: string]: number }, route) => {
    const country = isoCodeToCountry(route.destinationIsoCountry);
    acc[country] = (acc[country] || 0) + 1;
    return acc;
   }, {});

   const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);

   return sortedCountries.slice(0, 5);

}

export function getFlightTimeCategorizerData(validFlights: Flight[]) {
  // examine the totalTime of each flight and categorize them into the following:
  // <60, 1h, 2h, 3h, 4h, 5h, 6h, 7h, 8h, 9h, 10h+
  // return { label: "<1h", value: 0 }

  const categorizerData = [
    { label: "<1h", min: 0, max: 60 },
    { label: "1h", min: 60, max: 120 },
    { label: "2h", min: 120, max: 180 },
    { label: "3h", min: 180, max: 240 },
    { label: "4h", min: 240, max: 300 },
    { label: "5h", min: 300, max: 360 },
    { label: "6h", min: 360, max: 420 },
    { label: "7h", min: 420, max: 480 },
    { label: "8h", min: 480, max: 540 },
    { label: "9h", min: 540, max: 600 },
    { label: "10h+", min: 600, max: Infinity },
  ]

  const categorizerDataWithCounts = categorizerData.map(category => ({
    ...category,
    count: validFlights.filter(flight => flight.totalTime >= category.min && flight.totalTime <= category.max).length,
  }));

  return categorizerDataWithCounts;
}
