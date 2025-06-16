"use client";

import React, { useEffect, useState, useRef } from "react";
import { Map } from "maplibre-gl";
import { X, Search, MapPin } from "lucide-react";
import { aviationCompliments } from "@/lib/data";
import UserPopupInfo from "./user-popup-info";
import { cn } from "@/lib/utils";

const FullScreenMap = ({ flights }: { flights: any[] }) => {
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filtered = flights.filter(flight => {
      const matchesUsername = flight.username?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCallsign = flight.callsign?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesUsername || matchesCallsign;
    });
    
    // Remove duplicates by username and take max 10 results
    const uniqueUsers = filtered.slice(0, 15);

    setSearchResults(uniqueUsers);
    setShowResults(uniqueUsers.length > 0);
  }, [searchQuery, flights]);

  // Focus on user function
  const focusOnUser = (flight: any) => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    // Fly to user's position with smooth animation
    map.flyTo({
      center: [flight.longitude, flight.latitude],
      zoom: 8, // Zoom in to focus on the user
      duration: 2000, // 2 second animation
      essential: true
    });

    // Clear search
    setSearchQuery("");
    setShowResults(false);
        
    // Show popup for the user
    setPopupInfo({
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

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          setPopupInfo({
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <p className="hidden lg:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold"><b>IFlytics Users & IF Staff</b> get their IFC avatar on the map!</p>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Search Component */}
      <div className="absolute top-4 left-4 z-[1002]" ref={searchInputRef}>
        <div className="relative">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="👨‍✈️ Search pilots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className="w-64 pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-1 w-full bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto z-[1003]">
              {searchResults.map((flight, index) => (
                <div
                  key={`${flight.username}-${index}`}
                  onClick={() => focusOnUser(flight)}
                  className={cn("flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0", flight.role === "staff" ? "hover:bg-blue-600 bg-blue-500 text-light" : flight.role === "user" ? "hover:bg-black/50 bg-gradient-to-br from-gray to-dark !text-light" : "")}
                >
                  {/* User Emoji */}
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

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className={cn("font-semibold truncate", flight.role === "staff" ? "text-light" : flight.role === "user" ? "!text-light" : "text-gray-900")}>
                      {flight.username}
                    </div>
                    <div className={cn("text-sm truncate", flight.role === "staff" ? "text-light" : flight.role === "user" ? "!text-light" : "text-gray-500")}>
                      {flight.callsign}
                    </div>
                  </div>

                  {/* Flight Status */}
                  <div className="flex-shrink-0 text-right">
                    <div className={cn("text-xs", flight.role === "staff" ? "text-light" : flight.role === "user" ? "!text-light" : "text-gray-500")}>
                      {Math.round(flight.altitude)}ft
                    </div>
                    <div className={cn("text-xs", flight.role === "staff" ? "text-light" : flight.role === "user" ? "!text-light" : "text-gray-500")}>
                      {Math.round(flight.speed)}kts
                    </div>
                  </div>

                  {/* Focus Icon */}
                  <MapPin className={cn("w-4 h-4 text-blue-500 flex-shrink-0", flight.role === "staff" ? "text-light" : flight.role === "user" ? "!text-light" : "")} />
                </div>
              ))}

              {searchResults.length === 0 && searchQuery.trim() !== "" && (
                <div className="px-4 py-6 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <div>No pilots found matching "{searchQuery}"</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compliment Leaderboard */}
      <ComplimentLeaderboard flights={flights} />

      {/* Flight Information Popup */}
      {popupInfo && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-[1000]"
            onClick={() => setPopupInfo(null)}
          />

          {/* Flight Information Card */}
         <UserPopupInfo popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
        </>
      )}
    </div>
  );
};

const ComplimentLeaderboard = ({ flights }: { flights: any[] }) => {
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
      {/* Toggle Button - Always visible and separate */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-[1000]
                     bg-blue-500/90 backdrop-blur-sm rounded-lg shadow-lg
                     p-1.5 md:p-2 hover:bg-blue-600 border-4 border-blue-100 transition-all duration-200"
        >
          <div className="animate-ping absolute -top-1 -left-1 w-2 h-2 bg-orange-500 rounded-full"></div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600">😂</span>
            <div className="transform -rotate-90">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </div>
        </button>
      )}

      {/* Slide-out Panel - Only render when open */}
      {isOpen && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[1001]">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl
                          w-72 md:w-80 animate-in slide-in-from-right duration-300">
            <div className="p-3 md:p-4 max-h-80 md:max-h-96 overflow-hidden">
              {/* Header with Close Button */}
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-base md:text-lg tracking-tight mb-1">Compliment Kings</h3>
                  <p className="text-xs font-semibold text-blue-600 font-mono truncate pr-8">"{currentCompliment}"</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable User List */}
              <div className="space-y-2 max-h-52 md:max-h-64 overflow-y-auto">
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

              {/* Footer */}
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

export default FullScreenMap;