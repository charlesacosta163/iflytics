'use client'

import React, { useEffect, useRef } from 'react'
import { Map, LngLatBounds } from 'maplibre-gl'

interface UserFlightMapProps {
  flightId?: string
  originAirport?: string
  destinationAirport?: string
  originCoordinates?: [number, number]
  destinationCoordinates?: [number, number]
  className?: string
}

const UserFlightMap = ({ 
  flightId, 
  originAirport, 
  destinationAirport,
  originCoordinates,
  destinationCoordinates,
  className = "" 
}: UserFlightMapProps) => {
  const mapRef = useRef<Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Fallback placeholder coordinates for demonstration
  const placeholderRoute: [number, number][] = [
    [-74.006, 40.7128], // New York (JFK area)
    [-87.9073, 41.9786], // Chicago (ORD area)  
    [-118.4081, 33.9425], // Los Angeles (LAX area)
  ]

  // Use real coordinates if provided, otherwise use placeholder
  const getRouteCoordinates = (): [number, number][] => {
    if (originCoordinates && destinationCoordinates) {
      return [originCoordinates, destinationCoordinates]
    }
    return placeholderRoute
  }

  // Function to create route sprites (takeoff/landing markers)
  const createRouteSprites = (map: Map) => {
    const spriteSize = 24

    // Create takeoff sprite (green circle with plane icon)
    const createTakeoffSprite = () => {
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = spriteSize
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, spriteSize, spriteSize)

        // Draw green circle background
        ctx.fillStyle = "#10B981" // green-500
        ctx.beginPath()
        ctx.arc(spriteSize / 2, spriteSize / 2, spriteSize / 2 - 2, 0, 2 * Math.PI)
        ctx.fill()

        // Draw white border
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(spriteSize / 2, spriteSize / 2, spriteSize / 2 - 2, 0, 2 * Math.PI)
        ctx.stroke()

        // Draw takeoff icon (simplified plane)
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("🛫", spriteSize / 2, spriteSize / 2)
      }

      return canvas
    }

    // Create landing sprite (red circle with plane icon)
    const createLandingSprite = () => {
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = spriteSize
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, spriteSize, spriteSize)

        // Draw red circle background
        ctx.fillStyle = "#EF4444" // red-500
        ctx.beginPath()
        ctx.arc(spriteSize / 2, spriteSize / 2, spriteSize / 2 - 2, 0, 2 * Math.PI)
        ctx.fill()

        // Draw white border
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(spriteSize / 2, spriteSize / 2, spriteSize / 2 - 2, 0, 2 * Math.PI)
        ctx.stroke()

        // Draw landing icon (simplified plane)
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("🛬", spriteSize / 2, spriteSize / 2)
      }

      return canvas
    }

    // Add sprites to map if they don't exist
    if (!map.hasImage("takeoff-sprite")) {
      const takeoffCanvas = createTakeoffSprite()
      const takeoffImg = new Image()
      takeoffImg.onload = () => {
        try {
          map.addImage("takeoff-sprite", takeoffImg)
        } catch (error) {
          console.warn("Error adding takeoff sprite:", error)
        }
      }
      takeoffImg.src = takeoffCanvas.toDataURL()
    }

    if (!map.hasImage("landing-sprite")) {
      const landingCanvas = createLandingSprite()
      const landingImg = new Image()
      landingImg.onload = () => {
        try {
          map.addImage("landing-sprite", landingImg)
        } catch (error) {
          console.warn("Error adding landing sprite:", error)
        }
      }
      landingImg.src = landingCanvas.toDataURL()
    }
  }

  // Function to split route at antimeridian crossings
  const splitAntimeridianRoute = (coordinates: [number, number][]): [number, number][][] => {
    const segments: [number, number][][] = []
    let currentSegment: [number, number][] = [coordinates[0]]
    
    for (let i = 1; i < coordinates.length; i++) {
      const [prevLon] = coordinates[i - 1]
      const [currLon] = coordinates[i]
      
      // Check if we're crossing the antimeridian (180° difference)
      if (Math.abs(currLon - prevLon) > 180) {
        // Finish current segment
        segments.push([...currentSegment])
        // Start new segment
        currentSegment = [coordinates[i]]
      } else {
        currentSegment.push(coordinates[i])
      }
    }
    
    segments.push(currentSegment)
    return segments
  }

  // Function to display the flight route
  const displayFlightRoute = (coordinates: [number, number][]) => {
    if (!mapRef.current || coordinates.length < 2 || !mapRef.current.isStyleLoaded()) return

    const map = mapRef.current
    const routeId = `route-${flightId || 'placeholder'}`
    const originMarkerId = `origin-${flightId || 'placeholder'}`
    const destinationMarkerId = `destination-${flightId || 'placeholder'}`

    // Clean up existing route
    try {
      if (map.getLayer(routeId)) map.removeLayer(routeId)
      if (map.getSource(routeId)) map.removeSource(routeId)
      if (map.getLayer(originMarkerId)) map.removeLayer(originMarkerId)
      if (map.getSource(originMarkerId)) map.removeSource(originMarkerId)
      if (map.getLayer(destinationMarkerId)) map.removeLayer(destinationMarkerId)
      if (map.getSource(destinationMarkerId)) map.removeSource(destinationMarkerId)
    } catch (e) {
      // Ignore cleanup errors
    }

    // Create route sprites
    createRouteSprites(map)

    // Split route at antimeridian crossings
    const routeSegments = splitAntimeridianRoute(coordinates)
    
    // Create gradient segments for each antimeridian-split route
    const segments: any[] = []
    let globalSegmentIndex = 0
    const totalOriginalSegments = coordinates.length - 1

    routeSegments.forEach((segmentCoords: [number, number][]) => {
      if (segmentCoords.length > 1) {
        for (let i = 0; i < segmentCoords.length - 1; i++) {
          const progress = globalSegmentIndex / totalOriginalSegments
          const red = Math.round(30 + (147 - 30) * progress)
          const green = Math.round(58 + (197 - 58) * progress)
          const blue = Math.round(138 + (253 - 138) * progress)

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
          })
          
          globalSegmentIndex++
        }
      }
    })

    // Add route source and layer
    map.addSource(routeId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: segments as any,
      },
    })

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
        "line-width": 3,
        "line-opacity": 0.8,
      },
    })

    // Add origin marker (takeoff)
    const originCoord = coordinates[0]
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
    })

    map.addLayer({
      id: originMarkerId,
      type: "symbol",
      source: originMarkerId,
      layout: {
        "icon-image": "takeoff-sprite",
        "icon-size": 0.8,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    })

    // Add destination marker (landing)
    const destinationCoord = coordinates[coordinates.length - 1]
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
    })

    map.addLayer({
      id: destinationMarkerId,
      type: "symbol",
      source: destinationMarkerId,
      layout: {
        "icon-image": "landing-sprite",
        "icon-size": 0.8,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    })

    // Fit map to route bounds
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord)
    }, new LngLatBounds(coordinates[0], coordinates[0]))

    map.fitBounds(bounds, {
      padding: 40,
      maxZoom: 8,
    })
  }

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map
    const map = new Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-95.7129, 37.0902], // Center of US
      zoom: 3,
      attributionControl: false,
    })

    mapRef.current = map

    map.on('load', () => {
      // Display the route (real coordinates or placeholder)
      const routeCoordinates = getRouteCoordinates()
      displayFlightRoute(routeCoordinates)
    })

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // Only run once on mount

  // Update route when coordinates change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      const routeCoordinates = getRouteCoordinates()
      displayFlightRoute(routeCoordinates)
    }
  }, [originCoordinates, destinationCoordinates])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      
      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
        © Carto Basemaps
      </div>
      
      {/* Airport labels if provided */}
      {originAirport && destinationAirport && (
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
          <p className="text-white text-sm font-semibold">
            {originAirport} → {destinationAirport}
          </p>
        </div>
      )}

      {/* Loading state when no coordinates provided */}
      {!originCoordinates || !destinationCoordinates ? (
        <div className="absolute top-2 right-2 bg-yellow-500/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-yellow-500/30">
          <p className="text-yellow-400 text-xs font-semibold">
            Flight Route
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default UserFlightMap
