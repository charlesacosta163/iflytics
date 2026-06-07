import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import React from "react"
import { getAirline } from "@/lib/sync-actions"
import { getAllAircraft } from "@/lib/actions"
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata"
import { cn } from "@/lib/utils"
import { FaPlane } from "react-icons/fa"
import { LuBuilding2, LuList, LuPlane, LuTrendingUp } from "react-icons/lu"

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

const Stat = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
}) => (
  <div className="min-w-0">
    <p className="flex items-center gap-1 text-[11px] leading-none text-gray-500 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </p>
    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight mt-1">
      {value}
    </p>
    {sub && (
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
        {sub}
      </p>
    )}
  </div>
)

type AirlineAircraft = { name: string; flights: number }
type AirlineEntry = {
  airline: string
  flights: number
  aircraft: AirlineAircraft[]
}

const AirlineAnalysisCard = async ({
  routesWithDistances,
}: {
  routesWithDistances: any[]
}) => {
  const allAircraft = await getAllAircraft()
  const aircraftArray = allAircraft ?? []

  function airlineAnalysisData(): AirlineEntry[] {
    const airlinesUsed: AirlineEntry[] = []

    routesWithDistances.forEach((route) => {
      const airline = getAirline(route.callsign)
      if (!airline) return

      const aircraftObj: any = aircraftArray.find(
        (aircraft: any) => aircraft.id === route.aircraftId
      )
      const aircraftName = aircraftObj ? aircraftObj.name : "Unknown Aircraft"

      const existingAirline = airlinesUsed.find(
        (item) => item.airline === airline
      )

      if (existingAirline) {
        existingAirline.flights += 1
        const existingAircraft = existingAirline.aircraft.find(
          (ac) => ac.name === aircraftName
        )
        if (existingAircraft) {
          existingAircraft.flights += 1
        } else {
          existingAirline.aircraft.push({ name: aircraftName, flights: 1 })
        }
      } else {
        airlinesUsed.push({
          airline,
          flights: 1,
          aircraft: [{ name: aircraftName, flights: 1 }],
        })
      }
    })

    return airlinesUsed
  }

  const sortedAirlinesUsed = airlineAnalysisData()
    .sort((a, b) => b.flights - a.flights)
    .map((airline) => ({
      ...airline,
      aircraft: airline.aircraft.sort((a, b) => b.flights - a.flights),
    }))

  const totalRoutes = routesWithDistances.length
  const totalTaggedFlights = sortedAirlinesUsed.reduce(
    (sum, airline) => sum + airline.flights,
    0
  )
  const untaggedFlights = totalRoutes - totalTaggedFlights
  const uniqueAirlines = sortedAirlinesUsed.length
  const topAirline = sortedAirlinesUsed[0]
  const topShare =
    topAirline && totalTaggedFlights > 0
      ? ((topAirline.flights / totalTaggedFlights) * 100).toFixed(1)
      : "0"
  const top3Flights = sortedAirlinesUsed
    .slice(0, 3)
    .reduce((sum, airline) => sum + airline.flights, 0)
  const top3Share =
    totalTaggedFlights > 0
      ? ((top3Flights / totalTaggedFlights) * 100).toFixed(1)
      : "0"
  const uniqueAircraftTypes = new Set(
    sortedAirlinesUsed.flatMap((airline) =>
      airline.aircraft.map((aircraft) => aircraft.name)
    )
  ).size
  const maxAirlineFlights = topAirline?.flights ?? 1

  return (
    <section
      className={cn(
        "bg-indigo-50 dark:bg-indigo-800/10",
        "rounded-[20px] md:rounded-[25px]",
        "p-4 md:p-5"
      )}
    >
      <header className="mb-4">
        <h3 className="flex items-center gap-1.5 text-lg font-semibold tracking-tighter text-gray-900 dark:text-gray-100">
          <LuBuilding2 className={labelIconClass} />
          Top airlines
        </h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
          Airlines identified from your <u>flight callsigns</u>
        </p>
      </header>

      {sortedAirlinesUsed.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Stat
              label="Airlines identified"
              value={uniqueAirlines}
              sub={`${totalTaggedFlights} tagged of ${totalRoutes} flights`}
              icon={<LuBuilding2 className={labelIconClass} />}
            />
            <Stat
              label="Top airline"
              value={topAirline?.airline ?? "—"}
              sub={
                topAirline
                  ? `${topAirline.flights} flights · ${topShare}%`
                  : undefined
              }
              icon={<LuTrendingUp className={labelIconClass} />}
            />
            <Stat
              label="Top 3 share"
              value={`${top3Share}%`}
              sub="Of airline-tagged flights"
              icon={<LuList className={labelIconClass} />}
            />
            <Stat
              label="Aircraft types"
              value={uniqueAircraftTypes}
              sub={
                untaggedFlights > 0
                  ? `${untaggedFlights} flight${untaggedFlights !== 1 ? "s" : ""} unmatched`
                  : "All flights matched an airline"
              }
              icon={<FaPlane className={labelIconClass} />}
            />
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-5 mb-3">
            All airlines ({sortedAirlinesUsed.length})
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-h-[500px] overflow-y-auto pr-1">
            {sortedAirlinesUsed.map((airline, index) => {
              const sharePct =
                totalTaggedFlights > 0
                  ? Number(
                      ((airline.flights / totalTaggedFlights) * 100).toFixed(1)
                    )
                  : 0
              const barPct =
                maxAirlineFlights > 0
                  ? Math.round((airline.flights / maxAirlineFlights) * 100)
                  : 0

              return (
                <div
                  key={airline.airline}
                  className={cn(
                    "flex flex-col gap-3 p-3 md:p-4",
                    "rounded-[20px] md:rounded-[25px]",
                    "bg-white/50 dark:bg-gray-800/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 w-4 shrink-0 tabular-nums">
                        {index + 1}
                      </span>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {airline.airline}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums leading-none">
                        {airline.flights}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {airline.flights === 1 ? "flight" : "flights"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                      <span>Share of tagged flights</span>
                      <span className="tabular-nums">{sharePct}%</span>
                    </div>
                    <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 dark:bg-sky-400 rounded-full"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-gray-200 dark:border-gray-700">
                    <p className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <LuPlane className={labelIconClass} />
                      Top aircraft
                    </p>
                    {airline.aircraft.slice(0, 3).map((aircraft) => (
                      <div
                        key={aircraft.name}
                        className="flex justify-between gap-2 text-xs"
                      >
                        <span className="text-gray-700 dark:text-gray-300 truncate">
                          {aircraft.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
                          {aircraft.flights}
                        </span>
                      </div>
                    ))}

                    {airline.aircraft.length > 3 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                          >
                            +{airline.aircraft.length - 3} more aircraft
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          className={cn(
                            "max-w-md max-h-[80vh] overflow-hidden flex flex-col z-[10001]",
                            "bg-white dark:bg-gray-800",
                            "border border-gray-200 dark:border-gray-700",
                            "rounded-xl md:rounded-2xl"
                          )}
                        >
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                              <span className="truncate">{airline.airline}</span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] rounded-md shrink-0",
                                  "bg-gray-100 dark:bg-gray-700",
                                  "text-gray-600 dark:text-gray-300",
                                  "border-none font-medium"
                                )}
                              >
                                {airline.aircraft.length} aircraft
                              </Badge>
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-3 overflow-y-auto flex-1 -mx-1 px-1">
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              All aircraft flown with this airline
                            </p>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {airline.aircraft.map((aircraft, aircraftIndex) => (
                                <div
                                  key={aircraftIndex}
                                  className={cn(
                                    "flex items-center gap-3 p-3",
                                    "rounded-[20px] md:rounded-[25px]",
                                    "border border-gray-200 dark:border-gray-700",
                                    "bg-stone-50 dark:bg-stone-800/50"
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs md:text-sm text-gray-900 dark:text-gray-100 truncate">
                                      {aircraft.name}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums">
                                      {aircraft.flights}{" "}
                                      {aircraft.flights === 1
                                        ? "flight"
                                        : "flights"}
                                    </p>
                                  </div>
                                  <Image
                                    src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`}
                                    alt={aircraft.name}
                                    width={60}
                                    height={40}
                                    className="rounded-md border border-gray-200 dark:border-gray-700 shrink-0"
                                  />
                                </div>
                              ))}
                            </div>

                            <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                              Total flights with {airline.airline}:{" "}
                              <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                                {airline.flights}
                              </span>
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div
          className={cn(
            "text-center py-10",
            "border border-dashed border-gray-200 dark:border-gray-600",
            "rounded-lg"
          )}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            No airline data available
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Fly with recognizable airline callsigns to see analysis here
          </p>
        </div>
      )}
    </section>
  )
}

export default AirlineAnalysisCard
