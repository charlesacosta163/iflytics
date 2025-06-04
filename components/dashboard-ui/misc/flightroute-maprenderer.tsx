'use client'
import React from 'react'
import dynamic from 'next/dynamic'

const FlightRouteMap = dynamic(() => import("@/components/dashboard-ui/misc/flightroute-map"), { ssr: false });

const FlightRouteMapRenderer = ({lat, lng}: {lat: number, lng: number}) => {
  return (
    <FlightRouteMap lat={lat} lng={lng} />
  )
}

export default FlightRouteMapRenderer