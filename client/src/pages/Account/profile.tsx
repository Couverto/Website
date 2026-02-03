import { Loading } from "@/components/customs/loading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { getUpdateAccountSchema } from "@/lib/zod/schemas/account/zod";
import { useState } from "react";
import { toast } from "sonner";
import { axiosConfig } from "@/config/axiosConfig";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { InputFile } from "@/components/customs/inputFile";
import { UpdatePasswordForm } from "./components/updatePasswordForm";
import { Dialog } from "@radix-ui/react-dialog";
import { EllipsisVertical, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteAccountForm } from "./components/deleteAccountForm";

export const AccountProfile = () => {
  const { authUser, setAuthUser, loading } = useAuthContext();

  const [updateLoading, setUpdateLoading] = useState(false);
  const [openUpdatePasswordDialog, setOpenUpdatePasswordDialog] = useState(false);
  const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

  const updateAccountSchema = getUpdateAccountSchema();
  const updateForm = useForm<z.infer<typeof updateAccountSchema>>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: authUser?.name,
      forename: authUser?.forename,
      username: authUser?.username,
      email: authUser?.email,
      phone: authUser?.phone,
    },
  });

  const onUpdateSubmit: SubmitHandler<z.infer<typeof updateAccountSchema>> = async (values) => {
    try {
      setUpdateLoading(true);
      const response = await axiosConfig.put(`/users/${authUser?._id}`, values);
      toast.success(response.data.message || "Compte mis à jour");
      setAuthUser(response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setUpdateLoading(false);
    }
  };

  const updateProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateLoading(true);

    const file = e.target.files?.[0];

    if (!file?.type.includes("image")) {
      toast.error("Type de fichier invalide");
      setUpdateLoading(false);
      return;
    }
    if (!file) {
      toast.error("Aucun fichier sélectionné");
      setUpdateLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await axiosConfig.post(`/uploads/avatar/${authUser?._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message || "Avatar mis à jour");
      setAuthUser(response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setUpdateLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="flex justify-center p-0 sm:p-4 md:p-8">
      <div className="w-full max-w-4xl bg-background md:bg-card md:border md:shadow-xl md:rounded-2xl p-4 sm:p-6 md:p-8 transition-all">
        {/* Header section (replaces CardHeader) */}
        <div className="flex flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{"Paramètres du compte"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {"Mettez à jour vos informations personnelles et les détails de votre compte."}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Button variant="outline" size="sm">
                <EllipsisVertical className="w-5 h-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => setOpenDeleteAccountDialog(true)}>
                <Trash className="w-4 h-4 text-destructive" />
                <span className="text-destructive ">{"Supprimer le compte"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile picture section */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage src={authUser?.avatar} alt="User Avatar" className="object-cover object-center w-full h-full rounded-full" />
            </Avatar>
          </div>
          <div className="flex flex-col items-center gap-2">
            <InputFile buttonText="Choisir une image" id="profile-picture" disabled={loading} onChange={updateProfilePic} />
          </div>
        </div>

        <Form {...updateForm}>
          <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={updateForm.control}
                name="forename"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider ml-1">{"Prénom"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jean"
                        {...field}
                        className="h-12 rounded-xl bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider ml-1">{"Nom"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dupont"
                        {...field}
                        className="h-12 rounded-xl bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                      />
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
                  <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider ml-1">
                    {"Nom d'utilisateur"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="jean_dupont"
                      {...field}
                      className="h-12 rounded-xl bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={updateForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider ml-1">{"Email"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="jean.dupont@gmail.com"
                        {...field}
                        className="h-12 rounded-xl bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider ml-1">{"Téléphone"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="06 12 34 56 78"
                        {...field}
                        className="h-12 rounded-xl bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(authUser?.hasPassword || authUser?.auth_type !== "google") && (
              <FormItem className="pt-4">
                <div className="flex flex-col w-full gap-3 p-4 rounded-2xl border border-dashed border-input bg-muted/20">
                  <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">{"Mot de passe"}</FormLabel>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <FormControl className="flex-1">
                      <Input type="password" placeholder={"********"} disabled className="h-11 rounded-xl bg-background/50 border-input" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenUpdatePasswordDialog(true)}
                      disabled={updateLoading}
                      className="rounded-xl"
                    >
                      {"Modifier le mot de passe"}
                    </Button>
                  </div>
                </div>
              </FormItem>
            )}

            <div className="pt-6">
              <Button
                type="submit"
                disabled={updateLoading}
                className="w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {updateLoading ? "Mise à jour..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <Dialog open={openUpdatePasswordDialog} onOpenChange={setOpenUpdatePasswordDialog}>
        <UpdatePasswordForm setOpen={setOpenUpdatePasswordDialog} />
      </Dialog>

      <Dialog open={openDeleteAccountDialog} onOpenChange={setOpenDeleteAccountDialog}>
        <DeleteAccountForm setOpen={setOpenDeleteAccountDialog} />
      </Dialog>
    </div>
  );
};
