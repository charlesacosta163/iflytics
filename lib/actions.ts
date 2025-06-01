'use server'

const API_KEY = process.env.API_KEY as string

export async function getUserId(username: string) {
    const response = await fetch("https://api.infiniteflight.com/public/v2/users", {
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

export async function getUserStats(username: string) {

    const response = await fetch("https://api.infiniteflight.com/public/v2/users", {
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

    const response = await fetch(`https://api.infiniteflight.com/public/v2/users/${userInfo.userId}/flights?page=${page}`, {
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
        const response = await fetch(`https://api.infiniteflight.com/public/v2/aircraft/liveries`, {
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

export async function getAircraft(aircraftId: string) {
    const response = await fetch(`https://api.infiniteflight.com/public/v2/aircraft/${aircraftId}`, {
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