import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAllAircraft,
  getFullAirportInfo,
  getAirportStatus,
  getAirportATIS,
  getAllAirportsWithActiveATC,
  matchATCTypeToTitle,
} from "@/lib/actions";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import AirportDetails from "@/components/airport-details";
import AirportWithATCCard from "@/components/airport-with-atc-card";
import { FaPlane } from "react-icons/fa";
import { Metadata } from 'next'
import { TbBuildingAirport, TbBuildingBroadcastTower } from "react-icons/tb";

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
          <p className="text-gray-500">Enter an airport ICAO code to search</p>
        </div>
      );
    }

    if (!airportData) {
      return (
        <div className="text-center py-8">
          <p className="text-red-400 font-bold text-2xl">
            Failed to load airport data
          </p>
          <p className="text-gray-500 text-sm mt-2">Please try again later</p>
        </div>
      );
    }

    if (airportData.statusCode === 404) {
      return (
        <div className="text-center py-8">
          <p className="text-red-400 font-bold text-2xl">
            Airport "{airport.toUpperCase()}" not found
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please check the ICAO code and try again
          </p>
        </div>
      );
    }

    if (airportData.statusCode === 500 || airportData.error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-400 font-bold text-2xl">Server Error</p>
          <p className="text-gray-500 text-sm mt-2">
            {airportData.error || "Unable to fetch airport data at this time"}
          </p>
        </div>
      );
    }

    return <AirportDetails airportData={airportData} />;
  };

  return (
    <div className="p-4 max-w-[1000px] w-full mx-auto">
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight dark:text-light bg-gradient-to-r from-gray-600 to-dark py-0.5 bg-clip-text text-transparent flex gap-2 items-center">
        Directory
      </h1>

      <Tabs defaultValue="airport" className="!w-full">
        <TabsList className="mt-4 w-full bg-gray-500 p-1 rounded-full">
          <TabsTrigger
            value="airport"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex gap-2 items-center"
          >
            <TbBuildingAirport className="w-6 h-6 text-light" />
            Airport
          </TabsTrigger>
          <TabsTrigger
            value="aircraft"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex gap-2 items-center"
          >
            <FaPlane className="w-6 h-6 text-light" />
            Aircraft
          </TabsTrigger>
          <TabsTrigger
            value="airport-list"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-300 transition-all duration-200 rounded-full flex gap-2 items-center"
          >
            <TbBuildingBroadcastTower className="w-6 h-6 text-green-500 animate-pulse" />
            Active ATC
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aircraft">
          <div className="flex gap-2 items-center mt-4 mb-6">
            <FaPlane className="w-6 h-6 text-gray-700" />
            <h2 className="text-gray-700 text-xl font-bold">All Aircraft ({aircraft.result.length})</h2>
          </div>

          {aircraft && aircraft.result && aircraft.result.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {aircraft.result.map((aircraft: any) => (
                <div
                  key={aircraft.id}
                  className="flex md:flex-row flex-col gap-4 justify-between items-center bg-gradient-to-br from-gray to-dark p-4 rounded-lg"
                >
                  <Image
                    src={`/images/aircraft/${matchAircraftNameToImage(
                      aircraft.name
                    )}`}
                    alt={aircraft.name}
                    width={200}
                    height={200}
                  />
                  <span className="md:text-2xl text-xl font-black tracking-tight text-white text-center md:text-right">
                    {aircraft.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Unable to load aircraft data</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="airport">

          {maintenanceMode ? (
            <div className="text-center py-8">
              <p className="text-gray-500">This feature is currently under maintenance, please check back later.</p>
            </div>
          ) : (
          <div className="flex flex-col gap-6">
            <Card className="p-6 bg-gradient-to-br from-gray to-dark text-white">
              <h2 className="text-2xl tracking-tight font-bold mb-2 flex gap-2 items-center">
                <TbBuildingAirport className="w-6 h-6 text-light" />
                Enter an airport ICAO code
              </h2>
              <form action="/directory" className="flex gap-3">
                <input
                  type="text"
                  name="airport"
                  placeholder="Enter ICAO code (e.g., KSFO)"
                  autoComplete="off"
                  maxLength={4}
                  minLength={4}
                  className="flex-1 px-4 py-2 bg-gray-700 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-none text-sm font-medium"
                  defaultValue={(airport as string) || ""}
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Search
                </button>
              </form>

              {airport && (
                <span className="text-sm font-medium text-gray-300">
                  You Searched for:{" "}
                  <b className="text-white">{airport.toUpperCase()}</b>
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
