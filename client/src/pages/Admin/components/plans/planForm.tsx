import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plan } from "@/interfaces/Plan";
import { Feature } from "@/interfaces/Feature";
import { getCreatePlanSchema, getDeletePlanSchema, getUpdatePlanSchema } from "@/lib/zod/schemas/admin/zod";
import { PlanFormProps } from "@/interfaces/Components";
import { Badge } from "@/components/ui/badge";

export const PlanForm = ({ dialog, refresh, action, plan }: PlanFormProps) => {
  const [loading, setLoading] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);

  const createSchema = getCreatePlanSchema();
  const updateSchema = getUpdatePlanSchema();
  const deleteSchema = getDeletePlanSchema();

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await axiosConfig.get("/features");
        setAvailableFeatures(response.data.features || []);
      } catch (error) {
        console.error("Error fetching features", error);
      }
    };
    fetchFeatures();
  }, []);

  const createForm = useForm<any>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      features: [],
      active: true,
      position: 0,
    },
  });

  const updateForm = useForm<any>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: plan?.name,
      description: plan?.description || "",
      price: plan?.price,
      features: plan?.features?.map((f) => f._id) || [],
      active: plan?.active,
      position: plan?.position,
    },
  });

  const deleteForm = useForm<any>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      confirmDelete: "",
    },
  });

  const onCreateSubmit: SubmitHandler<any> = async (values) => {
    try {
      setLoading(true);
      const response = await axiosConfig.post("/plans", values);
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

  const onUpdateSubmit: SubmitHandler<any> = async (values) => {
    try {
      setLoading(true);
      const response = await axiosConfig.put(`/plans/${plan?._id}`, values);
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

  const onDeleteSubmit: SubmitHandler<any> = async (values) => {
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
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">{"Fonctionnalités"}</FormLabel>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4 max-h-[200px] overflow-y-auto">
              {availableFeatures?.map((feature) => (
                <FormField
                  key={feature._id}
                  control={form.control}
                  name="features"
                  render={({ field }) => {
                    return (
                      <FormItem key={feature._id} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(feature._id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, feature._id])
                                : field.onChange(field.value?.filter((value: string) => value !== feature._id));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{feature.name}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              {availableFeatures.length === 0 && <p className="text-sm text-muted-foreground italic">{"Aucune fonctionnalité définie"}</p>}
            </div>
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
