import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/customs/dataTable";
import { columns } from "./columns";
import { toast } from "sonner";
import { Check, CreditCard, Calendar, RefreshCw, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plan } from "@/interfaces/Plan";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Payment {
  _id: string;
  planName: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
}

interface Subscription {
  plan: Plan | null;
  subscriptionStatus: "active" | "cancelled" | "expired" | "none";
  autoRenew: boolean;
  subscriptionEndDate: string | null;
}

interface RestaurantContext {
  restaurant: any;
  userRole: string;
}

export const RestaurantPlan = () => {
  const { id } = useParams();
  const { userRole } = useOutletContext<RestaurantContext>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [subRes, payRes, plansRes] = await Promise.all([
        api.get(`/restaurants/${id}/subscription`),
        api.get(`/restaurants/${id}/payments`),
        api.get("/plans/public"),
      ]);
      setSubscription(subRes.data);
      setPayments(payRes.data.payments || []);
      setPlans(plansRes.data.plans || []);
      if (subRes.data.plan) {
        setSelectedPlan(subRes.data.plan._id);
      }
    } catch (error) {
      console.error("Error fetching subscription data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAutoRenewToggle = async (checked: boolean) => {
    setUpdating(true);
    try {
      await api.put(`/restaurants/${id}/subscription`, { autoRenew: checked });
      setSubscription((prev) => (prev ? { ...prev, autoRenew: checked } : null));
      toast.success(checked ? "Renouvellement automatique activé" : "Renouvellement automatique désactivé");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    const newPlan = plans.find((p) => p._id === selectedPlan);
    if (!newPlan) return;

    setUpdating(true);
    try {
      // Create payment for the new plan
      await api.post("/payments", {
        restaurantId: id,
        planId: selectedPlan,
        amount: newPlan.price,
        paymentMethod: "card",
      });
      toast.success(`Plan changé vers ${newPlan.name} - Paiement de ${newPlan.price}€ effectué`);
      setChangePlanOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors du changement de plan");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelPlan = async () => {
    setUpdating(true);
    try {
      await api.delete(`/restaurants/${id}/subscription`);
      toast.success("Abonnement résilié. Votre restaurant est maintenant fermé.");
      setCancelOpen(false);
      navigate(`/restaurant/${id}/dashboard`);
    } catch (error) {
      toast.error("Erreur lors de la résiliation");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[280px] rounded-2xl" />
          <Skeleton className="h-[280px] rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  const statusConfig = {
    active: { label: "Actif", className: "bg-emerald-500/15 text-emerald-600" },
    cancelled: { label: "Annulé", className: "bg-amber-500/15 text-amber-600" },
    expired: { label: "Expiré", className: "bg-red-500/15 text-red-600" },
    none: { label: "Aucun", className: "bg-zinc-500/15 text-zinc-500" },
  };

  const status = subscription?.subscriptionStatus || "none";
  const statusDisplay = statusConfig[status];

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Plan actuel</CardTitle>
                <CardDescription>Votre abonnement en cours</CardDescription>
              </div>
              <Badge className={statusDisplay.className}>{statusDisplay.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscription?.plan ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{subscription.plan.name}</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-semibold text-foreground">{subscription.plan.price}€</span>
                    <span>/mois</span>
                  </div>
                </div>
                {subscription.subscriptionEndDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {subscription.autoRenew ? "Renouvellement le" : "Expire le"}{" "}
                      {format(new Date(subscription.subscriptionEndDate), "dd MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                )}
                <ul className="space-y-2 pt-2">
                  {subscription.plan.features?.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>Aucun plan actif</p>
                <p className="text-sm">Choisissez un plan pour profiter de toutes les fonctionnalités</p>
              </div>
            )}

            <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Changer de plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Changer de plan</DialogTitle>
                  <DialogDescription>
                    Sélectionnez votre nouveau plan d'abonnement. Le premier mois sera facturé immédiatement.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
                  {plans.map((plan) => {
                    const isCurrentPlan = subscription?.plan?._id === plan._id;
                    return (
                      <Card
                        key={plan._id}
                        className={`cursor-pointer transition-all border-2 rounded-xl ${
                          selectedPlan === plan._id
                            ? "border-primary bg-primary/5 shadow-lg"
                            : isCurrentPlan
                              ? "border-muted bg-muted/30 opacity-60"
                              : "border-border hover:border-primary/50 hover:shadow-md"
                        }`}
                        onClick={() => !isCurrentPlan && setSelectedPlan(plan._id)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl font-bold flex items-center gap-2">
                                {plan.name}
                                {isCurrentPlan && (
                                  <Badge variant="secondary" className="text-xs">
                                    Actuel
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1">{plan.description}</CardDescription>
                            </div>
                            {selectedPlan === plan._id && !isCurrentPlan && (
                              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black">{plan.price}€</span>
                            <span className="text-muted-foreground">/mois</span>
                          </div>
                          <ul className="space-y-2">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {selectedPlan && selectedPlan !== subscription?.plan?._id && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                    <p className="text-sm font-medium text-primary">
                      💳 En confirmant, vous serez facturé de {plans.find((p) => p._id === selectedPlan)?.price}€ pour le premier mois.
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setChangePlanOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleChangePlan} disabled={updating || !selectedPlan || selectedPlan === subscription?.plan?._id}>
                    {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirmer et payer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Renewal Settings */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Paramètres de renouvellement</CardTitle>
            <CardDescription>Gérez le renouvellement automatique de votre abonnement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="space-y-1">
                <Label htmlFor="auto-renew" className="font-semibold">
                  Renouvellement automatique
                </Label>
                <p className="text-sm text-muted-foreground">Votre abonnement sera renouvelé automatiquement chaque mois</p>
              </div>
              <Switch
                id="auto-renew"
                checked={subscription?.autoRenew ?? true}
                onCheckedChange={handleAutoRenewToggle}
                disabled={updating || !subscription?.plan}
              />
            </div>

            {subscription?.autoRenew === false && subscription?.subscriptionEndDate && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <p className="text-sm font-medium">
                  ⚠️ Votre abonnement ne sera pas renouvelé et expirera le{" "}
                  {format(new Date(subscription.subscriptionEndDate), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            )}

            {/* Cancel Subscription */}
            {subscription?.plan && (
              <div className="pt-4 border-t">
                <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <XCircle className="h-4 w-4" />
                      Résilier l'abonnement
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Résilier l'abonnement ?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          Cette action va <strong>immédiatement fermer votre restaurant</strong> et le rendre invisible aux clients.
                        </p>
                        <p>Vous pourrez le réactiver à tout moment en souscrivant à un nouveau plan.</p>
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                          ⚠️ Attention : Toutes les réservations futures seront annulées.
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelPlan} className="bg-destructive hover:bg-destructive/90">
                        {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Confirmer la résiliation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Historique des paiements</CardTitle>
          <CardDescription>Consultez l'historique de vos paiements</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <DataTable
              columns={columns}
              data={payments}
              dataCount={payments.length}
              fetchData={() => {}}
              isLoading={false}
              callback={() => {}}
              searchElement="planName"
            />
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucun paiement enregistré</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
