import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/pages/Admin/sideBar/app-sidebar"; // Reusing or creating a specific one?
// For now, I'll assume we need a separate layout or reuse Admin's if acceptable.
// But let's keep it simple for now, just a placeholder.
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const RestaurantLayout = () => {
  return (
    <SidebarProvider>
      {/* <RestaurantSidebar /> - TODO: Create specific sidebar */}
      <div className="flex min-h-screen w-full">
        {/* Temporary reuse or simple sidebar */}
        <div className="w-64 border-r bg-muted/20 hidden lg:block p-4">
          <h2 className="font-bold text-lg mb-4">Restaurant Dashboard</h2>
          <p className="text-sm text-muted-foreground">Sidebar coming soon</p>
        </div>
        <main className="flex-1 p-6">
          <SidebarTrigger className="lg:hidden mb-4" />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
