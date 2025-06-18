import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/logout-button'
import { getUser } from '@/lib/supabase/user-actions'

import { getAggregatedFlights } from '@/lib/cache/flightdata'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Dashboard - IFlytics | Your Infinite Flight Statistics",
  description: "View your Infinite Flight statistics with advanced data visualization, real-time flight maps, leaderboards, and interactive games. Join thousands of pilots exploring their aviation data.",
  keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history",
}

export default async function DashboardPage() {
  let maintenance = true

  if (maintenance) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">This page is under construction, will send an update soon!</h1>
      </div>
    )
  }

  const { user_metadata: data } = await getUser()

    const flights = await getAggregatedFlights(data.ifcUserId)

  return (
    <div className="border border-red-500 grid grid-cols-6 gap-4 h-full [&>div]:rounded-lg">
      
      <div className="col-span-3 row-span-2 bg-blue-500">Hello Card</div>
      <div className="col-span-2 row-span-1 bg-white">Most recent flight card</div>
      <div className="bg-amber-300">Current Grade Card</div>
      <div className="col-span-2 bg-purple-200">Last 30 days stats card</div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>
      <div className="border border-blue-600"></div>

    </div>
  )
}
