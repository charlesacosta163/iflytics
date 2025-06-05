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

export async function matchATCRank(atcRank: string) {
    switch (atcRank) {
        case "0":
            return "Observer"
        case "1":
            return "Apprentice"
        case "2":
            return "Specialist"
        case "3":
            return "Officer"
        case "4":
            return "Recruiter"
        case "5":
            return "Supervisor"
        case "6":
            return "Moderator"
        case "7":
            return "Staff"
        default:
            return "Unknown"
    }
}

export async function getFullAirportInfo(airportIcao: string) {
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_AIRPORT_DB_API_URL}/${airportIcao}?apiToken=${process.env.AIRPORT_DB_API_KEY}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        return { statusCode: response.status };
    }

    const data = await response.json()

    return data || null
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${process.env.NEXT_PUBLIC_IF_EXPERT_SERVER_ID}/airport/${airportIcao}/status`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
    })

    if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        return { statusCode: response.status };
    }

    const data = await response.json()

    return data.result || null
}

export async function getAirportATIS(airportIcao: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${process.env.NEXT_PUBLIC_IF_EXPERT_SERVER_ID}/airport/${airportIcao}/atis`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
    })

    if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        return "No ATIS available"
    }

    const data = await response.json()

    return data.result || "No ATIS available"
}