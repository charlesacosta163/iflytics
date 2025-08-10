import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import React from 'react'
import { getAirline } from '@/lib/sync-actions';
import { getAllAircraft } from '@/lib/actions';
import { matchAircraftNameToImage } from '@/lib/cache/flightinsightsdata';
import { FaRegSadCry } from 'react-icons/fa'

const AirlineAnalysisCard = async ({ routesWithDistances }: { routesWithDistances: any[] }) => {

    const allAircraft = await getAllAircraft()
    const aircraftArray = allAircraft.result

  function airlineAnalysisData() {
    // Data using for analysis: Determine how many flights are done by each airline + aircraft used for that airline

    // Data structure for airlinesUsed:
    // [
    //   {
    //     airline: string,
    //     flights: number,
    //     aircraft: string[] 
    //   }
    // ]

    let airlinesUsed: any[] = []

    routesWithDistances.forEach((route) => {
        const airlineCallsign = route.callsign
        const airline = getAirline(airlineCallsign)

        if (!airline) {
            return
        }

        // Get aircraft name from aircraftId
        const aircraftObj = aircraftArray.find((aircraft: any) => aircraft.id === route.aircraftId)
        const aircraftName = aircraftObj ? aircraftObj.name : 'Unknown Aircraft'

        // Check if airline already exists in array
        const existingAirline = airlinesUsed.find(item => item.airline === airline)

        if (existingAirline) {
            // Increment flights
            existingAirline.flights += 1
            
            // Check if aircraft already exists for this airline
            const existingAircraft = existingAirline.aircraft.find((ac: any) => ac.name === aircraftName)
            if (existingAircraft) {
                existingAircraft.flights += 1
            } else {
                existingAirline.aircraft.push({
                    name: aircraftName,
                    flights: 1
                })
            }
        } else {
            // Add new airline entry
            airlinesUsed.push({
                airline: airline,
                flights: 1,
                aircraft: [{
                    name: aircraftName,
                    flights: 1
                }]
            })
        }
    })

    return airlinesUsed
  }  

  const airlinesUsed = airlineAnalysisData()
  const sortedAirlinesUsed = airlinesUsed
    .sort((a, b) => b.flights - a.flights)
    .map(airline => ({
      ...airline,
      aircraft: airline.aircraft.sort((a: any, b: any) => b.flights - a.flights)
    }))


    // sortedAirlinesUsed.forEach((airline) => console.log(airline))
  
  return (
    <section className="grid grid-cols-1 gap-4">
      <Card className="p-6 flex-1">
          <header className="text-center pb-2 border-b">
            <h3 className="text-xl font-bold tracking-tight">Your Top Airlines</h3>
            <p className="text-sm dark:text-gray-300 text-gray-500">Callsign used for flights to those airlines</p>
          </header>

                     <CardContent className='overflow-y-auto max-h-[500px]'>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {sortedAirlinesUsed.length > 0 ? sortedAirlinesUsed.map((airline, index) => (
                 <div key={airline.airline} className="border-b pb-3">
                   <div className="flex justify-between gap-2 mb-2">
                     <div className="text-sm font-bold flex gap-2 items-center">
                       <span className="text-gray-500">{index + 1}.</span>
                       {airline.airline}
                     </div>
                     <div className="text-sm dark:text-gray-300 text-gray-500 font-semibold">{airline.flights} {airline.flights === 1 ? 'flight' : 'flights'}</div>
                   </div>
                   <div className="ml-6 flex flex-col gap-1">
                     {airline.aircraft.slice(0, 3).map((aircraft: any, aircraftIndex: any) => (
                       <div key={aircraft.name} className="flex justify-between text-xs">
                         <span className="text-gray-600 dark:text-gray-400">{aircraft.name}</span>
                         <span className="text-gray-500">{aircraft.flights} {aircraft.flights === 1 ? 'flight' : 'flights'}</span>
                       </div>
                     ))}
                                           {airline.aircraft.length > 3 && (
                        <Dialog>
                          <DialogTrigger>
                            <div className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer hover:underline">
                              +{airline.aircraft.length - 3} more aircraft
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-gray text-light border-none shadow-none">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span className="text-lg font-bold">{airline.airline}</span>
                                <Badge variant="secondary" className="text-xs rounded-full bg-gray-600/25 text-light border-none">
                                  {airline.aircraft.length} aircraft
                                </Badge>
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-3">
                              <div className="text-sm dark:text-gray-300 text-gray-200">
                                All aircraft you've flown with this airline:
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                                {airline.aircraft.map((aircraft: any, aircraftIndex: number) => (
                                  <div key={aircraftIndex} className="flex items-center gap-3 p-3 bg-gray-600/15 text-light rounded-lg">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-sm leading-tight">
                                        {aircraft.name}
                                      </div>
                                      <Badge variant="outline" className="text-xs mt-1 rounded-full border-none bg-gray-600/25 dark:bg-gray-700/25 text-light">
                                        {aircraft.flights} {aircraft.flights === 1 ? 'flight' : 'flights'}
                                      </Badge>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Image 
                                        src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`} 
                                        alt={aircraft.name} 
                                        width={60} 
                                        height={40}
                                        className="rounded"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t text-xs text-gray-300">
                                Total flights with {airline.airline}: <b>{airline.flights}</b>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                   </div>
                 </div>
               )) : (
                <div className="text-center py-12 rounded-lg col-span-2">
                  <FaRegSadCry className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Airlines Data</h3>
                  <p className="text-gray-500">Fly some flights to see your top airlines!</p>
                </div>
              )}
             </div>
           </CardContent>
      </Card>
      
    </section>
  )
}

export default AirlineAnalysisCard