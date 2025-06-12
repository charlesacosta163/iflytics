"use client"

import React, { useEffect, useState, useRef } from 'react'
import { Map } from 'maplibre-gl'
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
            style: 'https://demotiles.maplibre.org/style.json',
            center: [0, 0],
            zoom: 1,
            attributionControl: false,
        });

        mapRef.current = map;

        map.on('load', () => {
            // Convert SVG to base64 data URL
            const planeSVG = `
                <svg height="20px" width="20px" viewBox="0 0 230.084 230.084" xmlns="http://www.w3.org/2000/svg">
                    <path style="fill:#3B82F6;" d="M212.542,166.088l-69-21.23c0,15.825,0,30.285,0,41.012l31.188,17.273v26.941l-59.688-18.366 l-59.689,18.366v-26.941l31.189-17.274c0-10.727,0-25.186,0-41.011l-69,21.23V122.08l69-38.215c0-30.704,0-55.229,0-55.365 c0-15.74,12.76-28.5,28.5-28.5c15.738,0,28.5,12.76,28.5,28.5c0,0.136,0,24.661,0,55.365l69,38.215V166.088z"/>
                </svg>
            `;

            // Create image from SVG
            const img = new Image(20, 20);
            img.onload = () => map.addImage('plane', img);
            img.src = `data:image/svg+xml;base64,${btoa(planeSVG)}`;

            // Add initial empty source
            map.addSource('flights', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            // Add plane icons layer
            map.addLayer({
                id: 'flight-points',
                type: 'symbol',
                source: 'flights',
                layout: {
                    'icon-image': 'plane',
                    'icon-size': 1,
                    'icon-allow-overlap': true
                }
            });

            // Add click handlers
            map.on('click', 'flight-points', (e) => {
                if (e.features && e.features[0]) {
                    const flight = e.features[0].properties;
                    setPopupInfo({
                        username: flight?.username,
                        callsign: flight?.callsign,
                        altitude: flight?.altitude,
                        speed: flight?.speed
                    });
                }
            });

            map.on('click', (e) => {
                if (!map.queryRenderedFeatures(e.point, { layers: ['flight-points'] }).length) {
                    setPopupInfo(null);
                }
            });

            map.on('mouseenter', 'flight-points', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'flight-points', () => {
                map.getCanvas().style.cursor = '';
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
            map.on('load', () => updateFlightData());
        } else {
            updateFlightData();
        }

        function updateFlightData() {
            const flightFeatures = flights.map((flight) => ({
                type: 'Feature' as const,
                geometry: {
                    type: 'Point' as const,
                    coordinates: [flight.longitude, flight.latitude] as [number, number]
                },
                properties: {
                    callsign: flight.callsign,
                    username: flight.username,
                    altitude: flight.altitude,
                    speed: flight.speed
                }
            }));

            const source = map.getSource('flights') as any;
            if (source) {
                source.setData({
                    type: 'FeatureCollection',
                    features: flightFeatures
                });
            }
        }
    }, [flights]); // Only run when flights change

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div ref={mapContainerRef} className='w-full h-full' />
            
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
                                    <div className="text-gray-500 text-sm mb-1">
                                        Live Flight
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
    )
}

export default FullScreenMap