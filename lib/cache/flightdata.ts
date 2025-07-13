

// Convert to use Next.js built-in fetch caching
export const getAggregatedFlights = async (ifcUserId: string) => {
    let allFlights = [];
    let page = 1;
    let hasMore = true;
  
    while (hasMore) {
      const response = await fetch(
        `https://api.infiniteflight.com/public/v2/users/${ifcUserId}/flights?page=${page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${process.env.API_KEY}`
          },
          next: { 
            revalidate: 10800, // 3 hours in seconds
            tags: [`user-flights-${ifcUserId}`] // User-specific cache tag
          }
        }
      );
  
      const data = await response.json();

      
      if (data.result?.data) {
        allFlights.push(...data.result.data);
        hasMore = data.result.hasNextPage;
        page++;
      } else {
        hasMore = false
      }
      if (page === 51) // Fetch only 50 pages per performance
        break
    }

    return allFlights;
};

// Convert aircraft caching to use Next.js built-in fetch caching
export const getAircraftCached = async (aircraftId: string) => {
  try {
    
    // Use Next.js fetch caching instead of unstable_cache
    const response = await fetch(
      `https://api.infiniteflight.com/public/v2/aircraft`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.API_KEY}`
        },
        next: {
          revalidate: 86400, // 24 hours - aircraft data rarely changes
          tags: [`aircraft-${aircraftId}`] // Aircraft-specific cache tag
        }
      }
    );

    const data = await response.json();
    const aircraftLibrary = data.result;

    // console.log(aircraftLibrary)

    const aircraftInfo = aircraftLibrary.find((aircraft: any) => aircraft.id === aircraftId);

    return aircraftInfo

    return aircraftInfo;
  } catch (error) {
    console.error(`Error fetching aircraft ${aircraftId}:`, error);
    return null;
  }
};

export async function getFlightsTimeFrame(ifcUserId: string, days: number, flightsFrame?: number) {
    const flights = await getAggregatedFlights(ifcUserId)

    // If flightsFrame is provided, prioritize it over days
    if (flightsFrame) {
        // Return the most recent X flights
        return flights.slice(0, flightsFrame)
    }

    // Otherwise, filter by days as usual
    const today = new Date()
    const daysAgo = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

    const filteredFlights = flights.filter((flight: any) => {
        const flightDate = new Date(flight.created)
        return flightDate >= daysAgo
    })

    return filteredFlights
}