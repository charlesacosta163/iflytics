"use client";

import { useEffect, useRef, useState } from "react";
import { Map, LngLatBounds } from "maplibre-gl";
import * as turf from "@turf/turf";
import { X } from "lucide-react";
import type { FlightRouteData } from "@/lib/flight-route-utils";
import { convertMinutesToHours, formatDate } from "@/lib/utils";

const SPRITE_SIZE = 32;

type RoutePopupInfo = {
  origin: string;
  destination: string;
  callsign?: string;
  created?: string;
  totalTime?: number;
  server?: string;
  xp?: number;
  distance?: number;
};

function createAirportSprite(color: string, emoji: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, SPRITE_SIZE / 2, SPRITE_SIZE / 2);
  }

  return canvas;
}

function addSpriteToMap(map: Map, id: string, color: string, emoji: string) {
  if (map.hasImage(id)) return;

  const canvas = createAirportSprite(color, emoji);
  const img = new Image();
  img.onload = () => {
    try {
      if (!map.hasImage(id)) {
        map.addImage(id, img);
      }
    } catch (error) {
      console.warn(`Error adding sprite ${id}:`, error);
    }
  };
  img.src = canvas.toDataURL();
}

const FlightsOverviewMap = ({ routes }: { routes: FlightRouteData[] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [popupInfo, setPopupInfo] = useState<RoutePopupInfo | null>(null);

  useEffect(() => {
    setPopupInfo(null);
  }, [routes]);

  useEffect(() => {
    if (!mapContainerRef.current || routes.length === 0) return;

    const map = new Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [0, 20],
      zoom: 1,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      addSpriteToMap(map, "origin-sprite", "#EF4444", "✈️");
      addSpriteToMap(map, "destination-sprite", "#10B981", "✈️");

      const arcFeatures: GeoJSON.Feature[] = [];
      const originFeatures: GeoJSON.Feature[] = [];
      const destinationFeatures: GeoJSON.Feature[] = [];

      routes.forEach((route, index) => {
        const { latitude: lat1, longitude: lng1 } = route.originCoordinates;
        const { latitude: lat2, longitude: lng2 } = route.destinationCoordinates;

        const originPoint = turf.point([lng1, lat1]);
        const destinationPoint = turf.point([lng2, lat2]);

        const arc = turf.greatCircle(originPoint, destinationPoint, {
          npoints: 64,
          properties: {
            origin: route.origin,
            destination: route.destination,
            callsign: route.callsign ?? "",
            created: route.created ?? "",
            totalTime: route.totalTime ?? 0,
            server: route.server ?? "",
            xp: route.xp ?? 0,
            distance: route.distance ?? 0,
          },
        });

        arc.id = index;
        arcFeatures.push(arc);

        originFeatures.push({
          type: "Feature",
          id: `origin-${index}`,
          geometry: {
            type: "Point",
            coordinates: [lng1, lat1],
          },
          properties: {
            airport: route.origin,
          },
        });

        destinationFeatures.push({
          type: "Feature",
          id: `destination-${index}`,
          geometry: {
            type: "Point",
            coordinates: [lng2, lat2],
          },
          properties: {
            airport: route.destination,
          },
        });
      });

      map.addSource("flight-routes", {
        type: "geojson",
        data: turf.featureCollection(arcFeatures),
      });

      map.addSource("origin-markers", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: originFeatures,
        },
      });

      map.addSource("destination-markers", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: destinationFeatures,
        },
      });

      map.addLayer({
        id: "flight-routes-layer",
        type: "line",
        source: "flight-routes",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3B82F6",
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            4,
            2,
          ],
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.75,
          ],
        },
      });

      map.addLayer({
        id: "flight-routes-clickable",
        type: "line",
        source: "flight-routes",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "rgba(0,0,0,0)",
          "line-width": 14,
        },
      });

      map.addLayer({
        id: "origin-markers-layer",
        type: "symbol",
        source: "origin-markers",
        layout: {
          "icon-image": "origin-sprite",
          "icon-size": 0.55,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      map.addLayer({
        id: "destination-markers-layer",
        type: "symbol",
        source: "destination-markers",
        layout: {
          "icon-image": "destination-sprite",
          "icon-size": 0.55,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      let hoveredRouteId: string | number | undefined | null = null;

      map.on("mouseenter", "flight-routes-clickable", (e) => {
        map.getCanvas().style.cursor = "pointer";

        if (e.features && e.features.length > 0) {
          if (hoveredRouteId !== null && hoveredRouteId !== undefined) {
            map.setFeatureState(
              { source: "flight-routes", id: hoveredRouteId },
              { hover: false }
            );
          }

          hoveredRouteId = e.features[0].id;
          map.setFeatureState(
            { source: "flight-routes", id: hoveredRouteId },
            { hover: true }
          );
        }
      });

      map.on("mouseleave", "flight-routes-clickable", () => {
        map.getCanvas().style.cursor = "";

        if (hoveredRouteId !== null && hoveredRouteId !== undefined) {
          map.setFeatureState(
            { source: "flight-routes", id: hoveredRouteId },
            { hover: false }
          );
          hoveredRouteId = null;
        }
      });

      map.on("click", "flight-routes-clickable", (e) => {
        const feature = e.features?.[0];
        const props = feature?.properties;

        if (!props) return;

        setPopupInfo({
          origin: props.origin,
          destination: props.destination,
          callsign: props.callsign || undefined,
          created: props.created || undefined,
          totalTime: props.totalTime ? Number(props.totalTime) : undefined,
          server: props.server || undefined,
          xp: props.xp ? Number(props.xp) : undefined,
          distance: props.distance ? Number(props.distance) : undefined,
        });
      });

      map.on("click", (e) => {
        if (
          !map.queryRenderedFeatures(e.point, {
            layers: ["flight-routes-clickable"],
          }).length
        ) {
          setPopupInfo(null);
        }
      });

      const bounds = routes.reduce((acc, route) => {
        const { latitude: lat1, longitude: lng1 } = route.originCoordinates;
        const { latitude: lat2, longitude: lng2 } = route.destinationCoordinates;
        return acc.extend([lng1, lat1]).extend([lng2, lat2]);
      }, new LngLatBounds(
        [routes[0].originCoordinates.longitude, routes[0].originCoordinates.latitude],
        [routes[0].originCoordinates.longitude, routes[0].originCoordinates.latitude]
      ));

      map.fitBounds(bounds, { padding: 48, maxZoom: 6 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [routes]);

  return (
    <div className="relative w-full h-[280px] md:h-[360px] rounded-[20px] overflow-hidden border-2 border-gray-200 dark:border-gray-700">
      <div ref={mapContainerRef} className="w-full h-full" />

      {popupInfo && (
        <>
          <div
            className="absolute inset-0 z-[1]"
            onClick={() => setPopupInfo(null)}
          />
          <div className="absolute top-3 left-3 z-[2] w-[260px] rounded-[16px] overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {popupInfo.callsign || "Flight Route"}
                  </p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
                    {popupInfo.origin} → {popupInfo.destination}
                  </p>
                </div>
                <button
                  onClick={() => setPopupInfo(null)}
                  className="shrink-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              {popupInfo.created && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {formatDate(popupInfo.created)}
                  </p>
                </div>
              )}
              {popupInfo.totalTime != null && popupInfo.totalTime > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Flight Time</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {convertMinutesToHours(popupInfo.totalTime)}
                  </p>
                </div>
              )}
              {popupInfo.distance != null && popupInfo.distance > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Distance</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {Math.round(popupInfo.distance).toLocaleString()} nm
                  </p>
                </div>
              )}
              {popupInfo.server && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Server</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {popupInfo.server}
                  </p>
                </div>
              )}
              {popupInfo.xp != null && popupInfo.xp > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">XP</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {popupInfo.xp.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded z-[2]">
        © Carto Basemaps
      </div>
    </div>
  );
};

export default FlightsOverviewMap;
