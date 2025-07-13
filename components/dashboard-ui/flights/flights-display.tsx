import React from "react";
import FlightDisplayCard from "../flight-display-card";
import { Flight } from "@/lib/types";
import { getAircraftAndLivery } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { IoLocationOutline, IoSparklesOutline } from "react-icons/io5";
import { FaInfoCircle, FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import { IoInfinite } from "react-icons/io5";
import { LuPlane } from "react-icons/lu";
import { formatDate } from "@/lib/utils";
import { convertMinutesToHours } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FlightsDisplay = ({ flights }: { flights: Flight[] }) => {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-700">Flights ({flights.length})</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flights.length > 0 ?
          flights.map((flight: any, index: number) => {
            return (
              <div key={index} className="flex flex-col">
                <Card className="p-4 rounded-[25px] bg-gradient-to-br from-gray-800 via-gray-900 to-black text-light flex flex-col gap-2 relative overflow-hidden">
                  <MdFlight className="absolute -top-20 right-0 text-light opacity-10 text-[24rem] -z-10 rotate-45 pointer-events-none" />
                  <IoInfinite className="hidden md:block absolute -top-30 left-10 text-light opacity-10 text-[24rem] -z-10 -rotate-315 pointer-events-none" />
                  <div className="flex justify-between gap-2">
                    <div id="left" className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center text-sm font-medium">
                        <FaRegCalendarAlt className="w-6 h-6" />
                        <div>{formatDate(flight.created)}</div>
                      </div>
                      <div className="flex gap-2 items-center font-semibold">
                        <LuPlane className="w-6 h-6" />
                        <div>{flight.callsign}</div>
                      </div>
                      <div className="flex gap-2 items-center text-sm font-medium">
                        <IoLocationOutline className="w-6 h-6" />
                        <div>
                          {flight.originAirport !== flight.destinationAirport
                            ? `${flight.originAirport} → ${
                                flight.destinationAirport || "Unknown"
                              }`
                            : "Did Not Travel"}
                        </div>
                      </div>
                    </div>

                    <div id="right" className="flex flex-col gap-2 self-end">
                      <div className="flex gap-2 items-center text-sm font-medium">
                        <FaRegClock className="w-6 h-6" />
                        <div>{convertMinutesToHours(flight.totalTime)}</div>
                      </div>
                      <div className="flex gap-2 items-center text-sm font-medium">
                        <IoSparklesOutline className="w-6 h-6" />
                        <div>{flight.xp} XP</div>
                      </div>
                    </div>
                  </div>

                  <Link className="cursor-pointer" href={`/dashboard/flights/${flight.id}`}>
                    <Button className="bg-gray-800 hover:bg-gray-700">
                      <FaInfoCircle className="w-6 h-6" />
                      More Details
                    </Button>
                  </Link>
                </Card>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center h-full col-span-2">
              <p className="text-gray-500 font-medium text-left">No flights found</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default FlightsDisplay;
