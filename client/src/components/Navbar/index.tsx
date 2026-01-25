import { Link, useNavigate, useLocation } from "react-router-dom";
import { ThemeChanger } from "./themeChanger";
import { Separator } from "../ui/separator";
import { House, LogOut, Menu, User, Users, Wrench, X, Utensils, ChefHat, Calendar, LayoutDashboard, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuthContext } from "@/contexts/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLogout } from "@/hooks/useLogout";
import { AvatarWithStatusCell } from "@/components/customs/avatarStatusCell";
import { useConfigContext } from "../../contexts/configContext";
import { useIsMobile } from "@/hooks/useMobile";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useLogout();
  const { authUser } = useAuthContext();
  const { configValues } = useConfigContext();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const navLinks = [
    {
      label: "Home",
      translationKey: "Accueil",
      path: "/",
      icon: House,
      auth: false,
      hideIfAuth: false,
    },
    {
      label: "Restaurants",
      translationKey: "Restaurants",
      path: "/restaurants",
      icon: Utensils,
      auth: false,
      hideIfAuth: false,
    },
    {
      label: "Pro Area",
      translationKey: "Espace Pro",
      path: "/pro",
      icon: ChefHat,
      auth: false,
      hideIfAuth: false,
    },
    {
      label: "About",
      translationKey: "A propos",
      path: "/about",
      icon: Users,
      auth: false,
      hideIfAuth: false,
    },
    {
      label: "Contact",
      translationKey: "Contact",
      path: "/contact",
      icon: Users,
      auth: false,
      hideIfAuth: false,
    },
  ];

  const userLinks = [
    {
      label: "My Bookings",
      translationKey: "Mes réservations",
      path: "/account/bookings",
      icon: Calendar,
      role: "user",
    },
    {
      label: "My Restaurants",
      translationKey: "Mes restaurants",
      path: "/account/restaurants",
      icon: ChefHat,
      role: "user", // Also accessible to users who want to be pros
    },
    {
      label: "Dashboard",
      translationKey: "Tableau de bord",
      path: "/admin/dashboard",
      icon: Wrench,
      role: "admin",
    },
  ];

  const isMobile = useIsMobile();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
        <nav
          className={cn(
            "pointer-events-auto w-full max-w-7xl rounded-full border transition-all duration-300 ease-in-out px-4 md:px-6 h-16 flex items-center justify-between",
            "bg-background backdrop-blur-md border-border/40 shadow-sm", // Default state (always visible/glassy)
            scrolled || isOpen ? "bg-background shadow-lg border-border" : "",
          )}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold group"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Utensils className="h-5 w-5" />
            </div>
            <span className={cn("text-xl font-bold tracking-tight")}>{configValues["APP_NAME"]}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              if (link.hideIfAuth && authUser) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative text-sm font-medium transition-all duration-200 px-4 py-2 rounded-full",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {link.translationKey}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <ThemeChanger />
            </div>

            {authUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-colors"
                  >
                    <AvatarWithStatusCell user={authUser} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{authUser.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{authUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/account")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{"Mon compte"}</span>
                    </DropdownMenuItem>
                    {userLinks
                      .filter((link) => !link.role || (link.role === "admin" ? authUser.role === "admin" : true))
                      .map((link) => (
                        <DropdownMenuItem key={link.path} className="cursor-pointer" onClick={() => navigate(link.path)}>
                          <link.icon className="mr-2 h-4 w-4" />
                          <span>{link.translationKey}</span>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{"Se déconnecter"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isMobile ? null : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden md:flex rounded-full hover:bg-accent">
                  <Link to="/login">{"Se connecter"}</Link>
                </Button>
                <Button asChild className="rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <Link to="/register">{"Créer un compte"}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        ref={menuRef}
        className={cn(
          "fixed top-0 right-0 w-[80%] max-w-sm h-[100dvh] overflow-y-auto bg-background/95 backdrop-blur-xl border-l shadow-2xl transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) z-[60] p-6 md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-between items-center mb-8">
          <span className="text-lg font-bold">{configValues["APP_NAME"]}</span>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {navLinks.map((link) => {
            if (link.hideIfAuth && authUser) return null;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 text-lg font-medium p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <link.icon className="h-5 w-5" />
                </div>
                {link.translationKey}
              </Link>
            );
          })}

          <Separator />

          {authUser ? (
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground px-2 mb-2">{"Mon compte"}</div>

              <Link
                to="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 text-lg font-medium p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                {"Mon compte"}
              </Link>

              {userLinks
                .filter((link) => !link.role || (link.role === "admin" ? authUser.role === "admin" : true))
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 text-lg font-medium p-2 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <link.icon className="h-5 w-5" />
                    </div>
                    {link.translationKey}
                  </Link>
                ))}

              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="justify-start px-2 mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-2 h-5 w-5" />
                {"Se déconnecter"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Button asChild className="w-full rounded-full h-12 text-base">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  {"Se connecter"}
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full rounded-full h-12 text-base">
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  {"Créer un compte"}
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-auto pt-8 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Preferences</span>
            <div className="flex gap-2">
              <ThemeChanger />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
