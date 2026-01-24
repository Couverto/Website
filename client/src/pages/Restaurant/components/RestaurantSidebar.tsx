import { NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Users, Settings, UserPlus, ChevronLeft, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NavUser } from "@/components/nav-user";
import { useAuthContext } from "@/contexts/authContext";
import { ThemeChanger } from "@/components/Navbar/themeChanger";
import { Separator } from "@/components/ui/separator";

interface RestaurantSidebarProps {
  restaurant?: {
    _id: string;
    name: string;
    coverImage?: string;
  };
  userRole?: string;
}

export const RestaurantSidebar = ({ restaurant, userRole = "employee" }: RestaurantSidebarProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const { state } = useSidebar();

  const role = userRole;

  const navItems = [
    {
      title: "Tableau de bord",
      url: `/restaurant/${id}/dashboard`,
      icon: LayoutDashboard,
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "Réservations",
      url: `/restaurant/${id}/bookings`,
      icon: CalendarDays,
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "Clients",
      url: `/restaurant/${id}/clients`,
      icon: Users,
      roles: ["admin", "manager"],
    },
    {
      title: "Collaborateurs",
      url: `/restaurant/${id}/collaborators`,
      icon: UserPlus,
      roles: ["admin", "manager"],
    },
    {
      title: "Statistiques",
      url: `/restaurant/${id}/stats`,
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      title: "Paramètres",
      url: `/restaurant/${id}/settings`,
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  const { pathname } = useLocation();
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300">
      <SidebarHeader className="p-4 group-data-[state=collapsed]:p-0 transition-all">
        <div className="flex items-center group-data-[state=expanded]:gap-3 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:h-16 transition-all">
          {restaurant?.coverImage ? (
            <img
              src={restaurant.coverImage}
              alt={restaurant.name}
              className="w-10 h-10 min-w-10 group-data-[state=collapsed]:h-9 group-data-[state=collapsed]:w-9 group-data-[state=collapsed]:min-w-9 rounded-2xl group-data-[state=collapsed]:rounded-xl object-cover shadow-lg shadow-primary/20 transition-all cursor-pointer"
              onClick={() => navigate(`/restaurant/${id}/dashboard`)}
            />
          ) : (
            <div
              className="w-10 h-10 min-w-10 group-data-[state=collapsed]:h-9 group-data-[state=collapsed]:w-9 group-data-[state=collapsed]:min-w-9 rounded-2xl group-data-[state=collapsed]:rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              onClick={() => navigate(`/restaurant/${id}/dashboard`)}
            >
              <span className="text-primary-foreground font-black text-xl group-data-[state=collapsed]:text-sm italic tracking-tighter">
                {restaurant?.name?.charAt(0) || "R"}
              </span>
            </div>
          )}
          <div className="flex flex-col overflow-hidden transition-all group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
            <h2 className="font-semibold truncate">{restaurant?.name || "Restaurant"}</h2>
            <p className="text-xs text-muted-foreground">{"Espace restaurateur"}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{"Navigation"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={active}
                      onClick={() => navigate(item.url)}
                      className={`h-11 px-4 transition-all duration-200 ${
                        active
                          ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-semibold"
                          : "hover:bg-primary/[0.04] hover:text-primary"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
                      />
                      <span className="flex-1">{item.title}</span>
                      {active && <div className="w-1 h-5 bg-primary rounded-full group-data-[state=collapsed]:hidden" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[state=collapsed]:p-2 flex flex-col gap-4 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900/50 backdrop-blur-sm transition-all">
        <div className="flex flex-col items-center gap-2">
          <NavUser user={authUser} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
