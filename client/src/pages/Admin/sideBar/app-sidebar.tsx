import * as React from "react";
import { LayoutDashboard, Users, FileText, Settings, Utensils, House, Paperclip, DollarSign } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { ThemeChanger } from "@/components/Navbar/themeChanger";
import { useConfigContext } from "@/contexts/configContext";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authUser } = useAuthContext();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { configValues } = useConfigContext();

  const adminMenus = {
    navMain: [
      {
        title: "Tableau de bord",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
        isActive: true,
        roles: ["admin", "user"],
      },
      {
        title: "Utilisateurs",
        url: "/admin/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "Restaurants",
        url: "/admin/restaurants",
        icon: Utensils,
        roles: ["admin"],
      },
      {
        title: "Offres",
        url: "/admin/plans",
        icon: DollarSign,
        roles: ["admin"],
      },
      {
        title: "Logs",
        url: "/admin/logs",
        icon: FileText,
        roles: ["admin"],
      },
      {
        title: "Paramètres",
        url: "/admin/settings",
        icon: Settings,
        roles: ["admin"],
      },
    ].filter((item) => !item.roles || (authUser?.role && item.roles.includes(authUser.role))),
    navSecondary: [
      {
        title: "Retour au site",
        url: "/",
        icon: House,
        isActive: false,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300">
      <SidebarHeader onClick={() => navigate("/")} className="p-4 group-data-[state=collapsed]:p-0 transition-all hover:cursor-pointer">
        <div className="flex items-center gap-2 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:h-16 transition-all">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">{configValues["APP_NAME"].charAt(0)}</span>
          </div>
          <div className="flex flex-col overflow-hidden transition-all group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
            <span className="font-semibold tracking-tight whitespace-nowrap">{configValues["APP_NAME"]}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <NavMain items={adminMenus.navMain} />
        <div className="mt-auto border-t border-zinc-100 dark:border-zinc-900/50">
          <NavMain items={adminMenus.navSecondary} />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[state=collapsed]:p-2 flex flex-col gap-4 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900/50 backdrop-blur-sm transition-all">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full gap-2 px-1 group-data-[state=collapsed]:flex-col group-data-[state=collapsed]:px-0">
            <ThemeChanger />
            {state === "expanded" && <Separator orientation="vertical" className="h-4 w-[1px] opacity-20" />}
          </div>
          <NavUser user={authUser} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
