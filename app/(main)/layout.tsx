import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="min-h-screen flex justify-center">
            <main className="flex flex-col max-w-[1000px] w-full">
                <Navbar />
                {children}
                <Footer />
            </main>
        </div>
    );
  }
  