'use client'

import { useEffect, useRef } from "react";
import { Map } from "maplibre-gl";
import { TiZoomInOutline, TiZoomOutOutline } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { FaPlane } from "react-icons/fa";

interface PilotSessionData {
  userId: string;
  username: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  isConnected?: boolean;
  lastReport?: string;
  // Add other potential properties that might exist
  [key: string]: any;
}

interface ProfileUserFlightMapProps {
  flightData?: PilotSessionData;
  userDisplayName: string;
}

const ProfileUserFlightMap = ({ flightData, userDisplayName }: ProfileUserFlightMapProps) => {
  const mapRef = useRef<Map | null>(null);

  // Check if user is currently flying (has valid coordinates)
  const isFlying = flightData && 
    flightData.latitude && 
    flightData.longitude && 
    flightData.latitude !== 0 && 
    flightData.longitude !== 0 &&
    Math.abs(flightData.latitude) <= 90 && 
    Math.abs(flightData.longitude) <= 180;

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

  useEffect(() => {
    if (!isFlying) return;

    const initializeMap = () => {
      const map = new Map({
        container: "profile-flight-map",
        style: "https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [flightData.longitude, flightData.latitude],
        zoom: 8,
        maxZoom: 15,
        minZoom: 2,
        attributionControl: false,
      });

      map.on("load", () => {
        loadPlaneSprite(map);
        addPlaneMarker(map);
        mapRef.current = map;
      });

      map.on("error", (e) => {
        console.error("Map error:", e);
      });
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [flightData, isFlying]);

  // Function to create airplane sprites using SVG files (same as full-screen-map)
  const createAirplaneSprite = (flight: any, callback: (canvas: HTMLCanvasElement) => void) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 60;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, 60, 60);

      // Determine which SVG to use based on role
      let svgPath = "/images/sprites/applane.svg"; // default for unregistered users
      
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

        // Draw the airplane SVG centered (same size as full-screen-map)
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

  // Load the airplane sprite
  const loadPlaneSprite = (map: Map) => {
    if (map.hasImage("airplane-sprite")) return;

    createAirplaneSprite(flightData, (canvas) => {
      const airplaneImg = new Image();
      airplaneImg.onload = () => {
        try {
          map.addImage("airplane-sprite", airplaneImg);
        } catch (error) {
          console.warn("Error adding airplane sprite:", error);
        }
      };
      airplaneImg.src = canvas.toDataURL();
    });
  };

  // Add plane marker to map
  const addPlaneMarker = (map: Map) => {
    if (!flightData || !isFlying) return;

    // Add plane position as GeoJSON source
    map.addSource("airplane", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [flightData.longitude, flightData.latitude],
            },
            properties: {},
          },
        ],
      },
    });

    // Add plane layer (same settings as full-screen-map)
    map.addLayer({
      id: "airplane-layer",
      type: "symbol",
      source: "airplane",
      layout: {
        "icon-image": "airplane-sprite",
        "icon-size": 0.8,
        "icon-allow-overlap": true,
      },
    });
  };

  // If not flying, show a message
  if (!isFlying) {
    return (
      <></>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold">Live Flight Tracking</h2>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 rounded-lg overflow-hidden shadow-lg">
        <div 
          id="profile-flight-map" 
          className="w-full h-full"
        />
        
        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <Button
            onClick={zoomIn}
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white/90 hover:bg-white border shadow-lg"
          >
            <TiZoomInOutline className="w-5 h-5 text-gray-700" />
          </Button>
          <Button
            onClick={zoomOut}
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white/90 hover:bg-white border shadow-lg"
          >
            <TiZoomOutOutline className="w-5 h-5 text-gray-700" />
          </Button>
        </div>

        {/* Flight Info Overlay */}
        <div className="hidden md:block absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <span className="text-gray-500 font-medium">Callsign</span>
              <div className="text-gray-800 font-bold text-lg">{flightData.callsign}</div>
            </div>
            <div className="text-center">
              <span className="text-gray-500 font-medium">Altitude</span>
              <div className="text-gray-800 font-bold text-lg">{Math.round(flightData.altitude).toLocaleString()} ft</div>
            </div>
            <div className="text-center">
              <span className="text-gray-500 font-medium">Speed</span>
              <div className="text-gray-800 font-bold text-lg">{Math.round(flightData.speed)} kts</div>
            </div>
            <div className="text-center">
              <span className="text-gray-500 font-medium">Heading</span>
              <div className="text-gray-800 font-bold text-lg">{Math.round(flightData.heading)}°</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUserFlightMap;