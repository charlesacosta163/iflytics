'use client'
import React from 'react'
import dynamic from 'next/dynamic'

const FlightRouteMap = dynamic(() => import("@/components/dashboard-ui/misc/flightroute-map"), { ssr: false });

const FlightRouteMapRenderer = () => {
  return (
    <FlightRouteMap />
  )
}

export default FlightRouteMapRenderer