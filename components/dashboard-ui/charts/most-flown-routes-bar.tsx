"use client"

import { Search } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Flights",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function MostFlownRoutesBarChart({ chartData: initialChartData }: { chartData: { route: string; count: number }[] }) {
    const [searchQuery, setSearchQuery] = useState("")
    const chartData = initialChartData.sort((a, b) => b.count - a.count).slice(0, 10)
    
    const filteredRoutes = initialChartData
      .sort((a, b) => b.count - a.count)
      .filter(route => route.route.toLowerCase().includes(searchQuery.toLowerCase()))
  return (
    <Card className={cn(
      "bg-gray-50 dark:bg-gray-800",
      "border-2 border-gray-200 dark:border-gray-700",
      "rounded-[20px] md:rounded-[25px]",
      "shadow-none"
    )}>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Your Most Flown Routes
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
          Top 10 most flown routes by you
        </CardDescription>
      </CardHeader>

      {
        chartData.length > 0 ? (
            <> 
      <CardContent className="px-4 md:px-6">
        <div className="overflow-x-auto rounded-[12px] md:rounded-[15px]">
          <ChartContainer config={chartConfig} className="h-[200px] min-w-[800px] lg:min-w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
                right: 40,
                left: 20,
                bottom: 20
              }}
            >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="route"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              interval={0}
              tick={{
                fontSize: 11,
                fill: "var(--foreground)",
              }}
              tickFormatter={value => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="px-4 md:px-6 pb-4 md:pb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "w-full",
                "bg-blue-600 hover:bg-blue-700",
                "dark:bg-blue-500 dark:hover:bg-blue-600",
                "text-white",
                "border-none",
                "rounded-[12px] md:rounded-[15px]",
                "font-bold text-sm md:text-base",
                "py-5"
              )}
            >
              View All Routes
            </Button>
          </DialogTrigger>
          <DialogContent className={cn(
            "max-w-3xl max-h-[80vh] overflow-y-auto z-[10001]",
            "bg-white dark:bg-gray-800",
            "border-2 border-gray-200 dark:border-gray-700",
            "rounded-[20px]"
          )}>
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                All Flight Routes
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                Complete list of all your flight routes and their frequencies
              </DialogDescription>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 font-bold">
                Showing {filteredRoutes.length} of {initialChartData.length} routes
              </p>
            </DialogHeader>
            <div className="mt-4">
              <div className={cn(
                "flex items-center gap-2 mb-4",
                "bg-gray-50 dark:bg-gray-700",
                "border-2 border-gray-200 dark:border-gray-600",
                "rounded-[12px]",
                "px-3 py-2"
              )}>
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Input 
                  placeholder="Search routes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "flex-1 border-none bg-transparent",
                    "text-gray-800 dark:text-gray-100",
                    "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                    "font-medium"
                  )}
                />
              </div>
              <div className="overflow-y-auto max-h-[50vh]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-gray-200 dark:border-gray-700 hover:bg-transparent">
                      <TableHead className="text-gray-700 dark:text-gray-300 font-bold">Route</TableHead>
                      <TableHead className="text-right text-gray-700 dark:text-gray-300 font-bold">Times Flown</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.map((route) => (
                      <TableRow 
                        key={route.route}
                        className={cn(
                          "border-b border-gray-200 dark:border-gray-700",
                          "hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <TableCell className="font-bold text-gray-800 dark:text-gray-100">{route.route}</TableCell>
                        <TableCell className="text-right font-bold text-gray-800 dark:text-gray-100">{route.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
      </>
      ) : (
        <div className={cn(
          "text-center py-8 mx-4 md:mx-6 mb-4 md:mb-6",
          "bg-white dark:bg-gray-700",
          "border-2 border-gray-200 dark:border-gray-600",
          "rounded-[15px] md:rounded-[20px]"
        )}>
          <p className="text-gray-500 dark:text-gray-400 font-bold">No routes found</p>
        </div>
      )
    }
    </Card>
  )
}
