"use client";
import { useEffect, useState, useRef } from "react";
import { Map } from "maplibre-gl";
import * as turf from "@turf/turf";
import * as maplibregl from "maplibre-gl";
import { getAircraft } from "@/lib/actions";
import { X } from "lucide-react";
import Link from "next/link";
import { TiZoomInOutline, TiZoomOutOutline } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { FaInfoCircle, FaRoute } from "react-icons/fa";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { convertMinutesToHours } from "@/lib/utils";
import { LuNotebookTabs } from "react-icons/lu";


let maintenanceMode = false;

export const RouteMap = ({ routes }: { routes: any[] }) => {
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [aircraftData, setAircraftData] = useState<any>(null);
  const [loadingAircraft, setLoadingAircraft] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mapRef = useRef<Map | null>(null);
  
  // Function to get route color based on flight time (IATA standards)
  const getRouteColor = (totalTime: number) => {
    if (totalTime <= 180) { // ≤3 hours
      return "#10B981"; // green-500 - Short haul
    } else if (totalTime > 180 && totalTime <= 360) { // 3-6 hours
      return "#F59E0B"; // yellow-500 - Medium haul
    } else if (totalTime > 360) { // 6+ hours
      return "#EF4444"; // red-500 - Long haul
    }
  };

  // Function to get route category based on flight time (IATA standards)
  const getRouteCategory = (totalTime: number) => {
    if (totalTime <= 180) { // ≤3 hours
      return "Short Haul";
    } else if (totalTime > 180 && totalTime <= 360) { // 3-6 hours
      return "Medium Haul";
    } else if (totalTime > 360) { // 6+ hours
      return "Long Haul";
    } else {
      return "Unknown";
    }
  };

  // Zoom functions
  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn({ duration: 300 });
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut({ duration: 300 });
    }
  };

  // Toggle fullscreen function
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // Trigger map resize after state update and DOM changes
    setTimeout(() => {
      if (mapRef.current) {
        // Force invalidate size and resize
        mapRef.current.resize();
        // Additional resize call to ensure proper fitting
        requestAnimationFrame(() => {
          if (mapRef.current) {
            mapRef.current.resize();
          }
        });
      }
    }, 150);
  };



  // Function to create origin and destination sprites (from FullScreenMap)
  const createRouteSprites = (map: Map) => {
    const spriteSize = 32;

    // Create takeoff sprite (green circle with plane icon)
    const createTakeoffSprite = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = spriteSize;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, spriteSize, spriteSize);

        // Draw green circle background
        ctx.fillStyle = "#10B981"; // green-500
        ctx.beginPath();
        ctx.arc(
          spriteSize / 2,
          spriteSize / 2,
          spriteSize / 2 - 2,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Draw white border
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          spriteSize / 2,
          spriteSize / 2,
          spriteSize / 2 - 2,
          0,
          2 * Math.PI
        );
        ctx.stroke();

        // Draw takeoff icon (simplified plane)
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🛫", spriteSize / 2, spriteSize / 2);
      }

      return canvas;
    };

    // Create landing sprite (red circle with plane icon)
    const createLandingSprite = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = spriteSize;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, spriteSize, spriteSize);

        // Draw red circle background
        ctx.fillStyle = "#EF4444"; // red-500
        ctx.beginPath();
        ctx.arc(
          spriteSize / 2,
          spriteSize / 2,
          spriteSize / 2 - 2,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Draw white border
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          spriteSize / 2,
          spriteSize / 2,
          spriteSize / 2 - 2,
          0,
          2 * Math.PI
        );
        ctx.stroke();

        // Draw landing icon (simplified plane)
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🛬", spriteSize / 2, spriteSize / 2);
      }

      return canvas;
    };

    // Add sprites to map if they don't exist
    if (!map.hasImage("takeoff-sprite")) {
      const takeoffCanvas = createTakeoffSprite();
      const takeoffImg = new Image();
      takeoffImg.onload = () => {
        try {
          map.addImage("takeoff-sprite", takeoffImg);
        } catch (error) {
          console.warn("Error adding takeoff sprite:", error);
        }
      };
      takeoffImg.src = takeoffCanvas.toDataURL();
    }

    if (!map.hasImage("landing-sprite")) {
      const landingCanvas = createLandingSprite();
      const landingImg = new Image();
      landingImg.onload = () => {
        try {
          map.addImage("landing-sprite", landingImg);
        } catch (error) {
          console.warn("Error adding landing sprite:", error);
        }
      };
      landingImg.src = landingCanvas.toDataURL();
    }
  };

  useEffect(() => {
    const map = new Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [0, 0],
      zoom: 1,
      attributionControl: false
    });

    mapRef.current = map;

    map.on("load", () => {
      // Create route sprites
      createRouteSprites(map);

      const arcFeatures: any[] = [];
      const originFeatures: any[] = [];
      const destinationFeatures: any[] = [];

      routes.forEach((route: any, index: number) => {
        const {
          originCoordinates: { latitude: lat1, longitude: lng1 },
          destinationCoordinates: { latitude: lat2, longitude: lng2 },
          distance,
          origin,
          destination,
          totalTime,
        } = route;

        // Skip routes with invalid coordinates (null, undefined, or 0,0)
        if (
          !lat1 || !lng1 || !lat2 || !lng2 || 
          (lat1 === 0 && lng1 === 0) || 
          (lat2 === 0 && lng2 === 0) ||
          Math.abs(lat1) > 90 || Math.abs(lat2) > 90 || 
          Math.abs(lng1) > 180 || Math.abs(lng2) > 180
        ) {
          console.warn(`Skipping route ${origin} -> ${destination} due to invalid coordinates:`, {
            origin: [lat1, lng1],
            destination: [lat2, lng2]
          });
          return; // Skip this route
        }

        const originPoint = turf.point([lng1, lat1]);
        const destinationPoint = turf.point([lng2, lat2]);

        const arc = turf.greatCircle(originPoint, destinationPoint, {
          npoints: 100,
          properties: {
            distance,
            origin,
            destination,
            color: getRouteColor(totalTime),
            category: getRouteCategory(totalTime),
          },
        });

        arc.id = index;
        arcFeatures.push(arc);

        // Add origin marker
        originFeatures.push({
          type: "Feature",
          id: `origin-${index}`,
          geometry: {
            type: "Point",
            coordinates: [lng1, lat1],
          },
          properties: {
            type: "origin",
            airport: origin,
          },
        });

        // Add destination marker
        destinationFeatures.push({
          type: "Feature",
          id: `destination-${index}`,
          geometry: {
            type: "Point",
            coordinates: [lng2, lat2],
          },
          properties: {
            type: "destination",
            airport: destination,
          },
        });
      });

      // Add route arcs
      const featureCollection = turf.featureCollection(arcFeatures);
      map.addSource("route-arcs", {
        type: "geojson",
        data: featureCollection,
      });

      // Add origin markers
      map.addSource("origin-markers", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: originFeatures,
        },
      });

      // Add destination markers
      map.addSource("destination-markers", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: destinationFeatures,
        },
      });

      // Visible route layer with distance-based color coding
      map.addLayer({
        id: "route-arcs-layer",
        type: "line",
        source: "route-arcs",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ["get", "color"], // Use color from feature properties
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            3, // Width when hovered (reduced from 5)
            2  // Default width (reduced from 3)
          ],
          "line-opacity": [
            "case", 
            ["boolean", ["feature-state", "hover"], false],
            1,   // Opacity when hovered
            0.8  // Default opacity
          ]
        },
      });

      // Origin markers layer
      map.addLayer({
        id: "origin-markers-layer",
        type: "symbol",
        source: "origin-markers",
        layout: {
          "icon-image": "takeoff-sprite",
          "icon-size": 0.4, // Further reduced from 0.5 to 0.3
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      // Destination markers layer
      map.addLayer({
        id: "destination-markers-layer",
        type: "symbol",
        source: "destination-markers",
        layout: {
          "icon-image": "landing-sprite",
          "icon-size": 0.4, // Further reduced from 0.5 to 0.3
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      // Invisible wider clickable layer (no styling changes needed)
      map.addLayer({
        id: "route-arcs-clickable",
        type: "line",
        source: "route-arcs",
        layout: {
          "line-join": "round", 
          "line-cap": "round",
        },
        paint: {
          "line-color": "rgba(0,0,0,0)",
          "line-width": 15,
        },
      });

      // Updated hover effects using feature-state
      let hoveredRouteId: string | number | undefined | null = null;

      map.on("mouseenter", "route-arcs-clickable", (e) => {
        map.getCanvas().style.cursor = "pointer";
        
        if (e.features && e.features.length > 0) {
          if (hoveredRouteId !== null) {
            map.setFeatureState(
              { source: "route-arcs", id: hoveredRouteId },
              { hover: false }
            );
          }
          
          hoveredRouteId = e.features[0].id;
          map.setFeatureState(
            { source: "route-arcs", id: hoveredRouteId },
            { hover: true }
          );
        }
      });

      map.on("mouseleave", "route-arcs-clickable", (e) => {
        map.getCanvas().style.cursor = "";
        
        if (hoveredRouteId !== null) {
          map.setFeatureState(
            { source: "route-arcs", id: hoveredRouteId },
            { hover: false }
          );
          hoveredRouteId = null;
        }
      });

      map.on("click", "route-arcs-clickable", (e) => {
        const feature = e.features?.[0];
        const props = feature?.properties;
      
        if (props) {
          const routeData = routes.find((r: any) => 
            r.origin === props.origin && r.destination === props.destination
          );
          
          setPopupInfo({
            origin: props.origin,
            destination: props.destination,
            distance: props.distance,
            category: props.category,
            color: props.color,
            aircraftId: routeData?.aircraftId,
            totalTime: routeData?.totalTime,
            server: routeData?.server,
            created: routeData?.created,
            flightId: routeData?.flightId
          });
        }
      });

      map.on("click", (e) => {
        if (!map.queryRenderedFeatures(e.point, { layers: ["route-arcs-clickable"] }).length) {
          setPopupInfo(null);
          setAircraftData(null);
        }
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [routes]);

  // Handle map resize when fullscreen state changes
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.resize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen]);

  // Fetch aircraft data when popup info changes
  useEffect(() => {
    if (popupInfo?.aircraftId) {
      setLoadingAircraft(true);
      
      getAircraft(popupInfo.aircraftId)
        .then((aircraft) => {
          setAircraftData(aircraft);
          setLoadingAircraft(false);
        })
        .catch(() => {
          setLoadingAircraft(false);
        });
    }
  }, [popupInfo]);

  const formatFlightTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div id="route-map-container" className={`
      ${isFullScreen 
        ? 'fixed inset-0 z-[9999] bg-white' 
        : 'relative'
      }
    `} style={{ 
      width: "100%",
      height: isFullScreen ? "100vh" : "100%",
      maxHeight: isFullScreen ? "100vh" : "600px",
      borderRadius: isFullScreen ? "0" : "20px", 
      overflow: "hidden" 
    }}>
      <div id="map" style={{ width: "100%", height: "100%"}} />
      
      {/* Zoom Controls - Top Left */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg
                     hover:bg-white transition-all duration-200
                     flex items-center justify-center border border-gray-200"
        >
          <TiZoomInOutline className="w-6 h-6 text-blue-500" />
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg
                     hover:bg-white transition-all duration-200
                     flex items-center justify-center border border-gray-200"
        >
          <TiZoomOutOutline className="w-6 h-6 text-red-500" />
        </button>
        <button
          onClick={toggleFullScreen}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg
                     hover:bg-white transition-all duration-200 text-gray
                     flex items-center justify-center border border-gray-200"
        >
          {isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-2">
      <Dialog>

<DialogTrigger className="text-light !text-lg tracking-tight py-1 px-4 font-semibold bg-gray-700 rounded-full hover:bg-gray-800 transition-all duration-300 cursor-pointer self-start flex items-center gap-2">
  <LuNotebookTabs className="w-4 h-4" />
  View All Routes
</DialogTrigger>

<DialogContent className="min-h-[500px] max-h-[90svh] max-w-3xl overflow-y-auto bg-[#FFD6BA] dark:bg-gray-800 !border-none z-[9999]">
  <DialogHeader>
    <DialogTitle className="text-xl font-bold">
      All Flight Routes
    </DialogTitle>
    <p className="text-gray-500 dark:text-gray-300 text-sm">
      Complete overview of your unique flight routes and
      distances
    </p>

    {/* Legend */}
    <div className="flex flex-col items-center gap-2 mt-4 p-3 bg-[#fbe4d4] dark:bg-gray-700 rounded-lg">
      <h3 className="text-lg font-bold tracking-tight text-orange-700 dark:text-orange-300 flex gap-2 items-center">
        <FaRoute className="w-4 h-4" /> Route Types (IATA)
      </h3>
      <div className="flex justify-center items-center gap-6 font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs dark:text-gray-300 text-gray-600">
              Short (≤3h)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs dark:text-gray-300 text-gray-600">
              Medium (3-6h)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs dark:text-gray-300 text-gray-600">
              Long (6h+)
            </span>
          </div>
        </div>
      </div>
    </div>
  </DialogHeader>

  <div className="mt-4">
    <Table>
      <TableCaption>
        Total of {routes.length} unique routes flown
      </TableCaption>
      <TableHeader>
        <TableRow className="!rounded-lg border-b border-orange-300/50">
          <TableHead className="w-[120px]">Origin</TableHead>
          <TableHead className="w-[120px]">
            Destination
          </TableHead>
          <TableHead className="text-center">Time</TableHead>
          <TableHead className="text-right">Distance</TableHead>
          <TableHead className="text-center w-[80px]">
            Type
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routes.map((route, index) => {
          // Calculate route type based on time
          const getRouteType = (totalTime: number) => {
            if (totalTime <= 180)
              return {
                label: "Short Haul",
                color: "bg-green-500",
                dotColor: "bg-green-500",
              };
            if (totalTime <= 360 && totalTime > 180)
              return {
                label: "Medium Haul",
                color: "bg-yellow-500",
                dotColor: "bg-yellow-500",
              };
            return {
              label: "Long Haul",
              color: "bg-red-500",
              dotColor: "bg-red-500",
            };
          };

          const routeType = getRouteType(route.totalTime || 0);

          return (
            <TableRow
              key={index}
              className="hover:bg-[#fbe4d4] dark:hover:bg-gray-700 !rounded-lg dark:border-b dark:border-orange-300/50 border-b border-orange-300/50"
            >
              <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                {route.origin}
              </TableCell>
              <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                {route.destination}
              </TableCell>
              <TableCell className="text-center">
                {route.totalTime ? (
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {convertMinutesToHours(route.totalTime)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-300 italic">
                    {maintenanceMode
                      ? "Under Maintenance"
                      : route.totalTime}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {route.distance ? (
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {Math.round(
                        route.distance
                      ).toLocaleString()}{" "}
                      nm
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(
                        route.distance * 1.852
                      ).toLocaleString()}{" "}
                      km
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-300 italic">
                    {maintenanceMode
                      ? "Under Maintenance"
                      : route.distance || "N/A"}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {/* Colored Circle instead of text badge */}
                <div className="flex justify-center">
                  <div
                    className={`w-4 h-4 ${routeType.dotColor} rounded-full`}
                    title={routeType.label} // Tooltip on hover
                  ></div>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>

    {/* Updated Summary Stats - using circles too */}
    <div className="mt-6 p-4 bg-[#fbe4d4] dark:bg-gray-700 rounded-lg">
      <h4 className="font-semibold text-gray-900 dark:text-gray-300 mb-3">
        Route Summary
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">
            {routes.length}
          </div>
          <div className="text-gray-600 dark:text-gray-300">Total Routes</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="text-xl font-bold text-green-600">
              {
                routes.filter(
                  (r) => (r.totalTime || 0) <= 180
                ).length
              }
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-300">Short Haul</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="text-xl font-bold text-yellow-600">
              {
                routes.filter(
                  (r) =>
                    (r.totalTime || 0) > 180 &&
                    (r.totalTime || 0) <= 360
                ).length
              }
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-300">Medium Haul</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="text-xl font-bold text-red-600">
              {
                routes.filter(
                  (r) => (r.totalTime || 0) > 360
                ).length
              }
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-300">Long Haul</div>
        </div>
      </div>

      {/* Total Distance */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold dark:text-purple-400 text-purple-600">
            {routes
              .reduce(
                (total, route) => total + (route.distance || 0),
                0
              )
              .toLocaleString()}{" "}
            nm
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            Total Distance Covered
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            {Math.round(
              routes.reduce(
                (total, route) => total + (route.distance || 0),
                0
              ) * 1.852
            ).toLocaleString()}{" "}
            km
          </div>
        </div>
      </div>
    </div>
  </div>
</DialogContent>
</Dialog>

      </div>
      
      {/* Flight Route Information Popup */}
      {popupInfo && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 z-[1000]"
            onClick={() => {
              setPopupInfo(null);
              setAircraftData(null);
            }}
          />
          
          {/* Route Information Card */}
          <div className="absolute top-5 left-5 bg-dark text-light rounded-xl overflow-hidden font-sans w-[300px] shadow-2xl z-[1001] border border-gray-600">
            {/* Header */}
            <div className="p-6 pb-4 border-b-2 border-gray-600 bg-gray">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-400 text-sm mb-1">
                    Flight Route
                  </div>
                  <div className="text-3xl font-bold text-white tracking-wider">
                    {popupInfo.origin}
                  </div>
                </div>
              </div>
              
              <div className="text-blue-300 text-base mt-2 font-medium">
                to {popupInfo.destination} • {popupInfo.distance} NM
              </div>
              
              {/* Route Category Badge */}
              <div className="mt-3 flex gap-2 items-center">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: popupInfo.color + '20', color: popupInfo.color, border: `1px solid ${popupInfo.color}` }}
                >
                  {popupInfo.category}
                </span>

                <Link href={`/dashboard/flights/${popupInfo.flightId}`}>
                  <button className="bg-blue-500 hover:bg-blue-600 rounded-full text-xs py-1 px-4 flex items-center gap-1 border border-blue-500 font-medium transition-all duration-200 cursor-pointer">
                    <FaInfoCircle className="w-4 h-4" />
                    <span className="text-xs">Details</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Flight Details */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Flight Time
                  </div>
                  <div className="text-white font-semibold">
                    {formatFlightTime(popupInfo.totalTime)}
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Distance
                  </div>
                  <div className="text-white font-semibold">
                    {popupInfo.distance} NM
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                  Flight Date
                </div>
                <div className="text-white font-semibold">
                  {formatDate(popupInfo.created)}
                </div>
              </div>

              {/* Aircraft Information */}
              <div className="bg-gray rounded-lg p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Aircraft
                </div>
                
                {loadingAircraft ? (
                  <div className="text-gray-400 text-sm">
                    Loading aircraft data...
                  </div>
                ) : aircraftData ? (
                  <div>
                    <div className="text-white font-bold text-lg mb-1">
                      {aircraftData.result.name}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    Aircraft data unavailable
                  </div>
                )}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => {
                setPopupInfo(null);
                setAircraftData(null);
              }}
              className="absolute top-4 right-4 bg-gray-600 hover:bg-gray-500 border-none rounded-full w-8 h-8 text-white text-lg cursor-pointer flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
