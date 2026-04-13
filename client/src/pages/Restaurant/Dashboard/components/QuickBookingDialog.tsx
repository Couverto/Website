import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { axiosConfig as api } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Loader2, Users, User, Phone, MessageSquare, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const quickBookingSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  guests: z.coerce.number().min(1, "Au moins 1 couvert"),
  phone: z.string().optional(),
  notes: z.string().optional(),
  time: z.string().min(1, "L'heure est requise"),
});

type QuickBookingValues = z.infer<typeof quickBookingSchema>;

interface QuickBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  tableId: string;
  tableName: string;
  date: Date;
  service: string; // "19:00-22:00"
  onSuccess: () => void;
}

export const QuickBookingDialog: React.FC<QuickBookingDialogProps> = ({
  open,
  onOpenChange,
  restaurantId,
  tableId,
  tableName,
  date,
  service,
  onSuccess
}) => {
  const [loading, setLoading] = React.useState(false);

  const timeSlots = React.useMemo(() => {
    const [start, end] = service.split("-");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    
    const slots = [];
    let currH = sh;
    let currM = sm;
    
    // Simple loop for slots every 15 mins
    const maxLoops = 48; // max 12 hours
    let count = 0;
    
    while (count < maxLoops) {
      const time = `${String(currH).padStart(2, '0')}:${String(currM).padStart(2, '0')}`;
      slots.push(time);
      
      if (currH === eh && currM === em) break;
      
      currM += 15;
      if (currM >= 60) {
        currM = 0;
        currH = (currH + 1) % 24;
      }
      count++;
    }
    return slots;
  }, [service]);

  const form = useForm<QuickBookingValues>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      name: "",
      guests: 2,
      phone: "",
      notes: "",
      time: service.split("-")[0],
    },
  });

  const onSubmit = async (values: QuickBookingValues) => {
    try {
      setLoading(true);
      const [hours, minutes] = values.time.split(":").map(Number);
      
      const bookingDate = new Date(date);
      bookingDate.setHours(hours, minutes, 0, 0);

      await api.post("/bookings", {
        restaurant: restaurantId,
        bookingDate,
        guests: values.guests,
        customer: {
          name: values.name,
          phone: values.phone || "0000000000",
        },
        notes: values.notes,
        tableId,
        isManual: true,
      });

      toast.success("Réservation rapide créée");
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Réservation Rapide - Table {tableName}</DialogTitle>
          <DialogDescription>
            Occupez cette table immédiatement pour le service {service}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du client</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Jean Dupont" {...field} className="pl-10" />
                      <User className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couverts</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" {...field} className="pl-10" />
                        <Users className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                      </div>
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
                    <FormLabel>Heure</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-10 relative">
                          <Clock className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                          <SelectValue placeholder="Heure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone (facultatif)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="06..." {...field} className="pl-10" />
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 opacity-50" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (facultatif)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea placeholder="Commentaires..." {...field} className="pl-10 min-h-[80px]" />
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer l'occupation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
