import React from 'react'
import { getAllIFlyticsUsers, getUsersSubscribedToPlans } from '@/lib/supabase/user-actions'
import { Metadata } from 'next'
import CommunityUsers from '@/components/community-users'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import TimelineUsers from '@/components/timeline-users'
import { RiCommunityLine, RiMapLine, RiTimeLine } from 'react-icons/ri'
import CommunityMap from '@/components/dashboard-ui/flights/maps/community-map'
import { getFlightsFromServer } from '@/lib/actions'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: "Community - IFlytics | Your Infinite Flight Statistics",
  description: "View the IFlytics community and their flying journeys. Join thousands of pilots exploring their aviation data.",
  keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history, iflytics community",
}

const UsersPage = async () => {
  const users = await getAllIFlyticsUsers() || []
  const flights = await getFlightsFromServer()

  const usersSubscribedToPlans = await getUsersSubscribedToPlans()
  return (
    <div>
      <Tabs defaultValue="community">
        <TabsList>
          <TabsTrigger value="community"> <RiCommunityLine className='inline'/> Community</TabsTrigger>
          <TabsTrigger value="timeline"> <RiTimeLine className='inline'/> Timeline</TabsTrigger>
          <TabsTrigger value="map"> <RiMapLine className='inline'/> Map <Badge className='text-xs font-bold text-white bg-orange-500'>BETA</Badge></TabsTrigger>
        </TabsList>
        <TabsContent value="community">
          <CommunityUsers users={users} />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineUsers users={users} />
        </TabsContent>
        <TabsContent value="map">
          <CommunityMap flights={flights} users={users} />
        </TabsContent>
      </Tabs>
    </div>
  ) 
}

export default UsersPage