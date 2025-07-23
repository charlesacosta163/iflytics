import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plane, Clock, Award, BarChart3 } from 'lucide-react'
import { getAllFlightRoutes, matchAircraftNameToImage } from '@/lib/cache/flightinsightsdata'
import Image from 'next/image'
import { Flight } from '@/lib/types'
import { getUser } from '@/lib/supabase/user-actions'

// Mock data - replace with your actual data fetching
const mockAircraftData = [
  {
    id: '1',
    aircraftName: 'Boeing 737-800',
    count: 45,
    totalTime: 2340,
    avgFlightTime: 52,
    lastUsed: '2024-01-15'
  },
  {
    id: '2', 
    aircraftName: 'Airbus A320',
    count: 32,
    totalTime: 1890,
    avgFlightTime: 59,
    lastUsed: '2024-01-12'
  },
  {
    id: '3',
    aircraftName: 'Boeing 787-9',
    count: 28,
    totalTime: 3420,
    avgFlightTime: 122,
    lastUsed: '2024-01-10'
  },
  {
    id: '4',
    aircraftName: 'Airbus A350',
    count: 15,
    totalTime: 2100,
    avgFlightTime: 140,
    lastUsed: '2024-01-08'
  },
  {
    id: '5',
    aircraftName: 'Boeing 777-300',
    count: 12,
    totalTime: 1680,
    avgFlightTime: 140,
    lastUsed: '2024-01-05'
  }
]

const convertMinutesToHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const FlightsAircraft = async ({ flights, user }: { flights: Flight[], user: any }) => {

  // ------------------------------ MOCK DATA STARTS HERE ------------------------------
  const totalFlights = mockAircraftData.reduce((acc, aircraft) => acc + aircraft.count, 0)
  const totalTime = mockAircraftData.reduce((acc, aircraft) => acc + aircraft.totalTime, 0)
  const mostUsedAircraft = mockAircraftData[0]
  const longestFlightAircraft = mockAircraftData.reduce((prev, current) => 
    (prev.avgFlightTime > current.avgFlightTime) ? prev : current
  )
 // ------------------------------ MOCK DATA ENDS HERE ------------------------------

  // Based on THIS Data for user flights
  const validFlights = flights.filter((flight) => {
    return (
      flight.totalTime > 5 && flight.originAirport && flight.destinationAirport
    );
  });

  // Get the user ID for the cache key
  const userMetadata = user.user_metadata;

  const shortenNumber = (number: number) => {
    // 71200 -> 71.2k
    if (number < 1000) {
      return number.toLocaleString();
    } else if (number < 1000000) {
      return (number / 1000).toFixed(1) + "k";
    } else if (number < 1000000000) {
      return (number / 1000000).toFixed(1) + "m";
    } else {
      return (number / 1000000000).toLocaleString() + "b";
    }
  };
  // Get the flight routes with distances with the user ID for the cache key
  // const startTime = Date.now(); --> Debugging
  const routesWithDistances = await getAllFlightRoutes(validFlights, user.id);
  // const endTime = Date.now(); --> Debugging

 // console.log(routesWithDistances[0])
  {/* sample route with distance data
    {
  flightId: '931999ef-911f-4a42-8f65-f7ec060dd1b8',
  created: '2025-07-21T02:41:02.727818Z',
  origin: 'KLAX',
  originIsoCountry: 'US',
  originContinent: 'NA',
  originCoordinates: { latitude: 33.942501, longitude: -118.407997 },
  destination: 'PHKO',
  destinationIsoCountry: 'US',
  destinationContinent: 'NA',
  destinationCoordinates: { latitude: 19.738783, longitude: -156.045603 },
  distance: 2173,
  totalTime: 295.57333,
  aircraftId: '64568366-b72c-47bd-8bf6-6fdb81b683f9',
  server: 'Expert'
} */}

  // Chore: Create a function to get the overview values data
  // const uniqueAircraftIds = [...new Set(routesWithDistances.map((route) => route.aircraftId))]



  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Unique Aircraft Used</span>
            </div>
            <div className="text-2xl font-bold">{0 || "N/A"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Total Flights</span>
            </div>
            <div className="text-2xl font-bold">{totalFlights.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Total Time</span>
            </div>
            <div className="text-2xl font-bold">{convertMinutesToHours(totalTime)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Most Used</span>
            </div>
            <div className="text-lg font-bold">{mostUsedAircraft.aircraftName.split(' ')[1]}</div>
          </CardContent>
        </Card>
      </div>

      {/* Aircraft Usage List */}
      <Card>
        <CardHeader>
          <CardTitle>Aircraft Usage Analysis</CardTitle>
          <CardDescription>Your most frequently used aircraft</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAircraftData.map((aircraft, index) => {
            const usagePercentage = (aircraft.count / totalFlights) * 100
            
            return (
              <div key={aircraft.id} className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50/50">
                {/* Aircraft Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={`/images/aircraft/${matchAircraftNameToImage(aircraft.aircraftName)}`}
                    alt={aircraft.aircraftName}
                    className="w-16 h-12 object-contain rounded-md bg-white p-1"
                    width={64}
                    height={48}
                  />
                </div>

                {/* Aircraft Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {aircraft.aircraftName}
                    </h3>
                    {index === 0 && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Most Used
                      </Badge>
                    )}
                    {aircraft.avgFlightTime === longestFlightAircraft.avgFlightTime && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Long Haul
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">{aircraft.count}</span> flights
                    </div>
                    <div>
                      <span className="font-medium">{convertMinutesToHours(aircraft.totalTime)}</span> total
                    </div>
                    <div>
                      <span className="font-medium">{convertMinutesToHours(aircraft.avgFlightTime)}</span> avg
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Usage: {usagePercentage.toFixed(1)}%</span>
                      <span>Last used: {new Date(aircraft.lastUsed).toLocaleDateString()}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                  </div>
                </div>

                {/* Flight Count Badge */}
                <div className="flex-shrink-0 text-center">
                  <div className="text-2xl font-bold text-blue-600">{aircraft.count}</div>
                  <div className="text-xs text-gray-500">flights</div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Aircraft Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aircraft Categories</CardTitle>
            <CardDescription>Distribution by aircraft family</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { family: 'Boeing 737 Family', count: 45, color: 'bg-blue-500' },
              { family: 'Airbus A320 Family', count: 32, color: 'bg-green-500' },
              { family: 'Boeing 787 Family', count: 28, color: 'bg-purple-500' },
              { family: 'Airbus A350 Family', count: 15, color: 'bg-yellow-500' },
              { family: 'Boeing 777 Family', count: 12, color: 'bg-red-500' }
            ].map((category) => (
              <div key={category.family} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  <span className="font-medium">{category.family}</span>
                </div>
                <div className="text-sm text-gray-600">{category.count} flights</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Aircraft efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Most Efficient (time/flight)</span>
                <span className="font-medium">Boeing 737-800</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Longest Average Flight</span>
                <span className="font-medium">Airbus A350</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Most Versatile</span>
                <span className="font-medium">Boeing 787-9</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Favorite Aircraft</span>
                <span className="font-medium">Boeing 737-800</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600 mb-2">Fleet Diversity Score</div>
              <Progress value={75} className="h-3" />
              <div className="text-xs text-gray-500 mt-1">You fly {mockAircraftData.length} different aircraft types</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FlightsAircraft