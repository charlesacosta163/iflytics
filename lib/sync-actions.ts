import { activeAirlines } from "./airlines-lib.js";
import { airports } from "./airports-lib.js";
import { aircraftIcaoCodes } from "./data.js";

export function getAirportLocally(airportIcao: string): any {
    try {
        return airports.find((airport: any) => airport.ident === airportIcao) || null;
    } catch (error) {
        console.error("Error finding airport data:", error);
        return null;
    }
}

export function getAirline(callsign: string) {
    // Use string.includes to find the airline
    const { airlines } = activeAirlines

    const airline = airlines.find((airline) => 
      airline.callsign && 
      airline.callsign.trim() !== '' && 
      callsign.toLowerCase().includes(airline.callsign.toLowerCase())
    )

    if (!airline) {
      return null
    }

    return airline.name
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