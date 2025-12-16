import { matchATCTypeToTitle } from '@/lib/actions'
import React from 'react'
import { Accordion, AccordionTrigger, AccordionItem, AccordionContent } from './ui/accordion'
import { TbBuildingBroadcastTower } from "react-icons/tb";
import { cn } from '@/lib/utils';


const AirportWithATCCard = ({groupedAirports, atisDataByAirport}: {groupedAirports: any, atisDataByAirport: any}) => {
  return (
    <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 mb-4 md:mb-6 mt-4 md:mt-6">
                <div className="flex items-center gap-2">

              <TbBuildingBroadcastTower className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-500 animate-pulse" />
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
                Active ATC
              </h3>
                </div>
              <span className={cn(
                "text-xs md:text-sm",
                "bg-gray-700 dark:bg-gray-600",
                "text-white",
                "font-bold px-3 py-1",
                "rounded-full"
              )}>
                Expert Server
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {groupedAirports.map((airport: any, index: number) => (
                <div
                  key={airport.name || index}
                  className={cn(
                    "flex flex-col",
                    "bg-gradient-to-r from-gray-100 to-gray-200",
                    "dark:from-gray-700 dark:to-gray-800",
                    "text-gray-800 dark:text-gray-100",
                    "rounded-[20px] md:rounded-[25px]",
                    "p-4 md:p-5",
                    "border-2 border-gray-200 dark:border-gray-700",
                    "shadow-sm hover:shadow-md transition-shadow",
                    "self-start"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xl md:text-2xl tracking-tight text-gray-800 dark:text-white">
                      {airport.name || "Unknown"}
                    </h4>
                    <span className={cn(
                      "text-xs md:text-sm",
                      "bg-green-100 dark:bg-green-300",
                      "text-green-700 dark:text-green-800",
                      "px-2 md:px-3 py-1",
                      "rounded-full font-bold"
                    )}>
                      {airport.frequencyData.length} Active
                    </span>
                  </div>

                  {/* Controllers List */}
                  <div className="flex flex-col gap-2 mb-3">
                    {airport.frequencyData.map((frequency: any, freqIndex: number) => (
                      <div key={frequency.frequencyId || freqIndex} className="flex items-center justify-between text-xs md:text-sm py-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "bg-green-600 dark:bg-green-500",
                            "min-w-[36px] h-9",
                            "text-xs rounded-full",
                            "text-white",
                            "flex items-center justify-center font-bold"
                          )}>
                            {matchATCTypeToTitle(frequency.type.toString())}
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {frequency.username}
                          </span>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                          {new Date(frequency.startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status */}
                  <div className={cn(
                    "mt-auto pt-2",
                    "border-t border-gray-300 dark:border-gray-600"
                  )}>
                    <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Status: Online • {airport.frequencyData.length} position{airport.frequencyData.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* ATIS Accordion */}
                  <div className="mt-3">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="atis" className={cn(
                        "border-gray-300 dark:border-gray-600"
                      )}>
                        <AccordionTrigger className={cn(
                          "text-gray-800 dark:text-white",
                          "hover:text-gray-600 dark:hover:text-gray-300",
                          "py-2 text-sm md:text-base font-semibold"
                        )}>
                          ATIS Information
                        </AccordionTrigger>
                        <AccordionContent className={cn(
                          "font-mono",
                          "bg-gray-200 dark:bg-gray-700",
                          "text-gray-800 dark:text-gray-100",
                          "rounded-[15px] md:rounded-[20px]",
                          "p-3 mt-2"
                        )}>
                          <div className="text-xs md:text-sm leading-relaxed">
                            {atisDataByAirport[airport.name] ? (
                              <div className="break-all text-gray-700 dark:text-gray-300">
                                {atisDataByAirport[airport.name]}
                              </div>
                            ) : (
                              <div className="text-gray-500 dark:text-gray-500 italic">
                                No ATIS information available
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Summary Stats */}
            <div className={cn(
              "mt-6 md:mt-8",
              "bg-gradient-to-r from-gray-100 to-gray-200",
              "dark:from-gray-700 dark:to-gray-800",
              "rounded-[20px] md:rounded-[25px]",
              "p-4 md:p-6",
              "border-2 border-gray-200 dark:border-gray-700"
            )}>
              <h4 className="text-xl md:text-2xl tracking-tight font-bold text-gray-800 dark:text-white mb-4 text-center">
                Live Statistics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
                <div className={cn(
                  "rounded-[15px] md:rounded-[20px]",
                  "p-3 md:p-4",
                  "bg-white/50 dark:bg-gray-600/30"
                )}>
                  <div className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
                    {groupedAirports.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">Active Airports</div>
                </div>
                <div className={cn(
                  "rounded-[15px] md:rounded-[20px]",
                  "p-3 md:p-4",
                  "bg-white/50 dark:bg-gray-600/30"
                )}>
                  <div className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
                    {groupedAirports.reduce((total: number, airport: any) => total + airport.frequencyData.length, 0)}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">Total Positions</div>
                </div>
                <div className={cn(
                  "rounded-[15px] md:rounded-[20px]",
                  "p-3 md:p-4",
                  "bg-white/50 dark:bg-gray-600/30"
                )}>
                  <div className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
                    {new Set(groupedAirports.flatMap((airport: any) => 
                      airport.frequencyData.map((freq: any) => freq.username)
                    )).size}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">Unique Controllers</div>
                </div>
                <div className={cn(
                  "rounded-[15px] md:rounded-[20px]",
                  "p-3 md:p-4",
                  "bg-white/50 dark:bg-gray-600/30"
                )}>
                  <div className="text-xl md:text-2xl font-bold tracking-tight text-green-600 dark:text-green-500">Live</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">Status</div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default AirportWithATCCard