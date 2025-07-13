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