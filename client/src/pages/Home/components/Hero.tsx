import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative h-[500px] flex items-center justify-center bg-muted/20 overflow-hidden">
      {/* Background Image Placeholder - would normally use a real image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40" />

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl text-foreground">{t("pages.home.hero.title")}</h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">{t("pages.home.hero.subtitle")}</p>
        </div>

        <div className="w-full max-w-4xl bg-background rounded-lg shadow-xl p-2 md:p-4 flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input className="pl-10" placeholder={t("pages.home.search.location_placeholder")} />
          </div>

          <div className="flex-1 relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input type="date" className="pl-10" />
          </div>

          <div className="w-full md:w-[180px]">
            <Select defaultValue="2">
              <SelectTrigger className="w-full">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("pages.home.search.guests")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 {t("pages.home.search.person")}</SelectItem>
                <SelectItem value="2">2 {t("pages.home.search.people")}</SelectItem>
                <SelectItem value="3">3 {t("pages.home.search.people")}</SelectItem>
                <SelectItem value="4">4 {t("pages.home.search.people")}</SelectItem>
                <SelectItem value="5">5 {t("pages.home.search.people")}</SelectItem>
                <SelectItem value="6">6+ {t("pages.home.search.people")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button size="lg" className="w-full md:w-auto font-semibold">
            {t("pages.home.search.button")}
          </Button>
        </div>
      </div>
    </section>
  );
};
