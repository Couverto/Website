import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { useTranslation } from "react-i18next";
import { getCreateRestaurantSchema, getDeleteRestaurantSchema, getUpdateRestaurantSchema } from "@/lib/zod/schemas/admin/zod";
// import { MultiSelect } from "@/components/ui/multi-select"; // Would be nice but using text for now

interface RestaurantFormProps {
  dialog: (isOpen: boolean) => void;
  refresh: () => void;
  action: string;
  restaurant?: RestaurantInterface;
}

export const RestaurantForm = ({ dialog, refresh, action, restaurant }: RestaurantFormProps) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const createSchema = getCreateRestaurantSchema(t);
  const updateSchema = getUpdateRestaurantSchema(t);
  const deleteSchema = getDeleteRestaurantSchema(t);

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      address: "",
      city: "",
      phone: "",
      website: "",
      coverImage: "",
      priceRange: "$$",
      cuisineType: "",
      rating: 0,
      images: "",
      menu: "",
      openingHours: "",
    },
  });

  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: restaurant?.name,
      slug: restaurant?.slug,
      description: restaurant?.description || "",
      address: restaurant?.adress,
      city: restaurant?.city,
      phone: restaurant?.phone,
      website: restaurant?.website || "",
      coverImage: restaurant?.coverImage || "",
      priceRange: (restaurant?.priceRange as "$" | "$$" | "$$$") || "$$",
      cuisineType: restaurant?.cuisineType?.join(", ") || "",
      rating: restaurant?.rating || 0,
      images: restaurant?.images?.join(", ") || "",
      menu: restaurant?.menu?.join(", ") || "",
      openingHours: JSON.stringify(restaurant?.openingHours || {}, null, 2),
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
        cuisineType: values.cuisineType ? values.cuisineType.split(",").map((s) => s.trim()) : [],
        images: values.images ? values.images.split(",").map((s) => s.trim()) : [],
        menu: values.menu ? values.menu.split(",").map((s) => s.trim()) : [],
        openingHours: values.openingHours ? JSON.parse(values.openingHours) : {},
      };

      const response = await axiosConfig.post("/restaurants", payload);
      toast.success(t(response.data.message));
      dialog(false);
      refresh();
      createForm.reset();
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const onUpdateSubmit: SubmitHandler<z.infer<typeof updateSchema>> = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        cuisineType: values.cuisineType ? values.cuisineType.split(",").map((s) => s.trim()) : undefined,
        images: values.images ? values.images.split(",").map((s) => s.trim()) : undefined,
        menu: values.menu ? values.menu.split(",").map((s) => s.trim()) : undefined,
        openingHours: values.openingHours ? JSON.parse(values.openingHours) : undefined,
      };

      const response = await axiosConfig.put(`/restaurants/${restaurant?._id}`, payload);
      toast.success(t(response.data.message));
      dialog(false);
      refresh();
      updateForm.reset();
    } catch (error: any) {
      toast.error(t(error.response?.data?.error || "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteSubmit: SubmitHandler<z.infer<typeof deleteSchema>> = async (values) => {
    if (values.confirmDelete.toLowerCase() === "delete") {
      try {
        setLoading(true);
        const response = await axiosConfig.delete(`/restaurants/${restaurant?._id}`);
        toast.success(t(response.data.message));
        dialog(false);
        refresh();
      } catch (error: any) {
        toast.error(t(error.response?.data?.error || "An error occurred"));
      } finally {
        setLoading(false);
      }
    } else {
      toast.error(t("pages.admin.users_page.form.confirm_text_invalid"));
    }
  };

  const renderFormFields = (form: any) => (
    <>
      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.restaurants_page.form.name")}</FormLabel>
              <FormControl>
                <Input placeholder="Chez Mario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.restaurants_page.form.slug")}</FormLabel>
              <FormControl>
                <Input placeholder="chez-mario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pages.admin.restaurants_page.form.description")}</FormLabel>
            <FormControl>
              <Input placeholder="Generic Italian restaurant..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.restaurants_page.form.address")}</FormLabel>
              <FormControl>
                <Input placeholder="123 Rue de la Pizza" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.restaurants_page.form.city")}</FormLabel>
              <FormControl>
                <Input placeholder="Paris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.restaurants_page.form.phone")}</FormLabel>
              <FormControl>
                <Input placeholder="+33 1 23 45 67 89" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.restaurants_page.form.website")}</FormLabel>
              <FormControl>
                <Input placeholder="https://chezmario.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="priceRange"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.restaurants_page.form.price_range")}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="$" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$</SelectItem>
                    <SelectItem value="$$">$$</SelectItem>
                    <SelectItem value="$$$">$$$</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("pages.admin.restaurants_page.form.rating")}</FormLabel>
              <FormControl>
                <Input type="number" min={0} max={5} step={0.1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="coverImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pages.admin.restaurants_page.form.cover_image")}</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cuisineType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pages.admin.restaurants_page.form.cuisine_type")}</FormLabel>
            <FormControl>
              <Input placeholder="Italian, Pizza (comma separated)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="openingHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pages.admin.restaurants_page.form.opening_hours")}</FormLabel>
            <FormControl>
              <Input placeholder='{"Monday": "9:00-18:00"}' {...field} />
            </FormControl>
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
          <Button type="submit" disabled={loading}>
            {t("pages.admin.users_page.form.save")}
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
          <Button type="submit" disabled={loading}>
            {t("pages.admin.restaurants_page.form.update")}
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
                <FormLabel>{t("pages.admin.users_page.form.confirm_delete_label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("pages.admin.users_page.form.confirm_delete_placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="destructive" disabled={loading}>
            {t("pages.admin.users_page.form.delete")}
          </Button>
        </form>
      </Form>
    );
  }

  return null;
};
