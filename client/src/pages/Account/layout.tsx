import { Outlet, NavLink, useLocation } from "react-router-dom";
import { User, Utensils, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const AccountLayout = () => {
  const location = useLocation();

  const navItems = [
    {
      title: "Profil",
      href: "/account/profile",
      icon: User,
    },
    {
      title: "Mes Restaurants",
      href: "/account/restaurants",
      icon: Utensils,
    },
    {
      title: "Mes Réservations",
      href: "/account/bookings",
      icon: Calendar,
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                    isActive || location.pathname.startsWith(item.href)
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-secondary/50",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
