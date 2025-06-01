import { unstable_cache as cache, revalidateTag } from "next/cache";

// Create a cached version of the fetcher function
export const getAggregatedFlights = cache(async (ifcUserId: string) => {
    console.log("Cache miss - fetching all flights");
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
          // No caching options here - we're caching the final result
        }
      );
  
      const data = await response.json();

      if (page === 50) // Fetch only 50 pages per performance
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
  },
  // The key generator function - correct syntax
  [(ifcUserId: string) => `flights-${ifcUserId}`],
  // Options
  { 
    revalidate: 10800, // 3 hours in seconds
    tags: ['flights'] // Optional tag for manual revalidation
  }
);


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
