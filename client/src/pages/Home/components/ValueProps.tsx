import { Clock, ShieldCheck, Smartphone, Search, CalendarDays, PartyPopper, Users, Star } from "lucide-react";
import { useConfigContext } from "@/contexts/configContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  delay?: number;
}

const FeatureCard = ({ title, description, icon, className, delay = 0 }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "group relative overflow-hidden rounded-3xl border bg-background/50 p-8 shadow-sm transition-all hover:bg-background hover:shadow-xl",
      className,
    )}
  >
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="mb-3 text-xl font-bold tracking-tight">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>

    {/* Decorative background gradient */}
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
  </motion.div>
);

export const ValueProps = () => {
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"];
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      <div className="absolute -left-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      <div className="absolute -right-[10%] bottom-[20%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="container px-4 md:px-6 mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-8 mb-24 max-w-4xl mx-auto">
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 text-primary rounded-full text-balance text-center h-auto whitespace-normal"
          >
            {"La plateforme de réservation pensée pour vous simplifier la vie."}
          </Badge>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Simplifiez vos réservations avec {appName}
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Une suite complète d'outils pour simplifier votre expérience de réservation.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 lg:mb-32">
          {/* Card 1: Real-time (Large Left) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 row-span-2 rounded-3xl border bg-gradient-to-br from-background to-muted/30 p-8 md:p-12 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10 max-w-lg">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">{"Confirmation immédiate"}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {"Fini l'attente au téléphone, votre table est bloquée instantanément."}
                <br className="hidden md:block" /> Plus d'attente, confirmation immédiate.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground"
                    >
                      <Users className="h-4 w-4" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">+2000 réservations ce mois</span>
              </div>
            </div>
            {/* Decorative Image/Pattern equivalent */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent hidden md:block" />
          </motion.div>

          {/* Card 2: Secure (Top Right) */}
          <FeatureCard
            title={"100% Gratuit"}
            description={"Pas de frais de réservation, payez directement au restaurant."}
            icon={<ShieldCheck className="h-6 w-6" />}
            delay={0.2}
            className="bg-orange-500/5 hover:bg-orange-500/10 border-orange-200/20"
          />

          {/* Card 3: Mobile (Bottom Right) */}
          <FeatureCard
            title={"Accessible partout"}
            description={"Réservez depuis votre mobile, où que vous soyez."}
            icon={<Smartphone className="h-6 w-6" />}
            delay={0.3}
            className="bg-purple-500/5 hover:bg-purple-500/10 border-purple-200/20"
          />
        </div>

        {/* Unified "How It Works" Section with Stats */}
        <div className="rounded-[2.5rem] bg-foreground text-background p-6 md:p-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-5" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl md:text-4xl font-bold">Comment ça marche ?</h3>
              <div className="space-y-8">
                {[
                  { icon: Search, title: "Trouver", desc: "Cherchez par lieu, date ou cuisine pour trouver le restaurant parfait." },
                  { icon: CalendarDays, title: "Réserver", desc: "Choisissez votre heure et confirmez votre réservation instantanément." },
                  { icon: PartyPopper, title: "Profiter", desc: "Recevez votre confirmation et profitez de votre repas !" },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-lg font-bold group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{step.title}</h4>
                      <p className="text-white/60 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Visual/Stats */}
            <div className="relative h-full min-h-[400px] rounded-3xl bg-white/5 border border-white/10 p-6 md:p-12 flex flex-col justify-between backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                </div>
                <blockquote className="text-xl md:text-2xl font-medium leading-relaxed">
                  "L'expérience de réservation la plus fluide que j'ai jamais eue. Simplement génial."
                </blockquote>
                <div className="pt-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src="/images/reviews/sophie_martin.png" alt="Sophie Martin" className="object-cover" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold">Sophie Martin</div>
                    <div className="text-sm text-white/50">Food Blogger</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center text-center sm:text-left">
                <div>
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-white/50">Satisfaction client</div>
                </div>
                <Button
                  className="w-full sm:w-auto rounded-full bg-white text-black hover:bg-white/90 font-bold px-8"
                  onClick={() => navigate("/restaurants")}
                >
                  Réserver maintenant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
