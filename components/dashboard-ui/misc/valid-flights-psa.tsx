"use client"

import { LuInfo } from "react-icons/lu"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function ValidFlightsPsa({
  totalFlights,
  validFlightsCount,
}: {
  totalFlights: number
  validFlightsCount: number
}) {
  const excludedCount = totalFlights - validFlightsCount

  return (
    <Accordion
      type="single"
      collapsible
      className={cn(
        "lg:col-span-3",
        "border border-gray-200 dark:border-gray-700",
        "bg-white/50 dark:bg-gray-800/50",
        "rounded-xl md:rounded-2xl"
      )}
    >
      <AccordionItem value="valid-flights" className="border-none px-4 md:px-5">
        <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
          <span className="flex items-center gap-1.5 text-left">
            <LuInfo className="shrink-0 w-[11px] h-[11px] text-gray-500 dark:text-gray-400" />
            Only valid flights count toward route analysis
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-[11px] text-gray-500 dark:text-gray-400 space-y-2 pb-4">
          <p>
            Metrics on this tab — distances, routes, countries, charts — are
            calculated from <strong className="font-medium text-gray-700 dark:text-gray-300">valid flights only</strong>.
            Flights that do not meet every criterion below are excluded.
          </p>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            What counts as a valid flight?
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Flight duration is longer than 5 minutes</li>
            <li>Both origin and destination airport codes are present</li>
            <li>Origin and destination are different airports</li>
          </ul>
          <p className="pt-1 tabular-nums">
            {validFlightsCount} of {totalFlights} flight
            {totalFlights !== 1 ? "s" : ""} included
            {excludedCount > 0 && (
              <span className="text-gray-400 dark:text-gray-500">
                {" "}
                · {excludedCount} excluded
              </span>
            )}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
