import Sidebar from "@/components/dashboard-ui/shared/sidebar";
import Navbar from "@/components/dashboard-ui/shared/navbar";
import Footer from "@/components/footer";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="h-screen flex">


        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
            <Navbar />

            <div className="flex-1 p-4">
                {children}
            </div>

            <Footer />

        </main>
      </div>
    );
  }
  