"use client";

import React, { useEffect, useState, useRef } from "react";
import { Map } from "maplibre-gl";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { TiZoomInOutline, TiZoomOutOutline } from "react-icons/ti";
import { LuPartyPopper, LuSun, LuMoon, LuTowerControl, LuEarth, LuSnowflake } from "react-icons/lu";
import { useRouter, usePathname } from "next/navigation";

import { aviationCompliments, customUserImages } from "@/lib/data";
import UserPopupInfo from "./user-popup-info";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GiControlTower } from "react-icons/gi";
import { FaRegFaceGrinWink } from "react-icons/fa6";
import { getUserFlightPlan, getAllAirportsWithActiveATC } from "@/lib/actions";
import { BiSolidFaceMask } from "react-icons/bi";
import { SlGlobe } from "react-icons/sl";
import { ImBlocked } from "react-icons/im";
import { RiUserCommunityLine } from "react-icons/ri";
import { FaPlane, FaRegSmileBeam } from "react-icons/fa";


// Add the map themes configuration
const mapThemes = {
  "/map": {
    name: "Light",
    icon: <LuSun className="w-6 h-6" />,
  },
  "/map/dark": {
    name: "Dark",
    icon: <LuMoon className="w-6 h-6" />,
  },
};

const FullScreenMap = ({
  flights,
  styleUrl,
}: {
  flights: any[];
  styleUrl: string;
}) => {

  // console.log(flights[0])
  const [displayedFlights, setDisplayedFlights] = useState(flights);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showAirplanes, setShowAirplanes] = useState(true);

  // Function to apply current filter to flight data
  const applyActiveFilter = (flightData: any[]) => {
    switch(activeFilter) {
      case "iflytics":
        return flightData.filter(f => 
          f.username && 
          customUserImages.some(user => user.username === f.username)
        );
      case "no-zombies":
        return flightData.filter(f => f.username && f.username.trim() !== "");
      default:
        return flightData;
    }
  };

  // Update displayed flights when flights prop changes - but maintain filter
  useEffect(() => {
    const filteredData = applyActiveFilter(flights);
    setDisplayedFlights(filteredData);
  }, [flights, activeFilter]);

  // Handle filter changes
  const handleFilterChange = (filteredFlights: any[], filterId: string) => {
    setActiveFilter(filterId);
    setDisplayedFlights(filteredFlights);
  };

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
            // Filter out invalid coordinates and null island (0,0)
            const [lon, lat] = coord;
            return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90 && !(lon === 0 && lat === 0);
          });

        // Additional validation: reject routes with waypoints too far apart
        const validCoordinates = coordinates.filter(
          (coord: [number, number], index: number) => {
            if (index === 0) return true;

            const [prevLon, prevLat] = coordinates[index - 1];
            const [currLon, currLat] = coord;

            // Calculate rough distance (reject if > 2000km between waypoints)
            const distance = Math.sqrt(
              Math.pow(currLon - prevLon, 2) + Math.pow(currLat - prevLat, 2)
            );

            return distance < 20; // Roughly 2000km
          }
        );

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
            if (map.getLayer(destinationMarkerId))
              map.removeLayer(destinationMarkerId);
            if (map.getSource(destinationMarkerId))
              map.removeSource(destinationMarkerId);
          } catch (e) {
            // console.log("Route cleanup:", e);
          }

          // Create route sprites if they don't exist
          createRouteSprites(map);

          // Split route at antimeridian crossings
          const routeSegments = splitAntimeridianRoute(validCoordinates);
          
          // Create gradient segments for each antimeridian-split route
          const segments: any[] = [];
          let globalSegmentIndex = 0;
          const totalOriginalSegments = validCoordinates.length - 1;

          routeSegments.forEach((segmentCoords: [number, number][]) => {
            if (segmentCoords.length > 1) {
              for (let i = 0; i < segmentCoords.length - 1; i++) {
                const progress = globalSegmentIndex / totalOriginalSegments;
                const red = Math.round(30 + (147 - 30) * progress);
                const green = Math.round(58 + (197 - 58) * progress);
                const blue = Math.round(138 + (253 - 138) * progress);

                segments.push({
                  type: "Feature",
                  properties: {
                    color: `rgb(${red}, ${green}, ${blue})`,
                    segment: globalSegmentIndex,
                  },
                  geometry: {
                    type: "LineString",
                    coordinates: [segmentCoords[i], segmentCoords[i + 1]],
                  },
                });
                
                globalSegmentIndex++;
              }
            }
          });

          // Add route source and layer
          map.addSource(routeId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: segments as any,
            },
          });

          map.addLayer({
            id: routeId,
            type: "line",
            source: routeId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": ["get", "color"],
              "line-width": 4,
              "line-opacity": 0.9,
            },
          });

          // Add origin marker (takeoff)
          const originCoord = validCoordinates[0];
          map.addSource(originMarkerId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: originCoord,
              },
              properties: {},
            },
          });

          map.addLayer({
            id: originMarkerId,
            type: "symbol",
            source: originMarkerId,
            layout: {
              "icon-image": "takeoff-sprite",
              "icon-size": 1,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            },
          });

          // Add destination marker (landing)
          const destinationCoord =
            validCoordinates[validCoordinates.length - 1];
          map.addSource(destinationMarkerId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: destinationCoord,
              },
              properties: {},
            },
          });

          map.addLayer({
            id: destinationMarkerId,
            type: "symbol",
            source: destinationMarkerId,
            layout: {
              "icon-image": "landing-sprite",
              "icon-size": 1,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            },
          });

          setCurrentRouteId(routeId);
        }
      }
    } catch (error) {
      console.error("Error fetching flight plan:", error);
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
      essential: true,
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
      attributionControl: true as any,
      logoPosition: "bottom-right" as any,
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

  // Function to create airplane sprites using SVG files
  const createAirplaneSprite = (flight: any, callback: (canvas: HTMLCanvasElement) => void) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 60;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, 60, 60);

      // Determine which SVG to use based on role
      let svgPath = "/images/sprites/plane.svg"; // default for unregistered users
      
      if (flight.role === "staff") {
        svgPath = "/images/sprites/staffplane.svg";
      } else if (flight.role === "mod") {
        svgPath = "/images/sprites/modplane.svg";
      } else if (flight.role === "user") {
        svgPath = "/images/sprites/userplane.svg";
      } else if (flight.virtualOrganization) {
        if (flight.virtualOrganization.includes("IFATC")) {
          svgPath = "/images/sprites/ifatcplane.svg";
        }
      } 
      else if (flight.pilotState === 1 || flight.pilotState === 2 || flight.pilotState === 3) {
        svgPath = "/images/sprites/applane.svg";
      }

      // Load and draw the SVG
      const img = new Image();
      img.onload = () => {
        // Set up rotation based on heading
        const centerX = 30;
        const centerY = 30;
        const heading = flight.heading || 0;
        const rotation = ((heading - 90) * Math.PI) / 180; // Convert to radians, adjust for SVG pointing east (0°) vs aviation heading (0° = North)

        // Save context and apply rotation
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);

        // Draw the airplane SVG centered (made smaller)
        ctx.drawImage(img, -12, -12, 24, 24);

        // Restore context
        ctx.restore();
        
        // Call the callback with the completed canvas
        callback(canvas);
      };
      
      img.onerror = () => {
        console.warn(`Failed to load airplane sprite: ${svgPath}`);
        // Still call callback even on error so the loading process continues
        callback(canvas);
      };
      
      img.src = svgPath;
    }
  };

  // Update flight data when flights change
  useEffect(() => {
    if (!mapRef.current || !flights || flights.length === 0) return;

    const handleRefresh = () => updateFlightData();
    window.addEventListener("refreshFlights", handleRefresh);

    const map = mapRef.current;

    const updateFlightData = () => {
      // Get unique users (not just emojis) since we need role-based styling
      const uniqueUsers = flights.reduce((acc: any[], flight) => {
        if (!acc.find((f) => f.username === flight.username)) {
          acc.push(flight);
        }
        return acc;
      }, []);

      let loadedImages = 0;
      const totalImages = uniqueUsers.length * (showAirplanes ? 2 : 1); // Double if we need both emoji and airplane

      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          updateMapData();
        }
      };

      // Create user-specific images with role-based borders
      const createUserImage = (flight: any) => {
        const emojiImageId = `user-${flight.username}`;
        const airplaneImageId = `airplane-${flight.username}`;

        // Create emoji image
        if (!map.hasImage(emojiImageId)) {
          createEmojiImage(flight, emojiImageId);
        } else {
          checkAllImagesLoaded();
        }

        // Create airplane image if airplane mode is enabled
        if (showAirplanes && !map.hasImage(airplaneImageId)) {
          createAirplaneSprite(flight, (canvas) => {
            const airplaneImg = new Image();
            airplaneImg.onload = () => {
              try {
                map.addImage(airplaneImageId, airplaneImg);
              } catch (error) {
                console.warn(`Error adding airplane image ${airplaneImageId}:`, error);
              }
              checkAllImagesLoaded();
            };
            airplaneImg.src = canvas.toDataURL();
          });
        } else if (showAirplanes) {
          checkAllImagesLoaded();
        }
      };

      const createEmojiImage = (flight: any, imageId: string) => {
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
            createEmojiWithBorder(flight, imageId);
          };

          img.src = flight.customImage;
        } else {
          // Create emoji with border
          createEmojiWithBorder(flight, imageId);
        }
      };

      const createEmojiWithBorder = (flight: any, imageId: string) => {
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
            map.addImage(imageId, img);
          } catch (error) {
            // console.log(`Image ${imageId} already exists`);
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
      const flightFeatures = displayedFlights.map((flight) => {
        return {
          type: "Feature" as const,
          id: `flight-${flight.username}`,
          geometry: {
            type: "Point" as const,
            coordinates: [flight.longitude, flight.latitude] as [
              number,
              number
            ],
          },
          properties: {
            callsign: flight.callsign,
            username: flight.username,
            altitude: flight.altitude,
            speed: flight.speed,
            emoji: flight.emoji,
            compliment: flight.compliment,
            customImage: flight.customImage,
            imageId: showAirplanes ? `airplane-${flight.username}` : `user-${flight.username}`,
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
      window.removeEventListener("refreshFlights", handleRefresh);
    };
  }, [displayedFlights, styleUrl]);

  // Handle airplane mode toggle
  useEffect(() => {
    if (!mapRef.current || !flights || flights.length === 0) return;

    const map = mapRef.current;
    
    // Get unique users for airplane sprites
    const uniqueUsers = flights.reduce((acc: any[], flight) => {
      if (!acc.find((f) => f.username === flight.username)) {
        acc.push(flight);
      }
      return acc;
    }, []);

    const updateMapDataWithMode = () => {
      const flightFeatures = displayedFlights.map((flight) => {
        return {
          type: "Feature" as const,
          id: `flight-${flight.username}`,
          geometry: {
            type: "Point" as const,
            coordinates: [flight.longitude, flight.latitude] as [
              number,
              number
            ],
          },
          properties: {
            callsign: flight.callsign,
            username: flight.username,
            altitude: flight.altitude,
            speed: flight.speed,
            emoji: flight.emoji,
            compliment: flight.compliment,
            customImage: flight.customImage,
            imageId: showAirplanes ? `airplane-${flight.username}` : `user-${flight.username}`,
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

    if (showAirplanes) {
      // Create airplane sprites for all users
      let loadedImages = 0;
      const totalImages = uniqueUsers.length;

      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          updateMapDataWithMode();
        }
      };

      if (totalImages === 0) {
        updateMapDataWithMode();
        return;
      }

      uniqueUsers.forEach((flight) => {
        const airplaneImageId = `airplane-${flight.username}`;
        if (!map.hasImage(airplaneImageId)) {
          createAirplaneSprite(flight, (canvas) => {
            const airplaneImg = new Image();
            airplaneImg.onload = () => {
              try {
                map.addImage(airplaneImageId, airplaneImg);
              } catch (error) {
                console.warn(`Error adding airplane image ${airplaneImageId}:`, error);
              }
              checkAllImagesLoaded();
            };
            airplaneImg.src = canvas.toDataURL();
          });
        } else {
          checkAllImagesLoaded();
        }
      });
    } else {
      // Just update the map data immediately when switching back to emoji mode
      updateMapDataWithMode();
    }
  }, [showAirplanes]); // Remove displayedFlights from dependency to prevent infinite loop

  // Enhanced clearAllRoutes function - nuclear cleanup
  const clearAllRoutes = () => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const style = map.getStyle();

    // Find and remove all route, origin, and destination layers
    if (style && style.layers) {
      style.layers.forEach((layer: any) => {
        if (
          layer.id.startsWith("route-") ||
          layer.id.startsWith("origin-") ||
          layer.id.startsWith("destination-")
        ) {
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
      Object.keys(style.sources).forEach((sourceId) => {
        if (
          sourceId.startsWith("route-") ||
          sourceId.startsWith("origin-") ||
          sourceId.startsWith("destination-")
        ) {
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

  // Add zoom functions
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

  // Add this function to handle antimeridian crossing
  const splitAntimeridianRoute = (coordinates: [number, number][]): [number, number][][] => {
    const segments: [number, number][][] = [];
    let currentSegment: [number, number][] = [coordinates[0]];
    
    for (let i = 1; i < coordinates.length; i++) {
      const [prevLon] = coordinates[i - 1];
      const [currLon] = coordinates[i];
      
      // Check if we're crossing the antimeridian (180° difference)
      if (Math.abs(currLon - prevLon) > 180) {
        // Finish current segment
        segments.push([...currentSegment]);
        // Start new segment
        currentSegment = [coordinates[i]];
      } else {
        currentSegment.push(coordinates[i]);
      }
    }
    
    segments.push(currentSegment);
    return segments;
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Airplane Mode Switch - Bottom Center */}
      <div className="absolute left-4 bottom-16 sm:bottom-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 bg-white/20 dark:bg-gray-700/20 dark:text-light backdrop-blur-sm rounded-2xl shadow-lg p-3 border border-white/30">
        <div className="flex items-center space-x-3">
          <Switch
            id="airplane-mode"
            checked={showAirplanes}
            onCheckedChange={setShowAirplanes}
          />

          <Label htmlFor="airplane-mode" className="text-sm font-medium cursor-pointer">
            <span className={`flex items-center gap-2 ${showAirplanes ? "text-blue-500 dark:text-blue-400" : "text-[#3eb489] dark:text-[#126d4b]"}`}>
              {showAirplanes ? <FaPlane /> : <FaRegSmileBeam />}
              <span className="hidden sm:inline">{showAirplanes ? "Airplane Mode" : "Emoji Mode"}</span> 
            </span>
           </Label>
        </div>
      </div>

      {/* Toggle Button - Always Visible */}
      <NavToggleButton 
        isVisible={isNavVisible} 
        onToggle={() => setIsNavVisible(!isNavVisible)} 
      />

      {/* FloatingRightNav with slide animation */}
      <FloatingRightNav 
        flights={flights}
        activeFilter={activeFilter}
        onSelectUser={focusOnUser} 
        onFilterChange={handleFilterChange}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        isVisible={isNavVisible}
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

// Add the toggle button component
const NavToggleButton = ({ 
  isVisible, 
  onToggle 
}: { 
  isVisible: boolean; 
  onToggle: () => void; 
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed top-1/2 transform -translate-y-1/2 z-[5]
        w-10 h-16 backdrop-blur-2xl
        transition-all duration-500 ease-out group overflow-hidden
        ${isVisible 
          ? 'right-[calc(4rem+0.5rem)] sm:right-[calc(4rem+1rem)] bg-white/15 hover:bg-white/25 rounded-l-3xl border-l border-t border-b border-white/30' 
          : 'right-0 bg-gradient-to-br from-white/20 via-blue-500/20 to-purple-600/20 hover:from-white/30 hover:via-blue-500/30 hover:to-purple-600/30 rounded-l-[2rem] border border-white/40 border-r-0'
        }
      `}
      style={{
        transform: 'translateY(-50%)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Animated background */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700
        ${isVisible 
          ? 'bg-gradient-to-r from-transparent via-white/10 to-blue-400/20'
          : 'bg-gradient-to-br from-blue-400/30 via-purple-500/30 to-pink-500/20'
        }
      `} />
      
      {/* Floating orb effect */}
      <div className="absolute inset-0 group-hover:animate-pulse">
        <div className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          w-8 h-8 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500
          ${isVisible ? 'bg-white' : 'bg-gradient-to-br from-blue-400 to-purple-500'}
        `} />
      </div>
      
      {/* Icon with enhanced animation */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className={`
          transition-all duration-500 ease-out
          ${isVisible 
            ? 'text-white/80 group-hover:text-white group-hover:scale-125 group-hover:rotate-12' 
            : 'text-white/90 group-hover:text-white group-hover:scale-125 group-hover:-rotate-12'
          }
        `}>
          {isVisible ? (
            <ChevronRight className="w-6 h-6 drop-shadow-lg" />
          ) : (
            <ChevronLeft className="w-6 h-6 drop-shadow-lg" />
          )}
        </div>
      </div>
    </button>
  );
};

// Update FloatingRightNav with slide animation and zoom controls
const FloatingRightNav = ({
  flights,
  activeFilter,
  onSelectUser,
  onFilterChange,
  onZoomIn,
  onZoomOut,
  isVisible, // Add visibility prop
}: {
  flights: any[];
  activeFilter: string;
  onSelectUser: (flight: any) => void;
  onFilterChange: (filteredFlights: any[], filterId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isVisible: boolean; // Add visibility prop
}) => {
  const router = useRouter();

  return (
    <div 
      className={`
        absolute top-1/2 transform -translate-y-1/2 z-[999]
        transition-all duration-300 ease-in-out
        ${isVisible 
          ? 'right-2 sm:right-4 translate-x-0 opacity-100' 
          : 'right-2 sm:right-4 translate-x-full opacity-0 pointer-events-none'
        }
      `}
      style={{
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out'
      }}
    >
      <div className="bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm rounded-2xl shadow-lg p-2 space-y-2 border border-white/30">
        {/* Zoom Controls */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={onZoomIn}
            className="w-12 h-8 bg-light/60 backdrop-blur-sm rounded-lg shadow-lg
                       hover:bg-gray-200 transition-all duration-200
                       flex items-center justify-center"
          >
            <TiZoomInOutline className="w-7 h-7 text-blue-400" />
          </button>
          <button
            onClick={onZoomOut}
            className="w-12 h-8 bg-light/60 backdrop-blur-sm rounded-lg shadow-lg
                       hover:bg-gray-200 transition-all duration-200
                       flex items-center justify-center"
          >
            <TiZoomOutOutline className="w-7 h-7 text-red-400" />
          </button>
        </div>

        {/* ATC Button */}
        <ActiveATCButton />

        {/* Search Button */}
        <SearchButton flights={flights} onSelectUser={onSelectUser} />

        {/* Filter Button */}
        <FilterButton 
          flights={flights} 
          activeFilter={activeFilter}
          onFilterChange={onFilterChange} 
        />

        {/* Compliment Button */}
        <ComplimentButton flights={flights} />

        {/* Map Theme Button */}
        <MapThemeButton />

        {/* Game Button */}
        <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 p-[4px] rounded-xl shadow-lg">
          <button
            onClick={() => router.push("/map/game")}
            className="w-10 h-10 bg-gray-700 text-light backdrop-blur-sm rounded-xl shadow-lg
                    hover:bg-gray-900 transition-all duration-200 relative
                    flex flex-col items-center justify-center group"
          >
            <BiSolidFaceMask className="w-4 h-4 text-white" />
            <span className="text-[0.4rem] text-white font-bold">Game</span>
          </button>
        </div>
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
            .filter(
              (item: any, index: number, self: any[]) =>
                index ===
                self.findIndex(
                  (airport) => airport.airportName === item.airportName
                )
            )
            .filter((airport: any) => airport.airportName && airport.username)
            .sort((a: any, b: any) =>
              a.airportName.localeCompare(b.airportName)
            );

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
                   flex flex-col items-center justify-center group"
      >
        <div className="animate-ping absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
        <LuTowerControl className="w-5 h-5 text-white" />
        <span className="text-[0.5rem] text-white font-bold">ATC</span>
      </button>

      {/* Panel - NO BLUR EFFECT */}
      {isOpen && (
        <div className="absolute right-18 top-[-0.5rem] z-[10001] slide-in-from-right-2 duration-500 ease-out">
          <div className="bg-[#E8F4FD]/95 backdrop-blur-xl rounded-3xl shadow-2xl w-72">
            <div className="p-4 max-h-80 overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <LuTowerControl className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-gray-800 text-lg">
                    Active ATC
                  </h3>
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
                      <div className="text-gray">
                        <GiControlTower className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black tracking-tight text-blue-500 truncate">
                          {facility.airportName}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          Controller:{" "}
                          <span className="font-bold tracking-tight text-blue-900">
                            {facility.username}
                          </span>
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

            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SearchButton = ({
  flights,
  onSelectUser,
}: {
  flights: any[];
  onSelectUser: (flight: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = flights.filter((flight) => {
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
                   hover:bg-blue-600 hover:scale-105 transition-all duration-300
                   flex flex-col items-center justify-center relative group"
      >
        <Search className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
        <span className="text-[0.5rem] text-white font-bold">Find</span>
      </button>

      {/* Panel - NO BLUR EFFECT */}
      {isOpen && (
        <div className="absolute right-18 top-[-0.5rem] z-[10001] w-72 md:w-80 slide-in-from-right-2 duration-500 ease-out">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-white/30 rounded-t-3xl">
              <h3 className="text-lg tracking-tight font-bold text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                Find Pilot
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all duration-300 text-gray-400 hover:text-gray-600 hover:rotate-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative text-sm font-medium mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 dark:text-gray-300 text-gray-400" />
              <input
                type="text"
                placeholder="👨‍✈️ Search pilots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="max-h-60 overflow-y-auto px-2">
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
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 text-sm hover:bg-blue-50 cursor-pointer rounded-lg mb-2",
                      flight.role === "staff"
                        ? "hover:bg-blue-600 bg-blue-500 text-light"
                        : flight.role === "mod"
                        ? "hover:bg-purple-600 bg-purple-500 text-light"
                        : flight.role === "user"
                        ? "hover:bg-black/50 bg-gradient-to-br from-gray to-dark !text-light"
                        : ""
                    )}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 text-lg flex items-center justify-center">
                        {flight.customImage ? (
                          <img
                            src={
                              new URL(flight.customImage, import.meta.url)
                                .href
                            }
                            alt="Custom avatar"
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          flight.emoji
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "font-semibold truncate",
                          flight.role === "staff"
                            ? "text-light"
                            : flight.role === "mod"
                            ? "!text-light"
                            : flight.role === "user"
                            ? "!text-light"
                            : "text-gray-900"
                        )}
                      >
                        {flight.username || "Zombie"}
                      </div>
                      <div
                        className={cn(
                          "text-xs truncate",
                          flight.role === "staff"
                            ? "text-light"
                            : flight.role === "mod"
                            ? "!text-light"
                            : flight.role === "user"
                            ? "!text-light"
                            : "text-gray-500"
                        )}
                      >
                        {flight.callsign}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div
                        className={cn(
                          "text-xs",
                          flight.role === "staff"
                            ? "text-light"
                            : flight.role === "mod"
                            ? "!text-light"
                            : flight.role === "user"
                            ? "!text-light"
                            : "text-gray-500"
                        )}
                      >
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
      )}
    </>
  );
};

// Update FilterButton - remove blur effect
const FilterButton = ({ 
  flights, 
  activeFilter,
  onFilterChange 
}: { 
  flights: any[]; 
  activeFilter: string;
  onFilterChange: (filteredFlights: any[], filterId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    { 
      id: "all", 
      name: "All Flights", 
      icon: <SlGlobe className="w-6 h-6" />,
      count: flights.length 
    },
    { 
      id: "iflytics", 
      name: "IFlytics Community", 
      icon: <RiUserCommunityLine className="w-6 h-6" />,
      count: flights.filter(f => 
        f.username && 
        customUserImages.some(user => user.username === f.username)
      ).length
    },
    { 
      id: "no-zombies", 
      name: "Hide Zombies", 
      icon: <ImBlocked className="w-6 h-6" />,
      count: flights.filter(f => f.username && f.username.trim() !== "").length
    }
  ];

  const applyFilter = (filterId: string) => {
    let filtered = flights;
    
    switch(filterId) {
      case "iflytics":
        filtered = flights.filter(f => 
          f.username && 
          customUserImages.some(user => user.username === f.username)
        );
        break;
      case "no-zombies":
        filtered = flights.filter(f => f.username && f.username.trim() !== "");
        break;
      default:
        filtered = flights;
    }
    
    onFilterChange(filtered, filterId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 bg-purple-500/90 backdrop-blur-sm rounded-xl shadow-lg
                   hover:bg-purple-600 hover:scale-105 transition-all duration-300
                   flex flex-col items-center justify-center relative group"
      >
        {activeFilter !== "all" && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
        )}
        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
        <span className="text-[0.5rem] text-white font-bold">Filter</span>
      </button>

      {isOpen && (
        <>
          <div
            className=""
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-18 top-[-0.5rem] z-[10001] w-52
                          animate-in slide-in-from-right-2 duration-500 ease-out">
            <div className="bg-gray-800/95 rounded-3xl shadow-2xl border border-gray-700/50">
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-t-3xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  Filter Flights
                </h3>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-700/80 transition-all duration-300 text-gray-400 hover:text-white hover:rotate-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Options */}
              <div className="p-4 pt-3 space-y-3">
                {filterOptions.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => applyFilter(option.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 transform-gpu group hover:scale-[1.02]",
                      activeFilter === option.id
                        ? "bg-purple-600/90 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gray-700/40 text-gray-300 hover:bg-gray-700/80 hover:text-white"
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideInUp 0.5s ease-out forwards'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-300">{option.icon}</span>
                      <span className="text-sm font-medium">{option.name}</span>
                    </div>
                    <span className="text-xs bg-black/20 px-2 py-1 rounded-full font-mono">
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
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

    const randomCompliment =
      aviationCompliments[
        Math.floor(Math.random() * aviationCompliments.length)
      ];
    setCurrentCompliment(randomCompliment);

    const usersWithCompliment = flights.filter(
      (flight) => flight.compliment === randomCompliment
    );
    const shuffled = usersWithCompliment.sort(() => Math.random() - 0.5);
    setTopUsers(shuffled.slice(0, 10));
  }, [flights]);

  return (
    <>
      {/* Button in the floating nav */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 bg-orange-400/90 backdrop-blur-sm rounded-xl shadow-lg
                   hover:bg-orange-500 hover:scale-105 transition-all duration-200 relative
                   flex flex-col items-center justify-center"
      >
        {topUsers.length > 0 && (
          <div className="animate-ping absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
        )}
        <FaRegFaceGrinWink className="w-5 h-5 text-white" />
        <span className="text-[0.5rem] text-white font-bold">Cheese</span>
      </button>

      {/* Panel - NO BLUR EFFECT */}
      {isOpen && (
        <div className="absolute right-18 top-[-0.5rem] z-[10001] slide-in-from-right-2 duration-500 ease-out">
          <div className="bg-[#FFEFD5]/95 backdrop-blur-xl rounded-3xl shadow-2xl  w-72 md:w-80">
            <div className="p-3 md:p-4 max-h-80 md:max-h-96 overflow-hidden">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-base md:text-lg tracking-tight mb-1">
                    Compliment Kings
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 font-mono">
                    {currentCompliment || "Loading compliments..."}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-42 md:max-h-48 overflow-y-auto">
                {topUsers.length > 0 ? (
                  topUsers.map((flight, index) => (
                    <div
                      key={`${flight.username}-${index}`}
                      className="flex items-center gap-2 md:gap-3 p-2 hover:bg-gray-50 rounded-lg"
                    >
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
                          <span className="text-xs md:text-sm">
                            {flight.emoji}
                          </span>
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
                  ))
                ) : (
                  // Fallback message when no compliments match
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎭</div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      No Compliment Kings Found!
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      Nobody online has earned the "{currentCompliment}" compliment yet.
                      <br />
                      Check back later to see who deserves this praise!
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 md:mt-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  {topUsers.length > 0 
                    ? "Refreshes every update • Top 10 pilots"
                    : "Compliments refresh with new flight data"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Update MapThemeButton - completely remove ALL blur effects
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
          className={cn(
            "w-12 h-12 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 flex flex-col items-center justify-center group relative hover:scale-105",
            pathname === "/map"
              ? "bg-light text-gray-700 hover:bg-gray-100"
              : "bg-gray-700 text-light hover:bg-gray-600"
          )}
        >
          <span className="text-lg group-hover:scale-110 transition-transform duration-300">
            {mapThemes[pathname as keyof typeof mapThemes]?.icon || mapThemes["/map"].icon}
          </span>
          <span className="text-[0.5rem] font-bold">{mapThemes[pathname as keyof typeof mapThemes]?.name || "Theme"}</span>
        </button>

        {isOpen && (
          <>
            <div
              className=""
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <div className="absolute right-16 top-[-20rem] z-[10001] w-48
                            animate-in slide-in-from-right-2 duration-500 ease-out">
              <div className="bg-gray-800/95 rounded-3xl shadow-2xl border border-gray-700/50">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-t-3xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Map Theme
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-700/80 transition-all duration-300 text-gray-400 hover:text-white hover:rotate-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Theme Grid */}
                <div className="p-4 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(mapThemes).map(([path, theme], index) => (
                      <button
                        key={path}
                        onClick={() => {
                          router.push(path);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full flex flex-col items-center justify-center gap-2 p-3 text-sm rounded-2xl transition-all duration-300 text-light relative group hover:scale-105 transform-gpu",
                          pathname === path
                            ? "bg-purple-600/90 font-medium shadow-lg shadow-purple-500/25"
                            : "hover:bg-gray-700/80 bg-gray-700/40"
                        )}
                        style={{
                          animationDelay: `${index * 75}ms`,
                          animation: 'slideInUp 0.4s ease-out forwards'
                        }}
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform duration-300">{theme.icon}</span>
                        <span className="text-xs text-center leading-tight">{theme.name}</span>
                        {pathname === path && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
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