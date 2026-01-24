import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { UserInterface } from "@/interfaces/User";
import { getCreateUserSchema, getDeleteUserSchema, getUpdateUserSchema } from "@/lib/zod/schemas/admin/zod";
import { UserFormProps } from "@/interfaces/Components";

export const UserForm = ({ dialog, refresh, action, user }: UserFormProps) => {
  const [loading, setLoading] = useState(false);

  const createUserSchema = getCreateUserSchema();
  const updateUserSchema = getUpdateUserSchema();
  const deleteUserchema = getDeleteUserSchema();

  const createForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      forename: "",
      username: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const updateForm = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name,
      forename: user?.forename,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      password: user?.password ?? "",
    },
  });

  const deleteForm = useForm<z.infer<typeof deleteUserchema>>({
    resolver: zodResolver(deleteUserchema),
    defaultValues: {
      confirmDelete: "",
    },
  });

  const onCreateSubmit: SubmitHandler<z.infer<typeof createUserSchema>> = async (values) => {
    try {
      setLoading(true);
      const response = await axiosConfig.post("/users", values);
      toast.success(response.data.message || "Utilisateur créé avec succès");
      dialog(false);
      refresh();
      createForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateSubmit: SubmitHandler<z.infer<typeof updateUserSchema>> = async (values) => {
    try {
      setLoading(true);
      const response = await axiosConfig.put(`/users/${user?._id}`, values);
      toast.success(response.data.message || "Utilisateur mis à jour");
      dialog(false);
      refresh();
      updateForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteSubmit: SubmitHandler<z.infer<typeof deleteUserchema>> = async (values) => {
    if (values.confirmDelete.toLowerCase() === "delete") {
      try {
        setLoading(true);
        const response = await axiosConfig.delete(`/users/${user?._id}`);
        toast.success(response.data.message || "Utilisateur supprimé");
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

  const getRandomPassword = async () => {
    try {
      setLoading(true);
      const response = await axiosConfig.get(`/users/utils/generatePassword`);
      toast.success(response.data.message || "Mot de passe généré");
      if (action === "update") updateForm.setValue("password", response.data.password);
      if (action === "create") createForm.setValue("password", response.data.password);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const copyGeneratedPassword = () => {
    const password = action === "update" ? updateForm.getValues("password") : createForm.getValues("password");

    if (!password) {
      toast.error("Aucun mot de passe généré pour le moment");
      return;
    }

    navigator.clipboard.writeText(password ?? "");
    toast.success("Mot de passe copié dans le presse-papiers");
  };

  if (action === "create") {
    return (
      <Form {...createForm}>
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-8">
          <div className="flex items-center justify-center gap-6">
            <FormField
              control={createForm.control}
              name="forename"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{"Prénom"}</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{"Nom"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={createForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Nom d'utilisateur"}</FormLabel>
                <FormControl>
                  <Input placeholder="john_doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"E-mail"}</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Rôle"}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={"Sélectionnez un rôle pour le nouvel utilisateur"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{"Utilisateur"}</SelectItem>
                      <SelectItem value="admin">{"Administrateur"}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{"Mot de passe"}</FormLabel>
                <FormControl>
                  <div className="flex items-end justify-end w-full gap-4">
                    <Input type="password" placeholder="************" {...field} disabled />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={copyGeneratedPassword}
                        disabled={loading}
                        aria-label={"Copier le mot de passe"}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="outline" onClick={getRandomPassword} disabled={loading}>
                        {"Générer"}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading}>
            {"Enregistrer"}
          </Button>
        </form>
      </Form>
    );
  }

  if (action === "update") {
    return (
      <Form {...updateForm}>
        <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-8">
          <div className="flex items-center justify-center gap-6">
            <FormField
              control={updateForm.control}
              name="forename"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{"Prénom"}</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{"Nom"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={updateForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Nom d'utilisateur"}</FormLabel>
                <FormControl>
                  <Input placeholder="john_doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={updateForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"E-mail"}</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={updateForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Rôle"}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={"Sélectionnez un rôle pour le nouvel utilisateur"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{"Utilisateur"}</SelectItem>
                      <SelectItem value="admin">{"Administrateur"}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-end w-full gap-4">
            <FormField
              control={updateForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{"Mot de passe"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="************" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={copyGeneratedPassword}
                disabled={loading}
                aria-label={"Copier le mot de passe"}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={getRandomPassword} disabled={loading} type="button">
                {"Générer"}
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
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
