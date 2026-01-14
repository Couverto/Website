import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import { useConfigContext } from "@/contexts/configContext";

export const FAQ = () => {
  const { t } = useTranslation();
  const { configValues } = useConfigContext();
  const appName = configValues["APP_NAME"] || "Couverto";

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
  ];

  return (
    <section className="bg-muted/10 py-24">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pages.home.faq.title")}</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {t("pages.home.faq.subtitle", { appName })}
          </p>
        </div>
        <div className="mx-auto max-w-4xl bg-background rounded-xl shadow-sm border p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-secondary/20">
                <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
