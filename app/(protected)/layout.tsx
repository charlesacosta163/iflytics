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
          
          <div className="hidden lg:block">
            <AppSidebar />
          </div>

          <main className="flex-1 flex flex-col overflow-y-auto relative">
              <Navbar />
              <SidebarTrigger className="lg:block hidden absolute top-4 left-1 z-[9999] rounded-lg !shadow-none hover:!shadow-none hover:!bg-transparent cursor-pointer" />

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
  