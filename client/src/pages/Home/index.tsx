import { Hero } from "./components/Hero";

import { ProSection } from "./components/ProSection";
import { RestaurantList } from "./components/RestaurantList";
import { ValueProps } from "./components/ValueProps";
import { FAQ } from "./components/FAQ";

export const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <Hero />
        <RestaurantList />
        <ValueProps />
        <FAQ />
        <ProSection />
      </main>
    </div>
  );
};
