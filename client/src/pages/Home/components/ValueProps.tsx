import { CalendarCheck, Clock, ShieldCheck, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ValueProps = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      titleKey: "pages.home.features.realtime.title",
      descKey: "pages.home.features.realtime.desc",
    },
    {
      icon: <CalendarCheck className="h-10 w-10 text-primary" />,
      titleKey: "pages.home.features.booking.title",
      descKey: "pages.home.features.booking.desc",
    },
    {
      icon: <Smartphone className="h-10 w-10 text-primary" />,
      titleKey: "pages.home.features.mobile.title",
      descKey: "pages.home.features.mobile.desc",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      titleKey: "pages.home.features.secure.title",
      descKey: "pages.home.features.secure.desc",
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pages.home.value_props.title")}</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">{t("pages.home.value_props.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center space-y-5 p-8 bg-background rounded-2xl shadow-sm border border-transparent hover:border-primary/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {/* Clone the element to enforce color transition if needed, though pure CSS usually works best */}
                <div className="[&>svg]:h-8 [&>svg]:w-8 [&>svg]:transition-colors">{feature.icon}</div>
              </div>
              <h3 className="font-bold text-xl">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
