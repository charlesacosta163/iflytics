import React from "react";
import { VscCopilotWarning } from "react-icons/vsc";
import { Flight } from "@/lib/types";
import {
  calculateTotalDistance,
  getAllFlightRoutes,
  getFlightTimeCategorizerData,
  getTopCountries,
  getUniqueRoutes,
} from "@/lib/cache/flightinsightsdata";
import { FaRoute, FaGlobeAmericas } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import { RiCopilotFill } from "react-icons/ri";
import {
  LuMapPin,
  LuRepeat,
  LuArrowUpRight,
  LuArrowDownRight,
  LuPlaneTakeoff,
  LuRuler,
  LuChartPie,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

import { customUserImages } from "@/lib/data";

import { RouteMap } from "./maps/route-map";
import { TopCountriesCard } from "../top-countries-card";
import { FlightTimeCategorizerBarChart } from "../charts/flight-time-categorizer-barchart";
import { RevalidateRoutesButton } from "@/components/revalidate-routes-btn";

import { FlightHaulsPieChart } from "../charts/route-pies/flight-hauls-pie";
import { FlightContinentsPieChart } from "../charts/route-pies/flight-continents-pie";
import { FlightDomesticIntlPieChart } from "../charts/route-pies/flight-domestic-intl-pie";
import ExportFlightsCSVBtn from "../export-flights-csv-btn";
import { getAllAircraft } from "@/lib/actions";
import { hasLifetimeAccess, Subscription } from "@/lib/subscription/helpers";
import { MostFlownRoutesBarChart } from "../charts/most-flown-routes-bar";
import { ValidFlightsPsa } from "../misc/valid-flights-psa";

let maintenanceMode = false;

const labelIconClass = "shrink-0 w-[11px] h-[11px]"

const Stat = ({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
}) => (
  <div className="min-w-0">
    <p className="flex items-center gap-1 text-[11px] leading-none text-gray-500 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </p>
    <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight">
      {value}
    </p>
    {sub && (
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
    )}
  </div>
)

const RouteLine = ({
  label,
  origin,
  destination,
  distance,
  icon,
}: {
  label: string
  origin: string
  destination: string
  distance: number
  icon?: React.ReactNode
}) => (
  <div className="min-w-0">
    <p className="flex items-center gap-1 text-[11px] leading-none text-gray-500 dark:text-gray-400 mb-1">
      {icon}
      <span>{label}</span>
    </p>
    <p className="text-sm text-gray-900 dark:text-gray-100">
      <span className="font-medium">{origin || "N/A"}</span>
      <span className="text-gray-400 mx-1.5">→</span>
      <span className="font-medium">{destination || "N/A"}</span>
      <span className="text-gray-500 dark:text-gray-400 ml-2 tabular-nums">
        {distance.toLocaleString()} NM
      </span>
    </p>
  </div>
)

const FlightsRoutes = async ({ flights, user , subscription, role}: { flights: Flight[], user: any, subscription: Subscription, role: string}) => {
  // console.log(`🔄 FlightsRoutes called at ${new Date().toISOString()}`); --> Debugging

  // Based on THIS Data for user flights
  // Criteria: Flight has a totalTime > 5, originAirport, destinationAirport must be non-empty
  const validFlights = flights.filter((flight) => {
    return (
      flight.totalTime > 5 && flight.originAirport && flight.destinationAirport && flight.originAirport !== flight.destinationAirport
    );
  });

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
  
  // console.log(`⏱️ Route calculation took ${endTime - startTime}ms`); --> Debugging
  
  const uniqueRoutes = getUniqueRoutes(
    routesWithDistances.map((route) => ({
      ...route,
      originIsoCountry: route.originIsoCountry || "US",
      destinationIsoCountry: route.destinationIsoCountry || "US",
      originContinent: route.originContinent || "NA",
      destinationContinent: route.destinationContinent || "NA",
    }))
  );

  // console.log(routesWithDistances[0])
  
  const totalDomesticRoutes = uniqueRoutes.filter(
    (route) => route.originIsoCountry === route.destinationIsoCountry
  ).length;
  const totalInternationalRoutes = uniqueRoutes.filter(
    (route) => route.originIsoCountry !== route.destinationIsoCountry
  ).length;

  const { totalDistanceTraveled, longestRouteInfo } =
    await calculateTotalDistance(validFlights);

  // Use ALL Flights Data
  const topCountries = getTopCountries(routesWithDistances);

  const flightTimeCategorizerData = getFlightTimeCategorizerData(validFlights);

  function getFlightHaulCategorizerData () {
    // Short Haul = <= 180
    // Medium Haul = > 180 && <=360
    // Long Haul = > 360

    const shortHaul = validFlights.filter((flight) => flight.totalTime <= 180);
    const mediumHaul = validFlights.filter((flight) => flight.totalTime > 180 && flight.totalTime <= 360);
    const longHaul = validFlights.filter((flight) => flight.totalTime > 360);

    return [{ 
       label: "Short Haul",
       value: shortHaul.length,
       fill: "#77DD77"
     }, {
       label: "Medium Haul",
       value: mediumHaul.length,
       fill: "#FDFD96"
     }, {
       label: "Long Haul",
       value: longHaul.length,
       fill: "#FF6961"
     }];
  }

  function getFlightContinentsFlewToData () {

    const pastelFillColors = ["#87abff", "#ff8799", "#FDFD96", "#C3B1E1", "#77DD77", "#FFB347", "#FFD1DC", "#E4C692", "#92E1C0", "#D49CD0"]
    // Return array of unique continents flown to [{label: "EU", amount: 10},...]
    const continents = routesWithDistances.map((route) => route.destinationContinent).filter((continent) => continent !== undefined)
    const uniqueContinents = [...new Set(continents)];
    return uniqueContinents.map((continent) => ({
      label: continent,
      amount: continents.filter((c) => c === continent).length,
      fill: pastelFillColors[uniqueContinents.indexOf(continent)],
    }))
  }

  function getDomesticInternationalAmountsData () {
    // Return [{label: "Domestic", amount: 10}, {label: "International", amount: 10}]

    const domesticRoutes = routesWithDistances.filter((route) => route.originIsoCountry === route.destinationIsoCountry)
    const internationalRoutes = routesWithDistances.filter((route) => route.originIsoCountry !== route.destinationIsoCountry)

    return [{
      label: "Domestic",
      amount: domesticRoutes.length,
      fill: "#BB9AB1"
    }, {
      label: "International",
      amount: internationalRoutes.length,
      fill: "#EECEB9"
    }]
  }

  const aircraftArray = await getAllAircraft();

  // Get unique origin and destination routes, and a count 
  // Data structure to be returned: [route: `KLAX-PHKO`, count: 10]

  // Process routes treating each direction as unique
  const flownRoutesData = validFlights.reduce((acc: { route: string; count: number }[], flight) => {
    const routeKey = `${flight.originAirport}-${flight.destinationAirport}`;
    const existingRoute = acc.find(r => r.route === routeKey);
    
    if (existingRoute) {
      existingRoute.count++;
    } else {
      acc.push({ route: routeKey, count: 1 });
    }
    
    return acc;
  }, [])

  const totalRouteFlights = validFlights.length
  const avgDistancePerFlight = Math.round(totalDistanceTraveled / totalRouteFlights || 0)
  const repeatRouteRate = uniqueRoutes.length > 0
    ? (totalRouteFlights / uniqueRoutes.length).toFixed(1)
    : "0"

  const shortestRoute = routesWithDistances.length > 0
    ? routesWithDistances.reduce((min, r) => (r.distance < min.distance ? r : min), routesWithDistances[0])
    : { origin: "", destination: "", distance: 0 }

  const mostFlownRoute = flownRoutesData.length > 0
    ? [...flownRoutesData].sort((a, b) => b.count - a.count)[0]
    : null

  const uniqueCountries = new Set(
    routesWithDistances.flatMap((r) => [r.originIsoCountry, r.destinationIsoCountry].filter(Boolean))
  ).size

  const uniqueAirports = new Set(
    validFlights.flatMap((f) => [f.originAirport, f.destinationAirport])
  ).size

  const continentsVisited = getFlightContinentsFlewToData().length

  const crossContinentFlights = routesWithDistances.filter(
    (r) => r.originContinent && r.destinationContinent && r.originContinent !== r.destinationContinent
  ).length

  const hubAirport = validFlights.reduce(
    (acc, flight) => {
      acc[flight.originAirport] = (acc[flight.originAirport] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const topHub = Object.entries(hubAirport).sort((a, b) => b[1] - a[1])[0]

  const userImage = customUserImages.find(
    (u: { username: string }) => u.username === userMetadata.ifcUsername
  )?.image

  // console.log(routesWithDistancesWithAircraftIcao[0])

  // console.log(getFlightContinentsFlewToData())
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

      <div className="flex gap-3 md:gap-4 items-center">
        <RevalidateRoutesButton userId={user.id} />

        <ExportFlightsCSVBtn
          routesWithDistances={routesWithDistances}
          aircraftArray={aircraftArray}
          subscription={subscription as Subscription}
        />
      </div>

      <ValidFlightsPsa
        totalFlights={flights.length}
        validFlightsCount={validFlights.length}
      />

      <div
        className={cn(
          "lg:col-span-3",
          "bg-cyan-50 dark:bg-cyan-800/40",
          "rounded-[20px] md:rounded-[25px]",
          "p-4 md:p-5"
        )}
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl tracking-tighter font-semibold text-gray-900 dark:text-gray-100">
              Routes Summary
            </h2>
            <p className="text-xs text-gray-500 font-medium dark:text-gray-400 mt-0.5">
              {totalRouteFlights} route flight{totalRouteFlights !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500 dark:text-gray-400">
            {userImage ? (
              <img
                src={userImage}
                alt={userMetadata.ifcUsername}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <RiCopilotFill className="w-4 h-4" />
            )}
            <span>@{userMetadata.ifcUsername}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
          <Stat
            label="Unique routes"
            value={uniqueRoutes.length}
            sub={`${totalDomesticRoutes} domestic · ${totalInternationalRoutes} intl`}
            icon={<FaRoute className={labelIconClass} />}
          />
          <Stat
            label="Total distance"
            value={maintenanceMode ? "—" : `${shortenNumber(totalDistanceTraveled)} NM`}
            sub={maintenanceMode ? "Under maintenance" : `${shortenNumber(totalDistanceTraveled * 1.1508)} mi · ${shortenNumber(totalDistanceTraveled * 1.852)} km`}
            icon={<GiPathDistance className={labelIconClass} />}
          />
          <Stat
            label="Avg per flight"
            value={`${avgDistancePerFlight} NM`}
            icon={<LuRuler className={labelIconClass} />}
          />
          <Stat
            label="Countries visited"
            value={uniqueCountries}
            sub={`${continentsVisited} continent${continentsVisited !== 1 ? "s" : ""}`}
            icon={<FaGlobeAmericas className={labelIconClass} />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
          <RouteLine
            label="Longest route"
            origin={longestRouteInfo.origin}
            destination={longestRouteInfo.destination}
            distance={longestRouteInfo.distance}
            icon={<LuArrowUpRight className={labelIconClass} />}
          />
          <RouteLine
            label="Shortest route"
            origin={shortestRoute.origin}
            destination={shortestRoute.destination}
            distance={shortestRoute.distance}
            icon={<LuArrowDownRight className={labelIconClass} />}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
          <Stat
            label="Unique airports"
            value={uniqueAirports}
            icon={<LuMapPin className={labelIconClass} />}
          />
          <Stat
            label="Cross-continent"
            value={crossContinentFlights}
            sub="International legs"
            icon={<FaGlobeAmericas className={labelIconClass} />}
          />
          <Stat
            label="Repeat rate"
            value={`${repeatRouteRate}×`}
            sub="Flights per unique route"
            icon={<LuRepeat className={labelIconClass} />}
          />
          <Stat
            label="Most flown"
            value={mostFlownRoute ? mostFlownRoute.route.replace("-", " → ") : "N/A"}
            sub={mostFlownRoute ? `${mostFlownRoute.count} time${mostFlownRoute.count !== 1 ? "s" : ""}` : undefined}
            icon={<FaRoute className={labelIconClass} />}
          />
        </div>

        {topHub && (
          <div className="flex items-baseline justify-between gap-3 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 text-sm">
            <span className="flex items-center gap-1 font-semibold text-[16px] text-gray-500 dark:text-gray-400">
              <LuPlaneTakeoff className={labelIconClass} />
              Home hub
            </span>
            <span className="text-gray-900 dark:text-gray-100 text-lg">
              <span className="font-medium">{topHub[0]}</span> |
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                {topHub[1]} departure{topHub[1] !== 1 ? "s" : ""}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Route Map */}
      <div className={cn(
        "lg:col-span-2",
        "bg-white dark:bg-gray-800",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[20px] md:rounded-[25px]",
        "min-h-[500px]",
        "overflow-hidden"
      )}>
        <RouteMap routes={uniqueRoutes} />
      </div>

      <TopCountriesCard countries={topCountries} />

      <div className="lg:col-span-3">
        <MostFlownRoutesBarChart chartData={flownRoutesData} />
      </div>

      <div
        className={cn(
          "lg:col-span-3",
          "bg-white/50 dark:bg-gray-800/50",
          "rounded-[20px] md:rounded-[25px]",
          "p-4 md:p-5"
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-4 md:mb-5">
          <div>
            <h3 className="flex items-center gap-1.5 text-lg tracking-tighter font-semibold text-gray-900 dark:text-gray-100">
              <LuChartPie className="shrink-0 w-[11px] h-[11px] text-gray-500 dark:text-gray-400" />
              Flight route metrics
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Duration hauls, continents reached, and domestic vs international split
            </p>
          </div>
          {validFlights.length > 0 && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
              {validFlights.length} flights
            </span>
          )}
        </div>

        {validFlights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <FlightHaulsPieChart chartData={getFlightHaulCategorizerData()} />
            <FlightContinentsPieChart chartData={getFlightContinentsFlewToData()} />
            <FlightDomesticIntlPieChart chartData={getDomesticInternationalAmountsData()} />
          </div>
        ) : (
          <div
            className={cn(
              "text-center py-8",
              "rounded-[20px] md:rounded-[25px]",
            )}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              No flight routes found
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-3">
        <FlightTimeCategorizerBarChart
          flightTimeCategorizerData={flightTimeCategorizerData}
        />
      </div>
    </div>
  );
};

export default FlightsRoutes;
