import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Feature } from "@/interfaces/Feature";
import { getCreateFeatureSchema, getDeleteFeatureSchema, getUpdateFeatureSchema } from "@/lib/zod/schemas/admin/zod";

const AVAILABLE_PAGES = [
  { value: "dashboard", label: "Tableau de bord" },
  { value: "bookings", label: "Réservations" },
  { value: "clients", label: "Clients" },
  { value: "tablePlan", label: "Plan de salle" },
  { value: "collaborators", label: "Équipe" },
  { value: "reviews", label: "Avis" },
  { value: "gallery", label: "Galerie" },
  { value: "stats", label: "Statistiques" },
  { value: "plan", label: "Abonnement" },
  { value: "referral", label: "Parrainage" },
  { value: "settings", label: "Paramètres" },
  { value: "bankImprint", label: "Empreinte Bancaire" },
];

interface FeatureFormProps {
  dialog: (open: boolean) => void;
  refresh: () => void;
  action: string;
  feature?: Feature;
}

export const FeatureForm = ({ dialog, refresh, action, feature }: FeatureFormProps) => {
  const [loading, setLoading] = useState(false);
  const [takenPages, setTakenPages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (action === "create" || action === "update") {
      const fetchFeatures = async () => {
        try {
          const response = await axiosConfig.get("/features");
          const featuresData: Feature[] = response.data.features;
          const taken: Record<string, string> = {};
          featuresData.forEach((f) => {
            if (feature?._id && f._id === feature._id) return;
            if (f.associatedPages) {
              f.associatedPages.forEach((p) => {
                taken[p] = f.name;
              });
            }
          });
          setTakenPages(taken);
        } catch (error) {
          console.error("Failed to fetch features for validation", error);
        }
      };
      fetchFeatures();
    }
  }, [action, feature?._id]);

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
      associatedPages: [],
    },
  });

  const updateForm = useForm<any>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: feature?.name,
      description: feature?.description || "",
      active: feature?.active,
      position: feature?.position,
      associatedPages: feature?.associatedPages || [],
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
      const payload = { ...values, associatedPages: values.associatedPages || [] };
      const response = await axiosConfig.post("/features", payload);
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
      const payload = { ...values, associatedPages: values.associatedPages || [] };
      const response = await axiosConfig.put(`/features/${feature?._id}`, payload);
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
      <FormField
        control={form.control}
        name="associatedPages"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Mettre à disposition les pages suivantes (Optionnel)</FormLabel>
            </div>
            {AVAILABLE_PAGES.map((item) => (
              <FormField
                key={item.value}
                control={form.control}
                name="associatedPages"
                render={({ field }) => {
                  return (
                    <FormItem key={item.value} className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item.value)}
                          disabled={!!takenPages[item.value]}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), item.value])
                              : field.onChange(field.value?.filter((value: string) => value !== item.value));
                          }}
                        />
                      </FormControl>
                      <FormLabel className={`font-normal ${takenPages[item.value] ? "text-muted-foreground" : ""}`}>
                        {item.label}
                        {takenPages[item.value] && <span className="text-xs italic ml-2">(Déjà utilisé par {takenPages[item.value]})</span>}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
            <FormMessage />
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
