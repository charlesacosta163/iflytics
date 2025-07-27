"use client"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata"
import { convertMinutesToHours } from "@/lib/utils"
import { Eye } from "lucide-react"
import Link from "next/link"

const shortenNumber = (number: number) => {
  if (number < 1000) {
    return number.toString()
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + "k"
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1) + "m"  
  } else {
    return (number / 1000000000).toFixed(1) + "b"
  }
}

const FlightAircraftEntry = ({ index, aircraft, flightsAmountRaw, allFlightsWithDistances }: { 
  index: number, 
  aircraft: any, 
  flightsAmountRaw: number,
  allFlightsWithDistances: any[]
}) => {

  // Filter flights for this specific aircraft
  const aircraftFlights = allFlightsWithDistances?.filter(flight => flight.aircraftId === aircraft.aircraftId) || [];

  return (
    <section key={aircraft.aircraftId} className='flex gap-2 items-center justify-between p-4 rounded-lg w-full dark:border-gray-800 border-2 border-gray-200'>
      
      <div className='rounded-lg relative'>
        <Image src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`} alt="Most Used Aircraft" width={100} height={50} />
        <span className='absolute -top-8 left-0 text-light font-black text-xl w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500'>
          {index + 1}
        </span>
      </div>

      <div className='flex-1 flex flex-col gap-2'>
        
        <div id="aircraft-name" className='text-lg font-bold'>
          {aircraft.name || "Unknown Aircraft"}
        </div>

        <div className="grid grid-cols-2 gap-1 text-xs font-medium">
          <span className=''>{convertMinutesToHours(Math.round(aircraft.totalTime))} total</span>
          <span className='text-right'>{shortenNumber(Math.round(aircraft.totalDistance))} nm</span>
        </div>

        <div className="flex flex-col gap-2 text-xs font-medium">
          <div className="flex justify-between gap-2 items-center">
            <span>Usage: {((aircraft.count / flightsAmountRaw) * 100).toFixed(1)}%</span>
            <span className="text-gray-400 text-right">Last Flight: {new Date(aircraft.lastUsed).toLocaleDateString()}</span>
          </div>
          <Progress value={Number(((aircraft.count / flightsAmountRaw) * 100).toFixed(1))} />
          
          {/* Flight Details Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full mt-1 border-none bg-gray-700 text-light hover:bg-gray-800 hover:text-light">
                <Eye className="w-3 h-3 mr-1" />
                View {aircraft.count} {aircraft.count === 1 ? 'Flight' : 'Flights'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray text-light border-none shadow-none">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Image 
                    src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`} 
                    alt={aircraft.name} 
                    width={40} 
                    height={25} 
                  />
                  {aircraft.name} Flight History
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3">
                {aircraftFlights.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-700/15 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Total Flights</p>
                        <p className="text-2xl font-bold">{aircraft.count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Total Distance</p>
                        <p className="text-2xl font-bold">{shortenNumber(Math.round(aircraft.totalDistance))} nm</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Total Time</p>
                        <p className="text-2xl font-bold">{convertMinutesToHours(Math.round(aircraft.totalTime))}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">Flight Log</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {aircraftFlights
                          .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()) // Sort by newest first
                          .map((flight, flightIndex) => (
                          <div key={flight.flightId || flightIndex} className="flex items-center justify-between p-3 rounded-lg bg-gray-600/15 hover:bg-gray-800/50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs bg-gray-700/15 text-light rounded-full">
                                  {flight.origin} → {flight.destination}
                                </Badge>
                                {flight.originIsoCountry && flight.destinationIsoCountry && (
                                  <Badge variant="outline" className={`text-xs rounded-full border-none text-light ${flight.origin === "????" || flight.destination === "????" ? "bg-dark" : flight.originIsoCountry === flight.destinationIsoCountry ? 'bg-[#9f7993]' : 'bg-[#ca9b7b]'}`}>
                                    {
                                    flight.origin === "????" || flight.destination === "????" ? 'Unknown' :
                                    flight.originIsoCountry === flight.destinationIsoCountry ? 'Domestic' : 'International'}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-400">
                                {new Date(flight.created).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="flex gap-2 items-center mt-1">
                                <Badge variant="secondary" className={`text-light text-xs rounded-full ${flight.server.toLowerCase().includes('casual') ? 'bg-green-500' : flight.server.toLowerCase().includes('training') ? 'bg-blue-400' : flight.server.toLowerCase().includes('expert') ? 'bg-red-400' : 'bg-gray-500'}`}>
                                    {flight.server || 'Unknown'}
                                </Badge>
                                {
                                  flight.origin !== "????" && flight.destination !== "????" && (
                                    <Link className="text-xs text-gray-400 px-3 py-1 rounded-full bg-gray-700/50 hover:bg-gray-700/70 transition-all duration-300 flex items-center gap-0.5 font-medium" href={`/dashboard/flights/${flight.flightId}`} target="_blank">
                                      <Eye className="w-3 h-3 mr-1" />
                                      View Flight
                                    </Link>
                                  )
                                }
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {Math.round(flight.distance || 0)} nm
                              </div>
                              <div className="text-xs text-gray-500">
                                {convertMinutesToHours(Math.round(flight.totalTime || 0))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No flight data available for this aircraft.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

      </div>

      <div className='flex flex-col items-center gap-1'>
        <span className='font-bold text-gray-500 dark:text-gray-300 text-2xl'>
          {aircraft.count}
        </span>
        <span className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
           {aircraft.count === 1 ? 'flight' : 'flights'}
        </span>
      </div>

    </section>
  )
}

export default FlightAircraftEntry;