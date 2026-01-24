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
import { getCreatePlanSchema, getDeletePlanSchema, getUpdatePlanSchema } from "@/lib/zod/schemas/admin/zod";
import { PlanFormProps } from "@/interfaces/Components";

export const PlanForm = ({ dialog, refresh, action, plan }: PlanFormProps) => {
  const [loading, setLoading] = useState(false);

  const createSchema = getCreatePlanSchema();
  const updateSchema = getUpdatePlanSchema();
  const deleteSchema = getDeletePlanSchema();

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      features: "",
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
      toast.success(response.data.message || "Plan créé");
      dialog(false);
      refresh();
      createForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
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
      toast.success(response.data.message || "Plan mis à jour");
      dialog(false);
      refresh();
      updateForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteSubmit: SubmitHandler<z.infer<typeof deleteSchema>> = async (values) => {
    if (values.confirmDelete.toUpperCase() === "DELETE") {
      try {
        setLoading(true);
        const response = await axiosConfig.delete(`/plans/${plan?._id}`);
        toast.success(response.data.message || "Plan supprimé");
        dialog(false);
        refresh();
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Le texte de confirmation est incorrect");
    }
  };

  const renderFormFields = (form: any) => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{"Nom"}</FormLabel>
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
            <FormLabel>{"Description"}</FormLabel>
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
              <FormLabel>{"Prix"}</FormLabel>
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
              <FormLabel>{"Position"}</FormLabel>
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
            <FormLabel>{"Fonctionnalités (séparées par des virgules)"}</FormLabel>
            <FormControl>
              <Textarea placeholder="Feature 1, Feature 2" {...field} />
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
              <FormLabel>{"Actif"}</FormLabel>
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
            {"Enregistrer"}
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
            {"Mettre à jour"}
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
                <FormLabel>{'Tapez "DELETE" pour confirmer'}</FormLabel>
                <FormControl>
                  <Input placeholder={"DELETE"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="destructive" disabled={loading}>
            {"Supprimer"}
          </Button>
        </form>
      </Form>
    );
  }

  return null;
};
