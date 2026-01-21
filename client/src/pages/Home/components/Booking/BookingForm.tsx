import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookingSchema, CreateBookingSchema } from "@/lib/zod/schemas/booking/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Loader2, CalendarIcon } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker, { registerLocale } from "react-datepicker";

// Register locales
registerLocale("fr", fr);
registerLocale("en-US", enUS);

interface BookingFormProps {
  restaurant: RestaurantInterface;
  onSuccess: () => void;
}

export const BookingForm = ({ restaurant, onSuccess }: BookingFormProps) => {
  const { t, i18n } = useTranslation();
  const { authUser: user } = useAuthContext();
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [closedDays, setClosedDays] = useState<number[]>([]); // 0 = Sunday, 6 = Saturday

  const form = useForm<CreateBookingSchema>({
    resolver: zodResolver(createBookingSchema),
    mode: "onChange",
    defaultValues: {
      // bookingDate is handled by useEffect to check for closed days
      guests: 2,
      time: "",
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

  // Determine closed days from restaurant opening hours
  useEffect(() => {
    // If no opening hours configured, allow all days (don't block any)
    if (!restaurant.openingHours || Object.keys(restaurant.openingHours).length === 0) {
      setClosedDays([]);
      return;
    }

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const closed: number[] = [];
    days.forEach((day, index) => {
      const dayInfo = restaurant.openingHours[day];
      if (!dayInfo || dayInfo.isClosed || !dayInfo.periods || dayInfo.periods.length === 0) {
        closed.push(index);
      }
    });
    setClosedDays(closed);
  }, [restaurant.openingHours]);

  // Set initial date to today if it's open, otherwise leave empty
  useEffect(() => {
    if (closedDays.length === 0) return;
    const today = new Date();
    const todayDayOfWeek = today.getDay();

    // If today is open, use today
    if (!closedDays.includes(todayDayOfWeek)) {
      form.setValue("bookingDate", today);
    } else {
      // If today is closed, do not pre-fill date (user must select)
      form.resetField("bookingDate");
    }
  }, [closedDays, form]);

  // Fetch available slots when date changes
  const bookingDate = form.watch("bookingDate");
  useEffect(() => {
    const fetchSlots = async () => {
      if (!bookingDate) return;
      setLoadingSlots(true);
      try {
        const response = await axiosConfig.get(`/restaurants/public/${restaurant._id}/slots`, {
          params: { date: format(bookingDate, "yyyy-MM-dd") },
        });
        setTimeSlots(response.data.slots || []);
        // Set first slot as default if available
        if (response.data.slots?.length > 0) {
          form.setValue("time", response.data.slots[0]);
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [bookingDate, restaurant._id, form]);

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
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="bookingDate"
            rules={{
              validate: (date) => {
                if (!date) return true;
                const day = new Date(date).getDay();
                if (closedDays.includes(day)) {
                  return t("components.booking.form.errors.closed_day");
                }
                return true;
              },
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("components.booking.form.date")}</FormLabel>
                <div className="relative">
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    locale={i18n.language === "fr" ? "fr" : "en-US"}
                    dateFormat={i18n.language === "fr" ? "dd/MM/yyyy" : "MM/dd/yyyy"}
                    minDate={new Date()}
                    filterDate={(date) => !closedDays.includes(date.getDay())}
                    placeholderText={t("components.booking.form.select_date")}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      !field.value && "text-muted-foreground",
                    )}
                    wrapperClassName="w-full"
                  />
                  <CalendarIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 opacity-50" />
                </div>
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
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingSlots || timeSlots.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={loadingSlots ? t("components.booking.form.loading_slots") : t("components.booking.form.select_time")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || !form.formState.isValid || (bookingDate && closedDays.includes(bookingDate.getDay()))}
        >
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("components.booking.form.submit")}
        </Button>
      </form>
    </Form>
  );
};
