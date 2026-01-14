import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

export const FAQ = () => {
  const { t } = useTranslation();

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
    <section className="container py-24 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("pages.home.faq.title")}</h2>
        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {t("pages.home.faq.subtitle")}
        </p>
      </div>
      <div className="mx-auto max-w-3xl mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
