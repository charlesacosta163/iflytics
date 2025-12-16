import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAllAircraft,
  getFullAirportInfo,
  getAirportStatus,
  getAirportATIS,
  getAllAirportsWithActiveATC,
} from "@/lib/actions";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import AirportDetails from "@/components/airport-details";
import AirportWithATCCard from "@/components/airport-with-atc-card";
import { FaPlane } from "react-icons/fa";
import { Metadata } from 'next'
import { TbBuildingAirport, TbBuildingBroadcastTower } from "react-icons/tb";
import { cn } from "@/lib/utils";

let maintenanceMode = false;

export const metadata: Metadata = {
  title: "Directory - IFlytics | Your Infinite Flight Statistics",
  description: "View the directory of airports and aircraft in Infinite Flight. Join thousands of pilots exploring their aviation data.",
  keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history, iflytics directory",
}


const DirectoryPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ airport?: string }>;
}) => {
  // Safe aircraft fetching with error handling
  let aircraft = null;
  try {
    aircraft = await getAllAircraft();
  } catch (error) {
    console.error("Failed to fetch aircraft:", error);
    aircraft = { result: [] }; // Fallback to empty array
  }

  const params = await searchParams;
  const airport = params.airport;

  let airportData = null;

  if (airport) {
    try {
      airportData = await getFullAirportInfo(airport);

      // If airport info fails, stop here
      if (!airportData || airportData.statusCode) {
      } else {
        let airportStatus = null;
        try {
          airportStatus = await getAirportStatus(airport);
        } catch (statusError) {
          airportStatus = {
            inboundFlightsCount: 0,
            outboundFlightsCount: 0,
            atcFacilities: [],
          };
        }

        let airportATIS = "No ATIS available";
        try {
          airportATIS = await getAirportATIS(airport);
        } catch (atisError) {
          airportATIS = "No ATIS available";
        }

        airportData = {
          ...airportData,
          ...airportStatus,
          atis: airportATIS || "No ATIS available",
        };
      }
    } catch (error) {
      console.error("💥 Unexpected error:", error);
      airportData = {
        statusCode: 500,
        error: "Failed to fetch airport data",
      };
    }
  }

  const activeAtc = await getAllAirportsWithActiveATC();

  function groupATCByAirport(atcData: any[]) {
    // Get unique airport names (ICAO codes)
    const uniqueAirports = [
      ...new Set(atcData.map((item) => item.airportName)),
    ];

    // Group data by airport with your specified structure
    const groupedAirports = uniqueAirports.map((airportName) => {
      // Find all ATC entries for this airport
      const frequencyData = atcData.filter(
        (item) => item.airportName === airportName
      );

      return {
        name: airportName,
        frequencyData: frequencyData,
      };
    });

    return groupedAirports;
  }

  const groupedAirports = groupATCByAirport(activeAtc);

  const activeAtcWithATIS = await Promise.all(
    activeAtc.map(async (airport: any) => {
      const atis = await getAirportATIS(airport.airportName);
      return { ...airport, atis };
    })
  );
  
  // Convert to key-value structure
  const atisDataByAirport = activeAtcWithATIS.reduce((acc, airport) => {
    acc[airport.airportName] = airport.atis;
    return acc;
  }, {});
  
  const Component = () => {
    if (!airport) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Enter an airport ICAO code to search</p>
        </div>
      );
    }

    if (!airportData) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 font-bold text-xl md:text-2xl tracking-tight">
            Failed to load airport data
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Please try again later</p>
        </div>
      );
    }

    if (airportData.statusCode === 404) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 font-bold text-xl md:text-2xl tracking-tight">
            Airport "{airport.toUpperCase()}" not found
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            Please check the ICAO code and try again
          </p>
        </div>
      );
    }

    if (airportData.statusCode === 500 || airportData.error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 font-bold text-xl md:text-2xl tracking-tight">Server Error</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            {airportData.error || "Unable to fetch airport data at this time"}
          </p>
        </div>
      );
    }

    return <AirportDetails airportData={airportData} />;
  };

  return (
    <div className="p-4 md:p-6 max-w-[1000px] w-full mx-auto">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-800 dark:text-gray-100 flex gap-2 items-center">
        Directory
      </h1>

      <Tabs defaultValue="airport" className="!w-full">
        <TabsList className={cn(
          "mt-4 md:mt-6 w-full",
          "bg-gray-200 dark:bg-gray-700",
          "p-1 rounded-[20px] md:rounded-[25px]"
        )}>
          <TabsTrigger
            value="airport"
            className={cn(
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=inactive]:bg-transparent",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-400",
              "transition-all duration-200",
              "rounded-[15px] md:rounded-[20px]",
              "flex gap-2 items-center",
              "font-semibold"
            )}
          >
            <TbBuildingAirport className="w-5 h-5 md:w-6 md:h-6" />
            Airport
          </TabsTrigger>
          <TabsTrigger
            value="aircraft"
            className={cn(
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=inactive]:bg-transparent",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-400",
              "transition-all duration-200",
              "rounded-[15px] md:rounded-[20px]",
              "flex gap-2 items-center",
              "font-semibold"
            )}
          >
            <FaPlane className="w-5 h-5 md:w-6 md:h-6" />
            Aircraft
          </TabsTrigger>
          <TabsTrigger
            value="airport-list"
            className={cn(
              "data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600",
              "data-[state=active]:text-gray-800 data-[state=active]:dark:text-white",
              "data-[state=inactive]:bg-transparent",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-400",
              "transition-all duration-200",
              "rounded-[15px] md:rounded-[20px]",
              "flex gap-2 items-center",
              "font-semibold"
            )}
          >
            <TbBuildingBroadcastTower className="w-5 h-5 md:w-6 md:h-6 text-green-500 animate-pulse" />
            Active ATC
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aircraft">
          <div className="flex gap-2 items-center mt-4 md:mt-6 mb-4 md:mb-6">
            <FaPlane className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-gray-800 dark:text-gray-200 text-lg md:text-xl font-bold tracking-tight">
              All Aircraft ({aircraft.result.length})
            </h2>
          </div>

          {aircraft && aircraft.result && aircraft.result.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {aircraft.result.map((aircraft: any) => (
                <Card
                  key={aircraft.id}
                  className={cn(
                    "flex md:flex-row flex-col gap-3 md:gap-4 justify-between items-center",
                    "bg-gradient-to-br from-gray-100 to-gray-200",
                    "dark:from-gray-800 dark:to-gray-900",
                    "p-4 md:p-5",
                    "rounded-[20px] md:rounded-[25px]",
                    "border-2 border-gray-200 dark:border-gray-700",
                    "hover:scale-[1.02] transition-transform duration-200"
                  )}
                >
                  <Image
                    src={`/images/aircraft/${matchAircraftNameToImage(
                      aircraft.name
                    )}`}
                    alt={aircraft.name}
                    width={200}
                    height={200}
                    className="w-[150px] md:w-[200px] h-auto"
                  />
                  <span className="text-lg md:text-2xl font-black tracking-tight text-gray-800 dark:text-white text-center md:text-right">
                    {aircraft.name}
                  </span>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Unable to load aircraft data</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="airport">

          {maintenanceMode ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">This feature is currently under maintenance, please check back later.</p>
            </div>
          ) : (
          <div className="flex flex-col gap-4 md:gap-6">
            <Card className={cn(
              "p-4 md:p-6",
              "bg-gray-50 dark:bg-gray-800",
              "border-2 border-gray-200 dark:border-gray-700",
              "rounded-[20px] md:rounded-[25px]"
            )}>
              <h2 className="text-xl md:text-2xl tracking-tight font-bold mb-3 md:mb-4 flex gap-2 items-center text-gray-800 dark:text-white">
                <TbBuildingAirport className="w-5 h-5 md:w-6 md:h-6" />
                Enter an airport ICAO code
              </h2>
              <form action="/directory" className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  name="airport"
                  placeholder="Enter ICAO code (e.g., KSFO)"
                  autoComplete="off"
                  maxLength={4}
                  minLength={4}
                  className={cn(
                    "flex-1 px-4 py-2 md:py-3",
                    "bg-white dark:bg-gray-700",
                    "text-gray-800 dark:text-white",
                    "border-2 border-gray-300 dark:border-gray-600",
                    "outline-none rounded-[15px] md:rounded-[20px]",
                    "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                    "focus:border-transparent",
                    "text-sm md:text-base font-medium",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  )}
                  defaultValue={(airport as string) || ""}
                  required
                />
                <button
                  type="submit"
                  className={cn(
                    "px-6 py-2 md:py-3",
                    "bg-blue-600 hover:bg-blue-700",
                    "dark:bg-blue-500 dark:hover:bg-blue-600",
                    "text-white text-sm md:text-base font-bold",
                    "rounded-[15px] md:rounded-[20px]",
                    "transition-colors duration-200"
                  )}
                >
                  Search
                </button>
              </form>

              {airport && (
                <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mt-3 block">
                  You Searched for:{" "}
                  <b className="text-gray-800 dark:text-white">{airport.toUpperCase()}</b>
                </span>
              )}
            </Card>

            <Component />
          </div>
          )}
        </TabsContent>

        <TabsContent value="airport-list">
          <AirportWithATCCard groupedAirports={groupedAirports} atisDataByAirport={atisDataByAirport} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DirectoryPage;
