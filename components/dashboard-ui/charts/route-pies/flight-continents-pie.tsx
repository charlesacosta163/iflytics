"use client"

import * as React from "react"
import { TrendingUp, Globe } from "lucide-react"
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
import { LuMap, LuMapPin } from "react-icons/lu"

export const description = "Flight Continents Distribution Pie Chart"

// Continent name mapping
const continentNames: { [key: string]: string } = {
  'NA': 'North America',
  'SA': 'South America', 
  'EU': 'Europe',
  'AF': 'Africa',
  'AS': 'Asia',
  'OC': 'Oceania',
  'AN': 'Antarctica'
}

export function FlightContinentsPieChart({ chartData }: { 
  chartData: { label: string, amount: number, fill: string }[] 
}) {
  const totalFlights = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [chartData])

  // Create dynamic chart config based on the data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: "Flights",
      },
    }
    
    chartData.forEach((item) => {
      config[item.label] = {
        label: continentNames[item.label] || item.label,
        color: item.fill,
      }
    })
    
    return config
  }, [chartData])

  return (
    <Card className="flex flex-col shadow-none bg-transparent">
      <CardHeader className="items-center pb-0 bg-red-400 text-light py-4 rounded-xl">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2"><LuMap className="text-2xl" /> Continents Visited</CardTitle>
        <CardDescription className="text-gray-200">Distribution of flights by destination continent</CardDescription>
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
                          Valid Flights
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
                {continentNames[entry.label] || entry.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium px-4 py-1 rounded-full bg-red-400 text-light">
          Global flight destinations <Globe className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}
