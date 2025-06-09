import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { formatDate } from '@/lib/utils'
import React from "react";
import { Card } from "../ui/card";
import { IoSparklesOutline, IoLocationOutline } from "react-icons/io5";
import { FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import { IoInfinite } from "react-icons/io5";
import { convertMinutesToHours } from "@/lib/utils";
import { LuPlane } from "react-icons/lu";
import { Flight } from "@/lib/types";

const FlightDisplayCard = ({ flight, aircraft }: { flight: Flight, aircraft: any }) => {
  return (
    <div className="flex flex-col">
      <Card className="p-4 rounded-t-[25px] rounded-b-none bg-gradient-to-br from-gray-800 via-gray-900 to-black text-light flex flex-col gap-2 relative overflow-hidden">
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
              <div>{flight.originAirport !== flight.destinationAirport ? `${flight.originAirport} → ${flight.destinationAirport || "Unknown"}` : "Did Not Travel"}</div>
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

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center text-sm font-medium">
                    <span className="text-muted-foreground">Aircraft</span>
                    <div className="flex-1 text-right">{aircraft.aircraftName}</div>
                  </div>
                  <div className="flex gap-2 items-center text-sm font-medium">
                    <span className="text-muted-foreground">Airline</span>
                    <div className="text-right flex-1">{aircraft.liveryName}</div>
                  </div>
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
                    <div className="flex-1 text-right">{flight.landingCount}</div>
                  </div>
                  <div className="flex gap-2 items-center text-sm font-medium">
                    <span className="text-muted-foreground">Violations</span>
                    <div className="flex-1 text-right">{flight.violations.length}</div>
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

export default FlightDisplayCard;
