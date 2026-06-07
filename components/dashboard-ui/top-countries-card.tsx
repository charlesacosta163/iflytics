"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { FaGlobeAmericas } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type CountryEntry = [string, number]

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

export function TopCountriesCard({ countries }: { countries: CountryEntry[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const top5 = countries.slice(0, 5)
  const totalFlights = countries.reduce((sum, [, count]) => sum + count, 0)
  const top5Total = top5.reduce((sum, [, count]) => sum + count, 0)
  const maxCount = top5.length > 0 ? Math.max(...top5.map(([, c]) => c)) : 0

  const filteredCountries = useMemo(
    () =>
      countries.filter(([name]) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [countries, searchQuery]
  )

  if (countries.length === 0) {
    return (
      <div
        className={cn(
          "rounded-[20px] md:rounded-[25px]",
          "p-4 md:p-5",
          "flex flex-col items-center justify-center min-h-[200px]"
        )}
      >
        <FaGlobeAmericas className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          No countries found
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "self-start ",
        "bg-white/50 dark:bg-gray-800/50",
        "rounded-[20px] md:rounded-[25px]",
        "p-4 md:p-5",
        "flex flex-col gap-4"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-lg tracking-tighter font-semibold text-gray-900 dark:text-gray-100">
            <FaGlobeAmericas className={labelIconClass} />
            Top Countries
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Destinations you flew to most
          </p>
        </div>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
          {countries.length} total
        </span>
      </div>

      <div className="space-y-3">
        {top5.map(([countryName, count], index) => {
          const percentage = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
          const shareOfTop5 =
            top5Total > 0 ? ((count / top5Total) * 100).toFixed(1) : "0"

          return (
            <div key={countryName} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 w-4 shrink-0 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {countryName}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {count}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                    ({shareOfTop5}%)
                  </span>
                </div>
              </div>
              <Progress
                value={percentage}
                className="h-1 bg-gray-100 dark:bg-gray-700 [&>div]:bg-purple-500 dark:[&>div]:bg-purple-400"
              />
            </div>
          )
        })}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full text-xs font-semibold",
              "text-gray-700 dark:text-gray-200",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "rounded-[15px] border-none"
            )}
          >
            View all countries
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "max-w-md max-h-[80vh] overflow-hidden flex flex-col",
            "bg-white dark:bg-gray-800",
            "border border-gray-200 dark:border-gray-700",
            "rounded-[20px] md:rounded-[25px] z-[20000]"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              All Countries
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
              {totalFlights} destination flight{totalFlights !== 1 ? "s" : ""} across{" "}
              {countries.length} countr{countries.length !== 1 ? "ies" : "y"}
            </DialogDescription>
          </DialogHeader>

          <div
            className={cn(
              "flex items-center gap-2",
              "border border-gray-200 dark:border-gray-700",
              "rounded-lg px-3 py-2"
            )}
          >
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Input
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "flex-1 h-7 border-none bg-transparent p-0 text-sm",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-gray-400"
              )}
            />
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Showing {filteredCountries.length} of {countries.length}
          </p>

          <div className="overflow-y-auto flex-1 -mx-1 px-1">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold text-gray-500 w-8">#</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500">Country</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 text-right">
                    Flights
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 text-right">
                    Share
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCountries.map(([name, count], index) => {
                  const originalRank = countries.findIndex(([n]) => n === name) + 1
                  const share =
                    totalFlights > 0
                      ? ((count / totalFlights) * 100).toFixed(1)
                      : "0"

                  return (
                    <TableRow
                      key={name}
                      className="border-gray-100 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                      <TableCell className="text-xs text-gray-400 tabular-nums py-2">
                        {originalRank || index + 1}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900 dark:text-gray-100 py-2">
                        {name}
                      </TableCell>
                      <TableCell className="text-sm text-right tabular-nums text-gray-900 dark:text-gray-100 py-2">
                        {count}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums text-gray-500 py-2">
                        {share}%
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
