
import React from 'react'
import FullScreenMap from '@/components/dashboard-ui/flights/maps/full-screen-map'
import { getFlightsFromServer } from '@/lib/actions'

const MapPage = async () => {
   const flights = await getFlightsFromServer()


  return (
    <div className="h-[calc(100vh-120px)] w-full">
      <FullScreenMap flights={flights} />
    </div>
  )
}

export default MapPage