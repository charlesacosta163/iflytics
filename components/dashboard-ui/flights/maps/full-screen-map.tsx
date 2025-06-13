"use client";

import React, { useEffect, useState, useRef } from "react";
import { Map } from "maplibre-gl";
import { X } from "lucide-react";

const FullScreenMap = ({ flights }: { flights: any[] }) => {
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 0],
      zoom: 1,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Add source first
      map.addSource("flights", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Add layer
      map.addLayer({
        id: "flight-points",
        type: "symbol",
        source: "flights",
        layout: {
          "icon-image": ["get", "emojiId"],
          "icon-size": 0.8,
          "icon-allow-overlap": true,
        },
      });

      // Click handlers
      map.on("click", "flight-points", (e) => {
        if (e.features && e.features[0]) {
          const flight = e.features[0].properties;
          setPopupInfo({
            emoji: flight?.emoji,
            compliment: flight?.compliment,
            username: flight?.username,
            callsign: flight?.callsign,
            altitude: flight?.altitude,
            speed: flight?.speed,
          });
        }
      });

      map.on("click", (e) => {
        if (!map.queryRenderedFeatures(e.point, { layers: ["flight-points"] }).length) {
          setPopupInfo(null);
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

    const map = mapRef.current;
    
    const updateFlightData = () => {
      // Get unique emojis from current flights
      const uniqueEmojis = [...new Set(flights.map(f => f.emoji).filter(Boolean))];
      let loadedImages = 0;
      const totalImages = uniqueEmojis.length;

      if (totalImages === 0) return;

      // Function to create emoji images
      const createEmojiImage = (emoji: string) => {
        // Check if image already exists
        if (map.hasImage(`emoji-${emoji}`)) {
          loadedImages++;
          if (loadedImages === totalImages) {
            updateMapData();
          }
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 32;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.font = "28px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(emoji, 16, 16);
        }

        const img = new Image();
        img.onload = () => {
          try {
            map.addImage(`emoji-${emoji}`, img);
          } catch (error) {
            console.log(`Image emoji-${emoji} already exists`);
          }
          loadedImages++;
          
          if (loadedImages === totalImages) {
            updateMapData();
          }
        };
        img.src = canvas.toDataURL();
      };

      // Function to update the actual map data
      const updateMapData = () => {
        const flightFeatures = flights.map((flight) => ({
          type: "Feature" as const,
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
            emojiId: `emoji-${flight.emoji}`,
          },
        }));

        const source = map.getSource("flights") as any;
        if (source) {
          source.setData({
            type: "FeatureCollection",
            features: flightFeatures,
          });
        }
      };

      // Create images for all unique emojis
      uniqueEmojis.forEach(createEmojiImage);
    };

    // Wait for map to be loaded
    if (!map.isStyleLoaded()) {
      map.on("load", updateFlightData);
    } else {
      updateFlightData();
    }
  }, [flights]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Flight Information Popup */}
      {popupInfo && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-[1000]"
            onClick={() => setPopupInfo(null)}
          />

          {/* Flight Information Card */}
          <div className="absolute top-5 left-5 bg-light rounded-xl overflow-hidden font-sans w-[280px] shadow-2xl z-[1001] border border-gray-300">
            {/* Header */}
            <div className="p-6 pb-4 border-b-2 border-blue-500 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-500 text-6xl mb-1">
                    {popupInfo.emoji}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {popupInfo.callsign}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="p-6 bg-light">
              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    Pilot
                  </div>
                  <div className="text-gray-900 font-semibold">
                    {popupInfo.username || "Unknown"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Altitude
                    </div>
                    <div className="text-gray-900 font-semibold">
                      {Math.round(popupInfo.altitude)} ft
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                      Speed
                    </div>
                    <div className="text-gray-900 font-semibold">
                      {Math.round(popupInfo.speed)} kts
                    </div>
                  </div>
                </div>

                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Compliment
                </div>
                <div className="font-semibold font-mono text-blue-500 tracking-tight">
                  {popupInfo.compliment}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setPopupInfo(null)}
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 border-none rounded-full w-8 h-8 text-gray-600 text-lg cursor-pointer flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FullScreenMap;