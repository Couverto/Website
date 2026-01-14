import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfigContext } from "@/contexts/configContext";

export const Testimonials = () => {
  const { t } = useTranslation();
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"] || "Couverto";
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: t("pages.landing.testimonials.testimonial_1_name"),
      role: t("pages.landing.testimonials.testimonial_1_role"),
      text: t("pages.landing.testimonials.testimonial_1_text", { appName }),
      rating: 5,
    },
    {
      name: t("pages.landing.testimonials.testimonial_2_name"),
      role: t("pages.landing.testimonials.testimonial_2_role"),
      text: t("pages.landing.testimonials.testimonial_2_text", { appName }),
      rating: 5,
    },
    {
      name: t("pages.landing.testimonials.testimonial_3_name"),
      role: t("pages.landing.testimonials.testimonial_3_role"),
      text: t("pages.landing.testimonials.testimonial_3_text", { appName }),
      rating: 5,
    },
    {
      name: t("pages.landing.testimonials.testimonial_4_name"),
      role: t("pages.landing.testimonials.testimonial_4_role"),
      text: t("pages.landing.testimonials.testimonial_4_text", { appName }),
      rating: 4,
    },
  ];

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-20 md:py-28 bg-primary/5">
      <div className="container mx-auto max-w-8xl px-3 md:px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{t("pages.landing.testimonials.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("pages.landing.testimonials.subtitle")}</p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 rounded-full bg-background shadow-lg"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 rounded-full bg-background shadow-lg"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Testimonial Card */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-background rounded-2xl p-8 md:p-10 shadow-lg border border-border text-center">
                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed">"{testimonial.text}"</blockquote>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">{testimonial.name.charAt(0)}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
