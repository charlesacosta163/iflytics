import { Flight } from "../types";
import { getAircraft } from "../actions";
import { aircraftImages } from "../data";
import { unstable_cache as cache } from "next/cache";
import { getAircraftCached } from "./flightdata";
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
    const totalFlights = flights.length
    const totalTime = Math.round(flights.reduce((acc, flight) => acc + flight.totalTime, 0))
    const totalLandings = flights.reduce((acc, flight) => acc + flight.landingCount, 0)
    const totalXp = flights.reduce((acc, flight) => acc + flight.xp, 0)

    return {
        totalFlights,
        totalTime,
        totalLandings,
        totalXp
    }
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
  return Array.from(dailyTotals.entries()).map(([date, totalTime]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    totalTime,
  })).reverse();


  /* SOME IMPORTANT NOTES:
    - If timeframe is last 30 days, return the last 30 days of data
    - If timeframe is is last 12 months, return the last 12 months of data
    - If timeframe is 2025, return the months of 2025 total flight time
    - If timeframe is 2024, return the months of 2024 total flight time
  */

}

export function getRecentFlightInsights(flights: Flight[]) {

    // Goal: Get the total landing count, total xp, total flight time in the specified time frame

    const totalLandings = flights.reduce((acc, flight) => acc + flight.landingCount, 0)
    const totalXp = flights.reduce((acc, flight) => acc + flight.xp, 0)
    const totalTime = Math.round(flights.reduce((acc, flight) => acc + flight.totalTime, 0))

    return {
        totalLandings, totalXp, totalTime
    }
}

export function getFlightAveragesPerTimeFrame(flights: Flight[]) {
  // Return early with zeros if there are no flights
  if (!flights.length) {
    return {
      avgFlightTime: 0,
      avgLandingsPerFlight: 0,
      avgXpPerFlight: 0,
      avgXpPerLanding: 0
    };
  }

  // Calculate totals first
  const totalFlights = flights.length;
  const totalTime = Math.round(flights.reduce((acc, flight) => acc + flight.totalTime, 0));
  const totalLandings = flights.reduce((acc, flight) => acc + flight.landingCount, 0);
  const totalXp = flights.reduce((acc, flight) => acc + flight.xp, 0);

  // Calculate averages with proper fallbacks to avoid division by zero
  const avgFlightTime = Math.round(totalTime / totalFlights) || 0;
  const avgLandingsPerFlight = totalLandings / totalFlights || 0;
  const avgXpPerFlight = Math.round(totalXp / totalFlights) || 0;
  const avgXpPerLanding = totalLandings ? Math.round(totalXp / totalLandings) : 0;

  return {
    avgFlightTime,
    avgLandingsPerFlight,
    avgXpPerFlight,
    avgXpPerLanding
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
        const batchResults = await Promise.all(batch.map(async (aircraftId) => {
          try {
            // Use cached aircraft data
            const aircraft = await getAircraftCached(aircraftId);
            
            return {
              name: aircraft?.name || `Aircraft ${aircraftId.substring(0, 6)}...`,
              count: aircraftUsageCount[aircraftId],
              id: aircraftId // Store the ID for debugging
            };
          } catch (innerError) {
            console.error(`Error processing aircraft ${aircraftId}:`, innerError);
            return {
              name: `Aircraft ${aircraftId.substring(0, 6)}...`,
              count: aircraftUsageCount[aircraftId],
              id: aircraftId,
              error: true
            };
          }
        }));
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
    return [
      { name: "Data unavailable", count: 0, error: true }
    ];
  }
}

export function getMostVisitedOriginAndDestinationAirports(flights: Flight[]) {
  // Filter out flights with null/undefined airports
  const validFlights = flights.filter(flight => 
    flight.originAirport && flight.destinationAirport
  );

  // Get all valid origin and destination airports
  const allOrigins = validFlights.map((flight) => flight.originAirport);
  const allDestinations = validFlights.map((flight) => flight.destinationAirport);

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
  const sortedOrigins = Object.entries(originAirportCount).sort((a, b) => b[1] - a[1]);
  const sortedDestinations = Object.entries(destinationAirportCount).sort((a, b) => b[1] - a[1]);

  // Handle case where there might be no valid airports
  if (sortedOrigins.length === 0 || sortedDestinations.length === 0) {
    return {
      topOrigin: "N/A",
      topDestination: "N/A"
    };
  }

  // Get the top most visited airports
  const topOrigin = sortedOrigins[0];
  const topDestination = sortedDestinations[0];

  return {
    topOrigin: topOrigin[0],
    topDestination: topDestination[0]
  };
}

export function matchAircraftNameToImage(aircraftName: string) {
  // Image name sample: a220.png
  // Aircraft name sample: Airbus A319
  
  const image = aircraftImages.find((image) => aircraftName.toLowerCase().includes(image.key.toLowerCase()));

  return image?.image || "placeholder.png";
  
}

