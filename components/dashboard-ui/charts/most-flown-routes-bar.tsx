"use client"

import { Search } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

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
    <Card className="bg-orange-100 dark:bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>Your Most Flown Routes</CardTitle>
        <CardDescription>Top 10 most flown routes by you</CardDescription>
      </CardHeader>

      {
        chartData.length > 0 ? (
            <> 
      <CardContent>
        <div className="overflow-x-auto">
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
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              View All Routes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto z-[10001]">
            <DialogHeader>
              <DialogTitle>All Flight Routes</DialogTitle>
              <DialogDescription>
                Complete list of all your flight routes and their frequencies
              </DialogDescription>
              <p className="text-sm text-muted-foreground">
                Showing {filteredRoutes.length} of {initialChartData.length} routes
              </p>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search routes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="overflow-y-auto max-h-[50vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-right">Times Flown</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.map((route) => (
                      <TableRow key={route.route}>
                        <TableCell className="font-medium">{route.route}</TableCell>
                        <TableCell className="text-right">{route.count}</TableCell>
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
        <div className="text-center py-8">
          <p className="text-gray-500 font-medium">No routes found</p>
        </div>
      )
    }
    </Card>
  )
}
