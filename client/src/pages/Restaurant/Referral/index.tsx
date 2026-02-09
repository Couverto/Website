import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gift, Copy, Check, Loader2, Users, Sparkles, ToggleLeft, ToggleRight, Building2, CalendarDays, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReferralCode {
  _id: string;
  code: string;
  isActive: boolean;
  discountPercentage: number;
  createdAt: string;
}

interface ReferredRestaurant {
  _id: string;
  name: string;
  coverImage?: string;
  city: string;
  createdAt: string;
  subscriptionStatus: string;
  discountGained?: number;
  discountAmountGained?: number;
  cumulativeDiscount?: number;
}

interface ReferrerRestaurant {
  _id: string;
  name: string;
  coverImage?: string;
  city: string;
}

interface Pricing {
  planName: string;
  planPrice: number;
  discountPerReferral: number;
  totalDiscountPercentage: number;
  discountAmount: number;
  priceAfterDiscount: number;
}

export const RestaurantReferral = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<ReferredRestaurant[]>([]);
  const [referredBy, setReferredBy] = useState<ReferrerRestaurant | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);

  useEffect(() => {
    const fetchReferralInfo = async () => {
      try {
        const response = await api.get(`/referral/restaurant/${id}`);
        setReferralCode(response.data.referralCode);
        setReferrals(response.data.referrals || []);
        setReferredBy(response.data.referredBy || null);
        setPricing(response.data.pricing || null);
      } catch (error) {
        toast.error("Erreur lors du chargement des informations de parrainage");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReferralInfo();
  }, [id]);

  const handleCopyCode = async () => {
    if (!referralCode?.code) return;

    try {
      await navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      toast.success("Code copié dans le presse-papier");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleToggleCode = async () => {
    setToggling(true);
    try {
      const response = await api.patch(`/referral/restaurant/${id}/toggle`);
      setReferralCode(response.data.referralCode);
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la modification");
    } finally {
      setToggling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold">Parrainage</h1>
        <p className="text-muted-foreground">Parrainez d'autres restaurants et bénéficiez d'avantages</p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            Votre code de parrainage
          </CardTitle>
          <CardDescription className="text-base">
            Partagez ce code avec d'autres restaurateurs pour qu'ils bénéficient d'un mois gratuit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code Display */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div
                className={`
                h-16 px-6 rounded-xl border-2 flex items-center justify-center
                font-mono text-2xl tracking-[0.3em] font-bold
                ${referralCode?.isActive ? "bg-white border-primary/30" : "bg-muted border-muted-foreground/20 text-muted-foreground"}
              `}
              >
                {referralCode?.code || "---"}
              </div>
              {!referralCode?.isActive && (
                <Badge variant="secondary" className="absolute -top-2 -right-2">
                  Désactivé
                </Badge>
              )}
            </div>
            <Button variant="outline" size="lg" onClick={handleCopyCode} disabled={!referralCode?.isActive} className="h-16 px-6">
              {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>

          {/* Toggle and Stats */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleToggleCode} disabled={toggling} className="gap-2">
                {toggling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : referralCode?.isActive ? (
                  <ToggleRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ToggleLeft className="h-5 w-5" />
                )}
                {referralCode?.isActive ? "Désactiver" : "Activer"}
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{referrals.length}</span>
                <span className="text-muted-foreground">parrainage(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{referralCode?.discountPercentage || 10}%</span>
                <span className="text-muted-foreground">par parrainage</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Discount Summary */}
      {referrals.length > 0 && pricing && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <TrendingDown className="h-5 w-5" />
              Votre réduction actuelle
            </CardTitle>
            <CardDescription>Grâce à vos {referrals.length} parrainage(s), vous économisez sur votre abonnement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8 py-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Prix normal ({pricing.planName})</p>
                <p className="text-3xl font-bold text-muted-foreground line-through">{formatPrice(pricing.planPrice)}</p>
              </div>
              <div className="text-5xl text-purple-600">→</div>
              <div className="text-center">
                <p className="text-sm text-purple-600 mb-1 font-medium">Avec réduction ({pricing.totalDiscountPercentage}%)</p>
                <p className="text-4xl font-bold text-purple-700">{formatPrice(pricing.priceAfterDiscount)}</p>
                <p className="text-sm text-green-600 font-medium mt-1">Économie : {formatPrice(pricing.discountAmount)}</p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Cette réduction sera automatiquement appliquée lors du prochain renouvellement.
            </p>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold mb-2">Partagez votre code</h4>
              <p className="text-sm text-muted-foreground">
                Donnez votre code de parrainage à un restaurateur qui souhaite rejoindre Couverto.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold mb-2">Ils s'inscrivent</h4>
              <p className="text-sm text-muted-foreground">
                Lors de la création de leur restaurant, ils entrent votre code et bénéficient d'1 mois gratuit.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold mb-2">Vous êtes récompensé</h4>
              <p className="text-sm text-muted-foreground">
                Vous recevez {pricing?.discountPerReferral || 10}% de réduction par parrainage (cumulable).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referred By */}
      {referredBy && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Gift className="h-5 w-5" />
              Vous avez été parrainé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {referredBy.coverImage ? (
                <img src={referredBy.coverImage} alt={referredBy.name} className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-green-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-green-800">{referredBy.name}</p>
                <p className="text-sm text-green-600">{referredBy.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals History with Discounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Historique des parrainages ({referrals.length})
          </CardTitle>
          <CardDescription>Chaque parrainage vous fait gagner une réduction supplémentaire</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Aucun restaurant parrainé pour le moment</p>
              <p className="text-sm mt-1">Partagez votre code pour commencer à parrainer !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((restaurant, index) => (
                <div key={restaurant._id} className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-700">#{referrals.length - index}</span>
                  </div>
                  {restaurant.coverImage ? (
                    <img src={restaurant.coverImage} alt={restaurant.name} className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{restaurant.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(restaurant.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        +{restaurant.discountGained || pricing?.discountPerReferral || 10}%
                      </Badge>
                      {restaurant.discountAmountGained && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          -{formatPrice(restaurant.discountAmountGained)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total cumulé : {restaurant.cumulativeDiscount || (referrals.length - index) * (pricing?.discountPerReferral || 10)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
