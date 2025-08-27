import { captionThing } from "./data.ts";
import { aircraftIcaoCodes } from './data.ts';

export function getRandomCaption() {
    return captionThing[Math.floor(Math.random() * captionThing.length)];
}

export function aircraftIdToIcaoWithArray(aircraftId, aircraftArray) {

    // Logic: Match Id to name in aircraftArray
    // Then use name to find icao in aircraftIcaoCodes
    const aircraftObj = aircraftArray.find((aircraft) => aircraft.id === aircraftId);
    if (!aircraftObj) return "";

    // Use string.includes to find the aircraft name in the aircraftIcaoCodes array
    const icao = aircraftIcaoCodes.find((aircraft) => aircraft.gameName.includes(aircraftObj.name));
    return {
        icao: icao?.icao || "",
        name: icao?.name || ""
    };
 }  

 export function getAppVersion() {
    return "v1.0.1-poppunk";
 }