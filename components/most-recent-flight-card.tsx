import React from 'react'
import { Card, CardHeader, CardContent } from './ui/card'
import { TbPlaneInflight } from "react-icons/tb";
import { formatDate } from '@/lib/utils';


const MostRecentFlightCard = ({flight}: {flight: any}) => {
  return (
    <Card className="hidden md:flex max-w-[400px] w-full rounded-[25px] text-gray shadow-none bg-gray-50">
        <CardHeader className="text-xl font-bold flex items-center gap-2">
            <TbPlaneInflight className="text-2xl" />
            Most Recent Flight
        </CardHeader>
        <CardContent>

            <div className="flex justify-between items-center">
                <p className="text-sm font-bold">{flight.callsign}</p>
                <span className="text-sm font-bold text-gray-400">{formatDate(flight.created)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
                <span className="text-5xl font-black">{flight.originAirport}</span>
                <span className="text-2xl font-black text-gray-300">to</span>
                <span className="text-5xl font-black">{flight.destinationAirport}</span>
            </div>
        </CardContent>
    </Card>
  )
}

export default MostRecentFlightCard