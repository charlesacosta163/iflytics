import React from "react";
import { GoCopilot } from "react-icons/go";
import MostRecentFlightCard from "./most-recent-flight-card";
import UserNavigation from "./user-navigation";

import { getPilotServerSessions, getUserFlights } from "@/lib/actions";
import { customUserImages } from "@/lib/data";

const ProfileHeader = async ({
  id,
  name,
  grade,
  organization,
}: {
  id: string;
  name: string;
  grade: number;
  organization: string;
}) => {
  const flights = await getUserFlights(name);
  const pilotServerSession = await getPilotServerSessions("", name)

  let airportFlightLog // Callsign, Date, Departure airport, Arrival airport
  let flightHistory = flights?.data.result.data

  if (flightHistory.length === 0) {
    airportFlightLog = {
      callsign: "Not conducted",
      date: "???",
      departure: "????",
      arrival: "????"
    }
  }
  
  // Get most recent flight
  let mostRecentFlight = flightHistory[0]

  airportFlightLog = {
    callsign: mostRecentFlight.callsign,
    date: mostRecentFlight.created,
    departure: mostRecentFlight.originAirport,
    arrival: mostRecentFlight.destinationAirport
  }

  mostRecentFlight = { ...mostRecentFlight, session: pilotServerSession }

  const userRoleColor = customUserImages.find(user => user.username.toLowerCase() === name.toLowerCase())?.role === "staff" ? "bg-blue-500" : customUserImages.find(user => user.username.toLowerCase() === name.toLowerCase())?.role === "mod" ? "bg-purple-500" : "bg-gray";
  const userRole = customUserImages.find(user => user.username.toLowerCase() === name.toLowerCase())?.role;

  const gradeColor: string =
    grade === 5
      ? "bg-yellow-500"
      : grade === 4
      ? "bg-green-500"
      : grade === 3
      ? "bg-purple-500"
      : grade === 2
      ? "bg-blue-500"
      : "bg-dark";
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 mt-4">
      <div className="flex flex-col justify-end gap-4 sm:gap-8 h-full">
        <div className="flex gap-4 sm:gap-8 items-center pb-2 sm:pb-0">
          {customUserImages.find(user => user.username.toLowerCase() === name.toLowerCase()) ? (
            <div className={`p-1 rounded-full ${userRoleColor} relative`}>
              <img src={customUserImages.find(user => user.username.toLowerCase() === name.toLowerCase())?.image} alt={name} className="w-16 h-16 rounded-full" />
              <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-light ${userRoleColor} rounded-full px-3 py-0.5 text-xs font-semibold whitespace-nowrap text-center`}>
                {userRole === "staff" ? "IF Staff" : userRole === "mod" ? "IF Mod" : "IFlytics User"}
              </div>
            </div>
          ) : (
            <GoCopilot className="text-[4rem]" />
          )}
          <div className="flex flex-col text-left">
            <div
              className={`font-semibold text-xs ${gradeColor} px-2 py-0.5 rounded-full self-start text-white`}
            >
              Grade {grade}
            </div>
            <b className="text-2xl tracking-tight">{name}</b>
            <div className="font-medium text-sm">
              Organization: {organization ? organization : "Not Joined"}
            </div>
          </div>
        </div>
        
        {/* User Navigation Tabs */}
        <UserNavigation username={name} />
      </div>
      <MostRecentFlightCard flight={mostRecentFlight} />
    </div>
  );
};

export default ProfileHeader;
