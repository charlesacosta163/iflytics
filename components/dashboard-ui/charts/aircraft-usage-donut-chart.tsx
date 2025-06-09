"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { FaPlane } from "react-icons/fa"

// Chart colors - using actual color values, not Tailwind classes 

// PLEASE USE ALL POSSIBLE TAILWIND 400 COLORS
const CHART_COLORS = [
  "#f87171", // red-400
  "#60a5fa", // blue-400
  "#4ade80", // green-400
  "#facc15", // yellow-400
  "#c084fc", // purple-400
  "#fb923c", // orange-400
  "#94a3b8", // slate-400
  "#67e8f9", // cyan-400
  "#d8b4fe", // violet-400
  "#fda4af", // rose-400
  "#a3e635", // lime-400
  "#2dd4bf", // teal-400
  "#f43f5e", // pink-400
  "#f97316", // orange-400
  "#818cf8", // indigo-400
  "#fb7185", // pink-400
  "#f97316", // orange-400
  "#818cf8", // indigo-400
  "#A9A9A9", // gray-700
  "#64748b", // gray-400
  "#94a3b8", // slate-400
];

export function AircraftUsageDonutChart({ aircraftUsageData, timeframe, className }: { aircraftUsageData: { name: string, count: number }[], timeframe: string, className?: string }) {
  // Process data for the chart
  const chartData = React.useMemo(() => {
    // Use all aircraft data without limiting to top 5
    return aircraftUsageData.map((aircraft, index) => ({
      name: aircraft.name,
      count: aircraft.count,
      // Cycle through available colors if there are more aircraft than colors
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [aircraftUsageData]);
  
  // Calculate total flights
  const totalFlights = React.useMemo(() => {
    return aircraftUsageData.reduce((acc, curr) => acc + curr.count, 0)
  }, [aircraftUsageData]);

  return (
    <Card className={cn("flex flex-col bg-dark w-full", className)}>
      <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <FaPlane className="text-purple-400" />
                Aircraft Usage
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your most used aircraft in the last {timeframe} days
              </CardDescription>
            </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                
                const data = payload[0].payload;
                const percentage = Math.round((data.count / totalFlights) * 100);
                
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-bold">{data.name}</span>
                      <span className="text-muted-foreground">
                        {data.count} flights ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              fill="#8884d8"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill}/>
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
                          className="fill-white text-3xl font-bold"
                        >
                          {totalFlights}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className=" fill-gray-200"
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
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap justify-center gap-2 w-full">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs truncate text-gray-200 font-medium" title={item.name}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
