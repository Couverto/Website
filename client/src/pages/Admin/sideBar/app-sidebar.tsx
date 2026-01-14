import * as React from "react";
import { LayoutDashboard, Users, FileText, Settings, Utensils, House } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { LanguageChanger } from "@/components/Navbar/languageChanger";
import { ThemeChanger } from "@/components/Navbar/themeChanger";
import { useConfigContext } from "@/contexts/configContext";
import { useNavigate } from "react-router-dom";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authUser } = useAuthContext();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { configValues } = useConfigContext();

  const adminMenus = {
    navMain: [
      {
        title: "dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
        isActive: true,
        roles: ["admin", "user"],
      },
      {
        title: "users",
        url: "/admin/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "restaurants",
        url: "/admin/restaurants",
        icon: Utensils,
        roles: ["admin"],
      },
      {
        title: "logs",
        url: "/admin/logs",
        icon: FileText,
        roles: ["admin"],
      },
      {
        title: "settings",
        url: "/admin/settings",
        icon: Settings,
        roles: ["admin"],
      },
    ].filter((item) => !item.roles || (authUser?.role && item.roles.includes(authUser.role))),
    navSecondary: [
      {
        title: "menu.back_to_website",
        url: "/",
        icon: House,
        isActive: false,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader onClick={() => navigate("/")} className="hover:cursor-pointer">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            {/* Display first letter of App Name */}
            <span className="text-primary-foreground font-bold text-sm">{(configValues["APP_NAME"] || "Couverto").charAt(0)}</span>
          </div>
          {state === "expanded" && <span className="font-bold text-lg">{configValues["APP_NAME"] || "Couverto"}</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminMenus.navMain} />
        <div className="mt-auto">
          <NavMain items={adminMenus.navSecondary} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <ThemeChanger />
        <LanguageChanger />
        <NavUser user={authUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
