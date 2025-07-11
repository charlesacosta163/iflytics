import React from 'react'
import { getAllIFlyticsUsers } from '@/lib/supabase/user-actions'
import { Metadata } from 'next'
import CommunityUsers from '@/components/community-users'

export const metadata: Metadata = {
  title: "Community - IFlytics | Your Infinite Flight Statistics",
  description: "View the IFlytics community and their flying journeys. Join thousands of pilots exploring their aviation data.",
  keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history, iflytics community",
}

const UsersPage = async () => {
  const users = await getAllIFlyticsUsers() || []
  
  return <CommunityUsers users={users} />
}

export default UsersPage