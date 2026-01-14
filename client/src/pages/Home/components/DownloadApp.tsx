import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Smartphone } from "lucide-react";

export const DownloadApp = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white">
              {t("pages.home.download_app.title")}
            </h2>
            <p className="max-w-[600px] mx-auto lg:mx-0 text-white/80 text-xl leading-relaxed">{t("pages.home.download_app.subtitle")}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="secondary"
                size="lg"
                className="h-16 px-8 rounded-xl gap-3 text-lg font-bold shadow-lg hover:scale-105 transition-transform"
              >
                {/* Simple SVG icon placeholders for store logos, could be real SVGs */}
                <Smartphone className="h-6 w-6" />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-xs font-medium uppercase opacity-80">{t("pages.home.download_app.download_on")}</span>
                  <span className="text-base leading-none">{t("pages.home.download_app.ios")}</span>
                </div>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="h-16 px-8 rounded-xl gap-3 text-lg font-bold shadow-lg hover:scale-105 transition-transform"
              >
                <Smartphone className="h-6 w-6" />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-xs font-medium uppercase opacity-80">{t("pages.home.download_app.get_on")}</span>
                  <span className="text-base leading-none">{t("pages.home.download_app.android")}</span>
                </div>
              </Button>
            </div>
          </div>

          <div className="flex-1 relative flex justify-center lg:justify-end">
            {/* Abstract phone mockup using CSS/HTML */}
            <div className="relative w-[300px] h-[600px] bg-white rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-8 border-gray-900 overflow-hidden z-10 rotate-[-5deg]">
              <div className="absolute top-0 inset-x-0 h-8 bg-gray-900 rounded-b-xl z-20 w-40 mx-auto"></div>
              <div className="h-full w-full bg-slate-100 flex flex-col pt-12">
                {/* Mock UI content */}
                <div className="px-4 space-y-4">
                  <div className="h-40 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <div className="h-24 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-24 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-24 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-24 rounded-lg bg-slate-200 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements behind */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-2xl z-0" />
          </div>
        </div>
      </div>
    </section>
  );
};
