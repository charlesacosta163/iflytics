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
import { convertMinutesToHours, cn } from '@/lib/utils'
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
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full">
      {/* Aircraft Brands Statistics Card */}
      <Card className={cn(
        "p-4 md:p-6 flex-1",
        "bg-gray-50 dark:bg-gray-800",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[20px] md:rounded-[25px]"
      )}>
        <div className="space-y-4">
          <header className={cn(
            "text-center pb-3 md:pb-4 mb-2",
            "border-b-2 border-gray-200 dark:border-gray-700"
          )}>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Aircraft Brands</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Your flight distribution by manufacturer</p>
          </header>
          
          <div className="space-y-2 md:space-y-3">
            {sortedBrands.map((brandData: any, index: number) => {
              const percentage = ((brandData.count / allAircraft.reduce((sum: number, aircraft: any) => sum + aircraft.count, 0)) * 100).toFixed(1);
              
              return (
                <div key={brandData.brand} className={cn(
                  "flex items-center justify-between",
                  "p-3 md:p-4",
                  "rounded-[15px] md:rounded-[20px]",
                  "bg-white dark:bg-gray-700",
                  "hover:bg-gray-100 dark:hover:bg-gray-600",
                  "transition-all duration-200",
                  "border-2 border-gray-200 dark:border-gray-600",
                  "hover:shadow-md"
                )}>
                  <div className="flex items-center gap-2 md:gap-3">
                    
                    {/* Dialog for Aircraft List */}
                    <Dialog>
                      <DialogTrigger className={cn(
                        'flex items-center gap-1.5 md:gap-2',
                        'bg-blue-600 hover:bg-blue-700',
                        'dark:bg-blue-500 dark:hover:bg-blue-600',
                        'transition-colors',
                        'text-white',
                        'rounded-[10px]',
                        'p-2',
                        'text-xs md:text-sm font-bold'
                      )}>
                        <FaQuestionCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="sm:block hidden">More</span>
                      </DialogTrigger>
                      <DialogContent className={cn(
                        "max-w-md",
                        "bg-white dark:bg-gray-800",
                        "border-2 border-gray-200 dark:border-gray-700",
                        "rounded-[20px]"
                      )}>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">{brandData.brand}</span>
                            <Badge variant="secondary" className={cn(
                              "text-xs rounded-full font-bold border-none",
                              "bg-blue-100 dark:bg-blue-900/30",
                              "text-blue-700 dark:text-blue-300"
                            )}>
                              {brandData.aircraftList.length} aircraft
                            </Badge>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-3 md:space-y-4">
                          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Aircraft you've flown from this manufacturer:
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 md:gap-3 max-h-64 overflow-y-auto">
                            {brandData.aircraftList.map((aircraftName: string, aircraftIndex: number) => (
                              <div key={aircraftIndex} className={cn(
                                "flex items-center gap-3 p-3",
                                "bg-gray-50 dark:bg-gray-700",
                                "border-2 border-gray-200 dark:border-gray-600",
                                "rounded-[12px]",
                                "hover:shadow-sm transition-shadow duration-200"
                              )}>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xs md:text-sm leading-tight text-gray-800 dark:text-gray-100">
                                    {aircraftName}
                                  </div>
                                  <Badge variant="outline" className={cn(
                                    "text-xs mt-1 rounded-full border-none font-bold",
                                    "bg-blue-100 dark:bg-blue-900/30",
                                    "text-blue-700 dark:text-blue-300"
                                  )}>
                                    {allAircraft.find((a: any) => a.name === aircraftName)?.count || 0} {allAircraft.find((a: any) => a.name === aircraftName)?.count === 1 ? 'flight' : 'flights'}
                                  </Badge>
                                </div>
                                <div className="flex-shrink-0">
                                  <Image 
                                    src={`/images/aircraft/${matchAircraftNameToImage(aircraftName) || "placeholder.png"}`} 
                                    alt={aircraftName} 
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
                            "text-gray-700 dark:text-gray-300 font-medium"
                          )}>
                            Total flights with {brandData.brand}: <b className="text-gray-900 dark:text-gray-100">{brandData.count}</b>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">#{index + 1}</span>
                      <span className="font-bold text-sm md:text-base text-gray-800 dark:text-gray-100 tracking-tight">{brandData.brand}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn(
                      "text-xs font-bold rounded-full",
                      "bg-amber-100 dark:bg-amber-900/30",
                      "text-amber-700 dark:text-amber-300"
                    )}>
                      {percentage}%
                    </Badge>
                    <span className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300">
                      {brandData.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Compliment Card */}
      <Card className={cn(
        "p-4 md:p-6 flex-1 md:self-start relative overflow-hidden",
        "bg-gradient-to-br from-blue-500 to-indigo-600",
        "dark:from-blue-600 dark:to-indigo-700",
        "border-2 border-blue-400 dark:border-blue-700",
        "rounded-[20px] md:rounded-[25px]",
        "text-white"
      )}>
        {/* Background Airplane Icon */}
        <LuTicketsPlane className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-112 h-112 text-white opacity-10" />

        <div className="space-y-4 text-center relative z-10">
          <header className={cn(
            "pb-3 md:pb-4 mb-2",
            "border-b-2 border-white/30"
          )}>
            <h3 className="text-lg md:text-xl font-bold tracking-tight">Pilot's Recognition</h3>
            <p className="text-xs md:text-sm font-semibold">Based on your most flown brand</p>
          </header>
          
          {topBrand && (
            <div className="space-y-3 md:space-y-4">
              <div className={cn(
                "flex items-center justify-between",
                "p-3 md:p-4",
                "bg-white dark:bg-white/95",
                "rounded-[15px] md:rounded-[20px]",
                "border-2 border-white/50"
              )}>
                <div className="flex flex-col gap-1 md:gap-2">
                  <Badge className={cn(
                    "mb-2 text-sm md:text-base font-black tracking-tight",
                    "bg-indigo-600 hover:bg-indigo-700",
                    "rounded-full px-3 md:px-4 py-1",
                    "flex items-center gap-1.5 md:gap-2",
                    "text-white w-fit"
                  )}>
                    <PiStarFill className="text-base md:text-lg" /> Top Brand
                  </Badge>
                  <span className={cn(
                    "text-3xl md:text-5xl font-black",
                    "text-transparent self-start",
                    "bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-700",
                    "tracking-tight"
                  )}>
                    {topBrand.brand}
                  </span>

                  <div className="flex flex-wrap gap-1.5 md:gap-2 mt-1 md:mt-2">
                    <Badge variant="secondary" className={cn(
                      "text-xs md:text-sm font-bold rounded-full border-none",
                      "bg-gradient-to-br from-blue-500 to-indigo-700",
                      "text-white"
                    )}>
                      {formatDistance(topBrand.totalDistance)}
                    </Badge>
                    <Badge variant="secondary" className={cn(
                      "text-xs md:text-sm font-bold rounded-full border-none",
                      "bg-gradient-to-br from-indigo-500 to-blue-700",
                      "text-white"
                    )}>
                      {convertMinutesToHours(Math.round(topBrand.totalTime))}
                    </Badge>
                  </div>
                </div>
                <span className="flex flex-col items-center justify-center text-xs md:text-sm font-bold text-blue-600">
                  <span className="text-2xl md:text-3xl font-black text-blue-700">
                    {topBrand.count}
                  </span> flights
                </span>
              </div>
              
              <div className={cn(
                "p-3 md:p-4",
                "bg-gradient-to-br from-indigo-700 to-blue-800",
                "dark:from-indigo-800 dark:to-blue-900",
                "rounded-[15px] md:rounded-[20px]",
                "text-white font-bold",
                "border-2 border-indigo-500/30"
              )}>
                <p className="text-sm md:text-base leading-relaxed text-center">
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