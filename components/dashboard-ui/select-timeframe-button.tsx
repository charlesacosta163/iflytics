'use client'

import React, { useMemo, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { LuCalendar, LuClock, LuPlane } from 'react-icons/lu'
import { hasPremiumAccess, Subscription } from '@/lib/subscription/helpers'
import { getMonthAndYear, cn } from '@/lib/utils'
import { Badge } from '../ui/badge'

type MonthKey = string

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

const itemClass = "text-sm font-medium text-gray-800 dark:text-gray-100 cursor-pointer"

const actionRowClass = cn(
  "relative flex cursor-pointer select-none items-center",
  "rounded-md px-2 py-1.5 text-xs font-medium",
  "text-gray-700 dark:text-gray-300",
  "hover:bg-gray-50 dark:hover:bg-gray-700/50",
  "transition-colors"
)

const SectionLabel = ({
  icon,
  children,
  first = false,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  first?: boolean
}) => (
  <p
    className={cn(
      "flex items-center gap-1.5 px-2 py-2",
      "text-[11px] font-medium text-gray-400 dark:text-gray-500",
      !first && "border-t border-gray-200 dark:border-gray-700 mt-1"
    )}
  >
    {icon}
    {children}
  </p>
)

const SelectTimeframeButton = ({
  subscription,
  months,
}: {
  subscription: Subscription
  months: MonthKey[]
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [timeframe, setTimeframe] = useState(
    searchParams.get('timeframe') || 'day-30'
  )
  const [customFlights, setCustomFlights] = useState('')
  const [error, setError] = useState('')
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const handleSelect = (value: string) => {
    setTimeframe(value)
    router.push(`${pathname}?timeframe=${value}`)
  }

  const handleCustomFlights = () => {
    const flights = parseInt(customFlights)
    if (isNaN(flights) || flights <= 0 || flights > 800) {
      setError('Please enter a number between 1 and 800')
      return
    }
    handleSelect(`flight-${flights}`)
    setError('')
    setCustomFlights('')
  }

  const parseMonthKey = (mk: MonthKey) => {
    const [mStr, yStr] = mk.split('_')
    const month = parseInt(mStr, 10)
    const yy = parseInt(yStr, 10)
    const year = yy < 100 ? 2000 + yy : yy
    return { year, month, key: mk }
  }

  const { monthsByYearList, monthsByYearMap } = useMemo(() => {
    const map = new Map<number, { month: number; key: MonthKey }[]>()
    months.forEach((mk) => {
      const { year, month, key } = parseMonthKey(mk)
      if (!map.has(year)) map.set(year, [])
      map.get(year)!.push({ month, key })
    })
    for (const [, arr] of map) arr.sort((a, b) => b.month - a.month)
    const list = Array.from(map.entries()).sort((a, b) => b[0] - a[0])
    return { monthsByYearList: list, monthsByYearMap: map }
  }, [months])

  const getDisplayText = (value: string) => {
    const [type, count] = value.split('-')
    if (type === 'day') return count === '1' ? 'Last 24 hours' : `Last ${count} days`
    if (type === 'month') return getMonthAndYear(count)
    return `Last ${count} flights`
  }

  const openYearDialog = (year: number) => {
    setSelectedYear(year)
    setMonthPickerOpen(true)
  }

  const monthsForSelectedYear =
    selectedYear != null ? (monthsByYearMap.get(selectedYear) ?? []) : []

  const isPremium = hasPremiumAccess(subscription)

  return (
    <Select value={timeframe} onValueChange={handleSelect}>
      <SelectTrigger
        className={cn(
          "h-9 min-w-[180px]",
          "bg-white/50 dark:bg-gray-800/50",
          "border border-gray-200 dark:border-gray-700",
          "text-gray-800 dark:text-gray-100",
          "text-sm font-medium",
          "rounded-[20px] md:rounded-[25px] px-3",
          "hover:bg-gray-50 dark:hover:bg-gray-800",
          "transition-colors"
        )}
      >
        <div className="flex items-center gap-1.5 w-full">
          <LuClock className={labelIconClass} />
          <SelectValue>
            {timeframe && getDisplayText(timeframe)}
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent
        className={cn(
          "min-w-[220px]",
          "bg-white dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700",
          "rounded-lg"
        )}
      >
        <SectionLabel icon={<LuClock className={labelIconClass} />} first>
          Time frames
        </SectionLabel>
        <SelectItem value="day-1" className={itemClass}>Last 24 hours</SelectItem>
        <SelectItem value="day-7" className={itemClass}>Last 7 days</SelectItem>
        <SelectItem value="day-30" className={itemClass}>Last 30 days</SelectItem>
        <SelectItem value="day-90" className={itemClass}>Last 90 days</SelectItem>

        {isPremium ? (
          <>
            <SectionLabel icon={<LuPlane className={labelIconClass} />}>
              Flight frames
            </SectionLabel>
            <SelectItem value="flight-10" className={itemClass}>Last 10 flights</SelectItem>
            <SelectItem value="flight-50" className={itemClass}>Last 50 flights</SelectItem>
            <SelectItem value="flight-100" className={itemClass}>Last 100 flights</SelectItem>
            <SelectItem value="flight-250" className={itemClass}>Last 250 flights</SelectItem>
            <SelectItem value="flight-500" className={itemClass}>Last 500 flights</SelectItem>
            <SelectItem value="flight-800" className={itemClass}>Last 800 flights</SelectItem>

            <Dialog>
              <DialogTrigger asChild>
                <div className={actionRowClass}>Custom flight frame</div>
              </DialogTrigger>
              <DialogContent
                className={cn(
                  "max-w-sm",
                  "bg-white dark:bg-gray-800",
                  "border border-gray-200 dark:border-gray-700",
                  "rounded-xl md:rounded-2xl"
                )}
              >
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Custom flight frame
                  </DialogTitle>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Show stats from your most recent flights
                  </p>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-500 dark:text-gray-400">
                      Number of flights (1–800)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="800"
                      value={customFlights}
                      onChange={(e) => {
                        setCustomFlights(e.target.value)
                        setError('')
                      }}
                      placeholder="e.g. 150"
                      className={cn(
                        "mt-1.5 h-9 text-sm",
                        "bg-white dark:bg-gray-800",
                        "border border-gray-200 dark:border-gray-700",
                        "text-gray-800 dark:text-gray-100",
                        "rounded-lg"
                      )}
                    />
                    {error && (
                      <p className="text-[11px] text-red-500 dark:text-red-400 mt-1.5">
                        {error}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleCustomFlights}
                    variant="outline"
                    className={cn(
                      "w-full h-9 text-xs font-semibold",
                      "border-gray-200 dark:border-gray-700",
                      "text-gray-700 dark:text-gray-200",
                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                      "rounded-lg"
                    )}
                  >
                    Apply
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {monthsByYearList.length > 0 && (
              <>
                <SectionLabel icon={<LuCalendar className={labelIconClass} />}>
                  Monthly frames
                </SectionLabel>

                <Dialog open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
                  {monthsByYearList.map(([year]) => (
                    <DialogTrigger asChild key={year}>
                      <div
                        className={actionRowClass}
                        onClick={() => openYearDialog(year)}
                        role="button"
                      >
                        {year}
                      </div>
                    </DialogTrigger>
                  ))}

                  <DialogContent
                    className={cn(
                      "sm:max-w-[420px] z-[1000000]",
                      "bg-white dark:bg-gray-800",
                      "border border-gray-200 dark:border-gray-700",
                      "rounded-xl md:rounded-2xl"
                    )}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {selectedYear
                          ? `Select month — ${selectedYear}`
                          : 'Select month'}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-[50vh] overflow-y-auto">
                      {monthsForSelectedYear.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                          No months found
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {monthsForSelectedYear.map(({ key }) => (
                            <Button
                              key={key}
                              variant="outline"
                              className={cn(
                                "justify-start h-8 text-xs font-medium",
                                "border-gray-200 dark:border-gray-700",
                                "text-gray-700 dark:text-gray-200",
                                "hover:bg-gray-50 dark:hover:bg-gray-800",
                                "rounded-lg"
                              )}
                              onClick={() => {
                                handleSelect(`month-${key}`)
                                setMonthPickerOpen(false)
                              }}
                            >
                              {getMonthAndYear(key)}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      Monthly data is based on your last 800 flights
                    </p>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </>
        ) : (
          <div
            className={cn(
              "mx-2 mb-2 mt-2 px-3 py-2.5 text-center",
              "border-2 border-dashed border-yellow-500 dark:border-yellow-400",
              "rounded-lg"
            )}
          >
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
              Upgrade to <Badge className="bg-yellow-400 text-white">Premium</Badge> or <Badge className="bg-green-500 text-white">Lifetime</Badge> for flight and monthly frames
            </p>
          </div>
        )}
      </SelectContent>
    </Select>
  )
}

export default SelectTimeframeButton
