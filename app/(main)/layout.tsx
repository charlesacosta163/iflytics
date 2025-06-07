import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <div className="max-w-[1000px] w-full mx-auto sticky top-0 z-50">
              <Navbar />
            </div>
      
            <main className="flex-1">
              {children}
            </main>

            <div className="max-w-[1000px] w-full mx-auto">
              <Footer />
            </div>
        </div>
    );
  }
  