import { matchATCTypeToTitle } from '@/lib/actions'
import React from 'react'
import { Accordion, AccordionTrigger, AccordionItem, AccordionContent } from './ui/accordion'
import { TbBuildingBroadcastTower } from "react-icons/tb";


const AirportWithATCCard = ({groupedAirports, atisDataByAirport}: {groupedAirports: any, atisDataByAirport: any}) => {
  return (
    <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 mb-6 mt-4">
                <div className="flex items-center gap-2">

              <TbBuildingBroadcastTower className="w-6 h-6 text-green-600 animate-pulse" />
              <h3 className="text-xl font-bold text-gray-700">
                Active ATC
              </h3>
                </div>
              <span className="text-sm bg-gray text-light font-bold px-2 py-1 rounded-full">
                Expert Server
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedAirports.map((airport: any, index: number) => (
                <div
                  key={airport.name || index}
                  className="flex flex-col bg-gradient-to-r from-gray-700 to-gray-800 text-light rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow self-start"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-2xl text-white">
                      {airport.name || "Unknown"}
                    </h4>
                    <span className="text-xs bg-green-300 text-green-800 px-2 py-1 rounded-full font-bold">
                      {airport.frequencyData.length} Active
                    </span>
                  </div>

                  {/* Controllers List */}
                  <div className="flex flex-col gap-2 mb-3">
                    {airport.frequencyData.map((frequency: any, freqIndex: number) => (
                      <div key={frequency.frequencyId || freqIndex} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-green-600 min-w-[36px] h-9 text-xs rounded-full text-white flex items-center justify-center font-bold">
                            {matchATCTypeToTitle(frequency.type.toString())}
                          </span>
                          <span className="font-medium text-light">
                            {frequency.username}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(frequency.startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status */}
                  <div className="mt-auto pt-2 border-t border-gray-600">
                    <span className="text-xs text-gray-400">
                      Status: Online • {airport.frequencyData.length} position{airport.frequencyData.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* ATIS Accordion */}
                  <div className="mt-3">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="atis" className="border-gray-600">
                        <AccordionTrigger className="text-white hover:text-gray-300 py-2">
                          ATIS Information
                        </AccordionTrigger>
                        <AccordionContent className="font-mono bg-gray-700 text-light rounded-lg p-3 mt-2">
                          <div className="text-sm text-gray-300 leading-relaxed">
                            {atisDataByAirport[airport.name] ? (
                              <div className="break-all">
                                {atisDataByAirport[airport.name]}
                              </div>
                            ) : (
                              <div className="text-gray-500 italic">
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
            <div className="mt-8 bg-gradient-to-r from-gray to-dark rounded-xl p-6">
              <h4 className="text-2xl tracking-tight font-bold text-light mb-4 text-center">
                Live Statistics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="rounded-lg p-3">
                  <div className="text-2xl font-bold text-light">
                    {groupedAirports.length}
                  </div>
                  <div className="text-sm text-gray-300">Active Airports</div>
                </div>
                <div className="rounded-lg p-3">
                  <div className="text-2xl font-bold text-light">
                    {groupedAirports.reduce((total: number, airport: any) => total + airport.frequencyData.length, 0)}
                  </div>
                  <div className="text-sm text-gray-300">Total Positions</div>
                </div>
                <div className="rounded-lg p-3">
                  <div className="text-2xl font-bold text-light">
                    {new Set(groupedAirports.flatMap((airport: any) => 
                      airport.frequencyData.map((freq: any) => freq.username)
                    )).size}
                  </div>
                  <div className="text-sm text-gray-300">Unique Controllers</div>
                </div>
                <div className="rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">Live</div>
                  <div className="text-sm text-gray-300">Status</div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default AirportWithATCCard