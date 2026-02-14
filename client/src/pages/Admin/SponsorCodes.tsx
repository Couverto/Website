import { useState, useEffect } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Gift, Loader2, RefreshCw, Trash } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SponsorCode {
  _id: string;
  code: string;
  description?: string;
  discountPercentage: number;
  maxUsages: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export const SponsorCodes = () => {
  const [codes, setCodes] = useState<SponsorCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);

  // Form State
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState(100);
  const [maxUsages, setMaxUsages] = useState(1);

  const fetchCodes = async () => {
    setFetching(true);
    try {
      const response = await axiosConfig.get("/referral/sponsor");
      setCodes(response.data);
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors du chargement des codes");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const generateCode = async () => {
    setLoading(true);
    try {
      const response = await axiosConfig.post("/referral/sponsor", {
        description,
        discountPercentage: discount,
        maxUsages,
      });
      setLastGeneratedCode(response.data.code);
      toast.success("Code sponsor généré avec succès");

      // Reset form defaults
      setDescription("");
      setDiscount(100);
      setMaxUsages(1);

      // Refresh list
      fetchCodes();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Erreur lors de la génération du code");
    } finally {
      setLoading(false);
    }
  };

  const deleteCode = async (id: string) => {
    try {
      await axiosConfig.delete(`/referral/sponsor/${id}`);
      toast.success("Code supprimé avec succès");
      fetchCodes();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  const deleteUnusedCodes = async () => {
    setLoading(true);
    try {
      const response = await axiosConfig.delete("/referral/sponsor/unused");
      toast.success(response.data.message);
      fetchCodes();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Erreur lors de la suppression massive");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copié dans le presse-papier");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Codes Sponsor</h2>
          <p className="text-muted-foreground">Gérez les codes d'accès spéciaux et suivez leur utilisation.</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={loading || codes.filter((c) => c.usageCount === 0).length === 0}>
                <Trash className="h-4 w-4 mr-2" />
                Supprimer les inutilisés
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Suppression massive</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous êtes sur le point de supprimer <strong>TOUS</strong> les codes sponsor qui n'ont jamais été utilisés.
                  <br />
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteUnusedCodes}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer tout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="sm" onClick={fetchCodes} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Creation Card */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Générer un Code
            </CardTitle>
            <CardDescription>Créez un nouveau code sponsor avec des paramètres personnalisés.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description (pour admin)</Label>
              <Input
                id="description"
                placeholder="Ex: Event Startup Lyon"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Réduction (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsages">Max Utilisations</Label>
                <Input id="maxUsages" type="number" min="1" value={maxUsages} onChange={(e) => setMaxUsages(Number(e.target.value))} />
              </div>
            </div>

            <Button onClick={generateCode} disabled={loading} className="w-full mt-2">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                "Créer le code"
              )}
            </Button>

            {lastGeneratedCode && (
              <div className="mt-4 rounded-lg border bg-emerald-50/50 border-emerald-100 p-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-emerald-600 font-medium mb-1">Dernier code créé :</p>
                <div className="flex items-center gap-2">
                  <code className="relative rounded bg-white px-2 py-1 font-mono text-lg font-bold text-emerald-700 flex-1 text-center select-all border border-emerald-200">
                    {lastGeneratedCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                    onClick={() => copyToClipboard(lastGeneratedCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* List Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Codes Existants</CardTitle>
            <CardDescription>Liste de tous les codes sponsor générés.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Réduction</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun code sponsor généré pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-mono font-medium">{c.code}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={c.description}>
                        {c.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          -{c.discountPercentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`${c.usageCount >= c.maxUsages ? "text-red-500 font-bold" : "text-foreground"}`}>
                            {c.usageCount}
                          </span>
                          <span className="text-muted-foreground">/ {c.maxUsages}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(c.createdAt), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(c.code)} title="Copier">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={c.usageCount > 0 ? "Impossible de supprimer (utilisé)" : "Supprimer"}
                              disabled={c.usageCount > 0}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-destructive"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce code ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer le code <strong>{c.code}</strong> ?
                                <br />
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCode(c._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
