"use client"

import * as React from "react"
import { TrendingUp, Plane } from "lucide-react"
import { Label, Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { LuEarth } from "react-icons/lu"

export const description = "Domestic vs International Flights Pie Chart"

const chartConfig = {
  amount: {
    label: "Flights",
  },
  domestic: {
    label: "Domestic",
    color: "#BB9AB1",
  },
  international: {
    label: "International", 
    color: "#EECEB9",
  },
} satisfies ChartConfig

export function FlightDomesticIntlPieChart({ chartData }: { 
  chartData: { label: string, amount: number, fill: string }[] 
}) {
  const totalFlights = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col shadow-none bg-transparent">
      <CardHeader className="items-center pb-0 bg-amber-500 text-light py-4 rounded-xl">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2"><LuEarth className="text-2xl" /> Flight Types</CardTitle>
        <CardDescription className="text-gray-200">Domestic vs International flights</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              strokeWidth={2}
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalFlights.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Flights
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        
        {/* Custom Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium px-4 py-1 rounded-full bg-amber-500 text-light">
          Flight destination analysis <Plane className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}