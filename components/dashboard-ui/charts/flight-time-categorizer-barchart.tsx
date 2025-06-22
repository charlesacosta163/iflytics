"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, ResponsiveContainer } from "recharts"

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
import { cn } from "@/lib/utils"
import { FaClock } from "react-icons/fa"

const chartConfig = {
  desktop: {
    label: "Flights",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function FlightTimeCategorizerBarChart({ 
  flightTimeCategorizerData, 
  className 
}: { 
  flightTimeCategorizerData: any[]; 
  className?: string;
}) {
    const chartData = flightTimeCategorizerData.map((item: any) => ({
        month: item.label,
        desktop: item.count,
    }));

  return (
    <Card className={cn("w-full bg-gray", className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
          <FaClock className="text-blue-400" />
          Flight Time Distribution
        </CardTitle>
        <CardDescription className="text-gray-300">
          Flights categorized by flight time duration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -8,
              right: 12,
              top: 20,
              bottom: 20
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{
                fontSize: 14,
                fontWeight: "bold",
                fill: "rgba(255,255,255, 0.75)",
              }}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) {
                  return null;
                }
                
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-bold">{label}</span>
                      <span className="text-muted-foreground">
                        Flights: <b>{payload[0].value}</b>
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar 
              dataKey="desktop" 
              fill="rgba(255,255,255, 0.4)" 
              radius={8}
              stroke="rgba(255,255,255, 0.8)"
              strokeWidth={1}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-white"
                fontSize={12}
                fontWeight="bold"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
