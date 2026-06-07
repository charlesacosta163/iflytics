import { aircraftBrands, aircraftBrandsCompliments } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { convertMinutesToHours, cn } from "@/lib/utils"
import { PiStarFill } from "react-icons/pi"
import Image from "next/image"
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata"
import { GiPathDistance } from "react-icons/gi"
import { LuFactory, LuList, LuPlane, LuTimer, LuTrendingUp } from "react-icons/lu"

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

type BrandEntry = {
  brand: string
  count: number
  totalDistance: number
  totalTime: number
  aircraftList: string[]
}

type AircraftStat = {
  name: string
  count: number
  totalDistance?: number
  totalTime?: number
}

const Stat = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
}) => (
  <div className="min-w-0">
    <p className="flex items-center gap-1 text-[11px] leading-none text-gray-500 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </p>
    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight mt-1">
      {value}
    </p>
    {sub && (
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
        {sub}
      </p>
    )}
  </div>
)

const shortenDistance = (distance: number) => {
  if (distance < 1000) return `${Math.round(distance)} NM`
  return `${(distance / 1000).toFixed(1)}k NM`
}

const AircraftBrandsCard = ({ allAircraft }: { allAircraft: AircraftStat[] }) => {
  const aircraftByName = Object.fromEntries(
    allAircraft.map((aircraft) => [aircraft.name, aircraft])
  )

  const aircraftBrandsCount = allAircraft.reduce<BrandEntry[]>((acc, aircraft) => {
    const matchedBrand = Object.entries(aircraftBrands).find(([, identifiers]) =>
      identifiers.some((identifier) =>
        aircraft.name.toLowerCase().includes(identifier.toLowerCase())
      )
    )

    const brandName = matchedBrand ? matchedBrand[0] : "Other"
    const existingBrand = acc.find((item) => item.brand === brandName)

    if (existingBrand) {
      existingBrand.count += aircraft.count
      existingBrand.totalDistance += aircraft.totalDistance || 0
      existingBrand.totalTime += aircraft.totalTime || 0
      existingBrand.aircraftList.push(aircraft.name)
    } else {
      acc.push({
        brand: brandName,
        count: aircraft.count,
        totalDistance: aircraft.totalDistance || 0,
        totalTime: aircraft.totalTime || 0,
        aircraftList: [aircraft.name],
      })
    }

    return acc
  }, [])

  const sortedBrands = [...aircraftBrandsCount].sort((a, b) => b.count - a.count)
  const topBrand = sortedBrands[0]

  const totalFlights = allAircraft.reduce((sum, aircraft) => sum + aircraft.count, 0)
  const uniqueBrands = sortedBrands.length
  const topShare =
    topBrand && totalFlights > 0
      ? ((topBrand.count / totalFlights) * 100).toFixed(1)
      : "0"
  const top3Flights = sortedBrands
    .slice(0, 3)
    .reduce((sum, brand) => sum + brand.count, 0)
  const top3Share =
    totalFlights > 0
      ? ((top3Flights / totalFlights) * 100).toFixed(1)
      : "0"
  const uniqueAircraftTypes = allAircraft.length
  const maxBrandFlights = topBrand?.count ?? 1

  const getRandomCompliment = (brand: string) => {
    const compliments =
      aircraftBrandsCompliments[
        brand as keyof typeof aircraftBrandsCompliments
      ] || aircraftBrandsCompliments.Other
    return compliments[Math.floor(Math.random() * compliments.length)]
  }

  return (
    <section
      className={cn(
        "bg-white/50 dark:bg-gray-800/50",
        "rounded-[20px] md:rounded-[25px]",
        "p-4 md:p-5"
      )}
    >
      <header className="mb-4">
        <h3 className="flex items-center gap-1.5 text-lg font-semibold tracking-tighter text-gray-900 dark:text-gray-100">
          <LuFactory className={labelIconClass} />
          Aircraft brands
        </h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
          Flight distribution by manufacturer
        </p>
      </header>

      {sortedBrands.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Stat
              label="Manufacturers"
              value={uniqueBrands}
              sub={`${totalFlights} total flights`}
              icon={<LuFactory className={labelIconClass} />}
            />
            <Stat
              label="Top brand"
              value={topBrand?.brand ?? "—"}
              sub={
                topBrand
                  ? `${topBrand.count} flights · ${topShare}%`
                  : undefined
              }
              icon={<LuTrendingUp className={labelIconClass} />}
            />
            <Stat
              label="Top 3 share"
              value={`${top3Share}%`}
              sub="Of all brand-tagged flights"
              icon={<LuList className={labelIconClass} />}
            />
            <Stat
              label="Aircraft types"
              value={uniqueAircraftTypes}
              sub="Across all manufacturers"
              icon={<LuPlane className={labelIconClass} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mt-5">
            <div className="lg:col-span-2 space-y-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                All manufacturers ({sortedBrands.length})
              </p>

              {sortedBrands.map((brandData, index) => {
                const sharePct =
                  totalFlights > 0
                    ? Number(
                        ((brandData.count / totalFlights) * 100).toFixed(1)
                      )
                    : 0
                const barPct =
                  maxBrandFlights > 0
                    ? Math.round((brandData.count / maxBrandFlights) * 100)
                    : 0

                return (
                  <div
                    key={brandData.brand}
                    className={cn(
                      "flex flex-col gap-2.5 p-3 md:p-4",
                      "rounded-[20px] md:rounded-[25px]",
                      "bg-white/70 dark:bg-gray-800/70",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 w-4 shrink-0 tabular-nums">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {brandData.brand}
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {brandData.aircraftList.length} aircraft type
                            {brandData.aircraftList.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums leading-none">
                          {brandData.count}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 tabular-nums">
                          {sharePct}%
                        </p>
                      </div>
                    </div>

                    <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 dark:bg-sky-400 rounded-full"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {shortenDistance(brandData.totalDistance)} ·{" "}
                        {convertMinutesToHours(Math.round(brandData.totalTime))}
                      </p>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
                          >
                            View aircraft
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          className={cn(
                            "max-w-md max-h-[80vh] overflow-hidden flex flex-col z-[10001]",
                            "bg-white dark:bg-gray-800",
                            "border border-gray-200 dark:border-gray-700",
                            "rounded-xl md:rounded-2xl"
                          )}
                        >
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                              <span className="truncate">{brandData.brand}</span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] rounded-md shrink-0",
                                  "bg-gray-100 dark:bg-gray-700",
                                  "text-gray-600 dark:text-gray-300",
                                  "border-none font-medium"
                                )}
                              >
                                {brandData.aircraftList.length} aircraft
                              </Badge>
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-3 overflow-y-auto flex-1 -mx-1 px-1">
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Aircraft flown from this manufacturer
                            </p>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {brandData.aircraftList.map(
                                (aircraftName, aircraftIndex) => {
                                  const aircraftStats = aircraftByName[aircraftName]
                                  const flightCount = aircraftStats?.count || 0
                                  const distanceFlown = aircraftStats?.totalDistance || 0

                                  return (
                                  <div
                                    key={aircraftIndex}
                                    className={cn(
                                      "flex items-center gap-3 p-3",
                                      "rounded-lg",
                                      "border border-gray-200 dark:border-gray-700",
                                      "bg-white/50 dark:bg-gray-800/50"
                                    )}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-xs md:text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {aircraftName}
                                      </p>
                                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums">
                                        {flightCount}{" "}
                                        {flightCount === 1 ? "flight" : "flights"}
                                      </p>
                                      <p className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums">
                                        <GiPathDistance className={labelIconClass} />
                                        {shortenDistance(distanceFlown)} flown
                                      </p>
                                    </div>
                                    <Image
                                      src={`/images/aircraft/${matchAircraftNameToImage(aircraftName) || "placeholder.png"}`}
                                      alt={aircraftName}
                                      width={60}
                                      height={40}
                                      className="rounded-md border border-gray-200 dark:border-gray-700 shrink-0"
                                    />
                                  </div>
                                  )
                                }
                              )}
                            </div>

                            <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                              Total flights with {brandData.brand}:{" "}
                              <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                                {brandData.count}
                              </span>
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )
              })}
            </div>

            {topBrand && (
              <div
                className={cn(
                  "flex flex-col gap-4 p-4",
                  "rounded-xl",
                  "border border-dashed border-gray-200 dark:border-gray-600",
                  "bg-gray-50/50 dark:bg-gray-900/30",
                  "h-fit"
                )}
              >
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <PiStarFill className="w-3 h-3 text-amber-500" />
                    Pilot&apos;s recognition
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Based on your most flown brand
                  </p>
                </div>

                <div>
                  <p className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    {topBrand.brand}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
                    {topBrand.count} flights · {topShare}% of your log
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    label="Distance"
                    value={shortenDistance(topBrand.totalDistance)}
                    icon={<GiPathDistance className={labelIconClass} />}
                  />
                  <Stat
                    label="Flight time"
                    value={convertMinutesToHours(
                      Math.round(topBrand.totalTime)
                    )}
                    icon={<LuTimer className={labelIconClass} />}
                  />
                </div>

                <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700 pt-3">
                  {getRandomCompliment(topBrand.brand)}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div
          className={cn(
            "text-center py-10",
            "border border-dashed border-gray-200 dark:border-gray-600",
            "rounded-lg"
          )}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            No brand data available
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Fly more aircraft to see manufacturer breakdown
          </p>
        </div>
      )}
    </section>
  )
}

export default AircraftBrandsCard
