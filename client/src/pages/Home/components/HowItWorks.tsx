import { Search, CalendarDays, PartyPopper } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      titleKey: "pages.home.how_it_works.step_1_title",
      descKey: "pages.home.how_it_works.step_1_desc",
    },
    {
      icon: <CalendarDays className="h-10 w-10 text-primary" />,
      titleKey: "pages.home.how_it_works.step_2_title",
      descKey: "pages.home.how_it_works.step_2_desc",
    },
    {
      icon: <PartyPopper className="h-10 w-10 text-primary" />,
      titleKey: "pages.home.how_it_works.step_3_title",
      descKey: "pages.home.how_it_works.step_3_desc",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pages.home.how_it_works.title")}</h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">{t("pages.home.how_it_works.subtitle")}</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4 bg-background p-4">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-4 border-background shadow-sm mb-4">
                {step.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-2xl font-bold">{t(step.titleKey)}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
