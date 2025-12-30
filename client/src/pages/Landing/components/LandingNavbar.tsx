import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeChanger } from "@/components/Navbar/themeChanger";
import { LanguageChanger } from "@/components/Navbar/languageChanger";
import { useTranslation } from "react-i18next";

export const LandingNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { label: t("pages.landing.navbar.features"), href: "#features" },
    { label: t("pages.landing.navbar.pricing"), href: "#pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-3 md:px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">Couverto</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageChanger />
          <ThemeChanger />
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              {t("pages.landing.navbar.login")}
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {t("pages.landing.navbar.try_free")}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn("md:hidden overflow-hidden transition-all duration-300 ease-in-out", isMobileMenuOpen ? "max-h-96" : "max-h-0")}>
        <nav className="container mx-auto flex flex-col gap-4 px-4 py-4 border-t border-border/40">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {t("pages.landing.navbar.login")}
              </Button>
            </Link>
            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {t("pages.landing.navbar.try_free")}
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <LanguageChanger />
            <ThemeChanger />
          </div>
        </nav>
      </div>
    </header>
  );
};
