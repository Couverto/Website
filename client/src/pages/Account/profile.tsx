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
    <div className="flex justify-center p-8">
      <Card className="w-full max-w-4xl p-4 shadow-xl rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between ">
          <div>
            <CardTitle>{"Paramètres du compte"}</CardTitle>
            <CardDescription>{"Mettez à jour vos informations personnelles et les détails de votre compte."}</CardDescription>
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
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative">
              <Avatar className="w-28 h-28 ">
                <AvatarImage src={authUser?.avatar} alt="User Avatar" className="object-cover object-center w-full h-full rounded-full" />
              </Avatar>
            </div>
            <div>
              <InputFile buttonText="Choisir une image" id="profile-picture" disabled={loading} onChange={updateProfilePic} />
            </div>
          </div>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row ">
                <FormField
                  control={updateForm.control}
                  name="forename"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{"Prénom"}</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean" {...field} />
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
                        <Input placeholder="Dupont" {...field} />
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
                      <Input placeholder="jean_dupont" {...field} />
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
                    <FormLabel>{"Email"}</FormLabel>
                    <FormControl>
                      <Input placeholder="jean.dupont@gmail.com" {...field} />
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
                    <FormLabel>{"Téléphone"}</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {authUser?.auth_type !== "google" && (
                <FormItem>
                  <div className="flex flex-col w-full gap-2">
                    <FormLabel>{"Mot de passe"}</FormLabel>
                    <div className="flex items-center justify-between gap-4">
                      <FormControl>
                        <Input type="password" placeholder={"********"} disabled />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={() => setOpenUpdatePasswordDialog(true)} disabled={updateLoading}>
                        {"Changer le mot de passe"}
                      </Button>
                    </div>
                  </div>
                </FormItem>
              )}
              {authUser?.auth_type === "google" && authUser?.hasPassword && (
                <FormItem>
                  <div className="flex flex-col w-full gap-2">
                    <FormLabel>{"Mot de passe"}</FormLabel>
                    <div className="flex items-center justify-between gap-4">
                      <FormControl>
                        <Input type="password" placeholder={"********"} disabled />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={() => setOpenUpdatePasswordDialog(true)} disabled={updateLoading}>
                        {"Changer le mot de passe"}
                      </Button>
                    </div>
                  </div>
                </FormItem>
              )}

              <CardFooter className="px-0">
                <Button type="submit" disabled={updateLoading} className="w-full">
                  {"Mettre à jour"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={openUpdatePasswordDialog} onOpenChange={setOpenUpdatePasswordDialog}>
        <UpdatePasswordForm setOpen={setOpenUpdatePasswordDialog} />
      </Dialog>

      <Dialog open={openDeleteAccountDialog} onOpenChange={setOpenDeleteAccountDialog}>
        <DeleteAccountForm setOpen={setOpenDeleteAccountDialog} />
      </Dialog>
    </div>
  );
};
