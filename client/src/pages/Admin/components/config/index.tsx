import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useConfigContext } from "@/contexts/configContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/customs/loading";
import { PaletteDesigner } from "./PaletteDesigner";
import { Separator } from "@/components/ui/separator";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("pages.admin.config_page.title")}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Général</CardTitle>
          <CardDescription>{t("pages.admin.config_page.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="APP_NAME"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("pages.admin.config_page.app_name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Couverto" {...field} />
                      </FormControl>
                      <FormDescription>{t("pages.admin.config_page.app_name_description")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Apparence</h3>
                  <p className="text-sm text-muted-foreground">Personnalisez les couleurs de l'application.</p>
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
              </div>

              <div className="flex justify-end">
                <Button type="submit">{t("global.buttons.save")}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
