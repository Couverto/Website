import { Link } from "react-router-dom";
import { useConfigContext } from "@/contexts/configContext";

export const Footer = () => {
  // const { configValues } = useConfigContext();
  const appName = "Couverto";
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: {
      title: "Produit",
      links: [
        { label: "Fonctionnalités", href: "/pro#features" },
        { label: "Tarifs", href: "/pro#pricing" },
      ],
    },
    company: {
      title: "Entreprise",
      links: [
        { label: "À propos", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    legal: {
      title: "Légal",
      links: [
        { label: "Mentions légales", href: "/legal/mentions-legales" },
        { label: "Politique de confidentialité", href: "/legal/confidentialite" },
        { label: "CGU", href: "/legal/cgu" },
      ],
    },
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-8xl px-3 md:px-4">
        {/* Main Footer */}
        <div className="py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <img src="/logos/logo.svg" alt="Couverto" className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold text-primary font-logo tracking-tight">Couverto</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              La gestion du service, simplement. Un outil conçu pour les restaurateurs indépendants.
            </p>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {currentYear} {appName}. Tous droits réservés.
          </p>
          <p>{"Fait avec soin pour les restaurateurs indépendants 🇫🇷"}</p>
        </div>
      </div>
    </footer>
  );
};
