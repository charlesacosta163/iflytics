import NavbarMap from "@/components/navbar-map";
import MapActivityTimeout from "@/components/dashboard-ui/flights/maps/map-activity-timeout";

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
  