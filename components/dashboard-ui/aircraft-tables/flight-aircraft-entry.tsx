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
import { convertMinutesToHours, cn } from "@/lib/utils"
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
    <section key={aircraft.aircraftId} className={cn(
      'flex gap-3 md:gap-4 items-center justify-between',
      'p-3 md:p-4',
      'rounded-[15px] md:rounded-[20px]',
      'w-full',
      'bg-white dark:bg-gray-700',
      'border-2 border-gray-200 dark:border-gray-600',
      'hover:shadow-md transition-shadow duration-200'
    )}>
      
      <div className='rounded-[10px] relative'>
        <Image 
          src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`} 
          alt="Most Used Aircraft" 
          width={100} 
          height={50}
          className="rounded-[8px]"
        />
        <span className={cn(
          'absolute -top-8 left-0',
          'text-white font-black text-lg md:text-xl',
          'w-8 h-8 flex items-center justify-center',
          'rounded-full',
          'bg-gradient-to-r from-blue-500 to-purple-500',
          'shadow-md'
        )}>
          {index + 1}
        </span>
      </div>

      <div className='flex-1 flex flex-col gap-2'>
        
        <div id="aircraft-name" className='text-base md:text-lg font-bold tracking-tight text-gray-800 dark:text-gray-100'>
          {aircraft.name || "Unknown Aircraft"}
        </div>

        <div className="grid grid-cols-2 gap-1 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300">
          <span>{convertMinutesToHours(Math.round(aircraft.totalTime))} total</span>
          <span className='text-right'>{shortenNumber(Math.round(aircraft.totalDistance))} nm</span>
        </div>

        <div className="flex flex-col gap-2 text-xs md:text-sm font-medium">
          <div className="flex justify-between gap-2 items-center text-gray-600 dark:text-gray-400">
            <span className="font-bold">Usage: {((aircraft.count / flightsAmountRaw) * 100).toFixed(1)}%</span>
            <span className="text-right">Last: {new Date(aircraft.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <Progress value={Number(((aircraft.count / flightsAmountRaw) * 100).toFixed(1))} className="h-2" />
          
          {/* Flight Details Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "w-full mt-1",
                  "bg-blue-600 hover:bg-blue-700",
                  "dark:bg-blue-500 dark:hover:bg-blue-600",
                  "text-white",
                  "border-none",
                  "rounded-[10px]",
                  "font-bold text-xs md:text-sm"
                )}
              >
                <Eye className="w-3 h-3 mr-1" />
                View {aircraft.count} {aircraft.count === 1 ? 'Flight' : 'Flights'}
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
              "max-w-4xl max-h-[80vh] overflow-y-auto",
              "bg-white dark:bg-gray-800",
              "border-2 border-gray-200 dark:border-gray-700",
              "rounded-[20px]"
            )}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Image 
                    src={`/images/aircraft/${matchAircraftNameToImage(aircraft.name) || "placeholder.png"}`} 
                    alt={aircraft.name} 
                    width={40} 
                    height={25} 
                    className="rounded-[6px]"
                  />
                  <span className="font-bold tracking-tight">{aircraft.name} Flight History</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3 md:space-y-4">
                {aircraftFlights.length > 0 ? (
                  <>
                    <div className={cn(
                      "grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4",
                      "p-4",
                      "bg-blue-50 dark:bg-blue-900/20",
                      "border-2 border-blue-200 dark:border-blue-800/30",
                      "rounded-[15px]"
                    )}>
                      <div className="text-center">
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Flights</p>
                        <p className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100">{aircraft.count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Distance</p>
                        <p className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100">{shortenNumber(Math.round(aircraft.totalDistance))} nm</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Time</p>
                        <p className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100">{convertMinutesToHours(Math.round(aircraft.totalTime))}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:space-y-3">
                      <h4 className="font-bold text-base md:text-lg text-gray-800 dark:text-gray-100 tracking-tight">Flight Log</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {aircraftFlights
                          .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()) // Sort by newest first
                          .map((flight, flightIndex) => (
                          <div key={flight.flightId || flightIndex} className={cn(
                            "flex items-center justify-between",
                            "p-3",
                            "rounded-[12px]",
                            "bg-gray-50 dark:bg-gray-700",
                            "border-2 border-gray-200 dark:border-gray-600",
                            "hover:shadow-md transition-all duration-200"
                          )}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <Badge variant="outline" className={cn(
                                  "text-xs font-bold rounded-full",
                                  "bg-blue-100 dark:bg-blue-900/30",
                                  "text-blue-700 dark:text-blue-300",
                                  "border-none"
                                )}>
                                  {flight.origin} → {flight.destination}
                                </Badge>
                                {flight.originIsoCountry && flight.destinationIsoCountry && (
                                  <Badge variant="outline" className={cn(
                                    "text-xs rounded-full border-none font-bold text-white",
                                    flight.origin === "????" || flight.destination === "????" 
                                      ? "bg-gray-500" 
                                      : flight.originIsoCountry === flight.destinationIsoCountry 
                                        ? 'bg-purple-500 dark:bg-purple-600' 
                                        : 'bg-amber-500 dark:bg-amber-600'
                                  )}>
                                    {
                                    flight.origin === "????" || flight.destination === "????" ? 'Unknown' :
                                    flight.originIsoCountry === flight.destinationIsoCountry ? 'Domestic' : 'International'}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1.5">
                                {new Date(flight.created).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="flex gap-2 items-center flex-wrap">
                                <Badge variant="secondary" className={cn(
                                  "text-white text-xs rounded-full font-bold border-none",
                                  flight.server.toLowerCase().includes('casual') 
                                    ? 'bg-green-500 dark:bg-green-600' 
                                    : flight.server.toLowerCase().includes('training') 
                                      ? 'bg-blue-500 dark:bg-blue-600' 
                                      : flight.server.toLowerCase().includes('expert') 
                                        ? 'bg-red-500 dark:bg-red-600' 
                                        : 'bg-gray-500 dark:bg-gray-600'
                                )}>
                                    {flight.server || 'Unknown'}
                                </Badge>
                                {
                                  flight.origin !== "????" && flight.destination !== "????" && (
                                    <Link 
                                      className={cn(
                                        "text-xs px-3 py-1 rounded-full",
                                        "bg-gray-200 dark:bg-gray-600",
                                        "hover:bg-gray-300 dark:hover:bg-gray-500",
                                        "text-gray-700 dark:text-gray-200",
                                        "transition-all duration-200",
                                        "flex items-center gap-1 font-bold"
                                      )} 
                                      href={`/dashboard/flights/${flight.flightId}`} 
                                      target="_blank"
                                    >
                                      <Eye className="w-3 h-3" />
                                      View
                                    </Link>
                                  )
                                }
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                {Math.round(flight.distance || 0)} nm
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {convertMinutesToHours(Math.round(flight.totalTime || 0))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={cn(
                    "text-center py-8",
                    "bg-gray-50 dark:bg-gray-700",
                    "border-2 border-gray-200 dark:border-gray-600",
                    "rounded-[15px]"
                  )}>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No flight data available for this aircraft.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

      </div>

      <div className='flex flex-col items-center gap-1'>
        <span className='font-black text-gray-800 dark:text-gray-100 text-xl md:text-2xl tracking-tight'>
          {aircraft.count}
        </span>
        <span className='text-xs text-gray-600 dark:text-gray-400 font-bold'>
           {aircraft.count === 1 ? 'flight' : 'flights'}
        </span>
      </div>

    </section>
  )
}

export default FlightAircraftEntry;