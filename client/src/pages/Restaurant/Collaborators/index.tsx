import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

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
      toast.success(t("pages.restaurant.collaborators.added"));
    } catch (error: any) {
      const errorKey = error.response?.data?.error;
      if (errorKey === "server.restaurants.errors.already_collaborator") {
        toast.error(t("pages.restaurant.collaborators.already_collaborator"));
      } else {
        toast.error(t("global.error"));
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
      setNewInviteLink(link);
      await fetchData();
      toast.success(t("pages.restaurant.collaborators.link_created"));
    } catch (error) {
      toast.error(t("pages.restaurant.collaborators.link_error"));
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(link);
    toast.success(t("pages.restaurant.collaborators.link_copied"));
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      await api.delete(`/restaurants/${id}/invitations/${invitationId}`);
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
      toast.success(t("pages.restaurant.collaborators.invitation_deleted"));
    } catch (error) {
      toast.error(t("global.error"));
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      await api.delete(`/restaurants/${id}/collaborators/${collaboratorId}`);
      setCollaborators((prev) => prev.filter((c) => c._id !== collaboratorId));
      toast.success(t("pages.restaurant.collaborators.removed"));
    } catch (error: any) {
      const errorKey = error.response?.data?.error;
      if (errorKey === "server.restaurants.errors.cannot_remove_last") {
        toast.error(t("pages.restaurant.collaborators.cannot_remove_last"));
      } else {
        toast.error(t("global.error"));
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
          <h1 className="text-3xl font-bold">{t("pages.restaurant.collaborators.page_title")}</h1>
          <p className="text-muted-foreground">{t("pages.restaurant.collaborators.page_subtitle")}</p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("pages.restaurant.collaborators.invite")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("pages.restaurant.collaborators.add_title")}</DialogTitle>
              <DialogDescription>{t("pages.restaurant.collaborators.add_description")}</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="search" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">
                  <Search className="h-4 w-4 mr-2" />
                  {t("pages.restaurant.collaborators.search_user")}
                </TabsTrigger>
                <TabsTrigger value="link">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {t("pages.restaurant.collaborators.invite_link")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("pages.restaurant.collaborators.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {isSearching && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.forename?.charAt(0)}
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.forename} {user.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => addCollaborator(user._id)} disabled={isAddingUser === user._id}>
                          {isAddingUser === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">{t("pages.restaurant.collaborators.no_results")}</p>
                )}
              </TabsContent>

              <TabsContent value="link" className="space-y-4 mt-4">
                <Button onClick={createInviteLink} disabled={isCreatingInvite} className="w-full">
                  {isCreatingInvite ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                  {isCreatingInvite ? t("pages.restaurant.collaborators.creating_link") : t("pages.restaurant.collaborators.create_link")}
                </Button>
                {newInviteLink && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {t("pages.restaurant.collaborators.link_ready")}
                    </p>
                    <div className="flex gap-2">
                      <Input value={newInviteLink} readOnly className="font-mono text-xs" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(newInviteLink);
                          toast.success(t("pages.restaurant.collaborators.link_copied"));
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setNewInviteLink(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                {t("global.buttons.cancel")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("pages.restaurant.collaborators.current")} ({collaborators.length})
          </CardTitle>
          <CardDescription>{t("pages.restaurant.collaborators.current_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {collaborators.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("pages.restaurant.collaborators.no_collaborators")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("pages.restaurant.collaborators.user")}</TableHead>
                  <TableHead>{t("pages.restaurant.collaborators.email")}</TableHead>
                  <TableHead>{t("pages.restaurant.collaborators.joined")}</TableHead>
                  <TableHead className="w-20">{t("pages.restaurant.collaborators.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborators.map((collab) => (
                  <TableRow key={collab._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collab.avatar} />
                          <AvatarFallback>
                            {collab.forename?.charAt(0)}
                            {collab.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {collab.forename} {collab.name}
                          </p>
                          <p className="text-sm text-muted-foreground">@{collab.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{collab.email}</TableCell>
                    <TableCell>{format(new Date(collab.createdAt), "dd MMM yyyy", { locale: fr })}</TableCell>
                    <TableCell>
                      {collaborators.length > 1 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("pages.restaurant.collaborators.remove_title")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("pages.restaurant.collaborators.remove_description", {
                                  name: `${collab.forename} ${collab.name}`,
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("global.buttons.cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeCollaborator(collab._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t("global.buttons.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("pages.restaurant.collaborators.pending")} ({invitations.length})
          </CardTitle>
          <CardDescription>{t("pages.restaurant.collaborators.pending_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("pages.restaurant.collaborators.no_invitations")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("pages.restaurant.collaborators.created_by")}</TableHead>
                  <TableHead>{t("pages.restaurant.collaborators.created_at")}</TableHead>
                  <TableHead>{t("pages.restaurant.collaborators.expires_at")}</TableHead>
                  <TableHead className="w-32">{t("pages.restaurant.collaborators.actions")}</TableHead>
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
    </div>
  );
};
