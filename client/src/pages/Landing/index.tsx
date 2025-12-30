import { LandingNavbar } from "./components/LandingNavbar";
import { Hero } from "./components/Hero";
import { ValueProposition } from "./components/ValueProposition";
import { ProductOverview } from "./components/ProductOverview";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { Reassurance } from "./components/Reassurance";
import { LandingFooter } from "./components/LandingFooter";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <Hero />
        <ValueProposition />
        <ProductOverview />
        <Pricing />
        <Testimonials />
        <Reassurance />
      </main>
      <LandingFooter />
    </div>
  );
};
