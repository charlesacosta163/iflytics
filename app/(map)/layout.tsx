import type { Metadata } from "next";
import NavbarMap from "@/components/navbar-map";
import MapActivityTimeout from "@/components/dashboard-ui/flights/maps/map-activity-timeout";

export const metadata: Metadata = {
  title: "The Infinite Flight Flight Map - IFlytics | Real-time Flight Tracking",
  description: "Explore live flights on the Infinite Flight Expert Server with real-time pilot tracking, interactive maps, and our game Find the Pilot. Track thousands of active pilots and test your skills.",
  keywords: "infinite flight, live map, flight tracking, real-time flights, expert server, aviation games, pilot tracking, flight simulator, find the pilot game, expert server map, map",
  openGraph: {
    title: "Infinite Flight Live Map - IFlytics",
    description: "Real-time flight tracking and interactive aviation games for Infinite Flight Expert Server.",
    type: "website",
    url: "/map",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinite Flight Live Map - IFlytics", 
    description: "Real-time flight tracking and interactive aviation games for Infinite Flight.",
  },
};

export default function MapLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <MapActivityTimeout>
            <div className="min-h-screen flex flex-col overflow-x-hidden">
                <main className="flex-1 relative">
                  <NavbarMap />
                  {children}
                </main>
            </div>
        </MapActivityTimeout>
    );
}