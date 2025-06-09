/* Sample Flight Object
{
    id: '43cd3c61-96ef-468a-98ae-b8e7900e49ca',
    created: '2025-05-28T03:52:22.674607Z',
    userId: '1577e4a9-98c7-4d61-9ff3-cf0d003284e4',
    aircraftId: '958486b0-1ef4-4efd-bee0-ea94e96f6c96',
    liveryId: '5af2afed-51a9-45de-a442-709f949a5443',
    callsign: 'Air Canada 8575',
    server: 'Expert',
    dayTime: 45.495136,
    nightTime: 0,
    totalTime: 142.74648,
    landingCount: 1,
    originAirport: 'KLAX',
    destinationAirport: 'CYVR',
    xp: 1647,
    worldType: 3,
    violations: []
  }
*/

export type Flight = {
    id: string;
    created: string;
    userId: string;
    aircraftId: string;
    liveryId: string;
    callsign: string;
    server: string;
    dayTime: number;
    nightTime: number;
    totalTime: number;
    landingCount: number;
    originAirport: string;
    destinationAirport: string;
    xp: number;
    worldType: number;
    violations: any[];
}

export interface FlightRoute {
  data: Array<{
    flightId: string;
    created: string;
    origin: string;
    originCoordinates: { latitude: number; longitude: number };
    destination: string;
    destinationCoordinates: { latitude: number; longitude: number };
    distance: number;
    totalTime: number;
    aircraftId: string;
    server: string;
  }>;
  timestamp: number;
  expiresAt: number;
}