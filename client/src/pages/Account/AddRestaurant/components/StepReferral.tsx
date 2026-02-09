import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Check, Loader2, X, Sparkles } from "lucide-react";
import { axiosConfig } from "@/config/axiosConfig";
import { StepProps } from "@/interfaces/Components";

interface ReferrerInfo {
  id: string;
  name: string;
  city: string;
  coverImage?: string;
}

export const StepReferral = ({ data, updateData, errors }: StepProps) => {
  const [code, setCode] = useState(data.referralCode || "");
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(!!data.referralCodeValidated);
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(data.referrer || null);
  const [error, setError] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-validate on code change with debounce
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmedCode = code.trim();

    // Reset if code is empty or too short
    if (!trimmedCode || trimmedCode.length < 6) {
      if (validated || referrer) {
        setValidated(false);
        setReferrer(null);
        setError("");
        updateData({
          referralCode: "",
          referralCodeValidated: false,
          referrer: null,
        });
      }
      return;
    }

    // Debounce validation (500ms delay)
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axiosConfig.post("/referral/validate", { code: trimmedCode });

        if (response.data.valid) {
          setValidated(true);
          setReferrer(response.data.referrer);
          updateData({
            referralCode: trimmedCode.toUpperCase(),
            referralCodeValidated: true,
            referrer: response.data.referrer,
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Code invalide");
        setValidated(false);
        setReferrer(null);
        updateData({
          referralCode: "",
          referralCodeValidated: false,
          referrer: null,
        });
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code]);

  const clearCode = () => {
    setCode("");
    setValidated(false);
    setReferrer(null);
    setError("");
    updateData({
      referralCode: "",
      referralCodeValidated: false,
      referrer: null,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Card */}
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            Avez-vous un code de parrainage ?
          </CardTitle>
          <CardDescription className="text-base">
            Si un autre restaurant vous a recommandé Couverto, entrez son code pour bénéficier d'avantages exclusifs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Ex: REF-ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={validated}
                className={`h-12 text-lg font-mono uppercase tracking-wider ${
                  validated ? "border-green-500 bg-green-50 pr-10" : error ? "border-red-500" : ""
                }`}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              {validated && !loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              )}
            </div>
            {validated && (
              <Button type="button" variant="outline" onClick={clearCode} className="h-12 px-6">
                <X className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm font-medium text-red-500 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <X className="h-4 w-4" />
              {error}
            </p>
          )}

          {/* Success - Referrer Info */}
          {validated && referrer && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                {referrer.coverImage ? (
                  <img src={referrer.coverImage} alt={referrer.name} className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-green-100 flex items-center justify-center">
                    <Gift className="h-6 w-6 text-green-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-green-800">Parrainé par {referrer.name}</p>
                  <p className="text-sm text-green-600">{referrer.city}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-600 text-white text-sm font-medium">
                    <Sparkles className="h-3 w-3" />1 mois gratuit
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              Pour vous (filleul)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>
                  <strong>1 mois d'abonnement gratuit</strong> - votre abonnement commencera 30 jours après la création
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Accès complet à toutes les fonctionnalités pendant la période gratuite</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              Pour le parrain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>
                  <strong>10% de réduction</strong> sur son prochain abonnement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Récompense pour chaque restaurant qu'il parraine</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Skip Notice */}
      <p className="text-center text-sm text-muted-foreground">Vous n'avez pas de code ? Pas de problème, cette étape est optionnelle.</p>

      {errors?.referralCode && <p className="text-center text-sm font-medium text-red-500">{errors.referralCode}</p>}
    </div>
  );
};
