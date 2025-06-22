import React from "react";
import { Card } from "./ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { FaLightbulb, FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { LuPlane } from "react-icons/lu";
import { IoLocationOutline, IoSparklesOutline } from "react-icons/io5";
import { MdFlight } from "react-icons/md";
import { IoInfinite } from "react-icons/io5";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import Image from "next/image";

import { formatDate, convertMinutesToHours } from "@/lib/utils";

const FlightEntryCard = ({
  flight,
  aircraft,
}: {
  flight: any;
  aircraft: any;
}) => {
  return (
    <div className="flex flex-col">
      <Card className="p-4 rounded-t-[25px] rounded-b-none bg-dark text-light flex flex-col gap-2 relative overflow-hidden">
        <MdFlight className="absolute -top-20 right-0 text-light opacity-10 text-[24rem] z-0 rotate-45" />
        <IoInfinite className="hidden md:block absolute -top-30 left-10 text-light opacity-10 text-[24rem] z-0 -rotate-315" />
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
                  : `Did not travel`}
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
      </Card>
      <Accordion
        type="single"
        collapsible
        className="bg-gray-900 rounded-t-none rounded-b-[25px] rounded-lg z-10 border-none outline-none"
      >
        <AccordionItem value="flight-details">
          <AccordionTrigger className="text-light font-semibold cursor-pointer text-lg hover:bg-gray-800 rounded-[25px] px-4">
            <span className="w-full">More Details</span>
          </AccordionTrigger>
          <AccordionContent className="text-light px-4">
            <hr className="my-2 opacity-10" />

            <section className="grid grid-cols-1 gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-gray-300">
                  Aircraft Information
                </h3>

                  {/* Aircraft Details */}
                <div className="flex-1 flex gap-4 items-center p-2 py-3 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 rounded-lg">
                  <div className="flex-1 flex flex-col gap-1 ">
                    <div className="text-white font-bold tracking-tight text-2xl">
                      {aircraft.aircraftName}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {aircraft.liveryName}
                    </div>
                  </div>
                  {/* Aircraft Image */}
                  <Image
                    src={`/images/aircraft/${matchAircraftNameToImage(
                      aircraft?.aircraftName || ""
                    )}`}
                    alt={aircraft?.aircraftName || "Aircraft"}
                    width={120}
                    height={90}
                    className="rounded-lg object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-gray-300">Flight Details</h3>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center text-sm font-medium">
                    <span className="text-muted-foreground">Server</span>
                    <div className="flex-1 text-right">{flight.server}</div>
                  </div>
                  <div className="flex gap-2 items-center text-sm font-medium">
                    <span className="text-muted-foreground">Landings</span>
                    <div className="flex-1 text-right">
                      {flight.landingCount}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center text-sm font-medium">
                    <span className="text-muted-foreground">Violations</span>
                    <div className="flex-1 text-right">
                      {flight.violations.length}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FlightEntryCard;
