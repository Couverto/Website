import { useParams, useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
import { Check, CreditCard, Calendar, RefreshCw, Loader2, XCircle, Gift, Sparkles } from "lucide-react";
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
  referralCodeUsed?: {
    _id: string;
    code: string;
    type: "standard" | "sponsor";
    discountPercentage: number;
  } | null;
}

interface RestaurantContext {
  restaurant: any;
  userRole: string;
}

interface ReferralDiscount {
  totalDiscountPercentage: number;
  discountAmount: number;
  priceAfterDiscount: number;
  totalReferrals: number;
}

export const RestaurantPlan = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userRole } = useOutletContext<RestaurantContext>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [referralDiscount, setReferralDiscount] = useState<ReferralDiscount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const navigate = useNavigate();
  const paymentHandled = useRef(false);

  const fetchData = async () => {
    setLoadingPayments(true);
    try {
      const [subRes, payRes, plansRes, refRes] = await Promise.all([
        api.get(`/restaurants/${id}/subscription`),
        api.get(`/restaurants/${id}/payments`),
        api.get("/plans/public"),
        api.get(`/referral/restaurant/${id}`).catch(() => null),
      ]);
      setSubscription(subRes.data);
      setPayments(payRes.data.payments || []);
      setPlans(plansRes.data.plans || []);
      if (refRes?.data?.pricing) {
        setReferralDiscount({
          totalDiscountPercentage: refRes.data.pricing.totalDiscountPercentage,
          discountAmount: refRes.data.pricing.discountAmount,
          priceAfterDiscount: refRes.data.pricing.priceAfterDiscount,
          totalReferrals: refRes.data.stats?.totalReferrals || 0,
        });
      }
      if (subRes.data.plan) {
        setSelectedPlan(subRes.data.plan._id);
      }
    } catch (error) {
      console.error("Error fetching subscription data", error);
    } finally {
      setLoading(false);
      setLoadingPayments(false);
    }
  };

  // Handle payment success/cancelled from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentHandled.current) return;

    if (paymentStatus === "success" && sessionId) {
      paymentHandled.current = true;
      // Finalize the payment
      api
        .post("/restaurants/finalize-payment", { sessionId })
        .then(() => {
          toast.success("Paiement réussi ! Votre abonnement est maintenant actif 🎉");
          fetchData();
        })
        .catch((err) => {
          console.error("Finalize error:", err);
          toast.success("Paiement réussi ! Votre abonnement sera activé sous peu.");
        })
        .finally(() => {
          // Clean up URL params
          setSearchParams({});
        });
    } else if (paymentStatus === "cancelled") {
      paymentHandled.current = true;
      toast.error("Paiement annulé");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

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
      const response = await api.post("/payments", {
        restaurantId: id,
        planId: selectedPlan,
        amount: newPlan.price,
        paymentMethod: "card",
      });

      // If Stripe checkout is required, redirect to Stripe
      if (response.data.requiresStripe && response.data.url) {
        window.location.href = response.data.url;
        return;
      }

      if (response.data.reopened) {
        toast.success(`Abonnement renouvelé - Votre restaurant est à nouveau ouvert ! 🎉`);
      } else {
        toast.success(`Plan changé vers ${newPlan.name} - Paiement de ${newPlan.price}€ effectué`);
      }
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
  const isSponsor = subscription?.referralCodeUsed?.type === "sponsor" && subscription?.referralCodeUsed?.discountPercentage === 100;
  const isPartialSponsor =
    subscription?.referralCodeUsed?.type === "sponsor" &&
    (subscription?.referralCodeUsed?.discountPercentage ?? 0) > 0 &&
    (subscription?.referralCodeUsed?.discountPercentage ?? 0) < 100;

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
            {isSponsor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-foreground">Offre Sponsor</span>
                    <p className="text-sm text-muted-foreground">Code : {subscription?.referralCodeUsed?.code}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">Accès gratuit et illimité</span>
                  </div>
                  <p className="text-sm text-emerald-700">
                    Votre restaurant bénéficie d'un accès complet à toutes les fonctionnalités grâce à un code sponsor administrateur. Aucun
                    abonnement payant n'est nécessaire.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-bold text-emerald-600 text-lg">Gratuit</span>
                    <Badge className="bg-emerald-500/15 text-emerald-600 text-xs">-100% Sponsor</Badge>
                  </div>
                </div>
              </div>
            ) : subscription?.plan ? (
              <>
                {isPartialSponsor && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Offre Sponsor</span>
                      <Badge className="bg-emerald-500/15 text-emerald-600 text-xs">
                        -{subscription?.referralCodeUsed?.discountPercentage}%
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-700">
                      Votre abonnement bénéficie d'une réduction de {subscription?.referralCodeUsed?.discountPercentage}% grâce au code
                      sponsor <strong>{subscription?.referralCodeUsed?.code}</strong>. Cette réduction est appliquée automatiquement sur
                      chaque facture.
                    </p>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{subscription.plan.name}</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {referralDiscount && referralDiscount.totalDiscountPercentage > 0 ? (
                      <>
                        <span className="font-semibold text-muted-foreground line-through">{subscription.plan.price}€</span>
                        <span className="font-bold text-emerald-600">{referralDiscount.priceAfterDiscount.toFixed(2)}€</span>
                        <Badge className="bg-emerald-500/15 text-emerald-600 text-xs">
                          -{referralDiscount.totalDiscountPercentage}% {isPartialSponsor ? "sponsor" : "parrainage"}
                        </Badge>
                      </>
                    ) : (
                      <span className="font-semibold text-foreground">{subscription.plan.price}€</span>
                    )}
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
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>Aucun plan actif</p>
                <p className="text-sm">Choisissez un plan pour profiter de toutes les fonctionnalités</p>
              </div>
            )}

            {!isSponsor && (
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
            )}
          </CardContent>
        </Card>

        {/* Renewal Settings — Hidden for sponsor restaurants */}
        {!isSponsor && (
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
                        <AlertDialogDescription asChild>
                          <div className="text-sm text-muted-foreground space-y-3">
                            <span className="block">
                              Cette action va <strong>immédiatement fermer votre restaurant</strong> et le rendre invisible aux clients.
                            </span>
                            <span className="block p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
                              💡 Conseil : Pour <strong>profiter du mois en cours</strong> sans être débité le mois prochain, il suffit de{" "}
                              <strong>désactiver le renouvellement automatique</strong> ci-dessus.
                            </span>
                            <span className="block">Vous pourrez le réactiver à tout moment en souscrivant à un nouveau plan.</span>
                            <span className="block p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                              ⚠️ Attention : Toutes les réservations futures seront annulées.
                            </span>
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
        )}
      </div>

      {/* Payment History */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Historique des paiements</CardTitle>
              <CardDescription>Consultez l'historique de vos paiements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <DataTable
              columns={columns}
              data={payments}
              dataCount={payments.length}
              fetchData={() => fetchData()}
              isLoading={loadingPayments}
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
