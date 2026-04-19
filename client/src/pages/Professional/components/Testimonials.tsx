import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfigContext } from "@/contexts/configContext";

export const Testimonials = () => {
  // const { configValues } = useConfigContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Marie Rousseau",
      role: "Le Petit Bistrot, Paris",
      text: "Couverto a radicalement changé ma façon de gérer les services. C'est intuitif et mes clients adorent.",
      rating: 5,
    },
    {
      name: "Jean-Pierre Martin",
      role: "La Table du Chef, Lyon",
      text: "La gestion de l'équipe est un vrai plus. Fini le stress des services désorganisés.",
      rating: 5,
    },
    {
      name: "Sophie Bernard",
      role: "Chez Sophie, Bordeaux",
      text: "Le support est réactif et l'outil évolue constamment. Un indispensable.",
      rating: 5,
    },
    {
      name: "Antoine Lefebvre",
      role: "Le Comptoir, Marseille",
      text: "Simple, efficace et à un prix très abordable. Je recommande sans hésiter.",
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
      <div className="container mx-auto max-w-8xl px-6 md:px-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{"Ce que disent nos clients"}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Des centaines de restaurateurs nous font confiance au quotidien"}
          </p>
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
