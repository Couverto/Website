import { Hero } from "./components/Hero";
import { RestaurantList } from "./components/RestaurantList";
import { ValueProps } from "./components/ValueProps";
import { FAQ } from "./components/FAQ";
import { DownloadApp } from "./components/DownloadApp";
import { CallToAction } from "./components/CallToAction";

export const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
