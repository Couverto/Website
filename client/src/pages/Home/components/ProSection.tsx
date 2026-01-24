import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ProSection = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 text-center mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">{"Vous êtes restaurateur ?"}</h2>
        <p className="mx-auto max-w-[700px] text-primary-foreground/90 text-xl mb-8">
          {"Découvrez notre solution complète pour gérer vos réservations et attirer plus de clients."}
        </p>
        <Button size="lg" variant="secondary" className="font-semibold text-lg h-12 px-8" asChild>
          <Link to="/pro">{"Découvrir la solution Pro"}</Link>
        </Button>
      </div>
    </section>
  );
};
