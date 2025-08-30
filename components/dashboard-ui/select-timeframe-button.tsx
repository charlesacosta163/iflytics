'use client'

import React, { useMemo, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { TbCalendarMonth, TbClock } from 'react-icons/tb'
import { LiaPlaneDepartureSolid } from 'react-icons/lia'
import { hasPremiumAccess, Subscription } from '@/lib/subscription/helpers'
import { getMonthAndYear } from '@/lib/utils'

let ENABLE_CUSTOM_FLIGHT_FRAME = true;

type MonthKey = string; // "8_25"

const SelectTimeframeButton = ({ subscription, months }: { subscription: Subscription, months: MonthKey[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [timeframe, setTimeframe] = useState(searchParams.get('timeframe') || "day-30");
  const [customFlights, setCustomFlights] = useState("");
  const [error, setError] = useState("");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleSelect = (value: string) => {
    setTimeframe(value);
    router.push(`${pathname}?timeframe=${value}`);
  }

  const handleCustomFlights = () => {
    const flights = parseInt(customFlights);
    if (isNaN(flights) || flights <= 0 || flights > 800) {
      setError("Please enter a number between 1 and 800");
      return;
    }
    handleSelect(`flight-${flights}`);
    setError("");
    setCustomFlights("");
  };

  // Parse "M_YY" -> {year: 2025, month: 8, key: "8_25"}
  const parseMonthKey = (mk: MonthKey) => {
    const [mStr, yStr] = mk.split('_');
    const month = parseInt(mStr, 10);
    const yy = parseInt(yStr, 10);
    const year = yy < 100 ? 2000 + yy : yy; // 25 -> 2025
    return { year, month, key: mk };
  };

  // Group months by full year, sort years desc, months desc
  const { monthsByYearList, monthsByYearMap } = useMemo(() => {
    const map = new Map<number, { month: number; key: MonthKey }[]>();
    months.forEach(mk => {
      const { year, month, key } = parseMonthKey(mk);
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push({ month, key });
    });
    for (const [, arr] of map) arr.sort((a, b) => b.month - a.month);
    const list = Array.from(map.entries()).sort((a, b) => b[0] - a[0]); // [[year, [{month,key}...]], ...]
    return { monthsByYearList: list, monthsByYearMap: map };
  }, [months]);

  // Helper: display text for the Select trigger
  const getDisplayText = (value: string) => {
    const [type, count] = value.split('-');
    if (type === 'day') return count === '1' ? 'Last 24 Hours' : `Last ${count} Days`;
    if (type === 'month') return getMonthAndYear(count); // count like "8_25"
    return `Last ${count} Flights`;
  };

  const openYearDialog = (year: number) => {
    setSelectedYear(year);
    setMonthPickerOpen(true);
  };

  const monthsForSelectedYear = selectedYear != null ? (monthsByYearMap.get(selectedYear) ?? []) : [];

  return (
    <>
      <Select value={timeframe} onValueChange={handleSelect}>
        <SelectTrigger className="bg-white font-semibold border-none">
          <SelectValue>
            {timeframe && getDisplayText(timeframe)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="font-medium">
          {/* Time Frames */}
          <div className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-md text-center flex items-center gap-2 justify-center">
            Time Frames <TbClock className="text-gray-500" />
          </div>
          <SelectItem value="day-1">Last 24 Hours</SelectItem>
          <SelectItem value="day-7">Last 7 Days</SelectItem>
          <SelectItem value="day-30">Last 30 Days</SelectItem>
          <SelectItem value="day-90">Last 90 Days</SelectItem>

          {hasPremiumAccess(subscription) ? (
            <>
              {/* Flight Frames */}
              <div className="text-xs text-gray-500 font-semibold bg-amber-200 px-2 py-1 rounded-md text-center flex items-center justify-center gap-2">
                Flight Frames <LiaPlaneDepartureSolid />
              </div>
              <SelectItem value="flight-10">Last 10 Flights</SelectItem>
              <SelectItem value="flight-50">Last 50 Flights</SelectItem>
              <SelectItem value="flight-100">Last 100 Flights</SelectItem>
              <SelectItem value="flight-250">Last 250 Flights</SelectItem>
              <SelectItem value="flight-500">Last 500 Flights</SelectItem>
              <SelectItem value="flight-800">Last 800 Flights</SelectItem>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Custom Flight Frame
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Custom Flight Frame</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Enter number of flights (1-800)</label>
                      <Input
                        type="number"
                        min="1"
                        max="800"
                        value={customFlights}
                        onChange={(e) => {
                          setCustomFlights(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter number of flights"
                        className="mt-1"
                      />
                      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    </div>
                    <Button 
                      onClick={handleCustomFlights}
                      className="w-full"
                    >
                      Apply
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Monthly Frames – list unique years as triggers */}
              {monthsByYearList.length > 0 && (
                <>
                  <div className="text-xs text-gray-600 font-semibold bg-blue-200/60 px-2 py-1 rounded-md text-center flex items-center justify-center gap-2 mt-1">
                    Monthly Frames <TbCalendarMonth />
                  </div>

                  {/* Render each unique year as a clickable row that opens the dialog */}
                  <Dialog open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
                    {monthsByYearList.map(([year]) => (
                      <DialogTrigger asChild key={year}>
                        <div
                          className="relative mt-1 flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          onClick={() => openYearDialog(year)}
                          role="button"
                        >
                          {year}
                        </div>
                      </DialogTrigger>
                    ))}

                    {/* Dialog shows months for the chosen year */}
                    <DialogContent className="sm:max-w-[520px] z-[1000000]">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedYear ? `Select Month — ${selectedYear}` : 'Select Month'}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {monthsForSelectedYear.length === 0 ? (
                          <div className="text-sm text-gray-500 px-1">No months found.</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {monthsForSelectedYear.map(({ month, key }) => (
                              <Button
                                key={key}
                                variant="outline"
                                className="justify-start"
                                onClick={() => {
                                  handleSelect(`month-${key}`); // e.g. "month-8_25"
                                  setMonthPickerOpen(false);
                                }}
                              >
                                {getMonthAndYear(key)}{/* e.g. "Aug 2025" */}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2 text-center">Data is based off <b><u>last 800 flights</u></b></p>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-500 px-2 py-1 rounded-md text-center bg-yellow-200">
              ⭐️ Upgrade to Premium for Flight & Monthly Frames
            </div>
          )}
        </SelectContent>
      </Select>
    </>
  )
}

export default SelectTimeframeButton;
