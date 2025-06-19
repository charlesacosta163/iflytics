"use client";

import React, { useEffect, useState, useRef } from "react";
import { Map } from "maplibre-gl";
import { X, Search, ChevronDown } from "lucide-react";
import { LuPartyPopper, LuSun, LuMoon } from "react-icons/lu";
import { useRouter, usePathname } from "next/navigation";

import { aviationCompliments } from "@/lib/data";
import UserPopupInfo from "./user-popup-info";
import { cn } from "@/lib/utils";
import { LuTowerControl } from "react-icons/lu";
import { GiControlTower } from "react-icons/gi";
import { FaRegFaceGrinWink } from "react-icons/fa6";
import { getUserFlightPlan, getAllAirportsWithActiveATC } from "@/lib/actions";

// Add the map themes configuration
const mapThemes = {
  "/map": {
    name: "Light",
    icon: <LuSun className="w-6 h-6" />
  },
  "/map/dark": {
    name: "Dark", 
    icon: <LuMoon className="w-6 h-6" />
  },
  "/map/party": {
    name: "Party",
    icon: <LuPartyPopper className="w-6 h-6" />
  }
};

const FullScreenMap = ({ flights, styleUrl }: { flights: any[], styleUrl: string }) => {
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Add state for current route
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null);

  // Function to create origin and destination sprites
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
        ctx.arc(spriteSize / 2, spriteSize / 2, spriteSize / 2 - 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw white border
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(spriteSize / 2, spriteSize / 2, spriteSize / 2 - 2, 0, 2 * Math.PI);
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
        ctx.arc(spriteSize / 2, spriteSize / 2, spriteSize / 2 - 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw white border
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(spriteSize / 2, spriteSize / 2, spriteSize / 2 - 2, 0, 2 * Math.PI);
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

  // Function to show flight route
  const showFlightRoute = async (flightId: string) => {
    if (!mapRef.current) return;
    
    try {
      const flightPlan = await getUserFlightPlan(flightId);
      
      if (flightPlan?.flightPlanItems?.length > 1) {
        const coordinates = flightPlan.flightPlanItems
          .filter((item: any) => item.location)
          .map((item: any) => [item.location.longitude, item.location.latitude])
          .filter((coord: [number, number]) => {
            // Filter out invalid coordinates
            const [lon, lat] = coord;
            return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
          });
        
        // Additional validation: reject routes with waypoints too far apart
        const validCoordinates = coordinates.filter((coord: [number, number], index: number) => {
          if (index === 0) return true;
          
          const [prevLon, prevLat] = coordinates[index - 1];
          const [currLon, currLat] = coord;
          
          // Calculate rough distance (reject if > 2000km between waypoints)
          const distance = Math.sqrt(
            Math.pow(currLon - prevLon, 2) + Math.pow(currLat - prevLat, 2)
          );
          
          return distance < 20; // Roughly 2000km
        });
        
        if (validCoordinates.length > 1) {
          const map = mapRef.current;
          const routeId = `route-${flightId}`;
          const originMarkerId = `origin-${flightId}`;
          const destinationMarkerId = `destination-${flightId}`;
          
          // FORCE cleanup first
          try {
            if (map.getLayer(routeId)) map.removeLayer(routeId);
            if (map.getSource(routeId)) map.removeSource(routeId);
            if (map.getLayer(originMarkerId)) map.removeLayer(originMarkerId);
            if (map.getSource(originMarkerId)) map.removeSource(originMarkerId);
            if (map.getLayer(destinationMarkerId)) map.removeLayer(destinationMarkerId);
            if (map.getSource(destinationMarkerId)) map.removeSource(destinationMarkerId);
          } catch (e) {
            // console.log("Route cleanup:", e);
          }
          
          // Create route sprites if they don't exist
          createRouteSprites(map);
          
          // Create gradient segments with VALIDATED coordinates
          const segments = [];
          const totalSegments = validCoordinates.length - 1;
          
          for (let i = 0; i < totalSegments; i++) {
            const progress = i / totalSegments;
            const red = Math.round(30 + (147 - 30) * progress);
            const green = Math.round(58 + (197 - 58) * progress);
            const blue = Math.round(138 + (253 - 138) * progress);
            
            segments.push({
              type: "Feature",
              properties: { 
                color: `rgb(${red}, ${green}, ${blue})`,
                segment: i 
              },
              geometry: {
                type: "LineString",
                coordinates: [validCoordinates[i], validCoordinates[i + 1]]
              }
            });
          }
          
          // Add route source and layer
          map.addSource(routeId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: segments as any
            }
          });
          
          map.addLayer({
            id: routeId,
            type: 'line',
            source: routeId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 4,
              'line-opacity': 0.9
            }
          });
          
          // Add origin marker (takeoff)
          const originCoord = validCoordinates[0];
          map.addSource(originMarkerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: originCoord
              },
              properties: {}
            }
          });
          
          map.addLayer({
            id: originMarkerId,
            type: 'symbol',
            source: originMarkerId,
            layout: {
              'icon-image': 'takeoff-sprite',
              'icon-size': 1,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            }
          });
          
          // Add destination marker (landing)
          const destinationCoord = validCoordinates[validCoordinates.length - 1];
          map.addSource(destinationMarkerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: destinationCoord
              },
              properties: {}
            }
          });
          
          map.addLayer({
            id: destinationMarkerId,
            type: 'symbol',
            source: destinationMarkerId,
            layout: {
              'icon-image': 'landing-sprite',
              'icon-size': 1,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            }
          });
          
          setCurrentRouteId(routeId);
        }
      }
    } catch (error) {
      console.error('Error fetching flight plan:', error);
    }
  };

  // Modified function to set popup info and show route
  const setPopupInfoWithRoute = (info: any) => {
    // Clear previous route first
    clearAllRoutes();
    
    // Set new popup info
    setPopupInfo(info);
    
    // Show route for new flight if info exists
    if (info && info.flightId) {
      showFlightRoute(info.flightId);
    }
  };

  // Enhanced clearPopupAndRoute function - destroys everything
  const clearPopupAndRoute = () => {
    clearAllRoutes();
    setPopupInfo(null);
  };

  // Focus on user function
  const focusOnUser = (flight: any) => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    // Fly to user's position with smooth animation
    map.flyTo({
      center: [flight.longitude, flight.latitude],
      zoom: 8,
      duration: 2000,
      essential: true
    });
        
    // Show popup and route for the user
    setPopupInfoWithRoute({
      emoji: flight?.emoji,
      compliment: flight?.compliment,
      customImage: flight?.customImage,
      username: flight?.username,
      callsign: flight?.callsign,
      altitude: flight?.altitude,
      speed: flight?.speed,
      heading: flight?.heading,
      aircraftId: flight?.aircraftId,
      flightId: flight?.flightId,
      isConnected: flight?.isConnected,
      lastReport: flight?.lastReport,
      latitude: flight?.latitude,
      longitude: flight?.longitude,
      liveryId: flight?.liveryId,
      pilotState: flight?.pilotState,
      role: flight?.role,
      track: flight?.track,
      userId: flight?.userId,
      verticalSpeed: flight?.verticalSpeed,
      virtualOrganization: flight?.virtualOrganization,
    });
  };

  // Simple map initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [0, 0],
      zoom: 1,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      createRouteSprites(map);
      
      map.addSource("flights", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "flight-points",
        type: "symbol",
        source: "flights",
        layout: {
          "icon-image": ["get", "imageId"],
          "icon-size": 0.8,
          "icon-allow-overlap": true,
        },
      });

      // Click handlers
      map.on("click", "flight-points", (e) => {
        if (e.features && e.features[0]) {
          const flight = e.features[0].properties;
          setPopupInfoWithRoute({
            emoji: flight?.emoji,
            compliment: flight?.compliment,
            customImage: flight?.customImage,
            username: flight?.username,
            callsign: flight?.callsign,
            altitude: flight?.altitude,
            speed: flight?.speed,
            heading: flight?.heading,
            aircraftId: flight?.aircraftId,
            flightId: flight?.flightId,
            isConnected: flight?.isConnected,
            lastReport: flight?.lastReport,
            latitude: flight?.latitude,
            longitude: flight?.longitude,
            liveryId: flight?.liveryId,
            pilotState: flight?.pilotState,
            role: flight?.role,
            track: flight?.track,
            userId: flight?.userId,
            verticalSpeed: flight?.verticalSpeed,
            virtualOrganization: flight?.virtualOrganization,
          });
        }
      });

      map.on("mouseenter", "flight-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "flight-points", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update flight data when flights change
  useEffect(() => {
    if (!mapRef.current || !flights || flights.length === 0) return;

    const handleRefresh = () => updateFlightData();
    window.addEventListener('refreshFlights', handleRefresh);
    
    const map = mapRef.current;
    
    const updateFlightData = () => {
      // Get unique users (not just emojis) since we need role-based styling
      const uniqueUsers = flights.reduce((acc: any[], flight) => {
        if (!acc.find(f => f.username === flight.username)) {
          acc.push(flight);
        }
        return acc;
      }, []);
      
      let loadedImages = 0;
      const totalImages = uniqueUsers.length;
      
      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          updateMapData();
        }
      };

      // Create user-specific images with role-based borders
      const createUserImage = (flight: any) => {
        const imageId = `user-${flight.username}`;
        
        if (map.hasImage(imageId)) {
          checkAllImagesLoaded();
          return;
        }

        if (flight.customImage) {
          // Custom image with border
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 36; // Increased size for border
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
              // Clear canvas
              ctx.clearRect(0, 0, 36, 36);
              
              // Draw border based on role
              if (flight.role === "staff") {
                ctx.strokeStyle = "#3b82f6"; // blue-500
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(18, 18, 16, 0, 2 * Math.PI);
                ctx.stroke();
              } else if (flight.role === "mod") {
                ctx.strokeStyle = "#8b5cf6"; // purple-500
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(18, 18, 16, 0, 2 * Math.PI);
                ctx.stroke();
              } else if (flight.role === "user") {
                ctx.fillStyle = "#374151"; // gray-700
                ctx.beginPath();
                ctx.arc(18, 18, 18, 0, 2 * Math.PI);
                ctx.fill();
              }
              
              // Create clipping path for image
              ctx.beginPath();
              ctx.arc(18, 18, flight.role === "user" ? 14 : 16, 0, 2 * Math.PI);
              ctx.clip();
              
              // Draw the custom image
              const imageSize = flight.role === "user" ? 28 : 32;
              const offset = flight.role === "user" ? 4 : 2;
              ctx.drawImage(img, offset, offset, imageSize, imageSize);
            }

            try {
              const imageData = ctx?.getImageData(0, 0, 36, 36);
              if (imageData) {
                map.addImage(imageId, imageData);
              }
            } catch (error) {
              // console.log(`Error adding custom image ${imageId}:`, error);
            }
            checkAllImagesLoaded();
          };
          
          img.onerror = () => {
            // Fallback to emoji if custom image fails
            createEmojiWithBorder(flight);
          };
          
          img.src = flight.customImage;
        } else {
          // Create emoji with border
          createEmojiWithBorder(flight);
        }
      };

      const createEmojiWithBorder = (flight: any) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 36; // Increased size for border
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, 36, 36);
          
          // Draw border/background based on role
          if (flight.role === "staff") {
            ctx.strokeStyle = "#3b82f6"; // blue-500
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(18, 18, 16, 0, 2 * Math.PI);
            ctx.stroke();
          } else if (flight.role === "mod") {
            ctx.strokeStyle = "#8b5cf6"; // purple-500
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(18, 18, 16, 0, 2 * Math.PI);
            ctx.stroke();
          } else if (flight.role === "user") {
            ctx.fillStyle = "#374151"; // gray-700
            ctx.beginPath();
            ctx.arc(18, 18, 16, 0, 2 * Math.PI);
            ctx.fill();
          }
          
          // Draw emoji
          ctx.font = flight.role === "user" ? "24px Arial" : "28px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "white";
          ctx.fillText(flight.emoji, 18, 18);
        }

        const img = new Image();
        img.onload = () => {
          try {
            map.addImage(`user-${flight.username}`, img);
          } catch (error) {
            // console.log(`Image user-${flight.username} already exists`);
          }
          checkAllImagesLoaded();
        };
        img.src = canvas.toDataURL();
      };

      // Handle case where there are no images to load
      if (totalImages === 0) {
        updateMapData();
        return;
      }

      // Create images for all unique users
      uniqueUsers.forEach(createUserImage);
    };

    // Update the map data function
    const updateMapData = () => {
      const flightFeatures = flights.map((flight) => {
        return {
          type: "Feature" as const,
          id: `flight-${flight.username}`,
          geometry: {
            type: "Point" as const,
            coordinates: [flight.longitude, flight.latitude] as [number, number],
          },
          properties: {
            callsign: flight.callsign,
            username: flight.username,
            altitude: flight.altitude,
            speed: flight.speed,
            emoji: flight.emoji,
            compliment: flight.compliment,
            customImage: flight.customImage,
            imageId: `user-${flight.username}`, // Always use user-specific image
            aircraftId: flight.aircraftId,
            flightId: flight.flightId,
            heading: flight.heading,
            isConnected: flight.isConnected,
            lastReport: flight.lastReport,
            latitude: flight.latitude,
            longitude: flight.longitude,
            liveryId: flight.liveryId,
            pilotState: flight.pilotState,
            role: flight.role,
            track: flight.track,
            userId: flight.userId,
            verticalSpeed: flight.verticalSpeed,
            virtualOrganization: flight.virtualOrganization,
          },
        };
      });

      const source = map.getSource("flights") as any;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: flightFeatures,
        });
      }
    };

    // Wait for map to be loaded
    if (!map.isStyleLoaded()) {
      map.on("load", updateFlightData);
    } else {
      updateFlightData();
    }

    return () => {
      window.removeEventListener('refreshFlights', handleRefresh);
    };
  }, [flights]);

  // Enhanced clearAllRoutes function - nuclear cleanup
  const clearAllRoutes = () => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    const style = map.getStyle();
    
    // Find and remove all route, origin, and destination layers
    if (style && style.layers) {
      style.layers.forEach((layer: any) => {
        if (layer.id.startsWith('route-') || layer.id.startsWith('origin-') || layer.id.startsWith('destination-')) {
          try {
            if (map.getLayer(layer.id)) {
              map.removeLayer(layer.id);
            }
          } catch (error) {
            console.warn(`Error removing layer ${layer.id}:`, error);
          }
        }
      });
    }
    
    // Find and remove all route, origin, and destination sources  
    if (style && style.sources) {
      Object.keys(style.sources).forEach(sourceId => {
        if (sourceId.startsWith('route-') || sourceId.startsWith('origin-') || sourceId.startsWith('destination-')) {
          try {
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId);
            }
          } catch (error) {
            console.warn(`Error removing source ${sourceId}:`, error);
          }
        }
      });
    }
    
    setCurrentRouteId(null);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <p className="hidden lg:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
        <b>IFlytics Users & IF Staff</b> get their IFC avatar on the map!
      </p>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* FloatingRightNav with theme button */}
      <FloatingRightNav 
        flights={flights} 
        onSelectUser={focusOnUser}
      />

      {/* Flight Information Popup */}
      {popupInfo && (
        <UserPopupInfo 
          popupInfo={popupInfo} 
          setPopupInfo={clearPopupAndRoute}
        />
      )}
    </div>
  );
};

const FloatingRightNav = ({ 
  flights, 
  onSelectUser
}: { 
  flights: any[], 
  onSelectUser: (flight: any) => void
}) => {
  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[999]">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg p-2 space-y-2 border border-white/30">
        {/* ATC Button */}
        <ActiveATCButton />
        
        {/* Search Button */}
        <SearchButton flights={flights} onSelectUser={onSelectUser} />
        
        {/* Compliment Button */}
        <ComplimentButton flights={flights} />
        
        {/* Map Theme Button */}
        <MapThemeButton />
      </div>
    </div>
  );
};

const ActiveATCButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [atcFacilities, setAtcFacilities] = useState<any[]>([]);

  useEffect(() => {
    const loadATC = async () => {
      try {
        const data = await getAllAirportsWithActiveATC();
        
        if (data && data.length > 0) {
          const uniqueAirports = data
            .filter((item: any, index: number, self: any[]) => 
              index === self.findIndex(airport => airport.airportName === item.airportName)
            )
            .filter((airport: any) => airport.airportName && airport.username)
            .sort((a: any, b: any) => a.airportName.localeCompare(b.airportName));
          
          setAtcFacilities(uniqueAirports);
        } else {
          setAtcFacilities([]);
        }
      } catch (error) {
        console.error("Error fetching ATC data:", error);
        setAtcFacilities([]);
      }
    };

    loadATC();
    const interval = setInterval(loadATC, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Button in the floating nav */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 bg-green-500/90 backdrop-blur-sm rounded-xl shadow-lg
                   hover:bg-green-600 transition-all duration-200 relative
                   flex items-center justify-center group"
      >
        <div className="animate-ping absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
        <LuTowerControl className="w-5 h-5 text-white" />
      </button>

      {/* Panel - slides out from the floating nav */}
      {isOpen && (
        <div className="absolute right-16 top-0 z-[1001]">
          <div className="bg-[#E8F4FD] backdrop-blur-sm rounded-xl shadow-xl
                          w-72 animate-in slide-in-from-right duration-300">
            <div className="p-4 max-h-80 overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <LuTowerControl className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-gray-800 text-lg">Active ATC</h3>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {atcFacilities.length} facilities active
              </div>

              <div className="max-h-52 overflow-y-auto">
                {atcFacilities.length > 0 ? (
                  atcFacilities.map((facility, index) => (
                    <div
                      key={`${facility.airportName}-${index}`}
                      className="flex items-center gap-3 px-3 py-3 text-sm hover:bg-blue-50 rounded-lg mb-2"
                    >
                      <div className="text-blue-500">
                        <GiControlTower className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {facility.airportName}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          Controller: {facility.username}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    <GiControlTower className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <div className="text-sm">No active ATC facilities</div>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-blue-100">
                <p className="text-xs text-gray-400 text-center">
                  Updates every 30 seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SearchButton = ({ flights, onSelectUser }: { flights: any[], onSelectUser: (flight: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = flights.filter(flight => {
      const username = flight.username?.toLowerCase() || "";
      const callsign = flight.callsign?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return username.includes(query) || callsign.includes(query);
    });
    
    setSearchResults(filtered.slice(0, 15));
  }, [searchQuery, flights]);

  return (
    <>
      {/* Button in the floating nav */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 bg-blue-500/90 backdrop-blur-sm rounded-xl shadow-lg
                   hover:bg-blue-600 transition-all duration-200
                   flex items-center justify-center"
      >
        <Search className="w-5 h-5 text-white" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-16 top-0 z-[1001]">
          <div className="bg-[#FFEFD5] backdrop-blur-sm rounded-xl shadow-xl
                          w-72 animate-in slide-in-from-right duration-300">
            <div className="p-4 max-h-96 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Search Pilots</h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative text-sm font-medium mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="👨‍✈️ Search pilots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto">
                {searchQuery.trim() === "" ? (
                  <div className="text-center text-gray-500 py-4">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <div>Start typing to search pilots...</div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((flight, index) => (
                    <div
                      key={`${flight.username}-${index}`}
                      onClick={() => {
                        onSelectUser(flight);
                        setIsOpen(false);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className={cn("flex items-center gap-3 px-3 py-3 text-sm hover:bg-blue-50 cursor-pointer rounded-lg mb-2", 
                        flight.role === "staff" ? "hover:bg-blue-600 bg-blue-500 text-light" : 
                        flight.role === "mod" ? "hover:bg-purple-600 bg-purple-500 text-light" :
                        flight.role === "user" ? "hover:bg-black/50 bg-gradient-to-br from-gray to-dark !text-light" : "")}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 text-lg flex items-center justify-center">
                          {flight.customImage ? (
                            <img 
                              src={new URL(flight.customImage, import.meta.url).href} 
                              alt="Custom avatar" 
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            flight.emoji
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("font-semibold truncate", 
                          flight.role === "staff" ? "text-light" : 
                          flight.role === "mod" ? "!text-light" :
                          flight.role === "user" ? "!text-light" : "text-gray-900")}>
                          {flight.username || "Zombie"}
                        </div>
                        <div className={cn("text-xs truncate", 
                          flight.role === "staff" ? "text-light" : 
                          flight.role === "mod" ? "!text-light" :
                          flight.role === "user" ? "!text-light" : "text-gray-500")}>
                          {flight.callsign}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className={cn("text-xs", 
                          flight.role === "staff" ? "text-light" : 
                          flight.role === "mod" ? "!text-light" :
                          flight.role === "user" ? "!text-light" : "text-gray-500")}>
                          {Math.round(flight.altitude)}ft
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <div>No pilots found matching "{searchQuery}"</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ComplimentButton = ({ flights }: { flights: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCompliment, setCurrentCompliment] = useState("");
  const [topUsers, setTopUsers] = useState<any[]>([]);
  

  useEffect(() => {
    if (!flights || flights.length === 0) return;

    const randomCompliment = aviationCompliments[Math.floor(Math.random() * aviationCompliments.length)];
    setCurrentCompliment(randomCompliment);

    const usersWithCompliment = flights.filter(flight => flight.compliment === randomCompliment);
    const shuffled = usersWithCompliment.sort(() => Math.random() - 0.5);
    setTopUsers(shuffled.slice(0, 10));
  }, [flights]);

  if (topUsers.length === 0) return null;

  return (
    <>
      {/* Button in the floating nav */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 bg-orange-400/90 backdrop-blur-sm rounded-xl shadow-lg
                   hover:bg-orange-500 transition-all duration-200 relative
                   flex items-center justify-center"
      >
        <div className="animate-ping absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
        <FaRegFaceGrinWink className="w-5 h-5 text-white" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-16 top-0 z-[1001]">
          <div className="bg-[#FFEFD5] backdrop-blur-sm rounded-xl shadow-xl
                          w-72 md:w-80 animate-in slide-in-from-right duration-300">
            <div className="p-3 md:p-4 max-h-80 md:max-h-96 overflow-hidden">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-base md:text-lg tracking-tight mb-1">Compliment Kings</h3>
                  <p className="text-xs font-semibold text-blue-600 font-mono">{currentCompliment}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-42 md:max-h-48 overflow-y-auto">
                {topUsers.length > 0 ? topUsers.map((flight, index) => (
                  <div key={`${flight.username}-${index}`} className="flex items-center gap-2 md:gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="text-xs font-bold text-gray-400 w-5 md:w-6">
                      #{index + 1}
                    </div>

                    <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                      {flight.customImage ? (
                        <img 
                          src={flight.customImage} 
                          alt="Avatar" 
                          className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs md:text-sm">{flight.emoji}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">
                        {flight.username}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {flight.callsign}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-500">
                        {Math.round(flight.altitude)}ft
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-sm text-gray-500">
                    Looks like no one has been complimented yet!
                  </div>
                )}
              </div>

              <div className="mt-2 md:mt-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Refreshes every update • Top 10 pilots
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MapThemeButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* Theme Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-purple-500/90 backdrop-blur-sm rounded-xl shadow-lg
                     hover:bg-purple-600 transition-all duration-200
                     flex items-center justify-center group relative"
        >
          <span className="text-light text-lg">
            {mapThemes[pathname as keyof typeof mapThemes]?.icon || mapThemes["/map"].icon}
          </span>
          <ChevronDown className={cn("w-3 h-3 text-light absolute -bottom-1 -right-1 transition-transform duration-200", 
            isOpen && "rotate-180")} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop to close dropdown */}
            <div 
              className="fixed inset-0 z-[998]" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <div className="absolute right-16 top-0 z-[1002] w-40">
              <div className="bg-gray-700 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-2">
                  <div className="text-xs font-semibold text-light px-3 py-2 border-b border-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Map Theme</span>
                      <button onClick={() => setIsOpen(false)}>
                        <X className="w-3 h-3 text-light" />
                      </button>
                    </div>
                  </div>
                  {Object.entries(mapThemes).map(([path, theme]) => (
                    <button
                      key={path}
                      onClick={() => {
                        router.push(path);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-light",
                        pathname === path 
                          ? "bg-purple-600 font-medium" 
                          : "hover:bg-gray-600"
                      )}
                    >
                      <span className="text-base">{theme.icon}</span>
                      <span className="flex-1 text-left">{theme.name}</span>
                      {pathname === path && (
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FullScreenMap;