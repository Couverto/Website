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
import { Feature } from "@/interfaces/Feature";
import { getCreateFeatureSchema, getDeleteFeatureSchema, getUpdateFeatureSchema } from "@/lib/zod/schemas/admin/zod";

interface FeatureFormProps {
  dialog: (open: boolean) => void;
  refresh: () => void;
  action: string;
  feature?: Feature;
}

export const FeatureForm = ({ dialog, refresh, action, feature }: FeatureFormProps) => {
  const [loading, setLoading] = useState(false);

  const createSchema = getCreateFeatureSchema();
  const updateSchema = getUpdateFeatureSchema();
  const deleteSchema = getDeleteFeatureSchema();

  const createForm = useForm<any>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
      position: 0,
    },
  });

  const updateForm = useForm<any>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: feature?.name,
      description: feature?.description || "",
      active: feature?.active,
      position: feature?.position,
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
      const response = await axiosConfig.post("/features", values);
      toast.success(response.data.message || "Fonctionnalité créée");
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
      const response = await axiosConfig.put(`/features/${feature?._id}`, values);
      toast.success(response.data.message || "Fonctionnalité mise à jour");
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
        const response = await axiosConfig.delete(`/features/${feature?._id}`);
        toast.success(response.data.message || "Fonctionnalité supprimée");
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
              <Input placeholder="Gestion des réservations" {...field} />
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
      <FormField
        control={form.control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{"Position"}</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
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
