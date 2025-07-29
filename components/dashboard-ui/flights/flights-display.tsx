import React from "react";
import FlightDisplayCard from "../flight-display-card";
import { Flight } from "@/lib/types";
import { getAircraftAndLivery } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { IoLocationOutline, IoSparklesOutline } from "react-icons/io5";
import { FaInfoCircle, FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import { IoInfinite } from "react-icons/io5";
import { LuPlane, LuPlaneTakeoff } from "react-icons/lu";
import { formatDate } from "@/lib/utils";
import { convertMinutesToHours } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TbExclamationCircle } from "react-icons/tb";

const FlightsDisplay = ({ flights }: { flights: Flight[] }) => {
  const violations: any[] = [];

  flights.forEach((flight) => {
    if (flight.violations.length > 0) {
      flight.violations.forEach((violation) => {
        violations.push({
          ...violation,
          flightId: flight.id,
        });
      });
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-light text-gray-700">
          Flights ({flights.length})
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
            >
              <TbExclamationCircle className="w-4 h-4" />
              Violation History
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-red-400 tracking-tight">
                <span className="text-red-600">⚠️</span>
                Violation History
              </DialogTitle>
              <DialogDescription>
                Your violation and report history from Infinite Flight
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Summary Stats */}
               <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                 <div className="text-center">
                   <div className="text-2xl font-bold text-orange-600">
                     {violations.filter(v => v.level === 1).length}
                   </div>
                   <div className="text-xs text-gray-500 dark:text-gray-400">Level 1</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold text-red-600">
                     {violations.filter(v => v.level === 2).length}
                   </div>
                   <div className="text-xs text-gray-500 dark:text-gray-400">Level 2</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold text-red-800">
                     {violations.filter(v => v.level === 3).length}
                   </div>
                   <div className="text-xs text-gray-500 dark:text-gray-400">Level 3</div>
                 </div>
               </div>

              {/* Violation List */}
              <div className="space-y-3">
                {violations.length > 0 ? violations.map((violation, index) => {
                  const level = violation.level;

                  const levelConfigs = {
                    1: {
                      bgColor: "bg-orange-500",
                      borderColor: "border-orange-400",
                      cardBg: "bg-orange-50 dark:bg-orange-900/20",
                      textColor: "text-orange-800 dark:text-orange-200",
                      badgeBg: "bg-orange-100 dark:bg-orange-800",
                      badgeText: "text-orange-800 dark:text-orange-200",
                    },
                    2: {
                      bgColor: "bg-red-500",
                      borderColor: "border-red-500",
                      fontColor: "text-red-800 dark:text-red-200",
                      cardBg: "bg-red-50 dark:bg-red-900/20",
                      textColor: "text-red-800 dark:text-red-200",
                      badgeBg: "bg-red-100 dark:bg-red-800",
                      badgeText: "text-red-800 dark:text-red-200",
                    },
                    3: {
                      bgColor: "bg-red-800",
                      borderColor: "border-red-800",
                      cardBg: "bg-red-100 dark:bg-red-900/30",
                      textColor: "text-red-900 dark:text-red-100",
                      badgeBg: "bg-red-200 dark:bg-red-800",
                      badgeText: "text-red-900 dark:text-red-100",
                    },
                  };

                  const levelConfig =
                    levelConfigs[level as keyof typeof levelConfigs] ||
                    levelConfigs[1];

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 border-l-4 ${levelConfig.borderColor} ${levelConfig.cardBg} rounded-r-lg`}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 ${levelConfig.bgColor} text-white rounded-full flex items-center justify-center text-sm font-bold`}
                        >
                          {violation.level}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${levelConfig.textColor}`}
                            >
                              {violation.type}
                            </span>
                            <span
                              className={`text-xs ${levelConfig.badgeBg} ${levelConfig.badgeText} px-2 py-1 rounded`}
                            >
                              Level {level}
                            </span>
                          </div>
                          <Link href={`/dashboard/flights/${violation.flightId}`} className="text-xs bg-blue-500 text-white font-medium flex items-center gap-1 px-3 py-1 rounded-full hover:bg-blue-600">
                            <LuPlaneTakeoff className="w-4 h-4" />
                            <span>Info</span>
                          </Link>
                        </div>

                        {violation.description && (
                          <p
                            className={`text-sm mb-2 ${levelConfig.textColor}`}
                          >
                            {violation.description}
                          </p>
                        )}

                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {violation.issuedBy ? (
                            <>
                              <p>
                                Issued by:{" "}
                                <span className="font-medium">
                                  {violation.issuedBy.username}
                                </span>
                                {violation.issuedBy.callsign && (
                                  <span className="text-gray-500">
                                    {" "}
                                    ({violation.issuedBy.callsign})
                                  </span>
                                )}
                              </p>
                              <p>Date: {formatDate(violation.created)}</p>
                            </>
                          ) : (
                            <p>
                              System detected • {formatDate(violation.created)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500 font-medium text-left">
                      No violations found
                    </p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Violation Levels
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Level 1: System violations
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Level 2: ATC reports
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-800 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Level 3: Serious violations
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flights.length > 0 ? (
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

                  <Link
                    className="cursor-pointer"
                    href={`/dashboard/flights/${flight.id}`}
                  >
                    <Button className="bg-gray-800 hover:bg-gray-700 dark:text-light">
                      <FaInfoCircle className="w-6 h-6" />
                      More Details
                    </Button>
                  </Link>
                </Card>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full col-span-2">
            <p className="text-gray-500 font-medium text-left">
              No flights found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightsDisplay;
