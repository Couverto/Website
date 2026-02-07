import { Hero } from "./components/Hero";
import { ValueProposition } from "./components/ValueProposition";
import { ProductOverview } from "./components/ProductOverview";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { Reassurance } from "./components/Reassurance";

import { SEO } from "@/components/SEO";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Couverto Pro - Solution de gestion pour restaurateurs"
        description="Découvrez Couverto Pro, la solution complète pour gérer vos réservations, votre plan de salle et fidéliser vos clients."
        url="/pro"
      />
      <main>
        <Hero />
        <ValueProposition />
        <ProductOverview />
        <Pricing />
        <Testimonials />
        <Reassurance />
      </main>
    </div>
  );
};
