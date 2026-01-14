import { Link, useNavigate } from "react-router-dom";
import { ThemeChanger } from "./themeChanger";
import { LanguageChanger } from "./languageChanger";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { House, LogOut, Menu, User, Wrench, X, Utensils } from "lucide-react";
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLogout } from "@/hooks/useLogout";
import { AvatarWithStatusCell } from "@/components/customs/avatarStatusCell";
import { useConfigContext } from "../../contexts/configContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, loading } = useLogout();
  const { authUser } = useAuthContext();
  const { configValues } = useConfigContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeDialogAndNavigate = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

  const navLinks = [
    {
      label: "Dashboard", // Key for translation if needed, or static
      translationKey: "navbar.dashboard",
      path: "/admin/dashboard",
      icon: Wrench,
      auth: true,
      role: "admin",
    },
    {
      label: "My Account",
      translationKey: "navbar.account",
      path: "/account",
      icon: User,
      auth: true,
    },
  ];

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold mr-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Utensils className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">{configValues["APP_NAME"] || "Couverto"}</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            {/* Pro Link (Desktop) */}

            <Link to="/pro" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden md:block">
              {t("pages.home.navbar.are_you_pro")}
            </Link>

            <Separator orientation="vertical" className="h-6 hidden md:block" />

            <div className="hidden md:flex items-center gap-2">
              <LanguageChanger />
              <ThemeChanger />
            </div>

            <Separator orientation="vertical" className="h-6 hidden md:block" />

            {/* Auth Buttons / User Menu */}
            <div className="flex items-center gap-2">
              {authUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hover:cursor-pointer">
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                      {navLinks
                        .filter((link) => !link.role || link.role === authUser.role)
                        .map((link) => (
                          <DropdownMenuItem key={link.path} className="cursor-pointer" onClick={() => navigate(link.path)}>
                            <link.icon className="mr-2 h-4 w-4" />
                            <span>{t(link.translationKey)}</span>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("navbar.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary">
                    <Link to="/login">{t("auth.login.title")}</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">{t("auth.register.title")}</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden flex items-center">
              <Menu onClick={() => setIsOpen(!isOpen)} className="cursor-pointer h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div
          ref={menuRef}
          className={cn(
            "fixed top-0 right-0 w-3/4 sm:w-1/2 h-screen overflow-y-auto bg-background border-l shadow-2xl transition-transform duration-300 ease-in-out z-50 p-6",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex justify-end mb-8">
            <X onClick={() => setIsOpen(false)} className="cursor-pointer h-6 w-6" />
          </div>

          <div className="flex flex-col gap-6">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">
              {t("navbar.restaurants")}
            </Link>
            <Link to="/pro" onClick={() => setIsOpen(false)} className="text-lg font-medium">
              {t("pages.home.navbar.are_you_pro")}
            </Link>

            <Separator />

            {authUser ? (
              <div className="flex flex-col gap-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">{authUser.username}</div>
                {navLinks
                  .filter((link) => !link.role || link.role === authUser.role)
                  .map((link) => (
                    <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg">
                      <link.icon className="h-5 w-5" />
                      {t(link.translationKey)}
                    </Link>
                  ))}
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="justify-start px-0 text-lg text-destructive hover:text-destructive"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  {t("navbar.logout")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Button asChild className="w-full">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    {t("auth.login.title")}
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    {t("auth.register.title")}
                  </Link>
                </Button>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("navbar.language")}</span>
              <LanguageChanger />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <ThemeChanger />
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};
