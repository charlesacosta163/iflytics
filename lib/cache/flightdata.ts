

// Convert to use Next.js built-in fetch caching
export const getAggregatedFlights = async (ifcUserId: string, maxPages: number = 51) => {
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
      // Use the passed maxPages parameter instead of hardcoded 51
      if (page === maxPages + 1) // +1 because we increment page after processing
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

// Modified getFlightsTimeFrame to determine appropriate page limit
/*

MONTHLY TIMEFRAME PLANS

>> Required Params:
 - ifcUserId (string) - Infinite Flight User ID
 - days (number) - Number of days to fetch flights for

 - flightsFrame (number) - Number of flights to fetch
      --> Must retrieve data from the last 800 flights, then filter out

 - monthAndYear (number) - month and year to fetch flights for
    e.g  2-2022 (February 2022)

 - currentYear (number) - Whether to fetch flights for the current year
    e.g. 2025


  
  Search Params structure:

  1. Day-based timeframe
     --> ?timeframe=day-30 (30 days)
     --> ?timeframe=day-7 (7 days)
     --> ?timeframe=day-1 (24 hours)

  
  2. Flight-based timeframe
    --> ?timeframe=flight-10 (last 10 flights)
    --> ?timeframe=flight-50 (last 50 flights)
    --> ?timeframe=flight-100 (last 100 flights)
    --> ?timeframe=flight-250 (last 250 flights)
    --> ?timeframe=flight-500 (last 500 flights)
    --> ?timeframe=flight-800 (last 800 flights)


  3. Year-based timeframe
    --> ?timeframe=year-2025 (2025)

  
  4. Month-based timeframe
    --> ?timeframe=month-5-2025 (May 2025)
*/ 
export async function getFlightsTimeFrame(ifcUserId: string, days: number, flightsFrame?: number, monthAndYear?: string) {
    // Determine how many pages to fetch based on requested flights
   
    let maxPages = 81; // For 800+ flights
  
    // else keep default 51 for all other cases

    const flights = await getAggregatedFlights(ifcUserId, maxPages)

    // If monthAndYear is provided (e.g 5_25) only filter by the flights in May 2025
    // flight.created is in format 2025-05-01T00:00:00Z
    if (monthAndYear) {
      const [monthStr, yearStr] = monthAndYear.split("_");
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10) + 2000; // turn "25" → 2025
    
      return flights.filter((flight: any) => {
        const flightDate = new Date(flight.created);
        return (
          flightDate.getMonth() === month - 1 &&
          flightDate.getFullYear() === year
        );
      });
    }

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