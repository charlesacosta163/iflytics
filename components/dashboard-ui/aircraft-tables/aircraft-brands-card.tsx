import { Card } from '@/components/ui/card'
import { aircraftBrands } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LuTicketsPlane } from 'react-icons/lu';
import { convertMinutesToHours } from '@/lib/utils'
import { PiStarFill } from 'react-icons/pi';
import { aircraftBrandsCompliments } from '@/lib/data'
import { FaQuestionCircle } from 'react-icons/fa';
import Image from "next/image"
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata"

const getBrandForAircraft = (aircraftName: string): string => {
  for (const [brand, identifiers] of Object.entries(aircraftBrands)) {
    if (identifiers.some(identifier => 
      aircraftName.toLowerCase().includes(identifier.toLowerCase())
    )) {
      return brand;
    }
  }
  return "Other";
};

const AircraftBrandsCard = ({allAircraft}: {allAircraft: any}) => {
  
  const aircraftBrandsCount = allAircraft.reduce((acc: any[], aircraft: any) => {
    const matchedBrand = Object.entries(aircraftBrands).find(([brand, identifiers]) => {
      return identifiers.some(identifier => 
        aircraft.name.toLowerCase().includes(identifier.toLowerCase())
      );
    });

    if (matchedBrand) {
      const [brandName] = matchedBrand;
      const existingBrand = acc.find(item => item.brand === brandName);
      
      if (existingBrand) {
        existingBrand.count += aircraft.count;
        existingBrand.totalDistance += aircraft.totalDistance || 0;
        existingBrand.totalTime += aircraft.totalTime || 0;
        existingBrand.aircraftList.push(aircraft.name); // Add back aircraft list
      } else {
        acc.push({ 
          brand: brandName, 
          count: aircraft.count,
          totalDistance: aircraft.totalDistance || 0,
          totalTime: aircraft.totalTime || 0,
          aircraftList: [aircraft.name] // Add back aircraft list
        });
      }
    } else {
      const otherBrand = acc.find(item => item.brand === "Other");
      if (otherBrand) {
        otherBrand.count += aircraft.count;
        otherBrand.totalDistance += aircraft.totalDistance || 0;
        otherBrand.totalTime += aircraft.totalTime || 0;
        otherBrand.aircraftList.push(aircraft.name); // Add back aircraft list
      } else {
        acc.push({ 
          brand: "Other", 
          count: aircraft.count,
          totalDistance: aircraft.totalDistance || 0,
          totalTime: aircraft.totalTime || 0,
          aircraftList: [aircraft.name] // Add back aircraft list
        });
      }
    }
    
    return acc;
  }, []);

  // Sort by count (highest first) and get top brand
  const sortedBrands = aircraftBrandsCount.sort((a: any, b: any) => b.count - a.count);
  const topBrand = sortedBrands[0];
  
  // Get random compliment for the top brand
  const getRandomCompliment = (brand: string) => {
    const compliments = aircraftBrandsCompliments[brand as keyof typeof aircraftBrandsCompliments] || aircraftBrandsCompliments["Other"];
    return compliments[Math.floor(Math.random() * compliments.length)];
  };

  // Helper function to format distance
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance.toFixed(0)} nm`;
    } else {
      return `${(distance / 1000).toFixed(1)}k nm`;
    }
  };
    
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Aircraft Brands Statistics Card */}
      <Card className="p-6 flex-1">
        <div className="space-y-4">
          <header className="text-center pb-2 border-b">
            <h3 className="text-xl font-bold tracking-tight">Aircraft Brands</h3>
            <p className="text-sm dark:text-gray-300 text-gray-500">Your flight distribution by manufacturer</p>
          </header>
          
          <div className="space-y-3">
            {sortedBrands.map((brandData: any, index: number) => {
              const percentage = ((brandData.count / allAircraft.reduce((sum: number, aircraft: any) => sum + aircraft.count, 0)) * 100).toFixed(1);
              
              return (
                <div key={brandData.brand} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    
                    {/* Dialog for Aircraft List */}
                    <Dialog>
                      <DialogTrigger>
                        <FaQuestionCircle className="w-4 h-4 text-gray-400 hover:text-gray-500" />
                      </DialogTrigger>
                      <DialogContent className="max-w-md bg-gray text-light border-none shadow-none">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span className="text-lg font-bold">{brandData.brand}</span>
                            <Badge variant="secondary" className="text-xs rounded-full bg-gray-600/25 text-light border-none">
                              {brandData.aircraftList.length} aircraft
                            </Badge>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-3">
                          <div className="text-sm dark:text-gray-300 text-gray-200">
                            Aircraft you've flown from this manufacturer:
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                            {brandData.aircraftList.map((aircraftName: string, aircraftIndex: number) => (
                              <div key={aircraftIndex} className="flex items-center gap-3 p-3 bg-gray-600/15 text-light rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm leading-tight">
                                    {aircraftName}
                                  </div>
                                  <Badge variant="outline" className="text-xs mt-1 rounded-full border-none bg-gray-600/25 dark:bg-gray-700/25 text-light">
                                    {allAircraft.find((a: any) => a.name === aircraftName)?.count || 0} {allAircraft.find((a: any) => a.name === aircraftName)?.count === 1 ? 'flight' : 'flights'}
                                  </Badge>
                                </div>
                                <div className="flex-shrink-0">
                                  <Image 
                                    src={`/images/aircraft/${matchAircraftNameToImage(aircraftName) || "placeholder.png"}`} 
                                    alt={aircraftName} 
                                    width={60} 
                                    height={40}
                                    className="rounded"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t text-xs text-gray-300">
                            Total flights with {brandData.brand}: <b>{brandData.count}</b>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium dark:text-gray-300 text-gray-600">#{index + 1}</span>
                      <span className="font-semibold">{brandData.brand}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {percentage}%
                    </Badge>
                    <span className="text-sm font-medium dark:text-gray-300 text-gray-600">
                      {brandData.count} {brandData.count === 1 ? 'flight' : 'flights'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Compliment Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-400 to-indigo-700 border-none flex-1 md:self-start text-light relative overflow-hidden">
        {/* Background Airplane Icon */}
        <LuTicketsPlane className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-112 h-112 text-light opacity-10" />

        <div className="space-y-4 text-center relative z-10">
          <header className="pb-2">
            <h3 className="text-xl font-bold tracking-tight">Pilot's Recognition</h3>
            <p className="text-sm">Based on your most flown brand</p>
          </header>
          
          {topBrand && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-indigo-200">
                <div className="flex flex-col gap-1">
                  <Badge className="mb-2 text-lg font-bold tracking-tight bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 rounded-full px-4 py-0.5 flex items-center gap-2 dark:text-light">
                  <PiStarFill className="text-lg text-light" /> Top Brand
                  </Badge>
                  <span className="text-5xl font-black clip-text text-transparent self-start bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-700">
                    {topBrand.brand}
                  </span>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs bg-gradient-to-br from-blue-500 to-indigo-700 text-light border-none rounded-full">
                      Distance: {formatDistance(topBrand.totalDistance)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-gradient-to-br from-indigo-500 to-blue-700 text-light border-none rounded-full">
                      Time: {convertMinutesToHours(Math.round(topBrand.totalTime))}
                    </Badge>
                  </div>
                </div>
                <span className="flex flex-col items-center justify-center text-sm font-medium text-blue-500">
                  <span className="text-3xl font-black text-blue-700">
                    {topBrand.count}
                  </span> flights
                </span>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-[#1E3B70] to-[#29539B] rounded-lg text-light font-semibold">
                <p className="text-lg leading-relaxed text-center font-mono">
                  {getRandomCompliment(topBrand.brand)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default AircraftBrandsCard