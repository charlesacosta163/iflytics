import React from "react"
import Image from "next/image"
import { GrPaint } from "react-icons/gr"
import { FaPlane, FaChevronDown } from "react-icons/fa"
import { LuTrendingUp, LuRepeat, LuSparkles, LuList } from "react-icons/lu"
import { MdOutlineAirlines } from "react-icons/md"
import { PiPaintBrushBroadFill } from "react-icons/pi"
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import FloatingIcons from "@/components/dashboard-ui/floating-icons"
import GroupedSubscriptionButtons from "@/components/dashboard-ui/grouped-sub-btns"

const MOCK_LIVERIES = [
  { name: "Southwest", count: 42, share: 42 },
  { name: "United Airlines", count: 28, share: 28 },
  { name: "Alaska Airlines", count: 18, share: 18 },
  { name: "American Airlines", count: 12, share: 12 },
]

const MOCK_AIRCRAFT = [
  "Boeing 737-800",
  "Airbus A320",
  "Boeing 777-300ER",
  "Airbus A350-900",
]

function MockProgress({ value }: { value: number }) {
  return (
    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function LiveryPreviewCard() {
  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto",
        "border-2 border-amber-200 dark:border-amber-800/50",
        "rounded-[25px] md:rounded-[30px]",
        "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
        "dark:from-amber-950/50 dark:via-orange-950/40 dark:to-yellow-950/30",
        "shadow-2xl overflow-hidden",
        "pointer-events-none select-none"
      )}
    >
      <div className="p-5 md:p-6 border-b-2 border-amber-200/80 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[12px] shadow-md">
            <FaPlane className="text-white text-lg" />
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-amber-900 dark:text-amber-100">
              Boeing 737-800
            </p>
            <p className="text-xs font-semibold text-amber-700/80 dark:text-amber-300/80">
              4 liveries flown · 100 flights
            </p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center justify-between gap-2 px-4 py-2.5",
            "bg-white dark:bg-gray-900",
            "border-2 border-gray-200 dark:border-gray-700",
            "rounded-[15px] text-sm font-bold text-gray-700 dark:text-gray-200",
            "shadow-sm min-w-[200px]"
          )}
        >
          <span className="truncate">Boeing 737-800</span>
          <FaChevronDown className="shrink-0 text-gray-400 text-xs" />
        </div>
      </div>

      <div className="p-5 md:p-6 flex flex-col md:flex-row gap-5 items-center">
        <div className="shrink-0 p-3 bg-white dark:bg-gray-900 border-2 border-amber-200 dark:border-amber-800/40 rounded-[20px] shadow-lg">
          <Image
            src={`/images/aircraft/${matchAircraftNameToImage("Boeing 737-800")}`}
            alt="Boeing 737-800 preview"
            width={180}
            height={100}
            className="w-[150px] md:w-[180px] h-auto rounded-[12px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 flex-1 w-full">
          {[
            { label: "Flights", value: "100" },
            { label: "Unique Liveries", value: "4" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/80 dark:bg-gray-900/80 border-2 border-amber-200/60 dark:border-amber-800/30 rounded-[15px] p-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white tabular-nums mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-3">
        {MOCK_LIVERIES.map((livery, index) => (
          <div
            key={livery.name}
            className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-700 rounded-[15px] p-3.5"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0",
                    index === 0
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gray-400 dark:bg-gray-600"
                  )}
                >
                  {index + 1}
                </span>
                <span className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
                  {livery.name}
                </span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] font-bold">
                  {livery.count} flights
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-300 text-amber-800 dark:text-amber-300 text-[10px] font-bold"
                >
                  {livery.share}%
                </Badge>
              </div>
            </div>
            <MockProgress value={100 - index * 18} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LiveryAnalysisShowcase() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center bg-white/60 dark:bg-gray-800/20 py-16 px-4 rounded-[50px]">
      <FloatingIcons />

      <header className="flex flex-col gap-4 items-center justify-center w-full relative z-10">
        <h1 className="text-4xl lg:text-8xl font-bold tracking-tighter flex items-center gap-3 flex-wrap justify-center">
          <GrPaint className="text-amber-500 dark:text-amber-400" />
          <span className="bg-gradient-to-r from-amber-500 to-amber-300 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
            Livery Analysis
          </span>
        </h1>
        <p className="text-gray-800 dark:text-gray-300 text-lg font-semibold tracking-tight text-center max-w-2xl">
          Track which liveries you fly most — per aircraft, per timeframe, with share metrics and ranked breakdowns.
        </p>

        <Button className="md:text-2xl text-lg font-bold tracking-tight !py-6 !px-12">
          <a href="#livery-analysis-features">See Features</a>
        </Button>

        <div className="w-full mt-4 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-yellow-400/20 blur-2xl rounded-[40px] pointer-events-none" />
          <LiveryPreviewCard />
          <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 mt-3">
            Preview — sample data shown
          </p>
        </div>
      </header>

      <section
        id="livery-analysis-features"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8 w-full relative z-10"
      >
        <div className="group hover:scale-[1.02] transition-all duration-200 col-span-1 md:col-span-2 bg-[#FFFAF0] dark:bg-gradient-to-br dark:from-amber-950 dark:to-orange-950 p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[280px] flex flex-col md:flex-row items-center justify-between gap-6">
          <header className="flex flex-col gap-2 md:max-w-[45%]">
            <PiPaintBrushBroadFill className="text-3xl md:text-5xl text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl md:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">
              Livery Breakdown
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              See every livery you&apos;ve flown on each aircraft type — ranked by flight count with percentage share and visual bars.
            </p>
          </header>

          <div className="flex flex-col gap-2 w-full md:w-[50%]">
            {MOCK_LIVERIES.slice(0, 3).map((livery, i) => (
              <div
                key={livery.name}
                className="flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 border-2 border-amber-100 dark:border-amber-900/40 rounded-[15px] px-4 py-3 shadow-sm"
              >
                <span className="text-lg font-black text-amber-500 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
                    {livery.name}
                  </p>
                  <MockProgress value={100 - i * 25} />
                </div>
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-bold shrink-0">
                  {livery.share}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="group hover:scale-[1.02] transition-all duration-200 bg-[#FFF8DC] dark:bg-gradient-to-br dark:from-[#16161d] dark:to-amber-950 p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[250px] flex flex-col gap-4">
          <header className="flex flex-col gap-2">
            <FaPlane className="text-3xl md:text-4xl text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">
              Per-Aircraft View
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Switch between aircraft types in your fleet and explore livery usage for each one individually.
            </p>
          </header>

          <div className="flex flex-col gap-2 mt-auto">
            {MOCK_AIRCRAFT.map((name, i) => (
              <div
                key={name}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[15px] border-2 transition-all",
                  i === 0
                    ? "bg-amber-500 border-amber-400 text-white shadow-md"
                    : "bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                )}
              >
                <Image
                  src={`/images/aircraft/${matchAircraftNameToImage(name)}`}
                  alt={name}
                  width={28}
                  height={28}
                  className="rounded-sm shrink-0"
                />
                <span className="font-bold text-sm truncate flex-1">{name}</span>
                {i === 0 && (
                  <Badge className="bg-white/25 hover:bg-white/25 text-white border-white/30 text-[10px]">
                    Selected
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="group hover:scale-[1.02] transition-all duration-200 bg-[#FDFAED] dark:bg-gradient-to-br dark:from-orange-950 dark:to-amber-950 p-6 md:p-8 rounded-[20px] overflow-hidden min-h-[250px] flex flex-col gap-4">
          <header className="flex flex-col gap-2">
            <LuTrendingUp className="text-3xl md:text-4xl text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">
              Livery Metrics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Top livery share, average flights per livery, top-3 concentration, and one-time liveries at a glance.
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            {[
              { label: "Top Share", value: "42%", icon: <LuTrendingUp /> },
              { label: "Avg / Livery", value: "8.5×", icon: <LuRepeat /> },
              { label: "Top 3 Share", value: "88%", icon: <GrPaint /> },
              { label: "One-Time", value: "3", icon: <LuSparkles /> },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-white/80 dark:bg-gray-900/80 border-2 border-amber-200/50 dark:border-amber-800/30 rounded-[15px] p-3"
              >
                <div className="text-amber-500 mb-1.5">{metric.icon}</div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-white tabular-nums">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="group hover:scale-[1.02] transition-all duration-200 col-span-1 md:col-span-2 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 p-6 md:p-10 rounded-[20px] flex flex-col md:flex-row justify-between items-center gap-6 border-2 border-amber-200/60 dark:border-amber-800/40">
          <header className="flex flex-col gap-2 w-full md:w-[42%]">
            <MdOutlineAirlines className="text-4xl md:text-6xl text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl md:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">
              Fleet Branding Insights
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Understand your virtual airline habits — which liveries dominate your fleet and how your branding choices shift over time.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white font-bold uppercase">
                Premium
              </Badge>
              <Badge className="bg-green-600 hover:bg-green-600 text-white font-bold uppercase">
                Lifetime
              </Badge>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-3 w-full md:w-[52%]">
            {[
              { airline: "Southwest", flights: 42, color: "from-yellow-400 to-orange-500" },
              { airline: "United", flights: 28, color: "from-blue-500 to-blue-700" },
              { airline: "Alaska", flights: 18, color: "from-teal-500 to-cyan-600" },
              { airline: "American", flights: 12, color: "from-red-500 to-red-700" },
            ].map((item) => (
              <div
                key={item.airline}
                className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-700 rounded-[15px] p-4 shadow-sm"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-[10px] mb-2 bg-gradient-to-br flex items-center justify-center",
                    item.color
                  )}
                >
                  <LuList className="text-white text-sm" />
                </div>
                <p className="font-bold text-gray-800 dark:text-gray-100">{item.airline}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                  {item.flights} flights
                </p>
              </div>
            ))}
          </div>
        </div> */}

        <GroupedSubscriptionButtons />
      </section>
    </div>
  )
}
