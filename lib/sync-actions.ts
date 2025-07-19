import { airports } from "./airports-lib";

export function getAirportLocally(airportIcao: string) {    
    // console.log(airportIcao)

    try {
        const airport = airports.find((airport: any) => airport.ident === airportIcao);

        // console.log(airport)

        return airport || null;
        
    } catch (error) {
        console.error("Error finding airport data:", error);
        return null;
    }
}

export function matchATCRankToTitle(atcRank: string) {
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