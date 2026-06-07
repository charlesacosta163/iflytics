"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"
import { cn } from "@/lib/utils"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export type RoutePieSlice = {
  label: string
  value: number
  fill: string
  displayLabel?: string
}

export function RoutePieChartCard({
  title,
  description,
  icon,
  slices,
  note,
}: {
  title: string
  description: string
  icon: React.ReactNode
  slices: RoutePieSlice[]
  note?: string
}) {
  const total = React.useMemo(
    () => slices.reduce((sum, s) => sum + s.value, 0),
    [slices]
  )

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: { label: "Flights" },
    }
    slices.forEach((slice) => {
      config[slice.label] = {
        label: slice.displayLabel || slice.label,
        color: slice.fill,
      }
    })
    return config
  }, [slices])

  if (total === 0) {
    return (
      <div
        className={cn(
          "rounded-[20px] md:rounded-[25px]",
          "p-4 md:p-5",
          "bg-white/50 dark:bg-gray-800/50",
          "flex flex-col items-center justify-center min-h-[200px]"
        )}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-[20px] md:rounded-[25px]",
        "p-4 md:p-5",
        "bg-white/50 dark:bg-gray-800/50",
        "flex flex-col gap-3 h-full"
      )}
    >
      <div>
        <h4 className="flex items-center gap-1.5 text-lg tracking-tighter font-semibold text-gray-900 dark:text-gray-100">
          <span className="text-gray-500 dark:text-gray-400">{icon}</span>
          {title}
        </h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto mx-auto h-[160px] w-full max-w-[180px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={68}
            paddingAngle={3}
            strokeWidth={2}
            stroke="hsl(var(--background))"
          >
            {slices.map((entry, index) => (
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
                        className="fill-foreground text-xl font-semibold"
                      >
                        {total.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 16}
                        className="fill-muted-foreground text-[10px]"
                      >
                        flights
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="space-y-2 mt-auto">
        {slices.map((slice) => {
          const pct =
            total > 0 ? ((slice.value / total) * 100).toFixed(1) : "0"
          return (
            <div
              key={slice.label}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: slice.fill }}
                />
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  {slice.displayLabel || slice.label}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
                {slice.value}{" "}
                <span className="text-[10px]">({pct}%)</span>
              </span>
            </div>
          )
        })}
      </div>

      {note && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 italic pt-1">
          {note}
        </p>
      )}
    </div>
  )
}
