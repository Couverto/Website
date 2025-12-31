import * as React from "react";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { LanguageChanger } from "@/components/Navbar/languageChanger";
import { ThemeChanger } from "@/components/Navbar/themeChanger";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authUser } = useAuthContext();
  const { state } = useSidebar();

  const adminMenus = {
    navMain: [
      {
        title: "dashboard",
        url: "/app/dashboard",
        icon: LayoutDashboard,
        isActive: true,
        roles: ["admin", "user"],
      },
      {
        title: "users",
        url: "/app/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "logs",
        url: "/app/logs",
        icon: FileText,
        roles: ["admin"],
      },
      {
        title: "settings",
        url: "/app/settings",
        icon: Settings,
        roles: ["admin"],
      },
    ].filter((item) => !item.roles || (authUser?.role && item.roles.includes(authUser.role))),
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          {state === "expanded" && <span className="font-bold text-lg">Couverto</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminMenus.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeChanger />
        <LanguageChanger />
        <NavUser user={authUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
