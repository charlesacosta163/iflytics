'use server'

import { revalidateTag } from "next/cache"

const API_KEY = process.env.API_KEY as string

export async function getUserId(username: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        }, 
        body: JSON.stringify({
            discourseNames: [username]
        })
    })

    const data = await response.json()

    if (data.result.length > 0) return {
        success: true,
        userId: data.result[0].userId,
        name: data.result[0].discourseUsername,
        grade: data.result[0].grade,
        organization: data.result[0].virtualOrganization,
    }

    return {
        success: false,
        error: "User not found"
    }
}

export async function getUserStats(username: string, userId?: string) {

    if (userId) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            }, 
            body: JSON.stringify({
                userIds: [userId]
            }),
            next: { revalidate: 3600 }
        })

        const data = await response.json()

        return data || null
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        }, 
        body: JSON.stringify({
            discourseNames: [username]
        })
    })

    const data = await response.json()

    return data || null
}

export async function getUserFlights(username: string, page: number = 1) {
    const userInfo = await getUserId(username)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userInfo.userId}/flights?page=${page}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        }, 
    })

    const data = await response.json()
    
    if (data) return {...userInfo, data}

    return null
}

export async function getAircraftAndLivery(aircraftId: string, liveryId: string) {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/aircraft/liveries`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            }, 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.result) {
            throw new Error('Invalid response format');
        }

        // Find the matching aircraft livery and callsign
        const matchingLivery = data.result.find((livery: any) => 
            livery.aircraftID === aircraftId && livery.id === liveryId
        );

        return matchingLivery || {
            aircraftName: "Unknown Aircraft",
            liveryName: "Unknown Livery"
        };
    } catch (error) {
        console.error('Error fetching aircraft livery:', error);
        return {
            aircraftName: "Unknown Aircraft",
            liveryName: "Unknown Livery"
        };
    }
}

export async function getAllAircraft() {
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/aircraft`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        next: { revalidate: 86400 } // Revalidate 24 hours
     })

     const data = await response.json()

     return data || null
}

export async function getAircraft(aircraftId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/aircraft/${aircraftId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        next: { revalidate: 86400 } // Revalidate 24 hours
    })

    const data = await response.json()

    // console.log(data)

    return data || null
}

export async function getAirport(airportIcao: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/airport/${airportIcao}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.API_KEY}`
            },
            next: { revalidate: 3600 } // Cache for 1 hour since airport data is relatively static
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch airport data: ${response.status}`);
        }

        const data = await response.json();
        
        // Return the result attribute
        return data.result;
        
    } catch (error) {
        console.error("Error fetching airport data:", error);
        return null;
    }
}

// Uses airportdb.io
export async function getFullAirportInfo(airportIcao: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AIRPORT_DB_API_URL}/${airportIcao}?apiToken=${process.env.AIRPORT_DB_API_KEY}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
            console.error('Airport DB API Error:', response.status, response.statusText);
            return { 
                statusCode: response.status,
                error: response.status === 404 ? 'Airport not found' : 'Failed to fetch airport info'
            };
        }

        const data = await response.json()
        
        // Validate response structure
        if (!data) {
            console.error('Invalid airport info response - no data');
            return { 
                statusCode: 500,
                error: 'Invalid response from airport database'
            };
        }

        return data;

    } catch (error) {
        console.error('Airport info fetch error:', error);
        return { 
            statusCode: 500,
            error: 'Failed to fetch airport information'
        };
    }
}

// NEW FUNCTION - USE FROM INFINITE FLIGHT API
export async function getInfiniteFlightAirportCoordinates(airportIcao: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/airport/${airportIcao}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            next: { revalidate: 86400 }, // Cache for 24 hours
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            console.error(`Airport coordinates API error for ${airportIcao}:`, response.status);
            return { latitude_deg: 0, longitude_deg: 0 }; // Fallback coordinates
        }

        const data = await response.json();

        const { latitude, longitude, country } = data.result;

        return {
            latitude_deg: latitude || 0,
            longitude_deg: longitude || 0,
            iso_country: country.isoCode,
        };
        
    } catch (error) {
        console.error(`Failed to fetch coordinates for ${airportIcao}:`, error);
        return { latitude_deg: 0, longitude_deg: 0 }; // Fallback coordinates
    }
}


export async function getAllAirportsWithActiveATC() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${process.env.NEXT_PUBLIC_IF_EXPERT_SERVER_ID}/atc`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            next: { revalidate: 120 } // Cache for 2 minutes
        })

        const data = await response.json()

        return data.result
    } catch (error) {
        console.error('Active ATC fetch error:', error);
    }
}

export async function getPilotServerSessions(id?: string, username?: string) {

    // Expert server for now
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${process.env.NEXT_PUBLIC_IF_EXPERT_SERVER_ID}/flights`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        return { statusCode: response.status };
    }

    const data = await response.json()

    if (id) {
        const currentUserSession = data.result.find((session: any) => session.userId === id)
        return currentUserSession || null
    }

    const currentUserSession = data.result.find((session: any) => session.username === username)

    return currentUserSession || null
}

export async function getAirportStatus(airportIcao: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${process.env.NEXT_PUBLIC_IF_EXPERT_SERVER_ID}/airport/${airportIcao}/status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
            console.error('Airport Status API Error:', response.status, response.statusText);
            return { 
                statusCode: response.status,
                inboundFlightsCount: 0,
                outboundFlightsCount: 0,
                atcFacilities: []
            };
        }

        const data = await response.json()
        
        // console.log('🛩️ Raw Airport Status API Response:', JSON.stringify(data, null, 2));
        
        // Validate response structure
        if (!data || !data.result) {
            console.error('Invalid airport status response structure');
            return {
                statusCode: 500,
                inboundFlightsCount: 0,
                outboundFlightsCount: 0,
                atcFacilities: []
            };
        }

        // console.log('🛩️ Airport Status Result:', JSON.stringify(data.result, null, 2));
        
        return data.result;

    } catch (error) {
        console.error('Airport Status fetch error:', error);
        return {
            statusCode: 500,
            error: 'Failed to fetch airport status',
            inboundFlightsCount: 0,
            outboundFlightsCount: 0,
            atcFacilities: []
        };
    }
}

export async function getAirportATIS(airportIcao: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${process.env.NEXT_PUBLIC_IF_EXPERT_SERVER_ID}/airport/${airportIcao}/atis`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
            return "No ATIS available";
        }

        const data = await response.json()
        
        // Validate response and return ATIS text
        if (data && data.result) {
            return data.result || "No ATIS available";
        }
        
        return "No ATIS available";

    } catch (error) {
        console.error('Airport ATIS fetch error:', error);
        return "No ATIS available";
    }
}

export async function matchATCTypeToTitle(atcType: string) {

    // Turn to 3 letter code
    switch (atcType) {
        case "0": 
            return "GND" // Ground
        case "1":
            return "TWR" // Tower
        case "2":
            return "UNI" // Unicom
        case "3":
            return "CLR" // Clearance
        case "4":
            return "APP" // Approach
        case "5":
            return "DEP" // Departure
        case "6": 
            return "CTR" // Center
        case "7":
            return "ATS" // ATIS
        case "8":
            return "AFT" // Aircraft
        case "9":
            return "REC" // Recorded
        case "10":
            return "UNK" // Unknown
        default:
            return "UNU" // Unused
    }
}

export async function getFlightsFromServer() {
    // Support only from Expert Server for now
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${process.env.NEXT_PUBLIC_IF_EXPERT_SERVER_ID}/flights`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        next: { revalidate: 30 } // Cache for 30 seconds
    })

    const data = await response.json()

    return data.result || []
}

export async function getUserFlightInfo(userId: string, flightId: string) {
    // Args: userId, flightId
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/flights/${flightId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        next: { revalidate: 60 } // Cache for 1 minute
    })

    const data = await response.json()

    return data.result || null
}

export async function getUserFlightPlan(flightId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${process.env.NEXT_PUBLIC_IF_EXPERT_SERVER_ID}/flights/${flightId}/flightplan`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        next: { revalidate: 60 }
    })

   // console.log("🛩️ Flight plan API status:", response.status);
    const data = await response.json()
   //  console.log("🛩️ Flight plan API response:", data);

    return data.result || "Flight Plan not found"
}

export async function matchATCRankToTitle(atcRank: string) {
    switch (atcRank) {
        case "0":
            return "Observer"
        case "1":
            return "Trainee"
        case "2":
            return "Apprentice"
        case "3":
            return "Specialist"
        case "4":
            return "Officer"
        case "4":
            return "Recruiter"
        case "5":
            return "Supervisor"
        case "6":
            return "Recruiter"
        case "7":
            return "Manager"
        default:
            return "Unknown"
    }
}

export async function getInfiniteFlightRouteDistanceWithCoordinates(originAirportCoords: [number, number], destinationAirportCoords: [number, number]) {
    // Use haversine formula to calculate distance --> display in nautical miles
    const R = 6371; // Radius of the earth in km
    const dLat = (destinationAirportCoords[0] - originAirportCoords[0]) * (Math.PI / 180);
    const dLon = (destinationAirportCoords[1] - originAirportCoords[1]) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(originAirportCoords[0] * (Math.PI / 180)) * Math.cos(destinationAirportCoords[0] * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance * 0.539957; // Convert to nautical miles
}


export async function getUselessFactToday() {
    const response = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/today`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        next: { revalidate: 14400 } // 4 hours
    })

    const data = await response.json()
    
    return data || {text: "Looks like we don't have any facts for today", source: "No Clue", source_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"}
}





// ---------------------------------------------LEGACY FUNCTIONS--------------------------------------------- //

// LEGACY FUNCTION - DO NOT USE
export async function getAirportCoordinates(airportIcao: string) {
    try {
        // const response = await fetch(`${process.env.NEXT_PUBLIC_AIRPORT_DB_API_URL}/${airportIcao}?apiToken=${process.env.AIRPORT_DB_API_KEY}`, {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Authorization": `Bearer ${API_KEY}`
        //     },
        //     next: { revalidate: 3600 },
        //     signal: AbortSignal.timeout(10000) // 10 second timeout
        // });

        // if (!response.ok) {
        //     console.error(`Airport coordinates API error for ${airportIcao}:`, response.status);
        //     return { latitude_deg: 0, longitude_deg: 0 }; // Fallback coordinates
        // }

        // const data = await response.json();
        
        // // Validate the data exists and is numeric
        // if (!data || 
        //     typeof data.latitude_deg !== 'number' || 
        //     typeof data.longitude_deg !== 'number' ||
        //     isNaN(data.latitude_deg) || 
        //     isNaN(data.longitude_deg)) {
        //     console.error(`Invalid coordinates for ${airportIcao}:`, data);
        //     return { latitude_deg: 0, longitude_deg: 0 }; // Fallback coordinates
        // }

        return {
            latitude_deg: 0,
            longitude_deg: 0,
            iso_country: "AAAA",
        };
        
    } catch (error) {
        console.error(`Failed to fetch coordinates for ${airportIcao}:`, error);
        return { latitude_deg: 0, longitude_deg: 0 }; // Fallback coordinates
    }
}

export async function revalidateFlightRoutes(userId: string) {
  'use server'
  
  try {
    // Revalidate both cache tags used in the flight routes
    revalidateTag(`flight-routes-${userId}`)
    revalidateTag(`user-${userId}`)
    revalidateTag('flight-routes')
    
    return {
      success: true,
      message: 'Flight routes cache refreshed successfully!'
    }
  } catch (error) {
    console.error('Error revalidating flight routes:', error)
    return {
      success: false,
      message: 'Failed to refresh flight routes cache'
    }
  }
}