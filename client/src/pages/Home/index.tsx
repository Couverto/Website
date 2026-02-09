import { Hero } from "./components/Hero";
import { RestaurantList } from "./components/RestaurantList";
import { ValueProps } from "./components/ValueProps";
import { FAQ } from "./components/FAQ";
import { DownloadApp } from "./components/DownloadApp";
import { CallToAction } from "./components/CallToAction";

import { SEO } from "@/components/SEO";

export const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO />
      <main className="flex-1">
        <Hero />
        <RestaurantList isPreview={true} />
        <ValueProps />
        <DownloadApp />
        <FAQ />
        <CallToAction />
      </main>
    </div>
  );
};
