import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreditCard as CardIcon, Calendar, Lock } from "lucide-react";

const formSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(19, "Card number too long"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
  cvc: z.string().min(3, "CVC must be 3 digits").max(3, "CVC too long"),
  cardHolder: z.string().min(2, "Card holder name required"),
});

interface StepPaymentProps {
  data: any;
  updateData: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export const StepPayment = ({ data, updateData, onSubmit, onBack, loading }: StepPaymentProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: data.payment.cardNumber,
      expiryDate: data.payment.expiryDate,
      cvc: data.payment.cvc,
      cardHolder: data.payment.cardHolder,
    },
  });

  const watchValues = form.watch();

  function onFormSubmit(values: z.infer<typeof formSchema>) {
    updateData({ payment: values });
    onSubmit();
  }

  // Visual card formatting
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  return (
    <div className="space-y-8">
      {/* Visual Card */}
      <div className="w-full max-w-sm mx-auto h-56 bg-gradient-to-br from-gray-800 to-black rounded-xl shadow-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <CardIcon className="w-32 h-32" />
        </div>
        <div className="flex flex-col justify-between h-full relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Current Balance</span>
            <span className="font-bold tracking-widest">VISA</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-mono tracking-widest truncate">
              {watchValues.cardNumber ? formatCardNumber(watchValues.cardNumber) : "**** **** **** ****"}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Card Holder</div>
              <div className="font-medium tracking-wide uppercase truncate max-w-[160px]">{watchValues.cardHolder || "YOUR NAME"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Expires</div>
              <div className="font-medium tracking-wide">{watchValues.expiryDate || "MM/YY"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CardIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input className="pl-10" placeholder="0000 0000 0000 0000" {...field} maxLength={19} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (MM/YY)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input className="pl-10" placeholder="MM/YY" {...field} maxLength={5} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVC</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input className="pl-10" placeholder="123" type="password" {...field} maxLength={4} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cardHolder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
              Back
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Create Restaurant"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
