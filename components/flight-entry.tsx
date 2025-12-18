import React from "react";
import { Card } from "./ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { FaLightbulb, FaRegCalendarAlt, FaRegClock, FaServer, FaExclamationTriangle } from "react-icons/fa";
import { LuPlane, LuPlaneLanding } from "react-icons/lu";
import { IoLocationOutline, IoSparklesOutline } from "react-icons/io5";
import { MdFlight } from "react-icons/md";
import { IoInfinite } from "react-icons/io5";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
      <Card className={cn(
        "p-4 md:p-5 rounded-t-[20px] md:rounded-t-[25px] rounded-b-none",
        "bg-gray-50 dark:bg-gray-800",
        "text-gray-800 dark:text-gray-100",
        "border-2 border-gray-200 dark:border-gray-700 border-b-0",
        "flex flex-col gap-3 relative overflow-hidden"
      )}>
        <MdFlight className="absolute -top-20 right-0 text-gray-300 dark:text-gray-700 opacity-10 text-[20rem] md:text-[24rem] z-0 rotate-45" />
        <IoInfinite className="hidden md:block absolute -top-30 left-10 text-gray-300 dark:text-gray-700 opacity-10 text-[24rem] z-0 -rotate-315" />
        <div className="flex justify-between gap-2 z-10">
          <div id="left" className="flex flex-col gap-2">
            <div className="flex gap-2 items-center text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              <FaRegCalendarAlt className="w-4 h-4 md:w-5 md:h-5" />
              <div>{formatDate(flight.created)}</div>
            </div>
            <div className="flex gap-2 items-center font-bold text-lg md:text-xl tracking-tight">
              <LuPlane className="w-5 h-5 md:w-6 md:h-6" />
              <div>{flight.callsign}</div>
            </div>
            <div className="flex gap-2 items-center text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              <IoLocationOutline className="w-4 h-4 md:w-5 md:h-5" />
              <div>
                {flight.originAirport !== flight.destinationAirport
                  ? `${flight.originAirport} → ${
                      flight.destinationAirport || "Unknown"
                    }`
                  : `Did not travel`}
              </div>
            </div>
          </div>

          <div id="right" className="flex flex-col gap-2 self-end text-right">
            <div className="flex gap-2 items-center text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400">
              <FaRegClock className="w-4 h-4 md:w-5 md:h-5" />
              <div>{convertMinutesToHours(flight.totalTime)}</div>
            </div>
            <div className="flex gap-2 items-center text-xs md:text-sm font-semibold text-amber-600 dark:text-amber-400">
              <IoSparklesOutline className="w-4 h-4 md:w-5 md:h-5" />
              <div>{flight.xp} XP</div>
            </div>
          </div>
        </div>
      </Card>
      <Accordion
        type="single"
        collapsible
        className={cn(
          "bg-gray-100 dark:bg-gray-900",
          "rounded-t-none rounded-b-[20px] md:rounded-b-[25px]",
          "border-2 border-t-0 border-gray-200 dark:border-gray-700",
          "z-10"
        )}
      >
        <AccordionItem value="flight-details" className="border-none">
          <AccordionTrigger className={cn(
            "text-gray-800 dark:text-gray-100",
            "font-semibold cursor-pointer",
            "text-base md:text-lg",
            "hover:bg-gray-200 dark:hover:bg-gray-800",
            "rounded-[20px] md:rounded-[25px]",
            "px-4 md:px-5"
          )}>
            <span className="w-full">More Details</span>
          </AccordionTrigger>
          <AccordionContent className="text-gray-800 dark:text-gray-100 px-4 md:px-5">
            <hr className="my-2 border-gray-300 dark:border-gray-700" />

            <section className="grid grid-cols-1 gap-4 mt-2 pb-2">
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-base md:text-lg text-gray-700 dark:text-gray-300 tracking-tight">
                  Aircraft Information
                </h3>

                  {/* Aircraft Details */}
                <div className={cn(
                  "flex-1 flex gap-3 md:gap-4 items-center",
                  "p-3 md:p-4 py-3 md:py-4",
                  "bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40",
                  "rounded-[15px] md:rounded-[20px]"
                )}>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-white font-bold tracking-tight text-lg md:text-2xl">
                      {aircraft.aircraftName}
                    </div>
                    <div className="text-gray-300 text-xs md:text-sm font-medium">
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
                    className="rounded-lg object-contain w-[80px] h-[60px] md:w-[120px] md:h-[90px]"
                  />
                </div>
              </div>

                              <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-base md:text-lg text-gray-700 dark:text-gray-300 tracking-tight">
                    Flight Details
                  </h3>

                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {/* Server Column */}
                    <div className={cn(
                      "bg-gradient-to-br from-green-100 to-green-200",
                      "dark:from-green-900/40 dark:to-green-800/40",
                      "rounded-[15px] md:rounded-[20px]",
                      "p-2 md:p-3",
                      "text-center"
                    )}>
                      <FaServer className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400 mx-auto mb-1 md:mb-2" />
                      <div className="text-green-700 dark:text-green-300 text-[10px] md:text-xs font-medium mb-1">Server</div>
                      <div className="text-green-700 dark:text-green-400 font-bold tracking-tight text-sm md:text-xl">{flight.server}</div>
                    </div>

                    {/* Landings Column */}
                    <div className={cn(
                      "bg-gradient-to-br from-blue-100 to-blue-200",
                      "dark:from-blue-900/40 dark:to-blue-800/40",
                      "rounded-[15px] md:rounded-[20px]",
                      "p-2 md:p-3",
                      "text-center"
                    )}>
                      <LuPlaneLanding className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1 md:mb-2" />
                      <div className="text-blue-700 dark:text-blue-300 text-[10px] md:text-xs font-medium mb-1">Landings</div>
                      <div className="text-blue-700 dark:text-blue-400 font-bold tracking-tight text-sm md:text-xl">{flight.landingCount}</div>
                    </div>

                    {/* Violations Column */}
                    <div className={cn(
                      "bg-gradient-to-br from-red-100 to-red-200",
                      "dark:from-red-900/40 dark:to-red-800/40",
                      "rounded-[15px] md:rounded-[20px]",
                      "p-2 md:p-3",
                      "text-center"
                    )}>
                      <FaExclamationTriangle className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400 mx-auto mb-1 md:mb-2" />
                      <div className="text-red-700 dark:text-red-300 text-[10px] md:text-xs font-medium mb-1">Violations</div>
                      <div className="text-red-700 dark:text-red-400 font-bold tracking-tight text-sm md:text-xl">{flight.violations.length}</div>
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
