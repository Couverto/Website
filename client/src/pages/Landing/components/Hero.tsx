import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, LayoutGrid, Users, Utensils, Clock, Star, ChefHat } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

        {/* Decorative shapes */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-40 right-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-40 right-1/3 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

        {/* Floating icons - decorative */}
        <div className="absolute top-32 left-[15%] text-primary/10 animate-pulse">
          <Utensils className="h-12 w-12" />
        </div>
        <div className="absolute top-48 right-[20%] text-primary/10 animate-pulse" style={{ animationDelay: "0.5s" }}>
          <Calendar className="h-10 w-10" />
        </div>
        <div className="absolute bottom-32 left-[10%] text-accent/10 animate-pulse" style={{ animationDelay: "1s" }}>
          <Clock className="h-14 w-14" />
        </div>
        <div className="absolute bottom-48 right-[15%] text-primary/10 animate-pulse" style={{ animationDelay: "1.5s" }}>
          <Star className="h-8 w-8" />
        </div>
        <div className="absolute top-1/2 left-[5%] text-accent/10 animate-pulse" style={{ animationDelay: "0.75s" }}>
          <ChefHat className="h-10 w-10" />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-6xl px-3 md:px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t("pages.landing.hero.badge")}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("pages.landing.hero.headline")} <span className="text-primary">{t("pages.landing.hero.headline_highlight")}</span>
            </h1>

            {/* Slogan */}
            <p className="text-lg text-muted-foreground md:text-xl max-w-xl">{t("pages.landing.hero.slogan")}</p>

            {/* Description */}
            <p className="text-muted-foreground max-w-xl">{t("pages.landing.hero.description")}</p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 w-full sm:w-auto">
                  {t("pages.landing.hero.cta_primary")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("pages.landing.hero.cta_secondary")}
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t("pages.landing.hero.trust_no_commitment")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t("pages.landing.hero.trust_quick_setup")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t("pages.landing.hero.trust_support")}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative lg:pl-8">
            <div className="relative rounded-xl border border-border bg-card p-2 shadow-2xl">
              {/* Mock Dashboard */}
              <div className="rounded-lg bg-background overflow-hidden">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">C</span>
                    </div>
                    <span className="font-semibold text-foreground">{t("pages.landing.dashboard_preview.title")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-card border border-border p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{t("pages.landing.dashboard_preview.reservations")}</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">12</div>
                      <div className="text-xs text-accent">{t("pages.landing.dashboard_preview.tonight")}</div>
                    </div>
                    <div className="rounded-lg bg-card border border-border p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <LayoutGrid className="h-3 w-3" />
                        <span>{t("pages.landing.dashboard_preview.tables")}</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">14/18</div>
                      <div className="text-xs text-muted-foreground">{t("pages.landing.dashboard_preview.occupied")}</div>
                    </div>
                    <div className="rounded-lg bg-card border border-border p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Users className="h-3 w-3" />
                        <span>{t("pages.landing.dashboard_preview.covers")}</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">38</div>
                      <div className="text-xs text-muted-foreground">{t("pages.landing.dashboard_preview.estimated")}</div>
                    </div>
                  </div>

                  {/* Reservations List */}
                  <div className="rounded-lg bg-card border border-border p-3">
                    <div className="text-sm font-medium text-foreground mb-3">{t("pages.landing.dashboard_preview.upcoming")}</div>
                    <div className="space-y-2">
                      {[
                        { name: "Dupont", time: "19:00", covers: 4, table: "T3" },
                        { name: "Martin", time: "19:30", covers: 2, table: "T7" },
                        { name: "Bernard", time: "20:00", covers: 6, table: "T12" },
                      ].map((reservation, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                              {reservation.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">{reservation.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {reservation.covers} {t("pages.landing.dashboard_preview.covers_count")}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-foreground">{reservation.time}</div>
                            <div className="text-xs text-muted-foreground">{reservation.table}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
        <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <div className="h-2 w-1 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
};
