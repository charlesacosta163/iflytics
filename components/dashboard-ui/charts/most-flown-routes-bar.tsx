"use client"

import { useState, useMemo, useEffect } from "react"
import { Search } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { FaRoute } from "react-icons/fa"
import { LuRepeat, LuTrendingUp, LuList, LuSparkles } from "react-icons/lu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

const chartConfig = {
  flights: {
    label: "Flights",
    theme: {
      light: "hsl(var(--chart-1))",
      dark: "#ffffff",
    },
  },
} satisfies ChartConfig

const formatRoute = (route: string) => {
  const [origin, destination] = route.split("-")
  return destination ? `${origin} → ${destination}` : route
}

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
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>
    )}
  </div>
)

const BonusStat = ({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) => (
  <div
    className={cn(
      "rounded-lg border border-dashed border-gray-200 dark:border-gray-600",
      "bg-gray-50/50 dark:bg-gray-900/30",
      "p-3 min-w-0"
    )}
  >
    <p className="text-[10px] leading-snug text-gray-400 dark:text-gray-500 italic">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 tabular-nums">
      {value}
    </p>
    {sub && (
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>
    )}
  </div>
)

function calcBonusMetrics(
  sortedRoutes: { route: string; count: number }[],
  totalFlights: number,
  uniqueRoutes: number
) {
  const oneTimers = sortedRoutes.filter((r) => r.count === 1).length

  const routeSet = new Set(sortedRoutes.map((r) => r.route))
  let roundTripPairs = 0
  const seen = new Set<string>()
  sortedRoutes.forEach((r) => {
    const [origin, dest] = r.route.split("-")
    const reverse = `${dest}-${origin}`
    const pairKey = [origin, dest].sort().join("-")
    if (origin !== dest && routeSet.has(reverse) && !seen.has(pairKey)) {
      seen.add(pairKey)
      roundTripPairs++
    }
  })

  const airportTally: Record<string, number> = {}
  sortedRoutes.forEach((r) => {
    const [o, d] = r.route.split("-")
    if (o) airportTally[o] = (airportTally[o] || 0) + r.count
    if (d) airportTally[d] = (airportTally[d] || 0) + r.count
  })
  const busiestAirport = Object.entries(airportTally).sort((a, b) => b[1] - a[1])[0]

  const varietyIndex =
    totalFlights > 0
      ? Math.round((uniqueRoutes / totalFlights) * 100)
      : 0

  const kAirportFlights = sortedRoutes
    .filter((r) => {
      const [o, d] = r.route.split("-")
      return o?.startsWith("K") || d?.startsWith("K")
    })
    .reduce((sum, r) => sum + r.count, 0)
  const kAirportShare =
    totalFlights > 0 ? Math.round((kAirportFlights / totalFlights) * 100) : 0

  const lonelyBottom = sortedRoutes.filter((r) => r.count === 1)
  const singleFlightShare =
    uniqueRoutes > 0
      ? ((lonelyBottom.length / uniqueRoutes) * 100).toFixed(0)
      : "0"

  return {
    oneTimers,
    roundTripPairs,
    busiestAirport,
    varietyIndex,
    kAirportShare,
    singleFlightShare,
  }
}

export function MostFlownRoutesBarChart({
  chartData: initialChartData,
}: {
  chartData: { route: string; count: number }[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const sortedRoutes = useMemo(
    () => [...initialChartData].sort((a, b) => b.count - a.count),
    [initialChartData]
  )

  const top10ChartData = useMemo(
    () =>
      sortedRoutes.slice(0, 10).map((r) => ({
        ...r,
        label: formatRoute(r.route),
      })),
    [sortedRoutes]
  )

  const top5 = sortedRoutes.slice(0, 5)
  const top5Max = top5.length > 0 ? top5[0].count : 0

  const totalFlights = sortedRoutes.reduce((sum, r) => sum + r.count, 0)
  const uniqueRoutes = sortedRoutes.length
  const topRoute = sortedRoutes[0]
  const avgPerRoute =
    uniqueRoutes > 0 ? (totalFlights / uniqueRoutes).toFixed(1) : "0"
  const topRouteShare =
    topRoute && totalFlights > 0
      ? ((topRoute.count / totalFlights) * 100).toFixed(1)
      : "0"
  const top3Flights = sortedRoutes
    .slice(0, 3)
    .reduce((sum, r) => sum + r.count, 0)
  const top3Share =
    totalFlights > 0
      ? ((top3Flights / totalFlights) * 100).toFixed(1)
      : "0"

  const filteredRoutes = useMemo(
    () =>
      sortedRoutes.filter((r) =>
        r.route.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [sortedRoutes, searchQuery]
  )

  const bonus = useMemo(
    () => calcBonusMetrics(sortedRoutes, totalFlights, uniqueRoutes),
    [sortedRoutes, totalFlights, uniqueRoutes]
  )

  if (sortedRoutes.length === 0) {
    return (
      <div
        className={cn(
          "rounded-[20px] md:rounded-[25px]",
          "p-4 md:p-5",
          "flex flex-col items-center justify-center min-h-[160px]"
        )}
      >
        <FaRoute className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          No routes found
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-teal-50 dark:bg-teal-800/40",
        "rounded-[20px] md:rounded-[25px]",
        "p-4 md:p-5",
        "flex flex-col gap-4 md:gap-5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-lg font-semibold tracking-tighter text-gray-900 dark:text-gray-100">
            <FaRoute className={labelIconClass} />
            Most Flown Routes
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            How often you fly each origin → destination pair
          </p>
        </div>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
          {uniqueRoutes} routes
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 pt-1 border-t border-gray-200 dark:border-gray-700">
        <Stat
          label="Total Valid Flights"
          value={totalFlights}
          icon={<LuList className={labelIconClass} />}
        />
        <Stat
          label="Avg per route"
          value={`${avgPerRoute}×`}
          sub="Flights per unique pair"
          icon={<LuRepeat className={labelIconClass} />}
        />
        <Stat
          label="Top route share"
          value={`${topRouteShare}%`}
          sub={topRoute ? formatRoute(topRoute.route) : undefined}
          icon={<LuTrendingUp className={labelIconClass} />}
        />
        <Stat
          label="Top 3 share"
          value={`${top3Share}%`}
          sub="Of all route flights"
          icon={<FaRoute className={labelIconClass} />}
        />
      </div>

      <div className="space-y-3 pt-1 border-t border-gray-200 dark:border-gray-700">
        <p className="text-[11px] text-gray-500 dark:text-gray-400">Top 5</p>
        {top5.map((route, index) => {
          const barPct =
            top5Max > 0 ? Math.round((route.count / top5Max) * 100) : 0
          const share =
            totalFlights > 0
              ? ((route.count / totalFlights) * 100).toFixed(1)
              : "0"

          return (
            <div key={route.route} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 w-4 shrink-0 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {formatRoute(route.route)}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {route.count}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                    ({share}%)
                  </span>
                </div>
              </div>
              <Progress
                value={barPct}
                className="h-1 bg-gray-100 dark:bg-gray-700 [&>div]:bg-sky-500 dark:[&>div]:bg-sky-400"
              />
            </div>
          )
        })}
      </div>

      <div
        className={cn(
          "rounded-[20px] md:rounded-[25px]",
          "p-4 md:p-5",
          "overflow-x-auto"
        )}
      >
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
          Top 10 chart
        </p>
        <ChartContainer
          config={chartConfig}
          className={cn(
            "aspect-auto min-w-[600px] lg:min-w-full",
            isMobile ? "h-[155px]" : "h-[180px]"
          )}
        >
          <BarChart
            accessibilityLayer
            data={top10ChartData}
            margin={{
              top: 20,
              right: 12,
              left: 0,
              bottom: isMobile ? 8 : 4,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={isMobile ? 2 : 8}
              axisLine={false}
              interval={0}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 44 : 30}
              tick={{
                fontSize: isMobile ? 7 : 10,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => (
                    <span className="font-medium tabular-nums">
                      {item.payload?.label}: {value} flight{Number(value) !== 1 ? "s" : ""}
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="count" fill="var(--color-flights)" radius={[4, 4, 0, 0]} maxBarSize={40}>
              <LabelList
                position="top"
                offset={6}
                className="fill-foreground"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="space-y-3 pt-1 border-t border-gray-200 dark:border-gray-700">
        <p className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <LuSparkles className={labelIconClass} />
          <span className="italic">Stats you probably didn&apos;t ask for</span>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          <BonusStat
            label="One-time routes"
            value={bonus.oneTimers}
            sub="Flew exactly once and never returned"
          />
          <BonusStat
            label="Round-trip pairs"
            value={bonus.roundTripPairs}
            sub="A→B and B→A both exist"
          />
          <BonusStat
            label="Variety index"
            value={`${bonus.varietyIndex}%`}
            sub="Unique routes ÷ total flights"
          />
          <BonusStat
            label="Busiest airport"
            value={bonus.busiestAirport?.[0] ?? "—"}
            sub={
              bonus.busiestAirport
                ? `${bonus.busiestAirport[1]} appearances on your map`
                : undefined
            }
          />
          <BonusStat
            label="K-airport share"
            value={`${bonus.kAirportShare}%`}
            sub="Flights touching a K-prefix airport"
          />
          <BonusStat
            label="Tourist routes"
            value={`${bonus.singleFlightShare}%`}
            sub="Of your routes were one-and-done"
          />
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full text-xs font-semibold",
                "text-gray-700 dark:text-gray-200",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "rounded-[15px] border-none"
            )}
          >
            View all routes
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "max-w-lg max-h-[80vh] overflow-hidden flex flex-col z-[10001]",
            "bg-white dark:bg-gray-800",
            "rounded-[20px] md:rounded-[25px]"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              All Routes
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
              {totalFlights} flights across {uniqueRoutes} unique route
              {uniqueRoutes !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          <div
            className={cn(
              "flex items-center gap-2",
              "border border-gray-200 dark:border-gray-700",
              "rounded-lg px-3 py-2"
            )}
          >
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Input
              placeholder="Search routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "flex-1 h-7 border-none bg-transparent p-0 text-sm",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-gray-400"
              )}
            />
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Showing {filteredRoutes.length} of {uniqueRoutes}
          </p>

          <div className="overflow-y-auto flex-1 -mx-1 px-1">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold text-gray-500 w-8">
                    #
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500">
                    Route
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 text-right">
                    Flights
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 text-right">
                    Share
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route, index) => {
                  const rank =
                    sortedRoutes.findIndex((r) => r.route === route.route) + 1
                  const share =
                    totalFlights > 0
                      ? ((route.count / totalFlights) * 100).toFixed(1)
                      : "0"

                  return (
                    <TableRow
                      key={route.route}
                      className="border-gray-100 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                      <TableCell className="text-xs text-gray-400 tabular-nums py-2">
                        {rank || index + 1}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900 dark:text-gray-100 py-2">
                        {formatRoute(route.route)}
                      </TableCell>
                      <TableCell className="text-sm text-right tabular-nums text-gray-900 dark:text-gray-100 py-2">
                        {route.count}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums text-gray-500 py-2">
                        {share}%
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
