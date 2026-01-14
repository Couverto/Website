import { Hero } from "./components/Hero";
import { ValueProposition } from "./components/ValueProposition";
import { ProductOverview } from "./components/ProductOverview";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { Reassurance } from "./components/Reassurance";
import { LandingFooter } from "./components";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
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
