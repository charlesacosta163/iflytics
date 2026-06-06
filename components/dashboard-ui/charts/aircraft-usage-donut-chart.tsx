"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"
import { cn, formatTimeframeText } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { FaPlane } from "react-icons/fa"

const CHART_COLORS = [
  "#f87171",
  "#60a5fa",
  "#4ade80",
  "#facc15",
  "#c084fc",
  "#fb923c",
  "#94a3b8",
  "#67e8f9",
  "#d8b4fe",
  "#fda4af",
  "#a3e635",
  "#2dd4bf",
  "#f43f5e",
  "#818cf8",
  "#fb7185",
  "#64748b",
]

export function AircraftUsageDonutChart({
  aircraftUsageData,
  timeframe,
  className,
}: {
  aircraftUsageData: { name: string; count: number }[]
  timeframe: string
  className?: string
}) {
  const chartData = React.useMemo(() => {
    return aircraftUsageData.map((aircraft, index) => ({
      name: aircraft.name,
      count: aircraft.count,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
  }, [aircraftUsageData])

  const totalFlights = React.useMemo(() => {
    return aircraftUsageData.reduce((acc, curr) => acc + curr.count, 0)
  }, [aircraftUsageData])

  return (
    <Card
      className={cn(
        "flex flex-col w-full",
        "bg-purple-50 dark:bg-purple-900/20",
        "!shadow-none",
        "rounded-[20px] md:rounded-[25px]",
        className
      )}
    >
      <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 bg-purple-500 dark:bg-purple-600 rounded-[12px] md:rounded-[15px] shrink-0">
            <FaPlane className="text-white text-lg md:text-xl" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base md:text-lg font-bold tracking-tight text-purple-900 dark:text-purple-100">
              Aircraft Usage
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-purple-700 dark:text-purple-300">
              Your most used aircraft {formatTimeframeText(timeframe)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 md:px-6 pb-4 md:pb-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center",
              "bg-white/70 dark:bg-gray-800/50",
              "p-3 md:p-4",
              "rounded-[15px] md:rounded-[20px]",
              "md:w-[280px] lg:w-[320px]"
            )}
          >
          <ChartContainer
            config={{}}
            className="aspect-square w-full max-h-[220px] sm:max-h-[250px] md:max-h-[280px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null

                  const data = payload[0].payload
                  const percentage = Math.round((data.count / totalFlights) * 100)

                  return (
                    <div className="rounded-[20px] border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 px-3 py-2 shadow-md">
                      <p className="text-xs font-bold text-purple-900 dark:text-purple-100">
                        {data.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {data.count} flights ({percentage}%)
                      </p>
                    </div>
                  )
                }}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={2}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-purple-900 dark:fill-purple-100 text-2xl sm:text-3xl font-bold"
                          >
                            {totalFlights}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 22}
                            className="fill-gray-500 dark:fill-gray-400 text-xs font-semibold"
                          >
                            Flights
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-3 flex-1 min-w-0">
            {chartData.map((item) => {
              const percentage = Math.round((item.count / totalFlights) * 100)

              return (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center gap-2",
                    "rounded-[20px]",
                    " min-w-0"
                  )}
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.count} flight{item.count === 1 ? "" : "s"} · {percentage}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
