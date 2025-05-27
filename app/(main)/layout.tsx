import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="min-h-screen flex justify-center overflow-x-hidden">
            <main className="flex flex-col max-w-[1000px] w-full">
                <Navbar />
        
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
            </main>
        </div>
    );
  }
  