import Sidebar from "@/components/dashboard-ui/shared/sidebar";
import Navbar from "@/components/dashboard-ui/shared/navbar";
import Footer from "@/components/footer";
import ActivityTimeout from "@/components/activity-timeout";
import { userHasIFCUsername } from "@/lib/supabase/user-actions";
import { redirect } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/dashboard-ui/shared/app-sidebar";

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
        {/* <Sidebar /> */}
        <SidebarProvider>
          
          <AppSidebar />

          <main className="flex-1 flex flex-col overflow-y-auto relative">
              <Navbar />
              <SidebarTrigger className="lg:block hidden absolute top-4 -left-2.5 z-[9999] bg-white dark:bg-gray-900 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700" />

              <div className="flex-1 p-4">
                  {children}
                  <ActivityTimeout />
              </div>

              <Footer />
          </main>

        </SidebarProvider>
      </div>
    );
  }
  