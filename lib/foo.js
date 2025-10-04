import { captionThing } from "./data.ts";
import { aircraftIcaoCodes } from './data.ts';
import { statCompliments } from './data.ts';

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

 export function getRandomCompliment(statType) {
    return statCompliments[statType][Math.floor(Math.random() * statCompliments[statType].length)];
 }

 export function getAppVersion() {
    return "v1.4.2-slowcore";
 }