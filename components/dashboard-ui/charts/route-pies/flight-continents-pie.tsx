"use client"

import { LuMap } from "react-icons/lu"
import { RoutePieChartCard } from "./route-pie-chart-card"

const continentNames: Record<string, string> = {
  NA: "North America",
  SA: "South America",
  EU: "Europe",
  AF: "Africa",
  AS: "Asia",
  OC: "Oceania",
  AN: "Antarctica",
}

export function FlightContinentsPieChart({
  chartData,
}: {
  chartData: { label: string; amount: number; fill: string }[]
}) {
  return (
    <RoutePieChartCard
      title="Continents visited"
      description="Destination continent per flight"
      icon={<LuMap className="w-[11px] h-[11px]" />}
      slices={chartData.map((d) => ({
        label: d.label,
        value: d.amount,
        fill: d.fill,
        displayLabel: continentNames[d.label] || d.label,
      }))}
    />
  )
}
