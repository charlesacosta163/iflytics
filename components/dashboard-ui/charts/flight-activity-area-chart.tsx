"use client"
import { ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { convertMinutesToHours } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { FaPlane } from "react-icons/fa"

const chartConfig = {
  totalTime: {
    label: "Total Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function FlightActivityAreaChart({flightActivityData, timeframe, className}: {flightActivityData: {date: string, totalTime: number}[], timeframe: string, className?: string}) {

  // console.log(flightActivityData)

  return (
    <Card className={cn("w-full bg-gray", className)}>
      <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <FaPlane className="text-blue-400" />
                Flight Time Per Day
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your flight time day by day for the last {timeframe.startsWith("flight-") ? timeframe.split("-")[1] : timeframe} {timeframe.startsWith("flight-") || ["50", "100", "250", "500"].includes(timeframe) ? "flights" : "days"}
              </CardDescription>
            </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            accessibilityLayer
            height={300}
            width={1000}
            data={flightActivityData}
            margin={{
              left: -8,
              right: 12,
              top: 20,
              bottom: 20
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{
                fontSize: 14,
                fontWeight: "bold",
                fill: "rgba(255,255,255, 0.75)",
              }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${Math.round(value / 60)}h`}
              tick={{
                fontSize: 14,
                fontWeight: "bold",
                fill: "rgba(255,255,255, 1)",
              }}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                
                if (!active || !payload || !payload.length) {
                  return null;
                }
                
                // Parse the MM/DD/YY date string and format as "March 25, 2019"
                const date = new Date(label);
                const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-bold">{formattedDate}</span>
                      <span className="text-muted-foreground">
                        Flight Time: <b>{convertMinutesToHours(payload[0].value as number)}</b>
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              dataKey="totalTime"
              type="linear"
              fill="rgba(255,255,255, 0.4)"  
              fillOpacity={0.6}
              stroke="rgba(255,255,255, 0.8)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  )
}


