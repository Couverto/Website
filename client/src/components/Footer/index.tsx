import { Link } from "react-router-dom";
import { useConfigContext } from "@/contexts/configContext";
import { Linkedin } from "lucide-react";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor" stroke="none" className={className}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

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
          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg/wfCgbEVM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#5865F2] transition-colors"
            >
              <DiscordIcon className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </a>
            <a
              href="https://www.linkedin.com/company/couverto/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#0077b5] transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
          <p>{"Fait avec soin pour les restaurateurs indépendants 🇫🇷"}</p>
        </div>
      </div>
    </footer>
  );
};
