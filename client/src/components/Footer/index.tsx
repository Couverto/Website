import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConfigContext } from "@/contexts/configContext";

export const Footer = () => {
  const { t } = useTranslation();
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"] || "Couverto";
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: {
      title: t("pages.landing.footer.product"),
      links: [
        { label: t("pages.landing.footer.features"), href: "#features" },
        { label: t("pages.landing.footer.pricing"), href: "#pricing" },
      ],
    },
    company: {
      title: t("pages.landing.footer.company"),
      links: [
        { label: t("pages.landing.footer.about"), href: "/about" },
        { label: t("pages.landing.footer.contact"), href: "/contact" },
      ],
    },
    legal: {
      title: t("pages.landing.footer.legal"),
      links: [
        { label: t("pages.landing.footer.legal_notice"), href: "#" },
        { label: t("pages.landing.footer.privacy"), href: "#" },
        { label: t("pages.landing.footer.terms"), href: "#" },
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
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-primary">{appName}</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">{t("pages.landing.footer.slogan", { appName })}</p>
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
            © {currentYear} {t("pages.landing.footer.copyright", { appName })}
          </p>
          <p>{t("pages.landing.footer.made_with_love")}</p>
        </div>
      </div>
    </footer>
  );
};
