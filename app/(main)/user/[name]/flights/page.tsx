import React from 'react'
import { getAircraftAndLivery, getUserFlights } from '@/lib/actions'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import ProfileHeader from '@/components/profile-header'
import FlightEntryCard from '@/components/flight-entry'
import PaginationBtn from '@/components/pagination-btn'
import UserNavigation from '@/components/user-navigation'

// Define proper types according to Next.js App Router standards
type PageProps = {
  params: { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const FlightsPage = async ({ params, searchParams }: PageProps) => {
    const { name } = params
    const page = Number(searchParams.page || '1')

    const userFlights = await getUserFlights(name, page)
    const { data: { result: {data: flights, pageIndex, totalPages, totalCount, hasPreviousPage, hasNextPage}}} : any = userFlights

    await new Promise(resolve => setTimeout(resolve, 1000));

    return (
        <div className='p-4 flex flex-col gap-4'>
            <ProfileHeader name={userFlights?.name} grade={userFlights?.grade} organization={userFlights?.organization}/>
            
            {/* User Navigation Tabs */}
            <UserNavigation username={name} />

            <div className="flex items-center justify-between">
                <h2 className='text-5xl font-black bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent py-0.5'>Flights</h2>
                <div className="text-sm text-muted-foreground">
                    Showing page {pageIndex} of {totalPages} ({totalCount} total flights)
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {flights.length > 0 ? flights.map(async (flight: any) => {
                    const aircraft = await getAircraftAndLivery(flight.aircraftId, flight.liveryId)
                    return <FlightEntryCard key={flight.id} flight={flight} aircraft={aircraft}/>
                }) : <div className='text-center text-gray-700 font-bold text-2xl'>No flights found</div>}
            </div>

            <div className="flex justify-center mt-4">
                <PaginationBtn
                    name={name}
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                    hasPreviousPage={hasPreviousPage}
                    hasNextPage={hasNextPage}
                />
            </div>
        </div>
    )
}

export default FlightsPage