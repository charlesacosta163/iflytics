"use client"

import { PiPaperPlaneTiltBold } from "react-icons/pi"
import { RoutePieChartCard } from "./route-pie-chart-card"

export function FlightHaulsPieChart({
  chartData,
}: {
  chartData: { label: string; value: number; fill: string }[]
}) {
  return (
    <RoutePieChartCard
      title="Flight hauls"
      description="By flight duration (minutes)"
      icon={<PiPaperPlaneTiltBold className="w-[11px] h-[11px]" />}
      slices={chartData.map((d) => ({
        label: d.label,
        value: d.value,
        fill: d.fill,
      }))}
      note="Short ≤3h · Medium 3–6h · Long 6h+"
    />
  )
}
