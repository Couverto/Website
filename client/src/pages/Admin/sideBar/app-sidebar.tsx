import * as React from "react";
import { Home, NotebookText, Presentation, Settings, UsersIcon } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LanguageChanger } from "@/components/Navbar/languageChanger";
import { ThemeChanger } from "@/components/Navbar/themeChanger";
import { useTranslation } from "react-i18next";

const adminMenus = {
  navMain: [
    {
      title: "dashboard",
      icon: Presentation,
      url: "/admin/dashboard",
      isActive: true,
    },
    {
      title: "users",
      icon: UsersIcon,
      url: "/admin/users",
    },
    {
      title: "logs",
      icon: NotebookText,
      url: "/admin/logs",
    },
    {
      title: "settings",
      icon: Settings,
      url: "/admin/settings",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { t } = useTranslation();

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
