import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { getUpdatePasswordSchema } from "@/lib/zod/schemas/account/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface UpdatePasswordProps {
  setOpen: (open: boolean) => void;
}

export const UpdatePasswordForm = ({ setOpen }: UpdatePasswordProps) => {
  const { authUser } = useAuthContext();

  const [loading, setLoading] = useState(false);

  const updatePasswordSchema = getUpdatePasswordSchema(authUser?.hasPassword);
  const updatePasswordForm = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  const onUpdatePasswordSubmit = async (values: z.infer<typeof updatePasswordSchema>) => {
    try {
      setLoading(true);
      const response = await axiosConfig.put(`/users/${authUser?._id}/password`, values);
      toast.success(response.data.message || "Mot de passe mis à jour");
      setOpen(false);
      updatePasswordForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[525px]">
      <Form {...updatePasswordForm}>
        <form onSubmit={updatePasswordForm.handleSubmit(onUpdatePasswordSubmit)} className="space-y-6">
          <DialogHeader>
            <DialogTitle>{"Modifier le profil"}</DialogTitle>
            <DialogDescription>
              {"Apportez des modifications à votre mot de passe ici. Cliquez sur enregistrer lorsque vous avez terminé."}
            </DialogDescription>
          </DialogHeader>
          {authUser?.hasPassword && (
            <FormField
              control={updatePasswordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{"Mot de passe actuel"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={"********"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={updatePasswordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{"Nouveau mot de passe"}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={"********"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={updatePasswordForm.control}
            name="newPasswordConfirm"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{"Confirmation du nouveau mot de passe"}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={"********"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button disabled={loading} type="submit">
              {"Enregistrer"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              {"Annuler"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
