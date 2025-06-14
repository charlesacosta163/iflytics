"use client";

import React, { useEffect, useState, useRef } from "react";
import { Map } from "maplibre-gl";
import { X, Search, MapPin } from "lucide-react";

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
      role: flight.role,
      emoji: flight.emoji,
      customImage: flight.customImage,
      compliment: flight.compliment,
      username: flight.username,
      callsign: flight.callsign,
      altitude: flight.altitude,
      speed: flight.speed,
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
      // Get unique emojis AND users with custom images
      const uniqueEmojis = [...new Set(flights.map(f => f.emoji).filter(Boolean))];
      const usersWithCustomImages = flights.filter(f => f.customImage);
      
      // console.log('Unique emojis:', uniqueEmojis.length);
      // console.log('Users with custom images:', usersWithCustomImages.map(u => ({username: u.username, customImage: u.customImage})));
      
      let loadedImages = 0;
      const totalImages = uniqueEmojis.length + usersWithCustomImages.length;
      
      const checkAllImagesLoaded = () => {
        loadedImages++;
       // console.log(`Loaded ${loadedImages}/${totalImages} images`);
        if (loadedImages === totalImages) {
          // console.log('All images loaded, updating map data');
          updateMapData();
        }
      };

      // Create emoji images (existing working logic)
      const createEmojiImage = (emoji: string) => {
        if (map.hasImage(`emoji-${emoji}`)) {
          checkAllImagesLoaded();
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
          ctx.fillStyle = "white";
          ctx.fillText(emoji, 16, 16);
        }

        const img = new Image();
        img.onload = () => {
          try {
            map.addImage(`emoji-${emoji}`, img);
            // console.log(`Loaded emoji: ${emoji}`);
          } catch (error) {
            // console.log(`Image emoji-${emoji} already exists`);
          }
          checkAllImagesLoaded();
        };
        img.src = canvas.toDataURL();
      };

      // Create custom user images (new functionality)
      const createCustomUserImage = (flight: any) => {
        const imageId = `user-${flight.username}`;
        
        // console.log(`Attempting to load custom image for ${flight.username}:`, flight.customImage);
        
        if (map.hasImage(imageId)) {
          // console.log(`Custom image for ${flight.username} already exists`);
          checkAllImagesLoaded();
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 32;
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            // Enable high-quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Create perfect circle clipping
            ctx.beginPath();
            ctx.arc(16, 16, 16, 0, 2 * Math.PI, false);
            ctx.clip();
            
            // Draw the image to fill the entire circle
            ctx.drawImage(img, 0, 0, 32, 32);
          }

          try {
            const imageData = ctx?.getImageData(0, 0, 32, 32);
            if (imageData) {
              map.addImage(imageId, imageData);
            }
          } catch (error) {
            // console.log(`Error adding custom image ${imageId}:`, error);
          }
          checkAllImagesLoaded();
        };
        
        img.onerror = (error) => {
          // console.log(`Failed to load custom image for ${flight.username}:`, error);
          // console.log(`Image URL was:`, flight.customImage);
          checkAllImagesLoaded();
        };
        
        img.src = flight.customImage;
      };

      // Function to update the actual map data
      const updateMapData = () => {
        const flightFeatures = flights.map((flight) => {
          // Determine which image to use
          const imageId = flight.customImage ? `user-${flight.username}` : `emoji-${flight.emoji}`;
          
          // console.log(`Flight ${flight.username} using imageId: ${imageId}, customImage: ${!!flight.customImage}`);
          
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
              imageId: imageId, // Dynamic image ID
            },
          };
        });

        // console.log('Updating map with features:', flightFeatures.length);
        
        const source = map.getSource("flights") as any;
        if (source) {
          source.setData({
            type: "FeatureCollection",
            features: flightFeatures,
          });
        }
      };

      // Handle case where there are no images to load
      if (totalImages === 0) {
        // console.log('No images to load, updating map data immediately');
        updateMapData();
        return;
      }

      // Load emoji images
      uniqueEmojis.forEach(createEmojiImage);
      
      // Load custom user images
      usersWithCustomImages.forEach(createCustomUserImage);
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

      {/* Search Component */}
      <div className="absolute top-4 left-4 z-[1002]" ref={searchInputRef}>
        <div className="relative">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pilots..."
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
                  className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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
                    <div className="font-semibold text-gray-900 truncate">
                      {flight.username}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {flight.callsign}
                    </div>
                  </div>

                  {/* Flight Status */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-gray-500">
                      {Math.round(flight.altitude)}ft
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(flight.speed)}kts
                    </div>
                  </div>

                  {/* Focus Icon */}
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
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

      {/* Flight Information Popup */}
      {popupInfo && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-[1000]"
            onClick={() => setPopupInfo(null)}
          />

          {/* Flight Information Card */}
          <div className="absolute top-16 left-5 bg-light rounded-xl overflow-hidden font-sans w-[280px] shadow-2xl z-[1001] border border-gray-300">
            {/* Header */}
            <div className="p-6 pb-4 border-b-2 border-blue-500 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-500 text-6xl mb-1">
                    {popupInfo.customImage ? (
                      <img 
                        src={new URL(popupInfo.customImage, import.meta.url).href} 
                        alt="Custom avatar" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      popupInfo.emoji
                    )}
                  </div>
                  <div className={`text-2xl font-bold text-gray-900 ${popupInfo.role === "staff" ? "!text-blue-500" : ""}`}>
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
                  <div className={`text-gray-900 font-semibold ${popupInfo.role === "staff" ? "!text-blue-500" : ""}`}>
                    {popupInfo.username || "Unknown"} {popupInfo.role === "staff" && <span className="text-xs text-blue-500">(STAFF)</span>}
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