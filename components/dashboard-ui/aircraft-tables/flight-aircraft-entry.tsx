"use client"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata"
import { convertMinutesToHours, cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import Link from "next/link"
import { GiPathDistance } from "react-icons/gi"
import { LuCalendar, LuList, LuTimer } from "react-icons/lu"

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

const shortenNumber = (number: number) => {
  if (number < 1000) return number.toLocaleString()
  if (number < 1000000) return (number / 1000).toFixed(1) + "k"
  if (number < 1000000000) return (number / 1000000).toFixed(1) + "m"
  return (number / 1000000000).toFixed(1) + "b"
}

const Stat = ({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
}) => (
  <div className="min-w-0 text-center">
    <p className="flex items-center justify-center gap-1 text-[11px] leading-none text-gray-500 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </p>
    <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight mt-1">
      {value}
    </p>
  </div>
)

const FlightAircraftEntry = ({
  index,
  aircraft,
  flightsAmountRaw,
  allFlightsWithDistances,
}: {
  index: number
  aircraft: any
  flightsAmountRaw: number
  allFlightsWithDistances: any[]
}) => {
  const aircraftFlights =
    allFlightsWithDistances?.filter(
      (flight) => flight.aircraftId === aircraft.aircraftId
    ) || []

  const usagePct =
    flightsAmountRaw > 0
      ? Number(((aircraft.count / flightsAmountRaw) * 100).toFixed(1))
      : 0

  const lastUsedLabel = aircraft.lastUsed
    ? new Date(aircraft.lastUsed).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A"

  return (
    <section
      className={cn(
        "flex flex-col gap-3",
        "p-3 md:p-6",
        "rounded-[20px] md:rounded-[25px]",
        "w-full",
        "bg-white/70 dark:bg-gray-800/70",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Image
            src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`}
            alt={aircraft.name || "Aircraft"}
            width={88}
            height={56}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
          <span
            className={cn(
              "absolute -top-2 -left-2",
              "w-5 h-5 flex items-center justify-center",
              "rounded-full",
              "bg-gray-900 dark:bg-gray-100",
              "text-[10px] font-semibold tabular-nums",
              "text-white dark:text-gray-900"
            )}
          >
            {index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm md:text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100 truncate">
              {aircraft.name || "Unknown Aircraft"}
            </h4>
            <div className="text-right shrink-0">
              <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums leading-none">
                {aircraft.count}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {aircraft.count === 1 ? "flight" : "flights"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            <p className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <LuTimer className={labelIconClass} />
              {convertMinutesToHours(Math.round(aircraft.totalTime))}
            </p>
            <p className="flex items-center justify-end gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <GiPathDistance className={labelIconClass} />
              {shortenNumber(Math.round(aircraft.totalDistance))} NM
            </p>
            <p className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <LuList className={labelIconClass} />
              {usagePct}% of log
            </p>
            <p className="flex items-center justify-end gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <LuCalendar className={labelIconClass} />
              {lastUsedLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
          <span>Usage share</span>
          <span className="tabular-nums">{usagePct}%</span>
        </div>
        <Progress
          value={usagePct}
          className="h-1 bg-gray-100 dark:bg-gray-700 [&>div]:bg-sky-500 dark:[&>div]:bg-sky-400"
        />
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full h-8 text-xs font-semibold",
              "border-gray-200 dark:border-gray-700",
              "text-gray-700 dark:text-gray-200",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "rounded-lg border-none"
            )}
          >
            <Eye className="w-3 h-3 mr-1.5" />
            View {aircraft.count}{" "}
            {aircraft.count === 1 ? "flight" : "flights"}
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "max-w-4xl max-h-[80vh] overflow-hidden flex flex-col z-[10001]",
            "bg-white dark:bg-gray-800",
            "border border-gray-200 dark:border-gray-700",
            "rounded-xl md:rounded-2xl"
          )}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              <Image
                src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`}
                alt={aircraft.name}
                width={40}
                height={25}
                className="rounded-md border border-gray-200 dark:border-gray-700"
              />
              <span className="truncate">{aircraft.name} flight history</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 -mx-1 px-1">
            {aircraftFlights.length > 0 ? (
              <>
                <div
                  className={cn(
                    "grid grid-cols-3 gap-3",
                    "p-3 md:p-4",
                    "border border-gray-200 dark:border-gray-700",
                    "rounded-xl",
                    "bg-white/50 dark:bg-gray-800/50"
                  )}
                >
                  <Stat
                    label="Flights"
                    value={aircraft.count}
                    icon={<LuList className={labelIconClass} />}
                  />
                  <Stat
                    label="Distance"
                    value={`${shortenNumber(Math.round(aircraft.totalDistance))} NM`}
                    icon={<GiPathDistance className={labelIconClass} />}
                  />
                  <Stat
                    label="Flight time"
                    value={convertMinutesToHours(Math.round(aircraft.totalTime))}
                    icon={<LuTimer className={labelIconClass} />}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Flight log
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {aircraftFlights
                      .sort(
                        (a, b) =>
                          new Date(b.created).getTime() -
                          new Date(a.created).getTime()
                      )
                      .map((flight, flightIndex) => (
                        <div
                          key={flight.flightId || flightIndex}
                          className={cn(
                            "flex items-center justify-between gap-3",
                            "p-3",
                            "rounded-lg",
                            "border border-gray-200 dark:border-gray-700",
                            "bg-white/50 dark:bg-gray-800/50"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {flight.origin}
                                <span className="text-gray-400 mx-1">→</span>
                                {flight.destination}
                              </span>
                              {flight.originIsoCountry &&
                                flight.destinationIsoCountry && (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px] rounded-md border-none font-medium px-1.5 py-0",
                                      flight.origin === "????" ||
                                        flight.destination === "????"
                                        ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                        : flight.originIsoCountry ===
                                            flight.destinationIsoCountry
                                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                    )}
                                  >
                                    {flight.origin === "????" ||
                                    flight.destination === "????"
                                      ? "Unknown"
                                      : flight.originIsoCountry ===
                                          flight.destinationIsoCountry
                                        ? "Domestic"
                                        : "International"}
                                  </Badge>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {new Date(flight.created).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            <div className="flex gap-2 items-center flex-wrap mt-1.5">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] rounded-md font-medium border-none px-1.5 py-0",
                                  flight.server?.toLowerCase().includes("casual")
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    : flight.server
                                          ?.toLowerCase()
                                          .includes("training")
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                      : flight.server
                                            ?.toLowerCase()
                                            .includes("expert")
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                )}
                              >
                                {flight.server || "Unknown"}
                              </Badge>
                              {flight.origin !== "????" &&
                                flight.destination !== "????" && (
                                  <Link
                                    className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-md",
                                      "border border-gray-200 dark:border-gray-600",
                                      "text-gray-600 dark:text-gray-300",
                                      "hover:bg-gray-50 dark:hover:bg-gray-700",
                                      "transition-colors",
                                      "inline-flex items-center gap-1 font-medium"
                                    )}
                                    href={`/dashboard/flights/${flight.flightId}`}
                                    target="_blank"
                                  >
                                    <Eye className="w-3 h-3" />
                                    View
                                  </Link>
                                )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                              {Math.round(flight.distance || 0)} NM
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {convertMinutesToHours(
                                Math.round(flight.totalTime || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div
                className={cn(
                  "text-center py-8",
                  "border border-dashed border-gray-200 dark:border-gray-600",
                  "rounded-lg"
                )}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  No flight data available for this aircraft
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default FlightAircraftEntry
