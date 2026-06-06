"use client"

import { useMemo, type ReactNode } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  FaArrowDown,
  FaArrowUp,
  FaBolt,
  FaCalendarAlt,
  FaCalendarDay,
  FaChartLine,
  FaFire,
  FaPlane,
  FaRegClock,
  FaTrophy,
} from "react-icons/fa"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { convertMinutesToHours, formatTimeframeText } from "@/lib/utils"
import { cn } from "@/lib/utils"

const chartConfig = {
  totalTime: {
    label: "Flight Time",
    color: "#3b82f6",
  },
} satisfies ChartConfig

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const dayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
]

const weekdayPastelStyles = [
  {
    bg: "bg-rose-100",
    darkBg: "dark:bg-rose-950/50",
    border: "border-rose-200",
    darkBorder: "dark:border-rose-800",
    label: "text-rose-700 dark:text-rose-300",
    value: "text-rose-900 dark:text-rose-100",
    detail: "text-rose-600/80 dark:text-rose-400/80",
    favoriteRing: "bor-rose-400 dark:ring-rose-500",
  },
  {
    bg: "bg-sky-100",
    darkBg: "dark:bg-sky-950/50",
    border: "border-sky-200",
    darkBorder: "dark:border-sky-800",
    label: "text-sky-700 dark:text-sky-300",
    value: "text-sky-900 dark:text-sky-100",
    detail: "text-sky-600/80 dark:text-sky-400/80",
    favoriteRing: "ring-sky-400 dark:ring-sky-500",
  },
  {
    bg: "bg-emerald-100",
    darkBg: "dark:bg-emerald-950/50",
    border: "border-emerald-200",
    darkBorder: "dark:border-emerald-800",
    label: "text-emerald-700 dark:text-emerald-300",
    value: "text-emerald-900 dark:text-emerald-100",
    detail: "text-emerald-600/80 dark:text-emerald-400/80",
    favoriteRing: "ring-emerald-400 dark:ring-emerald-500",
  },
  {
    bg: "bg-violet-100",
    darkBg: "dark:bg-violet-950/50",
    border: "border-violet-200",
    darkBorder: "dark:border-violet-800",
    label: "text-violet-700 dark:text-violet-300",
    value: "text-violet-900 dark:text-violet-100",
    detail: "text-violet-600/80 dark:text-violet-400/80",
    favoriteRing: "ring-violet-400 dark:ring-violet-500",
  },
  {
    bg: "bg-orange-100",
    darkBg: "dark:bg-orange-950/50",
    border: "border-orange-200",
    darkBorder: "dark:border-orange-800",
    label: "text-orange-700 dark:text-orange-300",
    value: "text-orange-900 dark:text-orange-100",
    detail: "text-orange-600/80 dark:text-orange-400/80",
    favoriteRing: "ring-orange-400 dark:ring-orange-500",
  },
  {
    bg: "bg-cyan-100",
    darkBg: "dark:bg-cyan-950/50",
    border: "border-cyan-200",
    darkBorder: "dark:border-cyan-800",
    label: "text-cyan-700 dark:text-cyan-300",
    value: "text-cyan-900 dark:text-cyan-100",
    detail: "text-cyan-600/80 dark:text-cyan-400/80",
    favoriteRing: "ring-cyan-400 dark:ring-cyan-500",
  },
  {
    bg: "bg-amber-100",
    darkBg: "dark:bg-amber-950/50",
    border: "border-amber-200",
    darkBorder: "dark:border-amber-800",
    label: "text-amber-700 dark:text-amber-300",
    value: "text-amber-900 dark:text-amber-100",
    detail: "text-amber-600/80 dark:text-amber-400/80",
    favoriteRing: "ring-amber-400 dark:ring-amber-500",
  },
] as const

function formatChartDate(label: string) {
  const date = new Date(label)
  if (Number.isNaN(date.getTime())) return label
  return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}`
}

function formatTooltipDate(label: string) {
  const date = new Date(label)
  if (Number.isNaN(date.getTime())) return label
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function parseChartDate(dateStr: string) {
  return new Date(dateStr)
}

function getDayDiff(prev: Date, curr: Date) {
  return Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
}

type FlightDay = { date: string; totalTime: number }
type StreakResult = { count: number; days: FlightDay[] }

function calcLongestStreak(sorted: FlightDay[]): StreakResult {
  if (!sorted.length) return { count: 0, days: [] }
  if (sorted.length === 1) return { count: 1, days: [sorted[0]] }

  let longestDays = [sorted[0]]
  let currentDays = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const diff = getDayDiff(parseChartDate(sorted[i - 1].date), parseChartDate(sorted[i].date))
    if (diff === 1) {
      currentDays.push(sorted[i])
    } else {
      if (currentDays.length > longestDays.length) {
        longestDays = [...currentDays]
      }
      currentDays = [sorted[i]]
    }
  }

  if (currentDays.length > longestDays.length) {
    longestDays = [...currentDays]
  }

  return { count: longestDays.length, days: longestDays }
}

function calcRecentStreak(sorted: FlightDay[]): StreakResult {
  if (!sorted.length) return { count: 0, days: [] }
  if (sorted.length === 1) return { count: 1, days: [sorted[0]] }

  const days: FlightDay[] = [sorted[sorted.length - 1]]
  for (let i = sorted.length - 1; i > 0; i--) {
    const diff = getDayDiff(parseChartDate(sorted[i - 1].date), parseChartDate(sorted[i].date))
    if (diff === 1) days.unshift(sorted[i - 1])
    else break
  }

  return { count: days.length, days }
}

type WeekdayStat = {
  dayIndex: number
  name: string
  time: number
  flyingDays: number
  flightCount: number
}

type MonthStat = {
  year: number
  monthIndex: number
  label: string
  time: number
  flyingDays: number
  flightCount: number
}

type YearStat = {
  year: number
  time: number
  flyingDays: number
  flightCount: number
}

type NicheStats = {
  favoriteWeekday: { name: string; days: number; time: number } | null
  weekdayBreakdown: WeekdayStat[]
  monthBreakdown: MonthStat[]
  monthBreakdownByYear: { year: number; months: MonthStat[] }[]
  yearBreakdown: YearStat[]
  bestYear: number | null
}

function calcNicheStats(
  sorted: FlightDay[],
  flights?: { created: string }[]
): NicheStats {
  const byWeekday = new Map<number, { days: number; time: number; flightCount: number }>()
  const byMonth = new Map<string, {
    label: string
    year: number
    monthIndex: number
    time: number
    days: number
    flightCount: number
  }>()
  const byYear = new Map<number, { time: number; days: number; flightCount: number }>()

  for (let i = 0; i < 7; i++) {
    byWeekday.set(i, { days: 0, time: 0, flightCount: 0 })
  }

  for (const day of sorted) {
    const parsed = parseChartDate(day.date)
    if (Number.isNaN(parsed.getTime())) continue

    const weekday = parsed.getDay()
    const weekdayEntry = byWeekday.get(weekday)!
    byWeekday.set(weekday, {
      days: weekdayEntry.days + 1,
      time: weekdayEntry.time + day.totalTime,
      flightCount: weekdayEntry.flightCount,
    })

    const year = parsed.getFullYear()
    const monthIndex = parsed.getMonth()
    const monthKey = `${year}-${monthIndex}`
    const monthLabel = `${monthNames[monthIndex]} ${year}`
    const monthEntry = byMonth.get(monthKey) ?? {
      label: monthLabel,
      year,
      monthIndex,
      time: 0,
      days: 0,
      flightCount: 0,
    }
    byMonth.set(monthKey, {
      ...monthEntry,
      days: monthEntry.days + 1,
      time: monthEntry.time + day.totalTime,
    })

    const yearEntry = byYear.get(year) ?? { time: 0, days: 0, flightCount: 0 }
    byYear.set(year, {
      days: yearEntry.days + 1,
      time: yearEntry.time + day.totalTime,
      flightCount: yearEntry.flightCount,
    })
  }

  if (flights?.length) {
    for (const flight of flights) {
      const parsed = new Date(flight.created)
      if (Number.isNaN(parsed.getTime())) continue

      const weekday = parsed.getDay()
      const weekdayEntry = byWeekday.get(weekday)!
      byWeekday.set(weekday, {
        ...weekdayEntry,
        flightCount: weekdayEntry.flightCount + 1,
      })

      const year = parsed.getFullYear()
      const monthIndex = parsed.getMonth()
      const monthKey = `${year}-${monthIndex}`
      const monthLabel = `${monthNames[monthIndex]} ${year}`
      const monthEntry = byMonth.get(monthKey) ?? {
        label: monthLabel,
        year,
        monthIndex,
        time: 0,
        days: 0,
        flightCount: 0,
      }
      byMonth.set(monthKey, {
        ...monthEntry,
        flightCount: monthEntry.flightCount + 1,
      })

      const yearEntry = byYear.get(year) ?? { time: 0, days: 0, flightCount: 0 }
      byYear.set(year, {
        ...yearEntry,
        flightCount: yearEntry.flightCount + 1,
      })
    }
  }

  const weekdayBreakdown: WeekdayStat[] = dayNames.map((name, dayIndex) => {
    const entry = byWeekday.get(dayIndex)!
    return {
      dayIndex,
      name,
      time: entry.time,
      flyingDays: entry.days,
      flightCount: entry.flightCount,
    }
  })

  const favoriteWeekdayEntry = [...byWeekday.entries()].sort(
    (a, b) => b[1].time - a[1].time
  )[0]

  const years = [...byYear.keys()].sort((a, b) => a - b)
  const monthBreakdown: MonthStat[] = []

  for (const year of years) {
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthKey = `${year}-${monthIndex}`
      const entry = byMonth.get(monthKey)
      monthBreakdown.push({
        year,
        monthIndex,
        label: `${monthNames[monthIndex]} ${year}`,
        time: entry?.time ?? 0,
        flyingDays: entry?.days ?? 0,
        flightCount: entry?.flightCount ?? 0,
      })
    }
  }

  const monthBreakdownByYear = years.map((year) => ({
    year,
    months: monthBreakdown.filter((month) => month.year === year),
  }))

  const yearBreakdown: YearStat[] = [...byYear.entries()]
    .map(([year, entry]) => ({
      year,
      time: entry.time,
      flyingDays: entry.days,
      flightCount: entry.flightCount,
    }))
    .sort((a, b) => b.year - a.year)

  const bestYear = yearBreakdown[0]?.year ?? null

  return {
    favoriteWeekday: favoriteWeekdayEntry
      ? {
          name: dayNames[favoriteWeekdayEntry[0]],
          days: favoriteWeekdayEntry[1].days,
          time: favoriteWeekdayEntry[1].time,
        }
      : null,
    weekdayBreakdown,
    monthBreakdown,
    monthBreakdownByYear,
    yearBreakdown,
    bestYear,
  }
}

const monthPastelStyles = [
  { bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800", label: "text-rose-700 dark:text-rose-300", value: "text-rose-900 dark:text-rose-100", detail: "text-rose-600/70 dark:text-rose-400/70" },
  { bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-800", label: "text-orange-700 dark:text-orange-300", value: "text-orange-900 dark:text-orange-100", detail: "text-orange-600/70 dark:text-orange-400/70" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", label: "text-amber-700 dark:text-amber-300", value: "text-amber-900 dark:text-amber-100", detail: "text-amber-600/70 dark:text-amber-400/70" },
  { bg: "bg-lime-50 dark:bg-lime-950/40", border: "border-lime-200 dark:border-lime-800", label: "text-lime-700 dark:text-lime-300", value: "text-lime-900 dark:text-lime-100", detail: "text-lime-600/70 dark:text-lime-400/70" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", label: "text-emerald-700 dark:text-emerald-300", value: "text-emerald-900 dark:text-emerald-100", detail: "text-emerald-600/70 dark:text-emerald-400/70" },
  { bg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-200 dark:border-teal-800", label: "text-teal-700 dark:text-teal-300", value: "text-teal-900 dark:text-teal-100", detail: "text-teal-600/70 dark:text-teal-400/70" },
  { bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-200 dark:border-sky-800", label: "text-sky-700 dark:text-sky-300", value: "text-sky-900 dark:text-sky-100", detail: "text-sky-600/70 dark:text-sky-400/70" },
  { bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200 dark:border-indigo-800", label: "text-indigo-700 dark:text-indigo-300", value: "text-indigo-900 dark:text-indigo-100", detail: "text-indigo-600/70 dark:text-indigo-400/70" },
  { bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800", label: "text-violet-700 dark:text-violet-300", value: "text-violet-900 dark:text-violet-100", detail: "text-violet-600/70 dark:text-violet-400/70" },
  { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40", border: "border-fuchsia-200 dark:border-fuchsia-800", label: "text-fuchsia-700 dark:text-fuchsia-300", value: "text-fuchsia-900 dark:text-fuchsia-100", detail: "text-fuchsia-600/70 dark:text-fuchsia-400/70" },
  { bg: "bg-pink-50 dark:bg-pink-950/40", border: "border-pink-200 dark:border-pink-800", label: "text-pink-700 dark:text-pink-300", value: "text-pink-900 dark:text-pink-100", detail: "text-pink-600/70 dark:text-pink-400/70" },
  { bg: "bg-cyan-50 dark:bg-cyan-950/40", border: "border-cyan-200 dark:border-cyan-800", label: "text-cyan-700 dark:text-cyan-300", value: "text-cyan-900 dark:text-cyan-100", detail: "text-cyan-600/70 dark:text-cyan-400/70" },
] as const

function BreakdownCell({
  label,
  time,
  flightCount,
  pastel,
  muted = false,
  highlight = false,
}: {
  label: string
  time: number
  flightCount: number
  pastel: (typeof monthPastelStyles)[number]
  muted?: boolean
  highlight?: boolean
}) {
  const hasActivity = time > 0 || flightCount > 0

  return (
    <div
      className={cn(
        "p-2 md:p-3 rounded-[20px] text-center min-w-0",
        hasActivity ? pastel.bg : "bg-gray-50 dark:bg-gray-900/30",
        hasActivity ? pastel.border : "border-gray-200 dark:border-gray-700",
        muted && !hasActivity && "opacity-50",
        highlight && hasActivity && "border-2 border-yellow-400 dark:border-yellow-500"
      )}
    >
      <p className={cn(
        "text-[10px] sm:text-xs font-bold truncate",
        hasActivity ? pastel.label : "text-gray-500 dark:text-gray-400"
      )}>
        {label}
      </p>
      <p className={cn(
        "text-xs sm:text-sm font-black mt-1 truncate",
        hasActivity ? pastel.value : "text-gray-400 dark:text-gray-500"
      )}>
        {hasActivity ? convertMinutesToHours(time) : "0h"}
      </p>
      <p className={cn(
        "text-[10px] mt-0.5",
        hasActivity ? pastel.detail : "text-gray-400 dark:text-gray-500"
      )}>
        {flightCount} flight{flightCount === 1 ? "" : "s"}
      </p>
    </div>
  )
}

function NicheStatRow({
  icon,
  title,
  value,
  detail,
}: {
  icon: ReactNode
  title: string
  value: string
  detail?: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-[20px] bg-yellow-50/80 dark:bg-yellow-950/30">
      <span className="shrink-0 text-yellow-600 dark:text-yellow-400 text-base mt-0.5">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-sm md:text-base font-bold text-yellow-900 dark:text-yellow-100">
          {value}
        </p>
        {detail && (
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {detail}
          </p>
        )}
      </div>
    </div>
  )
}

function MetricStat({
  label,
  value,
  subtitle,
  color,
  icon,
}: {
  label: string
  value: string | number
  subtitle?: string
  color: "blue" | "green" | "orange" | "purple" | "teal" | "rose" | "indigo" | "amber"
  icon: ReactNode
}) {
  const valueColors = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    orange: "text-orange-600 dark:text-orange-400",
    purple: "text-purple-600 dark:text-purple-400",
    teal: "text-teal-600 dark:text-teal-400",
    rose: "text-rose-600 dark:text-rose-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
    amber: "text-amber-600 dark:text-amber-400",
  }

  return (
    <div
      className={cn(
        "bg-white/70 dark:bg-gray-800/50",
        "p-3 md:p-4",
        "rounded-[15px] md:rounded-[20px]",
        "min-w-0"
      )}
    >
      <p className={cn(
        "text-xs md:text-sm font-semibold truncate",
        "flex items-center gap-1.5",
        valueColors[color]
      )}>
        <span className="shrink-0 text-sm md:text-base">{icon}</span>
        <span className="truncate">{label}</span>
      </p>
      <p className={cn("text-xl md:text-2xl font-bold tracking-tight truncate", valueColors[color])}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function StreakMetricStat({
  label,
  streak,
  subtitle,
  color,
  icon,
}: {
  label: string
  streak: StreakResult
  subtitle: string
  color: "rose" | "amber"
  icon: ReactNode
}) {
  const valueColors = {
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
  }

  const borderColors = {
    rose: "border-rose-200 dark:border-rose-800",
    amber: "border-amber-200 dark:border-amber-800",
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "bg-white/70 dark:bg-gray-800/50",
            "p-3 md:p-4",
            "rounded-[15px] md:rounded-[20px]",
            "min-w-0 w-full text-left",
            "border-2 border-dashed",
            borderColors[color],
            "hover:bg-white dark:hover:bg-gray-800/80",
            "transition-colors duration-200",
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            color === "rose"
              ? "focus-visible:ring-rose-400"
              : "focus-visible:ring-amber-400"
          )}
        >
          <p className={cn(
            "text-xs md:text-sm font-semibold truncate",
            "flex items-center gap-1.5",
            valueColors[color]
          )}>
            <span className="shrink-0 text-sm md:text-base">{icon}</span>
            <span className="truncate">{label}</span>
          </p>
          <p className={cn("text-xl md:text-2xl font-bold tracking-tight truncate", valueColors[color])}>
            {streak.count}d
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {subtitle} · tap for days
          </p>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-3 shadow-lg"
      >
        <p className={cn("text-sm font-bold mb-2", valueColors[color])}>
          {label} — {streak.count} day{streak.count === 1 ? "" : "s"}
        </p>
        <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {streak.days.map((day, index) => (
            <li
              key={day.date}
              className="flex items-center justify-between gap-2 text-xs border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                  color === "rose" ? "bg-rose-500" : "bg-amber-500"
                )}>
                  {index + 1}
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {formatTooltipDate(day.date)}
                </span>
              </div>
              <span className={cn("font-bold shrink-0", valueColors[color])}>
                {convertMinutesToHours(day.totalTime)}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export default function FlightActivityAreaChart({
  flightActivityData,
  timeframe,
  totalFlights,
  flights,
  className,
}: {
  flightActivityData: { date: string; totalTime: number }[]
  timeframe: string
  totalFlights?: number
  flights?: { created: string }[]
  className?: string
}) {
  const stats = useMemo(() => {
    if (!flightActivityData.length) return null

    const sorted = [...flightActivityData].sort(
      (a, b) => parseChartDate(a.date).getTime() - parseChartDate(b.date).getTime()
    )

    const total = sorted.reduce((acc, d) => acc + d.totalTime, 0)
    const activeDays = sorted.filter((d) => d.totalTime > 0).length
    const peak = sorted.reduce((max, d) => (d.totalTime > max.totalTime ? d : max), sorted[0])
    const shortest = sorted.reduce((min, d) => (d.totalTime < min.totalTime ? d : min), sorted[0])
    const avgPerDay = activeDays > 0 ? total / activeDays : 0
    const longestStreak = calcLongestStreak(sorted)
    const recentStreak = calcRecentStreak(sorted)
    const avgPerFlight =
      totalFlights && totalFlights > 0 ? total / totalFlights : null
    const nicheStats = calcNicheStats(sorted, flights)

    return {
      total,
      activeDays,
      peak,
      shortest,
      avgPerDay,
      longestStreak,
      recentStreak,
      avgPerFlight,
      nicheStats,
    }
  }, [flightActivityData, totalFlights, flights])

  return (
    <Card
      className={cn(
        "w-full",
        "bg-yellow-50 dark:bg-yellow-900/20",
        "!shadow-none",
        "rounded-[20px] md:rounded-[25px]",
        className
      )}
    >
      <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 bg-yellow-500 dark:bg-yellow-600 rounded-[12px] md:rounded-[15px] shrink-0">
            <FaRegClock className="text-white text-lg md:text-xl" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base md:text-lg font-bold tracking-tight text-yellow-900 dark:text-yellow-100">
              Flight Time Per Day
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-yellow-700 dark:text-yellow-300">
              Your flight time day by day {formatTimeframeText(timeframe)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6 pb-4 md:pb-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <MetricStat
              label="Total Time"
              value={convertMinutesToHours(stats.total)}
              subtitle="hours flew"
              color="blue"
              icon={<FaRegClock />}
            />
            <MetricStat
              label="Flying Days"
              value={stats.activeDays}
              subtitle={`${stats.activeDays} day${stats.activeDays === 1 ? "" : "s"} logged`}
              color="green"
              icon={<FaCalendarDay />}
            />
            <MetricStat
              label="Daily Average"
              value={convertMinutesToHours(Math.round(stats.avgPerDay))}
              subtitle="per flying day"
              color="orange"
              icon={<FaChartLine />}
            />
            <MetricStat
              label="Peak Day"
              value={convertMinutesToHours(stats.peak.totalTime)}
              subtitle={formatChartDate(stats.peak.date)}
              color="purple"
              icon={<FaArrowUp />}
            />
            <MetricStat
              label="Shortest Day"
              value={convertMinutesToHours(stats.shortest.totalTime)}
              subtitle={formatChartDate(stats.shortest.date)}
              color="teal"
              icon={<FaArrowDown />}
            />
            <StreakMetricStat
              label="Longest Streak"
              streak={stats.longestStreak}
              subtitle="consecutive flying days"
              color="rose"
              icon={<FaFire />}
            />
            <StreakMetricStat
              label="Current Streak"
              streak={stats.recentStreak}
              subtitle="most recent run"
              color="amber"
              icon={<FaBolt />}
            />
            {stats.avgPerFlight !== null && (
              <MetricStat
                label="Avg per Flight"
                value={convertMinutesToHours(Math.round(stats.avgPerFlight))}
                subtitle={`across ${totalFlights} flight${totalFlights === 1 ? "" : "s"}`}
                color="indigo"
                icon={<FaPlane />}
              />
            )}
          </div>
        )}

        {stats?.nicheStats && (
          <Accordion
            type="single"
            collapsible
            className={cn(
              "bg-white/70 dark:bg-gray-800/50",
              "rounded-[15px] md:rounded-[20px]",
              "border-2 border-gray-200 dark:border-gray-700",
              "px-3 md:px-4"
            )}
          >
            <AccordionItem value="niche-stats" className="border-none">
              <AccordionTrigger className=" text-xl italic animate-pulse md:text-2xl tracking-tighter font-bold text-yellow-800 dark:text-yellow-200 hover:no-underline py-3">
              📆 Bonus stats you might not care about
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {stats.nicheStats.favoriteWeekday && (
                  <div className="space-y-3">
                    <NicheStatRow
                      icon={<FaCalendarDay />}
                      title="Favorite day to fly"
                      value={stats.nicheStats.favoriteWeekday.name}
                      detail={`${stats.nicheStats.favoriteWeekday.days} flying day${stats.nicheStats.favoriteWeekday.days === 1 ? "" : "s"} · ${convertMinutesToHours(stats.nicheStats.favoriteWeekday.time)} logged`}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {stats.nicheStats.weekdayBreakdown.map((day) => {
                        const isFavorite =
                          day.name === stats.nicheStats.favoriteWeekday?.name
                        const pastel = weekdayPastelStyles[day.dayIndex]

                        return (
                          <div
                            key={day.name}
                            className={cn(
                              "p-2 md:p-3 rounded-[20px] text-center min-w-0",
                              pastel.bg,
                              pastel.darkBg,
                              pastel.border,
                              pastel.darkBorder,
                              isFavorite && `ring-2 ${pastel.favoriteRing}`
                            )}
                          >
                            <p className={cn(
                              "text-[10px] sm:text-xs font-bold truncate",
                              pastel.label
                            )}>
                              {day.name.slice(0, 3)}
                            </p>
                            <p className={cn(
                              "text-xs sm:text-sm font-black mt-1 truncate",
                              pastel.value
                            )}>
                              {convertMinutesToHours(day.time)}
                            </p>
                            <p className={cn(
                              "text-[10px] mt-0.5",
                              pastel.detail
                            )}>
                              {day.flightCount} flight{day.flightCount === 1 ? "" : "s"}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {stats.nicheStats.yearBreakdown.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5 px-1">
                      <FaTrophy className="text-yellow-600 dark:text-yellow-400" />
                      Year breakdown
                    </p>

                    <Accordion type="multiple" className="space-y-2">
                      {stats.nicheStats.yearBreakdown.map((yearStat) => {
                        const months =
                          stats.nicheStats.monthBreakdownByYear.find(
                            (entry) => entry.year === yearStat.year
                          )?.months ?? []
                        const isBestYear = yearStat.year === stats.nicheStats.bestYear
                        const yearPastel = monthPastelStyles[yearStat.year % 12]

                        return (
                          <AccordionItem
                            key={yearStat.year}
                            value={`year-${yearStat.year}`}
                            className={cn(
                              "rounded-[20px] px-3 shadow-none",
                              yearPastel.bg,
                              yearPastel.border,
                            )}
                          >
                            <AccordionTrigger className="hover:no-underline py-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-left min-w-0">
                                <span className={cn(
                                  "text-base md:text-lg font-black tracking-tight",
                                  yearPastel.value
                                )}>
                                  {yearStat.year}
                                </span>
                                <span className={cn("text-xs font-semibold", yearPastel.detail)}>
                                  {convertMinutesToHours(yearStat.time)} · {yearStat.flightCount} flight{yearStat.flightCount === 1 ? "" : "s"}
                                </span>
                                
                              </div>
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pb-2">
                                {months.map((month) => (
                                  <BreakdownCell
                                    key={month.label}
                                    label={monthNames[month.monthIndex].slice(0, 3)}
                                    time={month.time}
                                    flightCount={month.flightCount}
                                    pastel={monthPastelStyles[month.monthIndex]}
                                    muted
                                  />
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                    </Accordion>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <div
          className={cn(
            "bg-white dark:bg-gray-800/50",
            "p-3 md:p-4",
            "rounded-[15px] md:rounded-[20px]",
            "border-2 border-gray-200 dark:border-gray-700"
          )}
        >
          <ChartContainer
            config={chartConfig}
            className="h-[220px] sm:h-[250px] md:h-[280px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={flightActivityData}
              margin={{
                left: 0,
                right: 8,
                top: 12,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="flightTimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatChartDate}
                tick={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "#64748b",
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                tickFormatter={(value) => `${Math.round(value / 60)}h`}
                tick={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "#64748b",
                }}
              />

              <ChartTooltip
                cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null

                  return (
                    <div className="rounded-[12px] border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 px-3 py-2 shadow-md">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-100">
                        {formatTooltipDate(label)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Flight Time:{" "}
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {convertMinutesToHours(payload[0].value as number)}
                        </span>
                      </p>
                    </div>
                  )
                }}
              />

              <Area
                dataKey="totalTime"
                type="monotone"
                fill="url(#flightTimeGradient)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#3b82f6",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
