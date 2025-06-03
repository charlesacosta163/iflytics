import Sidebar from "@/components/dashboard-ui/shared/sidebar";
import Navbar from "@/components/dashboard-ui/shared/navbar";
import Footer from "@/components/footer";
import ActivityTimeout from "@/components/activity-timeout";
import { userHasIFCUsername } from "@/lib/supabase/user-actions";
import { redirect } from "next/navigation";

export default async function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    // Check if user has IFC username for all protected routes
    const response = await userHasIFCUsername();
    
    if (response.success === false) {
        redirect('/setup/setifcusername')
    }
  
    return (
      <div className="h-screen flex">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
            <Navbar />

            <div className="flex-1 p-4">
                {children}
                <ActivityTimeout />
            </div>

            <Footer />
        </main>
      </div>
    );
  }
  