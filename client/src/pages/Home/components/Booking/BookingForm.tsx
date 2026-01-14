import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookingSchema, CreateBookingSchema } from "@/lib/zod/schemas/booking/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";
import { useEffect } from "react";

interface BookingFormProps {
  restaurant: RestaurantInterface;
  onSuccess: () => void;
}

export const BookingForm = ({ restaurant, onSuccess }: BookingFormProps) => {
  const { t } = useTranslation();
  const { authUser: user } = useAuthContext();

  const form = useForm<CreateBookingSchema>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      guests: 2,
      time: "19:00",
      customer: {
        name: "",
        email: "",
        phone: "",
      },
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("customer.name", `${user.forename} ${user.name}`);
      form.setValue("customer.email", user.email);
      form.setValue("customer.phone", user.phone || "");
    }
  }, [user, form]);

  const onSubmit = async (values: CreateBookingSchema) => {
    try {
      // Combine date and time
      const [hours, minutes] = values.time.split(":").map(Number);
      const bookingDate = new Date(values.bookingDate);
      bookingDate.setHours(hours, minutes);

      // Handle empty email if it's an optional field in schema but might strict check in backend logic?
      // Schema says optional string or literal empty. Backend model: email optional.
      // Cleaning up email if empty string to undefined might be safer for backend if it expects real email or null.
      const payload = {
        restaurant: restaurant._id,
        bookingDate,
        guests: values.guests,
        customer: {
          ...values.customer,
          email: values.customer.email || undefined,
        },
        notes: values.notes,
      };

      // Use /guest endpoint when user is not authenticated
      const endpoint = user ? "/bookings" : "/bookings/guest";
      await axiosConfig.post(endpoint, payload);
      toast.success(t("components.booking.form.success"));
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error ? t(error.response.data.error) : t("components.booking.form.error"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bookingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("components.booking.form.date")}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("components.booking.form.time")}</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("components.booking.form.guests")}</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium text-sm text-muted-foreground">{t("components.booking.form.contact_details")}</h4>
          <FormField
            control={form.control}
            name="customer.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("components.booking.form.name")}</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("components.booking.form.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("components.booking.form.phone")}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+33 6 12 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("components.booking.form.notes")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("components.booking.form.notes_placeholder")} className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("components.booking.form.submit")}
        </Button>
      </form>
    </Form>
  );
};
