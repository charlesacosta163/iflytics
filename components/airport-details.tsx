import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaPlane, FaGlobe, FaMapMarkerAlt, FaRuler, FaWikipediaW, FaExternalLinkAlt } from 'react-icons/fa';
import { FaRadio } from 'react-icons/fa6';
import { MdLocationOn } from 'react-icons/md';
import { GiRadarDish } from 'react-icons/gi';
import { BiWorld } from 'react-icons/bi';
import FlightRouteMapRenderer from './dashboard-ui/misc/flightroute-maprenderer';

const AirportDetails = ({ airportData }: { airportData: any }) => {
  const formatCoordinates = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  };

  const getAirportTypeIcon = (type: string) => {
    switch (type) {
      case 'large_airport':
        return '🛫';
      case 'medium_airport':
        return '✈️';
      case 'small_airport':
        return '🛩️';
      default:
        return '🛩️';
    }
  };

  const getSurfaceIcon = (surface: string) => {
    switch (surface.toUpperCase()) {
      case 'ASP':
      case 'ASPH':
        return '🛤️';
      case 'CON':
      case 'CONC':
        return '🏗️';
      case 'GRS':
      case 'GRASS':
        return '🌱';
      default:
        return '🛤️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Airport Info */}
      <Card className="bg-gradient-to-r from-gray-800 to-dark border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-light">
            <span className="text-3xl">{getAirportTypeIcon(airportData.type)}</span>
            {airportData.name}
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            {airportData.icao_code} • {airportData.iata_code} • {airportData.municipality}, {airportData.region.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <MdLocationOn className="text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Coordinates</p>
                <p className="text-sm text-light">{formatCoordinates(airportData.latitude_deg, airportData.longitude_deg)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Elevation</p>
                <p className="text-sm text-light">{airportData.elevation_ft} ft</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BiWorld className="text-purple-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Country/Region</p>
                <p className="text-sm text-light">{airportData.country.name} ({airportData.country.code})</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaPlane className="text-orange-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Type</p>
                <p className="text-sm capitalize text-light">{airportData.type.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaGlobe className="text-red-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Scheduled Service</p>
                <p className="text-sm text-light">{airportData.scheduled_service === 'yes' ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infinite Flight Airport Status */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light">
            <FaPlane className="text-green-400" />
            Infinite Flight Status
          </CardTitle>
          <CardDescription className="text-gray-300">
            Current activity on Expert Server
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder data - replace with actual airportStatus prop */}
          {(() => {
        
            const inboundCount = airportData.inboundFlightsCount;
            const outboundCount = airportData.outboundFlightsCount;
            
            const isActive = airportData.atcFacilities.length > 0;
            
            return (
              <div className="space-y-4">
                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <div>
                      <h3 className="text-lg font-semibold text-light">
                        {isActive ? 'Active Airport' : 'Inactive Airport'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {isActive ? 'ATC services are currently available' : 'No ATC services active'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-light">{airportData.atcFacilities.length}</p>
                    <p className="text-xs text-gray-400">ATC Online</p>
                  </div>
                </div>

                
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                        <p className="text-2xl font-bold text-light">{inboundCount}</p>
                        <p className="text-sm text-blue-200">Inbound Flights</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                        <p className="text-2xl font-bold text-light">{outboundCount}</p>
                        <p className="text-sm text-green-200">Outbound Flights</p>
                    </div>
                </div>

                {/* ATC Controllers (if active) - deduplicated */}
                {isActive && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                      Active Controllers
                    </h4>
                    {(() => {
                      // Create a Map to store unique controllers by username (keeps first occurrence)
                      const uniqueControllers = airportData.atcFacilities.reduce((acc: any[], controller: any) => {
                        if (!acc.find(c => c.username === controller.username)) {
                          acc.push(controller);
                        }
                        return acc;
                      }, []);

                      return uniqueControllers.map((controller: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-light">
                                {controller.type === 4 ? 'TWR' : 'ATC'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-light">{controller.username}</p>
                              <p className="text-xs text-gray-400">
                                Online since {new Date(controller.startTime).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                            Active
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* Inactive State */}
                {!isActive && (
                  <div className="text-center py-6 text-gray-400">
                    <div className="text-4xl mb-2">🏗️</div>
                    <p className="font-medium">No ATC Coverage</p>
                    <p className="text-sm">This airport is currently uncontrolled</p>
                  </div>
                )}

                { /* ATIS info */}
                {airportData.atis && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-400 font-bold">ATIS</p>
                    <p className="text-sm text-light font-mono bg-gray-700 p-4 rounded-lg">{airportData.atis}</p>
                </div>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Airport Location Map */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light">
            <FaMapMarkerAlt className="text-blue-400" />
            Airport Location
          </CardTitle>
          <CardDescription className="text-gray-300">
            {airportData.name} on the map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden">
            <FlightRouteMapRenderer 
              lat={airportData.latitude_deg} 
              lng={airportData.longitude_deg} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      {(airportData.home_link || airportData.wikipedia_link) && (
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-light">
              <FaExternalLinkAlt className="text-blue-400" />
              External Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {airportData.home_link && (
                <a
                  href={airportData.home_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200"
                >
                  <FaGlobe className="text-light" />
                  <span className="text-light font-medium">Official Website</span>
                </a>
              )}
              {airportData.wikipedia_link && (
                <a
                  href={airportData.wikipedia_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg transition-all duration-200"
                >
                  <FaWikipediaW className="text-light" />
                  <span className="text-light font-medium">Wikipedia</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Runways */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light">
            <FaRuler className="text-green-400" />
            Runways ({airportData.runways.length})
          </CardTitle>
          <CardDescription className="text-gray-300">Runway information and specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {airportData.runways.map((runway: any, index: number) => (
              <div key={runway.id} className="border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 hover:from-gray-600 hover:to-gray-700 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-light">
                    {runway.le_ident}/{runway.he_ident}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getSurfaceIcon(runway.surface)}</span>
                    <span className="text-sm bg-gray-600 text-light px-2 py-1 rounded">{runway.surface}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-400">Length</p>
                    <p className="text-light">{Number(runway.length_ft).toLocaleString()} ft</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Width</p>
                    <p className="text-light">{runway.width_ft} ft</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Lighting</p>
                    <p className="text-light">{runway.lighted === '1' ? '✅ Yes' : '❌ No'}</p>
                  </div>
                  {runway.he_ils && (
                    <div>
                      <p className="font-medium text-gray-400">ILS</p>
                      <p className="text-light">{runway.he_ils.freq} MHz</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Frequencies */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light">
            <FaRadio className="text-purple-400" />
            Frequencies ({airportData.freqs.length})
          </CardTitle>
          <CardDescription className="text-gray-300">Communication frequencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {airportData.freqs.map((freq: any) => (
              <div key={freq.id} className="border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-3 hover:from-gray-600 hover:to-gray-700 transition-all duration-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-purple-300 bg-purple-900 px-2 py-1 rounded">
                    {freq.type}
                  </span>
                  <span className="text-lg font-mono font-bold text-light">
                    {freq.frequency_mhz}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{freq.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Aids */}
      {airportData.navaids && airportData.navaids.length > 0 && (
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-light">
              <GiRadarDish className="text-orange-400" />
              Navigation Aids ({airportData.navaids.length})
            </CardTitle>
            <CardDescription className="text-gray-300">Available navigation aids</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {airportData.navaids.map((navaid: any, index: number) => (
                <div key={index} className="border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 hover:from-gray-600 hover:to-gray-700 transition-all duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-light">{navaid.name}</h4>
                      <p className="text-sm text-gray-300">({navaid.ident})</p>
                    </div>
                    <span className="text-sm bg-orange-900 text-orange-300 px-2 py-1 rounded">
                      {navaid.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-400">Frequency</p>
                      <p className="text-light">{navaid.frequency_khz} kHz</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Usage</p>
                      <p className="text-light">{navaid.usageType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source Caption */}
      <div className="text-center pt-4 pb-2">
        <p className="text-sm text-gray-500">
          Data is supplied by{' '}
          <a 
            href="https://airportdb.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
          >
            airportdb.io & Infinite Flight Live API
          </a>
        </p>
      </div>
    </div>
  );
};

export default AirportDetails;