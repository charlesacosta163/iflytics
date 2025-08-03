'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FaFileExport, FaDownload, FaDesktop } from 'react-icons/fa'
import Papa from 'papaparse'
import { aircraftIdToIcaoWithArray } from '@/lib/foo'

interface RouteWithDistance {
  flightId: string;
  created: string;
  origin: string;
  originIsoCountry: string;
  originContinent: string;
  originCoordinates: { latitude: number; longitude: number };
  destination: string;
  destinationIsoCountry: string;
  destinationContinent: string;
  destinationCoordinates: { latitude: number; longitude: number };
  distance: number;
  totalTime: number;
  aircraftId: string;
  server: string;
  aircraftIcao: any;
}

interface ExportFlightsCSVBtnProps {
  routesWithDistances: any[];
  aircraftArray: any[];
}

const ExportFlightsCSVBtn: React.FC<ExportFlightsCSVBtnProps> = ({ routesWithDistances, aircraftArray }) => {

   routesWithDistances = routesWithDistances.map((route) => {
    const aircraftIcao = aircraftIdToIcaoWithArray(route.aircraftId, aircraftArray);
    return { ...route, aircraftIcao };
  });

  console.log(routesWithDistances[0])

  const [selectedFields, setSelectedFields] = useState({
    flightId: false,
    created: true, // Mandatory
    origin: true, // Mandatory
    originIsoCountry: false,
    originContinent: false,
    originLatitude: false,
    originLongitude: false,
    destination: true, // Mandatory
    destinationIsoCountry: false,
    destinationContinent: false,
    destinationLatitude: false,
    destinationLongitude: false,
    distance: false,
    totalTime: true, // Mandatory
    aircraftIcao: false, // Change from aircraftId to aircraftIcao
    aircraftName: false,
    server: false,
  });

  const [showPreview, setShowPreview] = useState(false);

  const fieldLabels = {
    flightId: 'Flight ID',
    created: 'Date* (Required)',
    origin: 'Origin* (Required)',
    originIsoCountry: 'Origin Country',
    originContinent: 'Origin Continent',
    originLatitude: 'Origin Latitude',
    originLongitude: 'Origin Longitude',
    destination: 'Destination* (Required)',
    destinationIsoCountry: 'Destination Country',
    destinationContinent: 'Destination Continent',
    destinationLatitude: 'Destination Latitude',
    destinationLongitude: 'Destination Longitude',
    distance: 'Distance (nm)',
    totalTime: 'Duration (mins)* (Required)',
    aircraftIcao: 'Aircraft (ICAO)',
    aircraftName: 'Aircraft Name',
    server: 'Server',
  };

  const mandatoryFields = ['created', 'origin', 'destination', 'totalTime'];

  const handleFieldToggle = (field: string, checked: boolean) => {
    if (mandatoryFields.includes(field)) return; // Don't allow unchecking mandatory fields
    
    setSelectedFields(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleExport = () => {
    const csvData = routesWithDistances.map(route => {
      const row: any = {};
      
      if (selectedFields.flightId) row['Flight ID'] = route.flightId;
      if (selectedFields.created) row['Date'] = formatDate(route.created);
      if (selectedFields.origin) row['From'] = route.origin;
      if (selectedFields.originIsoCountry) row['Origin Country'] = route.originIsoCountry;
      if (selectedFields.originContinent) row['Origin Continent'] = route.originContinent;
      if (selectedFields.originLatitude) row['Origin Latitude'] = route.originCoordinates.latitude;
      if (selectedFields.originLongitude) row['Origin Longitude'] = route.originCoordinates.longitude;
      if (selectedFields.destination) row['To'] = route.destination;
      if (selectedFields.destinationIsoCountry) row['Destination Country'] = route.destinationIsoCountry;
      if (selectedFields.destinationContinent) row['Destination Continent'] = route.destinationContinent;
      if (selectedFields.destinationLatitude) row['Destination Latitude'] = route.destinationCoordinates.latitude;
      if (selectedFields.destinationLongitude) row['Destination Longitude'] = route.destinationCoordinates.longitude;
      if (selectedFields.distance) row['Distance'] = route.distance;
      if (selectedFields.totalTime) row['Duration'] = Math.round(route.totalTime);
      if (selectedFields.aircraftIcao) row['Aircraft'] = route.aircraftIcao.icao;
      if (selectedFields.aircraftName) row['Aircraft Name'] = route.aircraftIcao.name;
      if (selectedFields.server) row['Server'] = route.server;
      
      return row;
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `iflytics-flights-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPreviewData = () => {
    return routesWithDistances.slice(0, 5).map(route => {
      const row: any = {};
      
      if (selectedFields.flightId) row['Flight ID'] = route.flightId;
      if (selectedFields.created) row['Date'] = formatDate(route.created);
      if (selectedFields.origin) row['From'] = route.origin;
      if (selectedFields.originIsoCountry) row['Origin Country'] = route.originIsoCountry;
      if (selectedFields.originContinent) row['Origin Continent'] = route.originContinent;
      if (selectedFields.originLatitude) row['Origin Latitude'] = route.originCoordinates.latitude;
      if (selectedFields.originLongitude) row['Origin Longitude'] = route.originCoordinates.longitude;
      if (selectedFields.destination) row['To'] = route.destination;
      if (selectedFields.destinationIsoCountry) row['Destination Country'] = route.destinationIsoCountry;
      if (selectedFields.destinationContinent) row['Destination Continent'] = route.destinationContinent;
      if (selectedFields.destinationLatitude) row['Destination Latitude'] = route.destinationCoordinates.latitude;
      if (selectedFields.destinationLongitude) row['Destination Longitude'] = route.destinationCoordinates.longitude;
      if (selectedFields.distance) row['Distance'] = route.distance;
      if (selectedFields.totalTime) row['Duration'] = Math.round(route.totalTime);
      if (selectedFields.aircraftIcao) row['Aircraft'] = route.aircraftIcao.icao;
      if (selectedFields.aircraftName) row['Aircraft Name'] = route.aircraftIcao.name;
      if (selectedFields.server) row['Server'] = route.server;
      
      return row;
    });
  };

  if (!routesWithDistances || routesWithDistances.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FaFileExport />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Export Flight Data</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col">
          <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">
            Select which fields to include in your CSV export. Compatible with MyFlightRadar24.
          </p>
          
          <div className="flex flex-col gap-2 overflow-y-auto">
            {Object.entries(fieldLabels).map(([field, label]) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={field}
                  checked={selectedFields[field as keyof typeof selectedFields]}
                  onCheckedChange={(checked) => handleFieldToggle(field, checked as boolean)}
                  disabled={mandatoryFields.includes(field)}
                />
                <label 
                  htmlFor={field} 
                  className={`text-sm ${mandatoryFields.includes(field) ? 'font-medium text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {label}
                </label>
              </div>
            ))}          
          <div>
            <Button 
                variant="outline" 
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center gap-2 mb-2"
            >
                <FaDesktop /> {/* or FaEye */}
                {showPreview ? 'Hide Preview' : 'Preview Data'}

            </Button>
                
          </div>

          {showPreview && (
            <div className="border rounded p-3 w-full max-w-full h-32 overflow-auto">
              <p className="text-xs text-gray-500 mb-2">First 5 rows preview:</p>
              <pre className="text-xs whitespace-pre-wrap break-all">
                {Papa.unparse(getPreviewData())}
              </pre>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button 
              onClick={handleExport}
              className="w-full flex items-center gap-2"
            >
              <FaDownload />
              Download CSV ({routesWithDistances.length} flights)
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            * Required fields for MyFlightRadar24 compatibility
          </p>
        </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportFlightsCSVBtn;