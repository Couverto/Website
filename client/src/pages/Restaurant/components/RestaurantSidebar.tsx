import { NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface RestaurantSidebarProps {
  restaurant?: {
    _id: string;
    name: string;
    coverImage?: string;
  };
}

export const RestaurantSidebar = ({ restaurant }: RestaurantSidebarProps) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const navItems = [
    {
      title: t("pages.restaurant.nav.dashboard"),
      url: `/restaurant/${id}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: t("pages.restaurant.nav.bookings"),
      url: `/restaurant/${id}/bookings`,
      icon: CalendarDays,
    },
    {
      title: t("pages.restaurant.nav.clients"),
      url: `/restaurant/${id}/clients`,
      icon: Users,
    },
    {
      title: t("pages.restaurant.nav.collaborators"),
      url: `/restaurant/${id}/collaborators`,
      icon: UserPlus,
    },
    {
      title: t("pages.restaurant.nav.stats") || "Statistiques",
      url: `/restaurant/${id}/stats`,
      icon: BarChart3,
    },
    {
      title: t("pages.restaurant.nav.settings"),
      url: `/restaurant/${id}/settings`,
      icon: Settings,
    },
  ];

  const { pathname } = useLocation();
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          {restaurant?.coverImage ? (
            <img src={restaurant.coverImage} alt={restaurant.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">{restaurant?.name?.charAt(0) || "R"}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{restaurant?.name || "Restaurant"}</h2>
            <p className="text-xs text-muted-foreground">{t("pages.restaurant.portal")}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("pages.restaurant.nav.title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
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
                      {active && <div className="w-1 h-5 bg-primary rounded-full" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:cursor-pointer"
              onClick={() => navigate("/account/restaurants")}
              tooltip={t("pages.restaurant.back_to_account")}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{t("pages.restaurant.back_to_account")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
