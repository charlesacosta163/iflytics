import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import React from 'react'
import { getAirline } from '@/lib/sync-actions';
import { getAllAircraft } from '@/lib/actions';
import { matchAircraftNameToImage } from '@/lib/cache/flightinsightsdata';
import { FaRegSadCry } from 'react-icons/fa'
import { cn } from '@/lib/utils'

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
      <Card className={cn(
        "p-4 md:p-6 flex-1",
        "bg-gray-50 dark:bg-gray-800",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[20px] md:rounded-[25px]"
      )}>
          <header className={cn(
            "text-center pb-3 md:pb-4 mb-4 md:mb-6",
            "border-b-2 border-gray-200 dark:border-gray-700"
          )}>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Your Top Airlines</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Callsign used for flights to those airlines</p>
          </header>

          <CardContent className='overflow-y-auto max-h-[500px] px-0'>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
               {sortedAirlinesUsed.length > 0 ? sortedAirlinesUsed.map((airline, index) => (
                 <div key={airline.airline} className={cn(
                   "p-3 md:p-4",
                   "bg-white dark:bg-gray-700",
                   "border-2 border-gray-200 dark:border-gray-600",
                   "rounded-[15px] md:rounded-[20px]",
                   "hover:shadow-md transition-shadow duration-200"
                 )}>
                   <div className="flex justify-between gap-2 mb-3">
                     <div className="text-sm md:text-base font-bold flex gap-2 items-center text-gray-800 dark:text-gray-100 tracking-tight">
                       <span className="text-gray-400 dark:text-gray-500">{index + 1}.</span>
                       {airline.airline}
                     </div>
                     <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-bold">{airline.flights} {airline.flights === 1 ? 'flight' : 'flights'}</div>
                   </div>
                   <div className="ml-4 md:ml-6 flex flex-col gap-1.5">
                     {airline.aircraft.slice(0, 3).map((aircraft: any, aircraftIndex: any) => (
                       <div key={aircraft.name} className="flex justify-between text-xs md:text-sm">
                         <span className="text-gray-600 dark:text-gray-400 font-medium">{aircraft.name}</span>
                         <span className="text-gray-500 dark:text-gray-500 font-semibold">{aircraft.flights} {aircraft.flights === 1 ? 'flight' : 'flights'}</span>
                       </div>
                     ))}
                     {airline.aircraft.length > 3 && (
                       <Dialog>
                         <DialogTrigger>
                           <div className="text-xs md:text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer hover:underline font-bold">
                             +{airline.aircraft.length - 3} more aircraft
                           </div>
                         </DialogTrigger>
                         <DialogContent className={cn(
                           "max-w-md",
                           "bg-white dark:bg-gray-800",
                           "border-2 border-gray-200 dark:border-gray-700",
                           "rounded-[20px]"
                         )}>
                           <DialogHeader>
                             <DialogTitle className="flex items-center gap-2">
                               <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">{airline.airline}</span>
                               <Badge variant="secondary" className={cn(
                                 "text-xs rounded-full",
                                 "bg-blue-100 dark:bg-blue-900/30",
                                 "text-blue-700 dark:text-blue-300",
                                 "border-none font-bold"
                               )}>
                                 {airline.aircraft.length} aircraft
                               </Badge>
                             </DialogTitle>
                           </DialogHeader>
                           
                           <div className="space-y-3 md:space-y-4">
                             <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                               All aircraft you've flown with this airline:
                             </div>
                             
                             <div className="grid grid-cols-1 gap-2 md:gap-3 max-h-64 overflow-y-auto">
                               {airline.aircraft.map((aircraft: any, aircraftIndex: number) => (
                                 <div key={aircraftIndex} className={cn(
                                   "flex items-center gap-3 p-3",
                                   "bg-gray-50 dark:bg-gray-700",
                                   "border-2 border-gray-200 dark:border-gray-600",
                                   "rounded-[12px]",
                                   "hover:shadow-sm transition-shadow duration-200"
                                 )}>
                                   <div className="flex-1 min-w-0">
                                     <div className="font-bold text-xs md:text-sm leading-tight text-gray-800 dark:text-gray-100">
                                       {aircraft.name}
                                     </div>
                                     <Badge variant="outline" className={cn(
                                       "text-xs mt-1 rounded-full",
                                       "bg-blue-100 dark:bg-blue-900/30",
                                       "text-blue-700 dark:text-blue-300",
                                       "border-none font-bold"
                                     )}>
                                       {aircraft.flights} {aircraft.flights === 1 ? 'flight' : 'flights'}
                                     </Badge>
                                   </div>
                                   <div className="flex-shrink-0">
                                     <Image 
                                       src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`} 
                                       alt={aircraft.name} 
                                       width={60} 
                                       height={40}
                                       className="rounded-[8px]"
                                     />
                                   </div>
                                 </div>
                               ))}
                             </div>

                             <div className={cn(
                               "pt-2 border-t-2",
                               "border-gray-200 dark:border-gray-700",
                               "text-xs md:text-sm",
                               "text-gray-700 dark:text-gray-300",
                               "font-medium"
                             )}>
                               Total flights with {airline.airline}: <b className="text-gray-900 dark:text-gray-100">{airline.flights}</b>
                             </div>
                           </div>
                         </DialogContent>
                       </Dialog>
                     )}
                   </div>
                 </div>
               )) : (
                <div className={cn(
                  "text-center py-8 md:py-12 col-span-2",
                  "bg-white dark:bg-gray-700",
                  "border-2 border-gray-200 dark:border-gray-600",
                  "rounded-[15px] md:rounded-[20px]"
                )}>
                  <FaRegSadCry className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-700 dark:text-gray-300 mb-2">No Airlines Data</h3>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Fly some flights to see your top airlines!</p>
                </div>
              )}
             </div>
           </CardContent>
      </Card>
      
    </section>
  )
}

export default AirlineAnalysisCard