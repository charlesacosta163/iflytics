'use server'

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
            })
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
        }
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

    console.log(currentUserSession)

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
            console.error('Airport ATIS API Error:', response.status, response.statusText);
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
