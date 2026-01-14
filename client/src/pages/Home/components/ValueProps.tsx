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
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t("pages.home.value_props.title")}</h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground mt-4">{t("pages.home.value_props.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-xl shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-full">{feature.icon}</div>
              <h3 className="font-bold text-xl">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
