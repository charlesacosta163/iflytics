"use client";

import React, { useEffect, useState, useRef } from "react";
import { Map } from "maplibre-gl";
import { X } from "lucide-react";

let chosenEmoji: string;
let chosenCompliment: string;

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
      // Create canvas with apple emoji
      const canvas = document.createElement("canvas");
      canvas.width = 30;
      canvas.height = 30;
      const ctx = canvas.getContext("2d");

      const aviationCompliments = [
        "Smooth as butter landing!",
        "Captain of the skies!",
        "Sky wizard extraordinaire!",
        "Turbulence? What turbulence?",
        "Flying like a boss!",
        "Cleared for awesome!",
        "Altitude master supreme!",
        "Sky dancing legend!",
        "Cloud surfing champion!",
        "Aviation ace pilot!",
        "Runway ruler royalty!",
        "Cockpit commander king!",
        "Flight path perfectionist!",
        "Airspace artist genius!",
        "Wind whisperer wizard!",
        "Throttle control master!",
        "Navigation ninja skills!",
        "Crosswind crushing hero!",
        "Fuel efficiency guru!",
        "Radio communication star!",
        "Weather dodging expert!",
        "Formation flying ace!",
        "Instrument reading legend!",
        "Approach angle artist!",
        "Departure timing genius!",
        "Pattern flying poet!",
        "Tower talking champion!",
        "Checklist checking master!",
        "Emergency handling hero!",
        "Precision flying machine!",
        "Altitude holding wizard!",
        "Speed control surgeon!",
        "Banking angle beauty!",
        "Descent rate dancer!",
        "Climb gradient genius!",
        "Heading holding hero!",
        "Frequency finding wizard!",
        "Squawk code specialist!",
        "Vector following virtuoso!",
        "Clearance copying champion!",
        "Traffic spotting eagle!",
        "Weather reading sage!",
        "Chart reading champion!",
        "GPS programming pro!",
        "Autopilot adjusting ace!",
        "Flap setting maestro!",
        "Gear operating genius!",
        "Trim tab tactician!",
        "Rudder work rockstar!",
        "Aileron artist supreme!",
        "Elevator expert elite!",
        "Propeller pitch perfectionist!",
        "Mixture management master!",
        "Cowl flap controller!",
        "Fuel pump professional!",
        "Magneto switching specialist!",
        "Carb heat handler!",
        "Oil pressure observer!",
        "Engine temperature tracker!",
        "Electrical system expert!",
        "Hydraulic pressure hero!",
        "Vacuum system virtuoso!",
        "Pitot tube protector!",
        "Static port specialist!",
        "Altimeter adjusting ace!",
        "Compass calibration king!",
        "VOR navigation ninja!",
        "ILS approach artist!",
        "GPS guidance guru!",
        "DME distance detective!",
        "ADF bearing boss!",
        "Transponder code genius!",
        "Comm radio rockstar!",
        "Ground control groupie!",
        "Tower frequency finder!",
        "Approach control ace!",
        "Departure procedure pro!",
        "En route expert elite!",
        "Class airspace ambassador!",
        "NOTAM knowledge ninja!",
        "TFR tracking tactician!",
        "Weather briefing boss!",
        "Flight planning phenom!",
        "Weight balance wizard!",
        "Performance chart champion!",
        "Density altitude detective!",
        "Wind triangle warrior!",
        "Cross country crusader!",
        "Pattern work perfectionist!",
        "Touch and go guru!",
        "Short field specialist!",
        "Soft field sensation!",
        "Emergency landing legend!",
        "Go around genius!",
        "Missed approach master!",
        "Holding pattern hero!",
        "Steep turn tactician!",
        "Stall recovery rockstar!",
        "Spin awareness specialist!",
        "Ground reference guru!",
        "Hood time hero!",
        "Night flying ninja!",
        "Cross country commander!",
        "Solo flight superstar!",
        "Checkride champion!",
        "Blue sky explorer!",
        "Cloud hopping hero!",
      ];
      const alternator = [
        "🤖", "👽", "👾", "👻", "💀", "🤡", "🤠", "🤖", "👽", "💩",
        "🤮", "🤢", "🤧", "🤒", "🤕", "🤑", "🤓", "🤔", "🤕", "👀", 
        "🥶", "🌭", "🍔", "🐸", "👹", "😹", "🤯", "😮‍💨", "😘", "⛽️", 
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
        "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆",
        "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛",
        "🦋", "🐌", "🐞", "🐜", "🦂", "🦟", "🦗", "🕷️", "🕸️", "🐢",
        "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡",
        "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓",
        "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
        "🥝", "🍍", "🥭", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️",
        "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄", "🥜", "🌰", "🍞",
        "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗",
        "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔",
        "🥙", "🧆", "🥘", "🍲", "🍝", "🍜", "🍛", "🍣", "🍱", "🥟",
        "🦪", "🍤", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧",
        "🍨", "🍦", "🥧", "🍰", "🎂", "🧁", "🍮", "🍭", "🍬", "🍫",
        "🍿", "🍩", "🍪", "🥛", "🍼", "☕", "🫖", "🍵", "🍶", "🍺",
        "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧃", "🧉", "🧊", "lol",
        "💻", "🖥️", "📱", "📲", "⌚", "⌨️", "🖱️", "🖲️", "🕹️", "💽",
        "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️",
        "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭",
        "⏰", "⏱️", "⏲️", "🕰️", "🌡️", "🧱", "🔋", "🔌", "💡", "🔦",
        "🕯️", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "💳", "🧾",
        "hi", "bye", "wow", "oof", "hehe", "joe", "poo", "bus", "boeing",
        "mcdonalds", "burger king", "wendys", "subway", "pizza hut", "dominos",
        "kfc", "chick fil a", "taco bell", "starbucks", "booing 737 min", "a340 paleo",
        "booing 797", "airboos a350-10000", "mcdonald doglas md-500", "lukla airport",
        "toyota sikorsky","airplane", "✈️","💺", "🛣️"
        ];

      chosenCompliment =
        aviationCompliments[
          Math.floor(Math.random() * aviationCompliments.length)
        ];
      chosenEmoji = alternator[Math.floor(Math.random() * alternator.length)];
      ctx!.font = "30px Arial";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(chosenEmoji, 12, 12);

      // Convert canvas to image
      const img = new Image();
      img.onload = () => map.addImage("plane", img);
      img.src = canvas.toDataURL(); // Convert canvas to data URL

      // Add initial empty source
      map.addSource("flights", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Add plane icons layer
      map.addLayer({
        id: "flight-points",
        type: "symbol",
        source: "flights",
        layout: {
          "icon-image": "plane",
          "icon-size": 1,
          "icon-allow-overlap": true,
        },
      });

      // Add click handlers
      map.on("click", "flight-points", (e) => {
        if (e.features && e.features[0]) {
          const flight = e.features[0].properties;
          setPopupInfo({
            username: flight?.username,
            callsign: flight?.callsign,
            altitude: flight?.altitude,
            speed: flight?.speed,
          });
        }
      });

      map.on("click", (e) => {
        if (
          !map.queryRenderedFeatures(e.point, { layers: ["flight-points"] })
            .length
        ) {
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
  }, []); // Empty dependency array - only run once

  // Update flight data when flights prop changes
  useEffect(() => {
    if (!mapRef.current || !flights) return;

    const map = mapRef.current;

    // Wait for map to be loaded
    if (!map.isStyleLoaded()) {
      map.on("load", () => updateFlightData());
    } else {
      updateFlightData();
    }

    function updateFlightData() {
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
        },
      }));

      const source = map.getSource("flights") as any;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: flightFeatures,
        });
      }
    }
  }, [flights]); // Only run when flights change

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
                    {chosenEmoji}
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

                <div className="font-semibold font-mono text-blue-500 tracking-tight">
                  {chosenCompliment}
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