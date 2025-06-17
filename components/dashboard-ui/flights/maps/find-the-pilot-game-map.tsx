'use client'

import React, { useEffect, useState, useRef } from "react";
import { Map } from "maplibre-gl";
import GameUserPopup from "./game-user-popup";

const FindThePilotGameMap = ({ 
  flights, 
  onPilotClick,
  targetPilot,
  onTargetFound,
  gameActive,
  shouldZoomToTarget,
  onZoomComplete
}: { 
  flights: any[], 
  onPilotClick?: (pilot: any) => void,
  targetPilot?: any,
  onTargetFound?: () => void,
  gameActive?: boolean,
  shouldZoomToTarget?: boolean,
  onZoomComplete?: () => void
}) => {
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
          "icon-image": ["get", "imageId"],
          "icon-size": 0.8,
          "icon-allow-overlap": true,
        },
      });

      // Click handlers
      map.on("click", "flight-points", (e) => {
        if (e.features && e.features[0]) {
          const flight = e.features[0].properties;
          const flightInfo = {
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
          };
          
          // Log the clicked user's info
          // console.log("🎯 Clicked user info:", flightInfo);
          
          // Call parent callback if provided
          if (onPilotClick) {
            onPilotClick(flightInfo);
          }
          
          // Set popup info
          setPopupInfo(flightInfo);
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
              console.log(`Error adding custom image ${imageId}:`, error);
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
            console.log(`Image user-${flight.username} already exists`);
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
  }, [flights]);

  // Zoom to target pilot when shouldZoomToTarget becomes true
  useEffect(() => {
    if (shouldZoomToTarget && targetPilot && mapRef.current) {
      const map = mapRef.current;
      
      console.log("🎯 Zooming to target pilot:", targetPilot.username, "at", targetPilot.latitude, targetPilot.longitude);
      
      // Fly to target pilot's position with smooth animation
      map.flyTo({
        center: [targetPilot.longitude, targetPilot.latitude],
        zoom: 8, // Zoom in to focus on the target
        duration: 3000, // 3 second animation (slower for dramatic effect)
        essential: true
      });

      // Show popup for the target pilot after zoom
      setTimeout(() => {
        setPopupInfo({
          emoji: targetPilot?.emoji,
          compliment: targetPilot?.compliment,
          customImage: targetPilot?.customImage,
          username: targetPilot?.username,
          callsign: targetPilot?.callsign,
          altitude: targetPilot?.altitude,
          speed: targetPilot?.speed,
          heading: targetPilot?.heading,
          aircraftId: targetPilot?.aircraftId,
          flightId: targetPilot?.flightId,
          isConnected: targetPilot?.isConnected,
          lastReport: targetPilot?.lastReport,
          latitude: targetPilot?.latitude,
          longitude: targetPilot?.longitude,
          liveryId: targetPilot?.liveryId,
          pilotState: targetPilot?.pilotState,
          role: targetPilot?.role,
          track: targetPilot?.track,
          userId: targetPilot?.userId,
          verticalSpeed: targetPilot?.verticalSpeed,
          virtualOrganization: targetPilot?.virtualOrganization,
        });

        // Call completion callback
        onZoomComplete?.();
      }, 3000); // Show popup after zoom completes
    }
  }, [shouldZoomToTarget, targetPilot, onZoomComplete]);

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
          <GameUserPopup 
            popupInfo={popupInfo} 
            setPopupInfo={setPopupInfo}
            targetPilot={targetPilot}
            onTargetFound={onTargetFound}
            gameActive={gameActive}
          />
        </>
      )}
    </div>
  );
};

export default FindThePilotGameMap;
