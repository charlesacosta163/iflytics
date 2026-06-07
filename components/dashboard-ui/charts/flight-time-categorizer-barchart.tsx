"use client"

import { useMemo, useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { FaClock } from "react-icons/fa"
import { LuClock, LuTrendingUp, LuTimer, LuPlane } from "react-icons/lu"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

export type FlightTimeCategory = {
  label: string
  min: number
  max: number
  count: number
}

const chartConfig = {
  flights: {
    label: "Flights",
    theme: {
      light: "hsl(var(--chart-2))",
      dark: "#ffffff",
    },
  },
} satisfies ChartConfig

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

export function FlightTimeCategorizerBarChart({
  flightTimeCategorizerData,
  className,
}: {
  flightTimeCategorizerData: FlightTimeCategory[]
  className?: string
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const totalFlights = useMemo(
    () => flightTimeCategorizerData.reduce((sum, d) => sum + d.count, 0),
    [flightTimeCategorizerData]
  )

  const peakBucket = useMemo(
    () =>
      [...flightTimeCategorizerData].sort((a, b) => b.count - a.count)[0] ??
      null,
    [flightTimeCategorizerData]
  )

  const peakShare =
    peakBucket && totalFlights > 0
      ? ((peakBucket.count / totalFlights) * 100).toFixed(1)
      : "0"

  const shortFlights = useMemo(
    () =>
      flightTimeCategorizerData
        .filter((d) => d.max <= 120)
        .reduce((sum, d) => sum + d.count, 0),
    [flightTimeCategorizerData]
  )

  const longFlights = useMemo(
    () =>
      flightTimeCategorizerData
        .filter((d) => d.min >= 360)
        .reduce((sum, d) => sum + d.count, 0),
    [flightTimeCategorizerData]
  )

  const longShare =
    totalFlights > 0
      ? ((longFlights / totalFlights) * 100).toFixed(1)
      : "0"

  const chartData = useMemo(
    () =>
      flightTimeCategorizerData.map((d) => ({
        label: d.label,
        count: d.count,
      })),
    [flightTimeCategorizerData]
  )

  const top5 = useMemo(
    () =>
      [...flightTimeCategorizerData]
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    [flightTimeCategorizerData]
  )

  const top5Max = top5[0]?.count ?? 1

  if (totalFlights === 0) {
    return (
      <div
        className={cn(
          "rounded-[20px] md:rounded-[25px]",
          "rounded-xl md:rounded-2xl",
          "p-4 md:p-5",
          "flex flex-col items-center justify-center min-h-[160px]",
          className
        )}
      >
        <FaClock className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          No flight duration data
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-[20px] md:rounded-[25px]",
        "bg-lime-50 dark:bg-lime-800/20",
        "p-4 md:p-5",
        "flex flex-col gap-4 md:gap-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-lg font-semibold tracking-tighter text-gray-900 dark:text-gray-100">
            <LuClock className={labelIconClass} />
            Flight duration distribution
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            How your valid flights break down by block time
          </p>
        </div>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
          {totalFlights} flights
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 pt-1 border-t border-gray-200 dark:border-gray-700">
        <Stat
          label="Most common"
          value={peakBucket?.label ?? "—"}
          sub={
            peakBucket
              ? `${peakBucket.count} flights · ${peakShare}%`
              : undefined
          }
          icon={<LuTrendingUp className={labelIconClass} />}
        />
        <Stat
          label="Under 2 hours"
          value={shortFlights}
          sub="Short hops and quick hops"
          icon={<LuTimer className={labelIconClass} />}
        />
        <Stat
          label="6 hours or more"
          value={longFlights}
          sub={`${longShare}% of all flights`}
          icon={<LuPlane className={labelIconClass} />}
        />
        <Stat
          label="Duration buckets"
          value={flightTimeCategorizerData.filter((d) => d.count > 0).length}
          sub="Of 11 hourly ranges used"
          icon={<FaClock className={labelIconClass} />}
        />
      </div>

      {top5.length > 0 && (
        <div className="space-y-3 pt-1 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Top 5</p>
          {top5.map((bucket, index) => {
            const barPct =
              top5Max > 0 ? Math.round((bucket.count / top5Max) * 100) : 0
            const share =
              totalFlights > 0
                ? ((bucket.count / totalFlights) * 100).toFixed(1)
                : "0"
            return (
              <div key={bucket.label} className="flex items-center gap-3">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 w-4 tabular-nums shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {bucket.label}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
                      {bucket.count}{" "}
                      <span className="text-gray-400">({share}%)</span>
                    </span>
                  </div>
                  <Progress
                    value={barPct}
                    className="h-1.5 bg-gray-100 dark:bg-gray-700"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-2 pt-1 border-t border-gray-200 dark:border-gray-700">
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          All duration buckets
        </p>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full h-[180px] md:h-[200px]"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 12,
              left: 0,
              bottom: isMobile ? 8 : 4,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
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
                      {item.payload?.label}: {value} flight
                      {Number(value) !== 1 ? "s" : ""}
                    </span>
                  )}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-flights)"
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 24 : 36}
            >
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
    </div>
  )
}
