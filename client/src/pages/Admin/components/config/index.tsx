import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useConfigContext } from "@/contexts/configContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/customs/loading";
import ColorPicker from "@/components/customs/colorPicker";
import { PaletteDesigner } from "./PaletteDesigner";

const configurationFormSchema = z.object({
  APP_NAME: z.string().trim(),
  COLOR_PALETTE: z.string().optional(),
});

type ConfigurationFormValues = z.infer<typeof configurationFormSchema>;

export const Config = () => {
  const { configValues, getConfigValue, updateConfigValues } = useConfigContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { t } = useTranslation();

  const form = useForm<ConfigurationFormValues>({
    resolver: zodResolver(configurationFormSchema),
    defaultValues: configValues,
    mode: "onChange",
  });

  useEffect(() => {
    const fetchConfigValues = async () => {
      const values = await getConfigValue(["APP_NAME", "ACCENT_COLOR", "COLOR_PALETTE"]);
      form.reset(values);
      setIsLoading(false);
    };

    fetchConfigValues();
  }, [getConfigValue, form]);

  const onSubmit = async (values: ConfigurationFormValues) => {
    const keys = Object.keys(values);
    const config = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));

    try {
      const response = await axiosConfig.put("/config", { keys, config });
      updateConfigValues(config);
      form.reset({ ...configValues, ...config });
      toast.success(t(`server.admin.messages.${response.data.message}`));
    } catch (error: any) {
      toast.error(t(error.response.data.error));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="container px-4 mx-auto">
        <Card className="p-6 rounded-lg shadow-lg">
          <CardTitle className="mb-2 text-2xl font-semibold">{t("pages.admin.config_page.title")}</CardTitle>
          <CardDescription className="mb-6">{t("pages.admin.config_page.description")}</CardDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="relative overflow-hidden p-8 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 shadow-sm group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-3xl opacity-50" />

                <FormField
                  control={form.control}
                  name="APP_NAME"
                  render={({ field }) => (
                    <FormItem className="relative z-10 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                              <span className="text-xl">✍️</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter">{t("pages.admin.config_page.app_name")}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
                            {t("pages.admin.config_page.app_name_description")}
                          </p>
                        </div>

                        <FormControl>
                          <Input
                            placeholder={t("pages.admin.config_page.app_name")}
                            {...field}
                            className="h-14 md:w-80 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 text-lg font-bold shadow-inner focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="COLOR_PALETTE"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PaletteDesigner paletteValue={field.value || ""} onPaletteChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">{t("global.buttons.save")}</Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};
