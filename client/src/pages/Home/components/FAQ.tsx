import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import { useConfigContext } from "@/contexts/configContext";
import { HelpCircle } from "lucide-react";

export const FAQ = () => {
  const { t } = useTranslation();
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"];

  const faqs = [
    {
      question: t("pages.home.faq.q1"),
      answer: t("pages.home.faq.a1"),
    },
    {
      question: t("pages.home.faq.q2"),
      answer: t("pages.home.faq.a2"),
    },
    {
      question: t("pages.home.faq.q3"),
      answer: t("pages.home.faq.a3"),
    },
    {
      question: t("pages.home.faq.q4"),
      answer: t("pages.home.faq.a4"),
    },
    // Adding dummy questions to fill space if needed, or stick to provided ones but style them better
  ];

  return (
    <section className="bg-muted/30 py-24 md:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
          {/* Left Header Side */}
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pages.home.faq.title")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t("pages.home.faq.subtitle", { appName })}</p>
            <div className="p-6 bg-background rounded-2xl border shadow-sm">
              <p className="font-semibold mb-2">Vous ne trouvez pas votre réponse ?</p>
              <p className="text-sm text-muted-foreground mb-4">Notre équipe de support est là pour vous aider 24/7.</p>
              <button className="text-primary font-bold text-sm hover:underline">Contacter le support &rarr;</button>
            </div>
          </div>

          {/* Right Accordion Side */}
          <div className="lg:col-span-2 space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-background border rounded-2xl px-6 data-[state=open]:shadow-md transition-all duration-200"
                >
                  <AccordionTrigger className="text-left text-lg font-bold py-6 hover:no-underline hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};
