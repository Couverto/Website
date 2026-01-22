import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plan } from "@/interfaces/Plan";
import { useTranslation } from "react-i18next";
import { getCreatePlanSchema, getDeletePlanSchema, getUpdatePlanSchema } from "@/lib/zod/schemas/admin/zod";
import { PlanFormProps } from "@/interfaces/Components";

export const PlanForm = ({ dialog, refresh, action, plan }: PlanFormProps) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const createSchema = getCreatePlanSchema(t);
  const updateSchema = getUpdatePlanSchema(t);
  const deleteSchema = getDeletePlanSchema(t);

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      features: "",
      stripePriceId: "",
      active: true,
      position: 0,
    },
  });

  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: plan?.name,
      description: plan?.description || "",
      price: plan?.price,
      features: plan?.features.join(", "),
      stripePriceId: plan?.stripePriceId || "",
      active: plan?.active,
      position: plan?.position,
    },
  });

  const deleteForm = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      confirmDelete: "",
    },
  });

  const onCreateSubmit: SubmitHandler<z.infer<typeof createSchema>> = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        features: values.features
          ? values.features
              .split(",")
              .map((f) => f.trim())
              .filter((f) => f !== "")
          : [],
      };

      const response = await axiosConfig.post("/plans", payload);
      toast.success(t(response.data.message));
      dialog(false);
      refresh();
      createForm.reset();
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "server.global.errors.unknown"));
    } finally {
      setLoading(false);
    }
  };

  const onUpdateSubmit: SubmitHandler<z.infer<typeof updateSchema>> = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        features: values.features
          ? values.features
              .split(",")
              .map((f) => f.trim())
              .filter((f) => f !== "")
          : [],
      };

      const response = await axiosConfig.put(`/plans/${plan?._id}`, payload);
      toast.success(t(response.data.message));
      dialog(false);
      refresh();
      updateForm.reset();
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "server.global.errors.unknown"));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteSubmit: SubmitHandler<z.infer<typeof deleteSchema>> = async (values) => {
    if (values.confirmDelete.toUpperCase() === "DELETE") {
      try {
        setLoading(true);
        const response = await axiosConfig.delete(`/plans/${plan?._id}`);
        toast.success(t(response.data.message));
        dialog(false);
        refresh();
      } catch (error: any) {
        toast.error(t(error.response?.data?.error || "server.global.errors.unknown"));
      } finally {
        setLoading(false);
      }
    } else {
      toast.error(t("pages.admin.plans_page.form.errors.confirm_text_invalid"));
    }
  };

  const renderFormFields = (form: any) => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pages.admin.plans_page.form.name")}</FormLabel>
            <FormControl>
              <Input placeholder="Essential" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pages.admin.plans_page.form.description")}</FormLabel>
            <FormControl>
              <Textarea placeholder="" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.plans_page.form.price")}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.plans_page.form.position")}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="features"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pages.admin.plans_page.form.features")}</FormLabel>
            <FormControl>
              <Textarea placeholder="Feature 1, Feature 2" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="stripePriceId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pages.admin.plans_page.form.stripePriceId")}</FormLabel>
            <FormControl>
              <Input placeholder="price_..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{t("pages.admin.plans_page.form.active")}</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </>
  );

  if (action === "create") {
    return (
      <Form {...createForm}>
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          {renderFormFields(createForm)}
          <Button type="submit" disabled={loading} className="w-full">
            {t("pages.admin.plans_page.form.save")}
          </Button>
        </form>
      </Form>
    );
  }

  if (action === "update") {
    return (
      <Form {...updateForm}>
        <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
          {renderFormFields(updateForm)}
          <Button type="submit" disabled={loading} className="w-full">
            {t("pages.admin.plans_page.form.update")}
          </Button>
        </form>
      </Form>
    );
  }

  if (action === "delete") {
    return (
      <Form {...deleteForm}>
        <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-8">
          <FormField
            control={deleteForm.control}
            name="confirmDelete"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pages.admin.plans_page.form.confirm_delete_label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("pages.admin.plans_page.form.confirm_delete_placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="destructive" disabled={loading}>
            {t("pages.admin.plans_page.form.delete")}
          </Button>
        </form>
      </Form>
    );
  }

  return null;
};
