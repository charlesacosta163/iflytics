"use client"

import { LuEarth } from "react-icons/lu"
import { RoutePieChartCard } from "./route-pie-chart-card"

export function FlightDomesticIntlPieChart({
  chartData,
}: {
  chartData: { label: string; amount: number; fill: string }[]
}) {
  return (
    <RoutePieChartCard
      title="Domestic vs international"
      description="Same country vs cross-border legs"
      icon={<LuEarth className="w-[11px] h-[11px]" />}
      slices={chartData.map((d) => ({
        label: d.label,
        value: d.amount,
        fill: d.fill,
      }))}
    />
  )
}
