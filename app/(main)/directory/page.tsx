import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getAllAircraft, getFullAirportInfo, getAirportStatus, getAirportATIS } from "@/lib/actions";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import AirportDetails from "@/components/airport-details";

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
    console.error('Failed to fetch aircraft:', error);
    aircraft = { result: [] }; // Fallback to empty array
  }

  const params = await searchParams;
  const airport = params.airport;

  let airportData = null;

  if (airport) {
    try {
      console.log(`🔍 Fetching data for airport: ${airport.toUpperCase()}`);
      
      // Step 1: Get basic airport info first (this is critical)
      // console.log('1️⃣ Fetching airport info...');
      airportData = await getFullAirportInfo(airport);
      // console.log('✅ Airport info result:', airportData);
      
      // If airport info fails, stop here
      if (!airportData || airportData.statusCode) {
        //console.error('❌ Airport info failed, stopping here');
        // airportData already contains the error info
      } else {
        // Step 2: Get airport status (ATC info) - continue even if this fails
        //console.log('2️⃣ Fetching airport status...');
        let airportStatus = null;
        try {
          airportStatus = await getAirportStatus(airport);
          // console.log('✅ Airport status result:', airportStatus);
        } catch (statusError) {
          // console.error('❌ Airport status failed:', statusError);
          airportStatus = {
            inboundFlightsCount: 0,
            outboundFlightsCount: 0,
            atcFacilities: []
          };
        }
        
        // Step 3: Get ATIS - continue even if this fails
        // console.log('3️⃣ Fetching ATIS...');
        let airportATIS = "No ATIS available";
        try {
          airportATIS = await getAirportATIS(airport);
          // console.log('✅ ATIS result:', airportATIS);
        } catch (atisError) {
          // console.error('❌ ATIS failed:', atisError);
          airportATIS = "No ATIS available";
        }
        
        // Step 4: Merge all data safely
        // console.log('4️⃣ Merging data...');
        airportData = {
          ...airportData,
          ...airportStatus,
          atis: airportATIS || "No ATIS available"
        };
        
          // console.log('🎉 Final merged data:', {
          //   hasBasicInfo: !!airportData.name,
          //   atcFacilitiesCount: airportData.atcFacilities?.length || 0,
          //   inboundFlights: airportData.inboundFlightsCount,
          //   outboundFlights: airportData.outboundFlightsCount,
          //   hasATIS: !!airportData.atis
          // });
      }
      
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      airportData = { 
        statusCode: 500, 
        error: 'Failed to fetch airport data' 
      };
    }
  }

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
          <p className="text-gray-500 text-sm mt-2">
            Please try again later
          </p>
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
          <p className="text-red-400 font-bold text-2xl">
            Server Error
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {airportData.error || 'Unable to fetch airport data at this time'}
          </p>
        </div>
      );
    }

    return <AirportDetails airportData={airportData} />;
  };

  return (
    <div className="p-4 max-w-[1000px] w-full mx-auto">
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-600 to-dark py-0.5 bg-clip-text text-transparent flex gap-2 items-center">
        Directory
      </h1>

      <Tabs defaultValue="airport" className="!w-full">
        <TabsList className="mt-4">
          <TabsTrigger value="airport">Airport</TabsTrigger>
          <TabsTrigger value="aircraft">Aircraft</TabsTrigger>
        </TabsList>

        <TabsContent value="aircraft">
          <div className="flex flex-col gap-4">
            <h2 className="text-gray text-xl font-bold pb-4">All Aircraft</h2>
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
          <div className="flex flex-col gap-6">
            <Card className="p-6 bg-gradient-to-br from-gray to-dark text-white">
              <h2 className="text-2xl tracking-tight font-bold mb-2">Enter an airport ICAO code</h2>
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

              {airport && <span className="text-sm font-medium text-gray-300">You Searched for: <b className="text-white">{airport.toUpperCase()}</b></span>}
            </Card>

            <Component />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DirectoryPage;
