"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { FlightRouteData } from "@/lib/flight-route-utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { LuMap } from "react-icons/lu";

const FlightsOverviewMap = dynamic(() => import("@/components/flights-overview-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] md:h-[360px] rounded-[20px] animate-pulse bg-gray-200 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-700" />
  ),
});

const FlightsOverviewMapRenderer = ({ routes }: { routes: FlightRouteData[] }) => {
  const [mapOpen, setMapOpen] = useState(false);

  if (routes.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      onValueChange={(value) => setMapOpen(value === "flight-map")}
      className={cn(
        "bg-gray-50 dark:bg-gray-900",
        "rounded-[20px] md:rounded-[25px]",
        "border-2 border-gray-200 dark:border-gray-700"
      )}
    >
      <AccordionItem value="flight-map" className="border-none">
        <AccordionTrigger
          className={cn(
            "text-gray-800 dark:text-gray-100",
            "font-semibold cursor-pointer",
            "text-base md:text-lg",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "rounded-[20px] md:rounded-[25px]",
            "px-4 md:px-5"
          )}
        >
          <span className="flex items-center gap-2">
            <LuMap className="w-4 h-4 md:w-5 md:h-5" />
            Show Map
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              ({routes.length} routes on this page)
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 md:px-5 pb-4 md:pb-5">
          {mapOpen && <FlightsOverviewMap routes={routes} />}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FlightsOverviewMapRenderer;
