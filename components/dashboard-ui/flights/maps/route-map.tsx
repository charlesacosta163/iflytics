"use client";
import { useEffect, useState } from "react";
import { Map } from "maplibre-gl";
import * as turf from "@turf/turf";
import * as maplibregl from "maplibre-gl";
import { getAircraft } from "@/lib/actions";
import { X } from "lucide-react";

export const RouteMap = ({ routes }: { routes: any[] }) => {
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [aircraftData, setAircraftData] = useState<any>(null);
  const [loadingAircraft, setLoadingAircraft] = useState(false);

  useEffect(() => {
    const map = new Map({
      container: "map",
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 0],
      zoom: 1,
      attributionControl: false
    });

    map.on("load", () => {
      const arcFeatures: any[] = [];

      routes.forEach((route: any) => {
        const {
          originCoordinates: { latitude: lat1, longitude: lng1 },
          destinationCoordinates: { latitude: lat2, longitude: lng2 },
          distance,
          origin,
          destination,
        } = route;
      
        const originPoint = turf.point([lng1, lat1]);
        const destinationPoint = turf.point([lng2, lat2]);
      
        const arc = turf.greatCircle(originPoint, destinationPoint, {
          npoints: 100,
          properties: {
            distance,
            origin,
            destination,
          },
        });
      
        arcFeatures.push(arc);
      });

      map.on("click", "route-arcs-layer", (e) => {
        const feature = e.features?.[0];
        const props = feature?.properties;
      
        if (props) {
          const routeData = routes.find((r: any) => 
            r.origin === props.origin && r.destination === props.destination
          );
          
          setPopupInfo({
            origin: props.origin,
            destination: props.destination,
            distance: props.distance,
            aircraftId: routeData?.aircraftId,
            totalTime: routeData?.totalTime,
            server: routeData?.server,
            created: routeData?.created,
            flightId: routeData?.flightId
          });
        }
      });

      map.on("click", (e) => {
        if (!map.queryRenderedFeatures(e.point, { layers: ["route-arcs-layer"] }).length) {
          setPopupInfo(null);
          setAircraftData(null);
        }
      });

      const featureCollection = turf.featureCollection(arcFeatures);

      map.addSource("route-arcs", {
        type: "geojson",
        data: featureCollection,
      });

      map.addLayer({
        id: "route-arcs-layer",
        type: "line",
        source: "route-arcs",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF5733",
          "line-width": 2,
        },
      });
    });

    return () => map.remove();
  }, [routes]);

  // Fetch aircraft data when popup info changes
  useEffect(() => {
    if (popupInfo?.aircraftId) {
      setLoadingAircraft(true);
      
      getAircraft(popupInfo.aircraftId)
        .then((aircraft) => {
          setAircraftData(aircraft);
          setLoadingAircraft(false);
        })
        .catch(() => {
          setLoadingAircraft(false);
        });
    }
  }, [popupInfo]);

  const formatFlightTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />
      
      {/* Flight Route Information Popup */}
      {popupInfo && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 z-[1000]"
            onClick={() => {
              setPopupInfo(null);
              setAircraftData(null);
            }}
          />
          
          {/* Route Information Card */}
          <div className="absolute top-5 left-5 bg-dark text-light rounded-xl overflow-hidden font-sans w-[300px] shadow-2xl z-[1001] border border-gray-600">
            {/* Header */}
            <div className="p-6 pb-4 border-b-2 border-gray-600 bg-gray">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-400 text-sm mb-1">
                    Flight Route
                  </div>
                  <div className="text-3xl font-bold text-white tracking-wider">
                    {popupInfo.origin}
                  </div>
                </div>
                
              </div>
              
              <div className="text-blue-300 text-base mt-2 font-medium">
                to {popupInfo.destination} • {popupInfo.distance} NM
              </div>
            </div>

            {/* Flight Details */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Flight Time
                  </div>
                  <div className="text-white font-semibold">
                    {formatFlightTime(popupInfo.totalTime)}
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Distance
                  </div>
                  <div className="text-white font-semibold">
                    {popupInfo.distance} NM
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                  Flight Date
                </div>
                <div className="text-white font-semibold">
                  {formatDate(popupInfo.created)}
                </div>
              </div>

              {/* Aircraft Information */}
              <div className="bg-gray rounded-lg p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Aircraft
                </div>
                
                {loadingAircraft ? (
                  <div className="text-gray-400 text-sm">
                    Loading aircraft data...
                  </div>
                ) : aircraftData ? (
                  <div>
                    <div className="text-white font-bold text-lg mb-1">
                      {aircraftData.result.name}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    Aircraft data unavailable
                  </div>
                )}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => {
                setPopupInfo(null);
                setAircraftData(null);
              }}
              className="absolute top-4 right-4 bg-gray-600 hover:bg-gray-500 border-none rounded-full w-8 h-8 text-white text-lg cursor-pointer flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
