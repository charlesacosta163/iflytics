'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FaFileExport, FaDownload, FaDesktop } from 'react-icons/fa'
import Papa from 'papaparse'
import { aircraftIdToIcaoWithArray } from '@/lib/foo'
import { hasLifetimeAccess, Subscription } from '@/lib/subscription/helpers';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FaQuestionCircle } from 'react-icons/fa';
import Link from 'next/link';

interface ExportFlightsCSVBtnProps {
  routesWithDistances: any[];
  aircraftArray: any[];
  subscription: Subscription;  // Add this
}

const ExportFlightsCSVBtn: React.FC<ExportFlightsCSVBtnProps> = ({ 
  routesWithDistances, 
  aircraftArray,
  subscription 
}) => {

   routesWithDistances = routesWithDistances.map((route) => {
    const aircraftIcao = aircraftIdToIcaoWithArray(route.aircraftId, aircraftArray);
    return { ...route, aircraftIcao };
  });


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
    aircraftIcao: 'Aircraft',
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
      if (selectedFields.totalTime) row['Duration'] = `${Math.floor(route.totalTime/60)}:${Math.floor(route.totalTime%60).toString().padStart(2,'0')}:00`;

      // If aircraft string is equal to "()" or includes undefined, set as empty string
      if (selectedFields.aircraftIcao && route.aircraftIcao.icao) {
        if (route.aircraftIcao.name === "()" || route.aircraftIcao.name === undefined || route.aircraftIcao.name.includes("undefined")) {
          row['Aircraft'] = "";
        } else {
          row['Aircraft'] = `${route.aircraftIcao.name}`;
        }
      }
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
      if (selectedFields.totalTime) row['Duration'] = `${Math.floor(route.totalTime/60)}:${Math.floor(route.totalTime%60).toString().padStart(2,'0')}:00`;
      if (selectedFields.aircraftIcao) row['Aircraft'] = `${route.aircraftIcao.name} (${route.aircraftIcao.icao})`;
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
        {hasLifetimeAccess(subscription) ? (
          <Button variant="outline" className="flex items-center gap-2">
            <FaFileExport />
            Export CSV
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled
            >
              <FaFileExport />
              Export CSV
            </Button>
            <Popover>
              <PopoverTrigger>
                <FaQuestionCircle className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">Lifetime Feature</h4>
                  <p className="text-sm text-gray-400">
                    Exporting flight data is available exclusively for Lifetime members. 
                    Upgrade to Lifetime to unlock this and other premium features. Data compatibility with MyFlightRadar24.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </DialogTrigger>

      {/* Only render dialog content if user has lifetime access */}
      {hasLifetimeAccess(subscription) && (
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] z-[10001]">
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
      )}
    </Dialog>
  );
};

export default ExportFlightsCSVBtn;