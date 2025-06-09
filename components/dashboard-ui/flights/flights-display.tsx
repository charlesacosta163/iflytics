import React from 'react'
import FlightDisplayCard from '../flight-display-card'
import { Flight } from '@/lib/types'
import { getAircraftAndLivery } from '@/lib/actions'

const FlightsDisplay = ({ flights }: { flights: Flight[] }) => {
  return (
    <div className='flex flex-col gap-4'>
        <header>
            <h1 className='text-2xl font-bold'>Flights</h1>
        </header>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {flights.length > 0 && flights.map(async (flight: any, index: number) => {
                const aircraft = await getAircraftAndLivery(flight.aircraftId, flight.liveryId)
                return(
                    <FlightDisplayCard key={index} flight={flight} aircraft={aircraft} />
                )
            })}
        </div>

    </div>
  )
}

export default FlightsDisplay