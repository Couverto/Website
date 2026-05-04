import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookingSchema, CreateBookingSchema } from "@/lib/zod/schemas/booking/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/customs/phoneInput";
import { Loader2, CalendarIcon, Users, Clock, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";
import { useEffect, useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker, { registerLocale } from "react-datepicker";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeImprintForm } from "./StripeImprintForm";

// Register locale
registerLocale("fr", fr);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface BookingFormProps {
  restaurant: RestaurantInterface;
  onSuccess: () => void;
  initialData?: {
    date?: string;
    guests?: string | number;
  };
}

export const BookingForm = ({ restaurant, onSuccess, initialData }: BookingFormProps) => {
  const { authUser: user } = useAuthContext();
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [closedDays, setClosedDays] = useState<number[]>([]); // 0 = Sunday, 6 = Saturday

  // Stripe Imprint states
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [bookingPayload, setBookingPayload] = useState<any>(null);

  const form = useForm<CreateBookingSchema>({
    resolver: zodResolver(createBookingSchema),
    mode: "all",
    defaultValues: {
      // bookingDate is handled by useEffect to check for closed days
      guests: initialData?.guests ? Number(initialData.guests) : 2,
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
    } else {
      //rendre les champs obligatoires
      form.setValue("customer.name", "");
      form.setValue("customer.email", "");
      form.setValue("customer.phone", "");
    }
  }, [user, form]);

  // Determine closed days from restaurant opening hours
  useEffect(() => {
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

  // Set initial date
  useEffect(() => {
    // Removed strict check on closedDays.length === 0 to allow setting date for 7/7 open restaurants
    // if (closedDays.length === 0) return;

    let targetDate = new Date();
    if (initialData?.date) {
      targetDate = new Date(initialData.date);
    }

    const dayOfWeek = targetDate.getDay();

    if (!closedDays.includes(dayOfWeek)) {
      form.setValue("bookingDate", targetDate);
    } else if (!initialData?.date) {
      form.resetField("bookingDate");
    }
  }, [closedDays, form, initialData]);

  // Fetch available slots when date or guests change
  const bookingDate = form.watch("bookingDate");
  const guestsCount = form.watch("guests");

  useEffect(() => {
    const fetchSlots = async () => {
      if (!bookingDate) return;
      setLoadingSlots(true);
      try {
        const response = await axiosConfig.get(`/restaurants/public/${restaurant._id}/slots`, {
          params: { 
            date: format(bookingDate, "yyyy-MM-dd"),
            guests: guestsCount
          },
        });

        let slots = response.data.slots || [];

        // Filter out past time slots if the selected date is today
        const today = new Date();
        const isToday = format(bookingDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

        if (isToday) {
          const currentHour = today.getHours();
          const currentMinute = today.getMinutes();

          slots = slots.filter((slot: string) => {
            const [hour, minute] = slot.split(":").map(Number);
            if (hour > currentHour) return true;
            if (hour === currentHour && minute > currentMinute) return true;
            return false;
          });
        }

        setTimeSlots(slots);
        setAvailability(response.data.availability || {});

        // Automatically select the first available slot if not already set or if previous slot is no longer available
        if (slots.length > 0) {
          const currentTime = form.getValues("time");
          // Only clear if the currently selected time is not in the new slots
          if (currentTime && !slots.includes(currentTime)) {
            form.setValue("time", "");
          }
          // Do NOT auto-select slots[0] anymore
        } else {
          form.setValue("time", "");
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [bookingDate, guestsCount, restaurant._id, form]);

  const selectedTime = form.watch("time");

  // Default max to restaurant capacity if available, or a fallback (e.g. 50) if strictly needed, or just let backend handle.
  const maxGuests = selectedTime && availability[selectedTime] !== undefined ? availability[selectedTime] : restaurant.capacity || 50;

  const onSubmit = async (values: CreateBookingSchema) => {
    try {
      const [hours, minutes] = values.time.split(":").map(Number);
      const bookingDate = new Date(values.bookingDate);
      bookingDate.setHours(hours, minutes);

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

      if (restaurant.isBankImprintEnabled) {
        try {
          const setupRes = await axiosConfig.post("/bookings/setup-intent", {
            restaurantId: restaurant._id,
            email: values.customer.email,
            name: values.customer.name,
          });
          setClientSecret(setupRes.data.clientSecret);
          setStripeCustomerId(setupRes.data.customerId);
          setBookingPayload(payload);
          return; // Stop here, render Stripe
        } catch (setupError: any) {
          toast.error(setupError.response?.data?.error || "Erreur lors de l'initialisation du paiement sécurisé.");
          return;
        }
      }

      const endpoint = user ? "/bookings" : "/bookings/guest";
      await axiosConfig.post(endpoint, payload);
      toast.success("Réservation créée avec succès !");
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Erreur lors de la création de la réservation. Veuillez réessayer.");
    }
  };

  if (clientSecret && bookingPayload && restaurant.isBankImprintEnabled) {
    const totalAmount = (restaurant.bankImprintAmount || 0) * bookingPayload.guests;
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
        <StripeImprintForm
          amount={totalAmount}
          onCancel={() => {
            setClientSecret(null);
            setBookingPayload(null);
          }}
          onSuccess={async (setupIntentId) => {
            try {
              const finalPayload = {
                ...bookingPayload,
                stripeSetupIntentId: setupIntentId,
                stripeCustomerId: stripeCustomerId,
                bankImprintAmount: totalAmount,
              };
              const endpoint = user ? "/bookings" : "/bookings/guest";
              await axiosConfig.post(endpoint, finalPayload);
              toast.success("Réservation confirmée avec succès !");
              onSuccess();
            } catch (error: any) {
              toast.error(error.response?.data?.error || "Erreur lors de l'enregistrement final de la réservation.");
            }
          }}
        />
      </Elements>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Exceptional Closures Banner */}
        {restaurant.exceptionalClosures && restaurant.exceptionalClosures.length > 0 && (
          <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-orange-800 font-medium text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span>Fermetures exceptionnelles à venir :</span>
            </div>
            <div className="space-y-1">
              {restaurant.exceptionalClosures.map((closure, idx) => {
                const start = new Date(closure.startDate);
                const end = new Date(closure.endDate);
                const isSameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
                const isFullDay = start.getUTCHours() === 0 && end.getUTCHours() >= 23;

                return (
                  <div key={idx} className="text-xs text-orange-700/80 ml-6 flex flex-col sm:flex-row sm:gap-1">
                    <span className="font-semibold">
                      {isSameDay ? (
                        <>Le {format(start, "dd/MM/yyyy")}</>
                      ) : (
                        <>
                          Du {format(start, "dd/MM/yyyy")} au {format(end, "dd/MM/yyyy")}
                        </>
                      )}
                      {!isFullDay && (
                        <>
                          {" "}
                          ({start.getUTCHours().toString().padStart(2, "0")}:{start.getUTCMinutes().toString().padStart(2, "0")} -{" "}
                          {end.getUTCHours().toString().padStart(2, "0")}:{end.getUTCMinutes().toString().padStart(2, "0")})
                        </>
                      )}
                      :
                    </span>
                    <span>{closure.reason}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exceptional Openings Banner */}
        {restaurant.exceptionalOpenings && restaurant.exceptionalOpenings.filter((o) => o.reason?.trim()).length > 0 && (
          <div className="bg-green-50/50 border border-green-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800 font-medium text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span>Ouvertures exceptionnelles à venir :</span>
            </div>
            <div className="space-y-1">
              {restaurant.exceptionalOpenings.filter((o) => o.reason?.trim()).map((opening, idx) => {
                const start = new Date(opening.startDate);
                const end = new Date(opening.endDate);
                const isSameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

                return (
                  <div key={idx} className="text-xs text-green-700/80 ml-6 flex flex-col sm:flex-row sm:gap-1">
                    <span className="font-semibold">
                      {isSameDay ? (
                        <>Le {format(start, "dd/MM/yyyy")}</>
                      ) : (
                        <>
                          Du {format(start, "dd/MM/yyyy")} au {format(end, "dd/MM/yyyy")}
                        </>
                      )}
                      {" "}({opening.periods.map((p) => `${p.open}-${p.close}`).join(", ")}) :
                    </span>
                    <span>{opening.reason}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="bookingDate"
            rules={{
              validate: (date) => {
                if (!date) return true;
                const day = new Date(date).getDay();
                if (closedDays.includes(day)) {
                  return "Le restaurant est fermé ce jour-là";
                }
                return true;
              },
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">{"Date de réservation"}</FormLabel>
                <div className="relative group">
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    locale="fr"
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    filterDate={(date) => {
                      const day = date.getDay();
                      const dateStr = format(date, "yyyy-MM-dd");

                      // Check exceptional openings first — these override closedDays
                      const hasExceptionalOpening = restaurant.exceptionalOpenings?.some((opening) => {
                        const sStr = format(new Date(opening.startDate), "yyyy-MM-dd");
                        const eStr = format(new Date(opening.endDate), "yyyy-MM-dd");
                        return dateStr >= sStr && dateStr <= eStr;
                      });

                      // If normally closed but has an exceptional opening, allow it
                      if (closedDays.includes(day) && !hasExceptionalOpening) return false;

                      // Check exceptional closures
                      if (restaurant.exceptionalClosures && restaurant.exceptionalClosures.length > 0) {
                        const isClosed = restaurant.exceptionalClosures.some((closure) => {
                          const start = new Date(closure.startDate);
                          const end = new Date(closure.endDate);
                          const sStr = format(start, "yyyy-MM-dd");
                          const eStr = format(end, "yyyy-MM-dd");

                          if (dateStr >= sStr && dateStr <= eStr) {
                            // If it's a middle day of a multi-day closure, it's fully closed
                            if (dateStr > sStr && dateStr < eStr) return true;

                            // If it's a boundary day, check if it's a full day closure
                            const isFullDay = start.getUTCHours() === 0 && end.getUTCHours() >= 23;

                            return isFullDay;
                          }
                          return false;
                        });
                        if (isClosed) return false;
                      }

                      return true;
                    }}
                    placeholderText={"Choisir une date"}
                    className={cn(
                      "flex h-12 w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 py-2 text-base ring-offset-background transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                      !field.value && "text-muted-foreground",
                    )}
                    wrapperClassName="w-full"
                  />
                  <CalendarIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 group-hover:opacity-60 transition-opacity" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">{"Nombre de couverts"}</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      type="number"
                      min={1}
                      max={maxGuests}
                      {...field}
                      onChange={(e) => field.onChange(Math.min(Number(e.target.value), maxGuests))}
                      className="h-12 rounded-xl bg-background/50 backdrop-blur-sm pl-4 pr-10 text-lg font-medium border-input hover:border-primary/50 transition-all focus-visible:ring-primary/20"
                    />
                    <Users className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 group-hover:opacity-60 transition-opacity" />
                  </div>
                </FormControl>
                {selectedTime && availability[selectedTime] !== undefined && (
                  <p className="text-[10px] text-primary/60 mt-1 font-medium">{`Disponibilité max : ${availability[selectedTime]} personnes`}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">{"Choisir l'horaire"}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loadingSlots || timeSlots.length === 0}>
                <FormControl>
                  <div className="relative group">
                    <SelectTrigger className="h-12 rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 text-base transition-all hover:border-primary/50 focus:ring-primary/20">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 opacity-40 group-hover:opacity-60 transition-opacity" />
                        <SelectValue placeholder={loadingSlots ? "Recherche de créneaux..." : "Sélectionner une heure"} />
                      </div>
                    </SelectTrigger>
                  </div>
                </FormControl>
                <SelectContent className="max-h-[300px] rounded-xl border-input/50 backdrop-blur-xl">
                  {timeSlots.map((slot) => {
                    const avail = availability[slot] || 0;
                    const isLow = avail <= 4 && avail > 0;
                    return (
                      <SelectItem key={slot} value={slot} className="py-3 focus:bg-primary/5 rounded-lg cursor-pointer">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-semibold text-base">{slot}</span>
                          {isLow && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                              {"Plus que " + avail}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {timeSlots.length === 0 && !loadingSlots && (
                <p className="text-xs text-muted-foreground mt-2 italic">{"Aucun créneau disponible pour cette date"}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border" />
            <h4 className="font-semibold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 whitespace-nowrap">
              {"Vos coordonnées"}
            </h4>
            <div className="h-px flex-1 bg-border" />
          </div>

          <FormField
            control={form.control}
            name="customer.name"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-foreground/60 ml-1">{"Nom complet"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jean Dupont"
                    {...field}
                    className={cn(
                      "h-11 rounded-xl bg-background/50 border-input transition-all focus-visible:ring-primary/20",
                      fieldState.invalid && "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer.email"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-foreground/60 ml-1">{"Email"}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jean.dupont@exemple.com"
                      {...field}
                      className={cn(
                        "h-11 rounded-xl bg-background/50 border-input transition-all focus-visible:ring-primary/20",
                        fieldState.invalid && "border-red-500 focus-visible:ring-red-500",
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer.phone"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-foreground/60 ml-1">{"Téléphone"}</FormLabel>
                  <FormControl>
                    <PhoneInput defaultCountry="FR" value={field.value} onChange={field.onChange} placeholder="6 12 34 56 78" />
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
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-medium text-foreground/60 ml-1">{"Notes optionnelles"}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={"Une précision ? Allergies, occasion spéciale..."}
                  className="resize-none min-h-[80px] rounded-xl bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          disabled={form.formState.isSubmitting || !bookingDate || timeSlots.length === 0}
        >
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
          {"Confirmer ma réservation"}
        </Button>
      </form>
    </Form>
  );
};
