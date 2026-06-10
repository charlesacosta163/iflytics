"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { GrPaint } from "react-icons/gr"
import { FaPlane } from "react-icons/fa"
import { LuList, LuTrendingUp, LuRepeat, LuSparkles } from "react-icons/lu"
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type LiveryUsage = {
  aircraftId: string
  liveryId: string
  aircraftName: string
  liveryName: string
  count: number
}

const StatCard = ({
  title,
  value,
  sub,
  icon,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ReactNode
}) => (
  <div
    className={cn(
      "bg-white/70 dark:bg-gray-800/80",
      "rounded-[15px] md:rounded-[20px]",
      "p-4 md:p-5",
      "hover:shadow-lg transition-all duration-300",
      "min-w-0"
    )}
  >
    <div className="inline-flex p-2 md:p-3 rounded-[12px] md:rounded-[15px] bg-gradient-to-r from-amber-500 to-orange-500 mb-3">
      <div className="text-white text-lg md:text-xl">{icon}</div>
    </div>
    <h3 className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
      {title}
    </h3>
    <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1 tracking-tight tabular-nums">
      {value}
    </p>
    {sub && (
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 truncate" title={sub}>
        {sub}
      </p>
    )}
  </div>
)

export function LiveryAnalysisPanel({ liveries }: { liveries: LiveryUsage[] }) {
  const aircraftOptions = useMemo(() => {
    const byId = new Map<
      string,
      { aircraftId: string; aircraftName: string; totalFlights: number; liveryCount: number }
    >()

    liveries.forEach((entry) => {
      if (!entry.aircraftId) return

      const existing = byId.get(entry.aircraftId)
      if (existing) {
        existing.totalFlights += entry.count
        existing.liveryCount += 1
      } else {
        byId.set(entry.aircraftId, {
          aircraftId: entry.aircraftId,
          aircraftName: entry.aircraftName,
          totalFlights: entry.count,
          liveryCount: 1,
        })
      }
    })

    return [...byId.values()]
      .filter((aircraft) => aircraft.aircraftId)
      .sort((a, b) => b.totalFlights - a.totalFlights)
  }, [liveries])

  const [selectedAircraftId, setSelectedAircraftId] = useState(
    () => aircraftOptions[0]?.aircraftId ?? ""
  )

  const selectedAircraft = aircraftOptions.find(
    (a) => a.aircraftId === selectedAircraftId
  )

  const aircraftLiveries = useMemo(
    () =>
      liveries
        .filter((l) => l.aircraftId === selectedAircraftId)
        .sort((a, b) => b.count - a.count),
    [liveries, selectedAircraftId]
  )

  const totalForAircraft = aircraftLiveries.reduce((sum, l) => sum + l.count, 0)
  const topLiveryCount = aircraftLiveries[0]?.count ?? 0

  const liveryMetrics = useMemo(() => {
    const topLivery = aircraftLiveries[0]
    const topShare =
      topLivery && totalForAircraft > 0
        ? ((topLivery.count / totalForAircraft) * 100).toFixed(1)
        : "0"
    const top3Flights = aircraftLiveries
      .slice(0, 3)
      .reduce((sum, l) => sum + l.count, 0)
    const top3Share =
      totalForAircraft > 0
        ? ((top3Flights / totalForAircraft) * 100).toFixed(1)
        : "0"
    const avgPerLivery =
      aircraftLiveries.length > 0
        ? (totalForAircraft / aircraftLiveries.length).toFixed(1)
        : "0"
    const oneTimeLiveries = aircraftLiveries.filter((l) => l.count === 1).length

    return {
      topLivery,
      topShare,
      top3Share,
      avgPerLivery,
      oneTimeLiveries,
    }
  }, [aircraftLiveries, totalForAircraft])

  if (aircraftOptions.length === 0) {
    return (
      <Card
        className={cn(
          "rounded-[25px] md:rounded-[30px]",
          "bg-white/50 dark:bg-gray-900/50",
          "shadow-md"
        )}
      >
        <CardContent className="flex flex-col items-center justify-center text-center py-16 px-6">
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[20px] mb-4">
            <GrPaint className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            No Livery Data Yet
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium mt-2 max-w-md">
            Fly a few more flights and your liveries will show up here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <main className="space-y-6 md:space-y-8">
      <Card
        className={cn(
          "rounded-[25px] md:rounded-[30px]",
          "bg-white/50 dark:bg-gray-800/50",
          "shadow-none overflow-hidden"
        )}
      >
        <CardContent className="p-5 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="min-w-0 text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                <GrPaint className="text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="bg-gradient-to-r from-amber-500 to-amber-300 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
                  Livery Analysis
                </span>
              </h1>
              <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-semibold tracking-tight mt-2">
                {liveries.length} unique liveries across {aircraftOptions.length} aircraft
              </p>
            </div>

            <Select
              value={selectedAircraftId || undefined}
              onValueChange={setSelectedAircraftId}
            >
              <SelectTrigger
                className={cn(
                  "w-full lg:w-[320px] h-12",
                  "rounded-[15px]",
                  "bg-white dark:bg-gray-800 border-none",
                  "text-sm font-bold shadow-none",
                  "hover:scale-[1.01] transition-transform duration-200"
                )}
              >
                <SelectValue placeholder="Select an aircraft" />
              </SelectTrigger>
              <SelectContent className="z-[10001] rounded-[15px] border-2">
                {aircraftOptions.map((aircraft) => (
                  <SelectItem key={aircraft.aircraftId} value={aircraft.aircraftId}>
                    <span className="flex items-center gap-2 font-semibold">
                      <Image
                        src={`/images/aircraft/${matchAircraftNameToImage(aircraft.aircraftName)}`}
                        alt={aircraft.aircraftName}
                        width={24}
                        height={24}
                        className="rounded-md"
                      />
                      <span className="truncate">{aircraft.aircraftName}</span>
                      <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] font-bold">
                        {aircraft.totalFlights}
                      </Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedAircraft && (
        <Card
          className={cn(
            "rounded-[25px] md:rounded-[30px]",
            "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
            "dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20",
            "shadow-none overflow-hidden"
          )}
        >
          <CardHeader className="pb-4 px-5 md:px-8 pt-6 md:pt-8">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 text-amber-500 rounded-[12px] md:rounded-[15px]">
                <FaPlane className="text-lg md:text-2xl" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-2xl md:text-5xl font-bold tracking-tighter text-amber-900 dark:text-amber-100">
                  {selectedAircraft.aircraftName}
                </CardTitle>
                <CardDescription className="text-sm font-semibold text-amber-800/80 dark:text-amber-300/90 mt-0.5">
                  Selected aircraft · {selectedAircraft.liveryCount} liveries flown
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5 md:px-8 pb-6 md:pb-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div
                className={cn(
                  "shrink-0 p-4 md:p-5",
                  "bg-white dark:bg-gray-900",
                  "rounded-[20px] md:rounded-[25px]",
                  "shadow-lg"
                )}
              >
                <Image
                  src={`/images/aircraft/${matchAircraftNameToImage(selectedAircraft.aircraftName)}`}
                  alt={selectedAircraft.aircraftName}
                  width={240}
                  height={140}
                  className="w-[200px] md:w-[240px] h-auto rounded-[15px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                <StatCard
                  title="Flights"
                  value={selectedAircraft.totalFlights}
                  icon={<LuList />}
                />
                <StatCard
                  title="Unique Liveries"
                  value={selectedAircraft.liveryCount}
                  icon={<GrPaint />}
                />
              </div>
            </div>

            <div
              className={cn(
                "pt-6 border-t-2 border-amber-200/80 dark:border-amber-800/40",
                "space-y-5"
              )}
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <LuTrendingUp className="text-amber-600 dark:text-amber-400 text-lg" />
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                    Livery Metrics
                  </h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Top Livery Share"
                    value={`${liveryMetrics.topShare}%`}
                    sub={liveryMetrics.topLivery?.liveryName ?? "No data"}
                    icon={<LuTrendingUp />}
                  />
                  <StatCard
                    title="Avg Per Livery"
                    value={`${liveryMetrics.avgPerLivery}×`}
                    sub="Flights per unique livery"
                    icon={<LuRepeat />}
                  />
                  <StatCard
                    title="Top 3 Share"
                    value={`${liveryMetrics.top3Share}%`}
                    sub="Of all flights on this aircraft"
                    icon={<GrPaint />}
                  />
                  <StatCard
                    title="One-Time Liveries"
                    value={liveryMetrics.oneTimeLiveries}
                    sub="Flown exactly once"
                    icon={<LuSparkles />}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <GrPaint className="text-amber-600 dark:text-amber-400 text-lg" />
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                  Liveries Flown
                </h3>
              </div>

              <div className="space-y-3">
                {aircraftLiveries.map((livery, index) => {
                  const share =
                    totalForAircraft > 0
                      ? ((livery.count / totalForAircraft) * 100).toFixed(1)
                      : "0"
                  const barPct =
                    topLiveryCount > 0
                      ? Math.round((livery.count / topLiveryCount) * 100)
                      : 0

                  return (
                    <div
                      key={livery.liveryId}
                      className={cn(
                        "p-4 md:p-5",
                        "bg-white/80 dark:bg-gray-900/80",
                        "rounded-[15px] md:rounded-[20px]",
                        "hover:shadow-md transition-shadow duration-200"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 shrink-0",
                              "rounded-full font-black text-sm text-white",
                              index === 0
                                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                : "bg-gray-400 dark:bg-gray-600"
                            )}
                          >
                            {index + 1}
                          </div>
                          <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100 truncate">
                            {livery.liveryName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-bold text-xs px-2.5">
                            {livery.count} flight{livery.count !== 1 ? "s" : ""}
                          </Badge>
                          <Badge
                            variant="outline"
                            className=" text-amber-800 dark:text-amber-300 font-bold text-xs"
                          >
                            {share}%
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={barPct}
                        className="h-2.5 bg-gray-100 dark:bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
