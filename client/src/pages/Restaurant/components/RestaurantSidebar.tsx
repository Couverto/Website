import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, CalendarDays, Users, Settings, UserPlus, ChevronLeft } from "lucide-react";
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
      url: `/restaurant/${id}/reservations`,
      icon: CalendarDays,
    },
    {
      title: t("pages.restaurant.nav.clients"),
      url: `/restaurant/${id}/clients`,
      icon: Users,
    },
    {
      title: t("pages.restaurant.nav.collaborators"),
      url: `/restaurant/${id}/collaborateurs`,
      icon: UserPlus,
    },
    {
      title: t("pages.restaurant.nav.settings"),
      url: `/restaurant/${id}/parametres`,
      icon: Settings,
    },
  ];

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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/account/restaurants")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("pages.restaurant.back_to_account")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
