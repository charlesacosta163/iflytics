import React from "react";
import { Flight } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { IoLocationOutline, IoSparklesOutline } from "react-icons/io5";
import { FaInfoCircle, FaPlane, FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { LuPlane, LuPlaneTakeoff } from "react-icons/lu";
import { BiSolidPlaneLand } from "react-icons/bi";
import { formatDate, convertMinutesToHours, cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TbExclamationCircle } from "react-icons/tb";

const FlightStat = ({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: "blue" | "amber" | "green"
}) => {
  const styles = {
    blue: {
      icon: "text-blue-500 dark:text-blue-400",
      value: "text-blue-600 dark:text-blue-400",
    },
    amber: {
      icon: "text-amber-500 dark:text-amber-400",
      value: "text-amber-600 dark:text-amber-400",
    },
    green: {
      icon: "text-green-500 dark:text-green-400",
      value: "text-green-600 dark:text-green-400",
    },
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 min-w-0",
        "bg-white dark:bg-gray-800/50",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[15px] md:rounded-[18px]",
        "p-2 md:p-3"
      )}
    >
      <span className={cn("text-base md:text-lg", styles[color].icon)}>{icon}</span>
      <p className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 truncate w-full text-center">
        {label}
      </p>
      <p className={cn("text-sm md:text-base font-black tracking-tight", styles[color].value)}>
        {value}
      </p>
    </div>
  )
}

const FlightCard = ({ flight }: { flight: Flight }) => {
  const hasRoute =
    flight.originAirport !== flight.destinationAirport &&
    (flight.originAirport || flight.destinationAirport)
  const violationCount = flight.violations?.length ?? 0

  return (
    <Card
      className={cn(
        "bg-sky-50/70 dark:bg-sky-900/20",
        "!shadow-none",
        "rounded-[20px] md:rounded-[25px]",
        "border-0",
        "overflow-hidden"
      )}
    >
      <div className="p-4 md:p-5 flex flex-col gap-3 md:gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-0">
            <FaRegCalendarAlt className="w-4 h-4 shrink-0" />
            <span className="truncate">{formatDate(flight.created)}</span>
          </div>
          {violationCount > 0 && (
            <Badge className="shrink-0 bg-red-500 dark:bg-red-600 text-white font-bold rounded-[10px] px-2 py-0.5 text-[10px] md:text-xs">
              {violationCount} violation{violationCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="p-2 bg-sky-500 dark:bg-sky-600 rounded-[12px] md:rounded-[15px] shrink-0">
            <LuPlane className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h3 className="text-lg md:text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 truncate">
            {flight.callsign}
          </h3>
        </div>

        <div
          className={cn(
            "bg-white dark:bg-gray-800/50",
            "border-2 border-gray-200 dark:border-gray-700",
            "rounded-[20px]",
            "p-3 md:p-4"
          )}
        >
          {hasRoute ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex-1 min-w-0 text-center">
                <p className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Origin
                </p>
                <p className="text-xl md:text-2xl font-black tracking-tighter text-red-600 dark:text-red-400 truncate">
                  {flight.originAirport || "—"}
                </p>
              </div>
              <div className="text-gray-300 dark:text-gray-600 text-lg md:text-xl font-light shrink-0">
                →
              </div>
              <div className="flex-1 min-w-0 text-center">
                <p className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Destination
                </p>
                <p className="text-xl md:text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-400 truncate">
                  {flight.destinationAirport || "Unknown"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm md:text-base font-semibold text-gray-500 dark:text-gray-400">
              <IoLocationOutline className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              <span>Did Not Travel</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <FlightStat
            label="Flight Time"
            value={convertMinutesToHours(flight.totalTime)}
            icon={<FaRegClock />}
            color="blue"
          />
          <FlightStat
            label="XP Earned"
            value={flight.xp}
            icon={<IoSparklesOutline />}
            color="amber"
          />
          <FlightStat
            label="Landings"
            value={flight.landingCount}
            icon={<BiSolidPlaneLand />}
            color="green"
          />
        </div>

        <Link href={`/dashboard/flights/${flight.id}`} className="w-full">
          <Button
            className={cn(
              "w-full",
              "bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500",
              "text-white font-bold",
              "rounded-[12px] md:rounded-[15px]",
              "flex items-center justify-center gap-2"
            )}
          >
            <FaInfoCircle className="w-4 h-4 md:w-5 md:h-5" />
            More Details
          </Button>
        </Link>
      </div>
    </Card>
  )
}

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
    <div className="flex flex-col gap-4 md:gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 md:p-2.5 bg-sky-500 dark:bg-sky-600 rounded-[12px] md:rounded-[15px] shrink-0">
            <FaPlane className="text-white text-lg md:text-xl" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
              Flight History
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              {flights.length} flight{flights.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "text-red-600 dark:text-red-400",
                "border-2 border-red-200 dark:border-red-800",
                "hover:bg-red-50 dark:hover:bg-red-900/20",
                "rounded-[12px] md:rounded-[15px]",
                "font-semibold",
                "flex items-center gap-2 shrink-0"
              )}
            >
              <TbExclamationCircle className="w-4 h-4" />
              Violation History
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-[20px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-red-600 dark:text-red-400 tracking-tight">
                <TbExclamationCircle className="w-5 h-5" />
                Violation History
              </DialogTitle>
              <DialogDescription>
                Your violation and report history from Infinite Flight
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[20px]">
                <div className="text-center">
                  <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                    {violations.filter((v) => v.level === 1).length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Level 1</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-red-600 dark:text-red-400">
                    {violations.filter((v) => v.level === 2).length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Level 2</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-red-800 dark:text-red-300">
                    {violations.filter((v) => v.level === 3).length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Level 3</div>
                </div>
              </div>

              <div className="space-y-3">
                {violations.length > 0 ? (
                  violations.map((violation, index) => {
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
                        className={cn(
                          "flex items-start gap-3 p-4 border-l-4 rounded-r-[15px]",
                          levelConfig.borderColor,
                          levelConfig.cardBg
                        )}
                      >
                        <div className="shrink-0">
                          <div
                            className={cn(
                              "w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold",
                              levelConfig.bgColor
                            )}
                          >
                            {violation.level}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={cn("font-semibold truncate", levelConfig.textColor)}>
                                {violation.type}
                              </span>
                              <span
                                className={cn(
                                  "text-xs px-2 py-1 rounded-[8px] shrink-0",
                                  levelConfig.badgeBg,
                                  levelConfig.badgeText
                                )}
                              >
                                Level {level}
                              </span>
                            </div>
                            <Link
                              href={`/dashboard/flights/${violation.flightId}`}
                              className="text-xs bg-blue-500 text-white font-medium flex items-center gap-1 px-3 py-1 rounded-full hover:bg-blue-600 shrink-0"
                            >
                              <LuPlaneTakeoff className="w-4 h-4" />
                              <span>Info</span>
                            </Link>
                          </div>

                          {violation.description && (
                            <p className={cn("text-sm mb-2", levelConfig.textColor)}>
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
                              <p>System detected • {formatDate(violation.created)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No violations found
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-100 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[15px]">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Violation Levels
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Level 1: System violations
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Level 2: ATC reports
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-800 rounded-full shrink-0" />
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
          flights.map((flight) => <FlightCard key={flight.id} flight={flight} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-[15px]">
              <LuPlane className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No flights found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightsDisplay;
