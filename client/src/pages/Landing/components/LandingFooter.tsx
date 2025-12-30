import { Link } from "react-router-dom";

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: {
      title: "Produit",
      links: [
        { label: "Fonctionnalités", href: "#features" },
        { label: "Tarifs", href: "#pricing" },
      ],
    },
    company: {
      title: "Entreprise",
      links: [
        { label: "À propos", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    legal: {
      title: "Légal",
      links: [
        { label: "Mentions légales", href: "#" },
        { label: "Politique de confidentialité", href: "#" },
        { label: "CGU", href: "#" },
      ],
    },
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Main Footer */}
        <div className="py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-primary">Couverto</span>
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
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Couverto. Tous droits réservés.</p>
          <p>Fait avec soin pour les restaurateurs indépendants 🇫🇷</p>
        </div>
      </div>
    </footer>
  );
};
