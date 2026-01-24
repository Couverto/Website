import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserPlus, Link as LinkIcon, Copy, Trash2, Loader2, Users, Clock, Check, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import { DataTable } from "@/components/customs/dataTable";
import { getColumns as getCollaboratorColumns } from "./columns";

interface Collaborator {
  _id: string;
  name: string;
  forename: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

interface Invitation {
  _id: string;
  token: string;
  createdBy: {
    name: string;
    forename: string;
  };
  expiresAt: string;
  createdAt: string;
}

interface SearchUser {
  _id: string;
  name: string;
  forename: string;
  email: string;
  username: string;
  avatar?: string;
}

export const RestaurantCollaborators = () => {
  const { id } = useParams();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // User search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState<string | null>(null);

  // Client-side pagination for collaborators
  const [paginatedCollaborators, setPaginatedCollaborators] = useState<Collaborator[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Delete confirmation state
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<Collaborator | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    setPaginatedCollaborators(collaborators.slice(start, end));
  }, [collaborators, pageIndex, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [collabRes, inviteRes] = await Promise.all([
        api.get(`/restaurants/${id}/collaborators`),
        api.get(`/restaurants/${id}/invitations`),
      ]);
      setCollaborators(collabRes.data.collaborators);
      setInvitations(inviteRes.data.invitations);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pIndex: number, pSize: number) => {
    setPageIndex(pIndex);
    setPageSize(pSize);
  };

  // Callback for DataTable actions (like Admin dashboard)
  const handleCallback = (action: string, data: any) => {
    switch (action) {
      case "delete":
        const collab = collaborators.find((c) => c._id === data);
        if (collab) setCollaboratorToDelete(collab);
        break;
      default:
        break;
    }
  };

  // ... (keep search logic: debouncedSearch, useEffect, addCollaborator) ...
  // ... (keep invite logic: createInviteLink, copyLink, deleteInvitation, removeCollaborator) ...

  // Re-implementing functions to ensure scope access (simplification for Replace)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query: string, excludeIds: string[]) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await api.get(`/users/search`, {
          params: { q: query, exclude: excludeIds.join(",") },
        });
        setSearchResults(response.data.users);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    const excludeIds = collaborators.map((c) => c._id);
    debouncedSearch(searchQuery, excludeIds);
  }, [searchQuery, collaborators, debouncedSearch]);

  const addCollaborator = async (userId: string) => {
    setIsAddingUser(userId);
    try {
      await api.post(`/restaurants/${id}/collaborators`, { userId });
      await fetchData();
      setSearchQuery("");
      setSearchResults([]);
      toast.success("Collaborateur ajouté");
    } catch (error: any) {
      const errorKey = error.response?.data?.error;
      if (errorKey === "server.restaurants.errors.already_collaborator") {
        toast.error("Cet utilisateur est déjà collaborateur");
      } else {
        toast.error("Une erreur est survenue");
      }
    } finally {
      setIsAddingUser(null);
    }
  };

  const createInviteLink = async () => {
    setIsCreatingInvite(true);
    try {
      const response = await api.post(`/restaurants/${id}/invitations`);
      const link = `${window.location.origin}/join/${response.data.invitation.token}`;
      navigator.clipboard.writeText(link);
      await fetchData();
      toast.success("Lien d'invitation créé et copié !");
      setIsInviteDialogOpen(false);
      setNewInviteLink(null);
    } catch (error) {
      toast.error("Erreur lors de la création du lien");
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Lien copié dans le presse-papiers");
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      await api.delete(`/restaurants/${id}/invitations/${invitationId}`);
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
      toast.success("Invitation supprimée");
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      await api.delete(`/restaurants/${id}/collaborators/${collaboratorId}`);
      setCollaborators((prev) => prev.filter((c) => c._id !== collaboratorId));
      toast.success("Collaborateur retiré");
    } catch (error: any) {
      const errorKey = error.response?.data?.error;
      if (errorKey === "server.restaurants.errors.cannot_remove_last") {
        toast.error("Impossible de retirer le dernier collaborateur");
      } else {
        toast.error("Une erreur est survenue");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{"Collaborateurs"}</h1>
          <p className="text-muted-foreground">{"Gérez l'équipe qui a accès à ce restaurant"}</p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {"Inviter"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">{"Ajouter un collaborateur"}</DialogTitle>
              <DialogDescription className="text-base">
                {"Partagez un lien d'invitation pour permettre à quelqu'un de rejoindre votre équipe."}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="search" className="mt-4 w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 h-11 bg-muted/50">
                <TabsTrigger value="search" className="data-[state=active]:bg-background data-[state=active]:shadow-sm h-9">
                  <Search className="h-4 w-4 mr-2" />
                  {"Rechercher"}
                </TabsTrigger>
                <TabsTrigger value="link" className="data-[state=active]:bg-background data-[state=active]:shadow-sm h-9">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {"Lien d'invitation"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4 mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={"Rechercher par nom ou email..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 text-base"
                    autoFocus
                  />
                </div>
                {isSearching && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {user.forename?.charAt(0)}
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">
                              {user.forename} {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addCollaborator(user._id)}
                          disabled={isAddingUser === user._id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {isAddingUser === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1.5" />
                              {"Ajouter"}
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-2 opacity-20" />
                    <p>{"Aucun utilisateur trouvé"}</p>
                  </div>
                )}
                {!isSearching && searchQuery.length < 2 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground opacity-50">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">Commencez à taper pour rechercher un utilisateur</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="link" className="space-y-6 mt-6">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg">Inviter par lien</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Créez un lien unique que vous pouvez envoyer à votre futur collaborateur. Ce lien expirera dans 24 heures.
                  </p>
                </div>

                {!newInviteLink ? (
                  <Button onClick={createInviteLink} disabled={isCreatingInvite} className="w-full h-11 text-base">
                    {isCreatingInvite ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                    {isCreatingInvite ? "Création en cours..." : "Créer un lien d'invitation"}
                  </Button>
                ) : (
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                    <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      {"Lien prêt à être partagé"}
                    </p>
                    <div className="flex gap-2">
                      <Input value={newInviteLink} readOnly className="font-mono text-xs h-10 bg-background" />
                      <Button
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(newInviteLink);
                          toast.success("Lien copié dans le presse-papiers");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={() => setNewInviteLink(null)}>
                      Générer un nouveau lien
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <DialogFooter className="md:justify-end border-t pt-4 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setNewInviteLink(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                {"Annuler"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Collaborators DataTable */}
      <div className="bg-card rounded-md border p-4">
        <DataTable
          columns={getCollaboratorColumns(handleCallback, collaborators.length)}
          data={paginatedCollaborators}
          dataCount={collaborators.length}
          fetchData={handlePageChange}
          isLoading={loading}
          callback={handleCallback}
          searchElement="name"
        />
      </div>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {"Invitations en attente"} ({invitations.length})
          </CardTitle>
          <CardDescription>{"Liens d'invitation actifs qui n'ont pas encore été utilisés"}</CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{"Aucune invitation en attente"}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{"Créée par"}</TableHead>
                  <TableHead>{"Créée le"}</TableHead>
                  <TableHead>{"Expire le"}</TableHead>
                  <TableHead className="w-32">{"Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => (
                  <TableRow key={invite._id}>
                    <TableCell>
                      {invite.createdBy.forename} {invite.createdBy.name}
                    </TableCell>
                    <TableCell>{format(new Date(invite.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}</TableCell>
                    <TableCell>{format(new Date(invite.expiresAt), "dd MMM yyyy HH:mm", { locale: fr })}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyLink(invite.token)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteInvitation(invite._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!collaboratorToDelete} onOpenChange={(open) => !open && setCollaboratorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{"Retirer ce collaborateur ?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {collaboratorToDelete
                ? `Êtes-vous sûr de vouloir retirer ${collaboratorToDelete.forename} ${collaboratorToDelete.name} de l'équipe ?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{"Annuler"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (collaboratorToDelete) {
                  removeCollaborator(collaboratorToDelete._id);
                  setCollaboratorToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {"Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
