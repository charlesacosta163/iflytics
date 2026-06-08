"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/supabase/user-actions"
import { getUserSubscription } from "@/lib/subscription/subscription"
import { hasPremiumAccess, Subscription } from "@/lib/subscription/helpers"
import { cn } from "@/lib/utils"
import { FaCrown, FaRoute, FaPlane, FaLock, FaStar } from "react-icons/fa"
import { LuRoute, LuPlane, LuMap, LuGlobe, LuFactory, LuBuilding2, LuCalendar, LuClock } from "react-icons/lu"
import { RiMap2Line } from "react-icons/ri"
import { TbFileTypeCsv, TbBrain } from "react-icons/tb"
import GroupedSubscriptionButtons from "@/components/dashboard-ui/grouped-sub-btns"
import routeMapImage from "@/public/subscriptions/route-cards/route-map.png"
import aircraftMostUsedImage from "@/public/subscriptions/aircraft-cards/aircraft-mostused.png"
import routeCsvImage from "@/public/subscriptions/route-cards/route-csv.png"

const FeatureItem = ({
  icon,
  title,
  description,
  tier,
}: {
  icon: React.ReactNode
  title: string
  description: string
  tier?: "premium" | "lifetime"
}) => (
  <div
    className={cn(
      "flex gap-3 p-4 rounded-xl",
      "bg-gray-50 dark:bg-gray-800/80",
      "border border-gray-200 dark:border-gray-700"
    )}
  >
    <div className="shrink-0 mt-0.5 text-gray-500 dark:text-gray-400">{icon}</div>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        {tier === "premium" && (
          <Badge className="shrink-0 bg-yellow-400 hover:bg-yellow-400 text-gray-900 text-[10px] font-bold">
            Premium
          </Badge>
        )}
        {tier === "lifetime" && (
          <Badge className="shrink-0 bg-green-600 hover:bg-green-600 text-white text-[10px] font-bold">
            Lifetime
          </Badge>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
)

export function PremiumUpsellSidebar({ expanded }: { expanded: boolean }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const userData = await getUser()
        if (userData?.id) {
          const data = await getUserSubscription(userData.id)
          setSubscription(data as Subscription)
        }
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const hasLifetimeRole =
    subscription?.role === "tester" || subscription?.role === "admin"

  if (loading || !subscription || hasPremiumAccess(subscription) || hasLifetimeRole) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={cn(
          "transition-all duration-200 hover:scale-[1.02]",
          expanded
            ? "w-full rounded-2xl p-3 text-left bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-md border-2 border-yellow-300/50 dark:border-yellow-600/40"
            : "flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md mx-auto"
        )}
        title={expanded ? undefined : "Unlock Premium"}
      >
        {expanded ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <FaCrown className="text-white text-base shrink-0" />
              <span className="text-sm font-bold text-white tracking-tight">
                Unlock Premium
              </span>
              <Badge className="ml-auto bg-white/25 hover:bg-white/25 text-white border-white/30 text-[10px] font-bold">
                NEW
              </Badge>
            </div>
            <p className="text-[11px] text-white/90 font-medium leading-snug">
              Route & Aircraft Analysis, flight frames & CSV export — tap to explore
            </p>
          </div>
        ) : (
          <FaCrown className="text-white text-base" />
        )}
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={cn(
            "max-w-[800px] w-full max-h-[90vh] overflow-y-auto z-[10001]",
            "bg-white dark:bg-gray-900",
            "border-2 border-gray-200 dark:border-gray-700",
            "rounded-2xl md:rounded-3xl p-5 md:p-8"
          )}
        >
          <DialogHeader className="text-center sm:text-left space-y-2">
            <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <FaCrown className="text-yellow-500 shrink-0" />
              <span className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                IFlytics Intelligent Insights
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
              Unlock route and aircraft analysis, flight & monthly frames on{" "}
              <Badge className="bg-yellow-400 hover:bg-yellow-400 text-gray-900 text-[10px] font-bold align-middle">
                Premium
              </Badge>
              , plus CSV export on{" "}
              <Badge className="bg-green-600 hover:bg-green-600 text-white text-[10px] font-bold align-middle">
                Lifetime
              </Badge>
              .
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="routes" className="mt-2">
            <TabsList className="grid w-full grid-cols-3 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger
                value="routes"
                className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm gap-1.5 sm:gap-2"
              >
                <LuRoute className="w-4 h-4 shrink-0" />
                <span className="truncate">Routes</span>
              </TabsTrigger>
              <TabsTrigger
                value="aircraft"
                className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm gap-1.5 sm:gap-2"
              >
                <LuPlane className="w-4 h-4 shrink-0" />
                <span className="truncate">Aircraft</span>
              </TabsTrigger>
              <TabsTrigger
                value="premium"
                className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm gap-1.5 sm:gap-2"
              >
                <FaStar className="w-3.5 h-3.5 shrink-0 text-yellow-500" />
                <span className="truncate">Premium</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="routes" className="space-y-5 mt-5">
              <div className="flex flex-col md:flex-row gap-5 items-center">
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FaRoute className="text-[#ff879b] dark:text-blue-400" />
                    Route Analysis
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visualize where you fly, how often, and how far — with maps, charts, and export tools.
                  </p>
                </div>
                <Image
                  src={routeMapImage}
                  alt="Route map preview"
                  width={220}
                  height={160}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg shrink-0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FeatureItem
                  icon={<RiMap2Line className="w-5 h-5" />}
                  title="Interactive route maps"
                  description="See every route on a world map with year filters and searchable route tables."
                />
                <FeatureItem
                  icon={<TbBrain className="w-5 h-5" />}
                  title="Route intelligence"
                  description="Routes summary, top countries, most flown pairs, and bonus route metrics."
                />
                <FeatureItem
                  icon={<LuGlobe className="w-5 h-5" />}
                  title="Geographic breakdown"
                  description="Continent pies, domestic vs international split, and country visit rankings."
                />
                <FeatureItem
                  icon={<LuMap className="w-5 h-5" />}
                  title="Distance & duration"
                  description="Total mileage, longest/shortest routes, and hourly flight duration charts."
                />
              </div>
            </TabsContent>

            <TabsContent value="aircraft" className="space-y-5 mt-5">
              <div className="flex flex-col md:flex-row gap-5 items-center">
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FaPlane className="text-blue-500 dark:text-pink-400 rotate-45" />
                    Aircraft Analysis
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Understand your fleet — which types you fly most, airlines you emulate, and manufacturers you favor.
                  </p>
                </div>
                <Image
                  src={aircraftMostUsedImage}
                  alt="Aircraft analysis preview"
                  width={220}
                  height={160}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg shrink-0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FeatureItem
                  icon={<LuPlane className="w-5 h-5" />}
                  title="Fleet intelligence"
                  description="Aircraft summary with top type share, distance, block time, and usage rankings."
                />
                <FeatureItem
                  icon={<LuBuilding2 className="w-5 h-5" />}
                  title="Per-aircraft histories"
                  description="Drill into every flight for each aircraft type with route and server details."
                />
                <FeatureItem
                  icon={<LuFactory className="w-5 h-5" />}
                  title="Manufacturer brands"
                  description="Boeing vs Airbus vs other breakdowns with pilot recognition highlights."
                />
                <FeatureItem
                  icon={<FaPlane className="w-4 h-4" />}
                  title="Airline analysis"
                  description="See which virtual airlines your callsigns map to and aircraft used per airline."
                />
                <FeatureItem
                  icon={<LuRoute className="w-5 h-5" />}
                  title="Fleet metrics"
                  description="Concentration stats, single-use types, and combined fleet distance & time."
                />
                <FeatureItem
                  icon={<FaLock className="w-4 h-4" />}
                  title="Sortable fleet table"
                  description="Rank aircraft by flights, distance, or block time with expandable flight logs."
                />
              </div>
            </TabsContent>

            <TabsContent value="premium" className="space-y-5 mt-5">
              <div className="flex flex-col md:flex-row gap-5 items-center">
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    Premium
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Go beyond day-based views — filter your entire dashboard by flight count or calendar month, and export your data on Lifetime.
                  </p>
                </div>
                <Image
                  src={routeCsvImage}
                  alt="Premium timeframe and export preview"
                  width={220}
                  height={160}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg shrink-0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FeatureItem
                  icon={<LuClock className="w-5 h-5" />}
                  title="Flight frames"
                  description="Analyze your last 10–800 flights across Routes, Aircraft, and all flight stats — included with Premium and Lifetime."
                  tier="premium"
                />
                <FeatureItem
                  icon={<LuCalendar className="w-5 h-5" />}
                  title="Monthly frames"
                  description="Pick any calendar month from your flight history and see stats scoped to that period — included with Premium and Lifetime."
                  tier="premium"
                />
                <FeatureItem
                  icon={<TbFileTypeCsv className="w-5 h-5" />}
                  title="CSV export"
                  description="Download your full flight history as CSV with MyFlightRadar24-compatible fields — exclusive to the Lifetime plan."
                  tier="lifetime"
                />
                <FeatureItem
                  icon={<FaLock className="w-4 h-4" />}
                  title="Works everywhere"
                  description="Flight and monthly frames apply across the Flights dashboard — Routes, Aircraft, and every stat tied to your selected timeframe."
                  tier="premium"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <span className="font-semibold text-gray-800 dark:text-gray-200">Premium</span> unlocks
              Route & Aircraft Analysis plus flight & monthly timeframe filters.{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">Lifetime</span> adds
              CSV export with MyFlightRadar24 compatibility — one payment, forever.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
            <GroupedSubscriptionButtons />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
