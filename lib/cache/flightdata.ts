

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

      if (page === 30) // Fetch only 30 pages per performance
        break
      
      if (data.result?.data) {
        allFlights.push(...data.result.data);
        hasMore = data.result.hasNextPage;
        page++;
      } else {
        hasMore = false
      }
    }

    return allFlights;
};

// Convert aircraft caching to use Next.js built-in fetch caching
export const getAircraftCached = async (aircraftId: string) => {
  try {
    
    // Use Next.js fetch caching instead of unstable_cache
    const response = await fetch(
      `https://api.infiniteflight.com/public/v2/aircraft/${aircraftId}`,
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
    return data.result;
  } catch (error) {
    console.error(`Error fetching aircraft ${aircraftId}:`, error);
    return null;
  }
};

export async function getFlightsTimeFrame(ifcUserId: string, days: number) {
    const flights = await getAggregatedFlights(ifcUserId)

    const today = new Date()
    const daysAgo = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

    const filteredFlights = flights.filter((flight: any) => {
        const flightDate = new Date(flight.created)
        return flightDate >= daysAgo
    })

    return filteredFlights
}