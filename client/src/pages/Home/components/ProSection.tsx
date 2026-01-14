import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const ProSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 text-center mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">{t("pages.home.pro_section.title")}</h2>
        <p className="mx-auto max-w-[700px] text-primary-foreground/90 text-xl mb-8">{t("pages.home.pro_section.subtitle")}</p>
        <Button size="lg" variant="secondary" className="font-semibold text-lg h-12 px-8" asChild>
          <Link to="/pro">{t("pages.home.pro_section.cta")}</Link>
        </Button>
      </div>
    </section>
  );
};
