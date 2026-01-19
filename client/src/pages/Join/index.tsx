import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react";
import { useAuthContext } from "@/contexts/authContext";

interface InvitationInfo {
  restaurant: {
    _id: string;
    name: string;
    coverImage?: string;
    city: string;
  };
  createdBy: {
    name: string;
    forename: string;
  };
}

export const JoinRestaurant = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [joinedRestaurantId, setJoinedRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await api.get(`/restaurants/invitations/${token}`);
        setInvitation(response.data.invitation);
      } catch (err: any) {
        const errorKey = err.response?.data?.error;
        if (errorKey === "server.invitations.errors.not_found") {
          setError("not_found");
        } else if (errorKey === "server.invitations.errors.expired") {
          setError("expired");
        } else if (errorKey === "server.invitations.errors.already_used") {
          setError("already_used");
        } else {
          setError("unknown");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!authUser) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/join/${token}`);
      return;
    }

    setAccepting(true);
    try {
      const response = await api.post(`/restaurants/invitations/${token}/accept`);
      setSuccess(true);
      setJoinedRestaurantId(response.data.restaurant._id);
    } catch (err: any) {
      const errorKey = err.response?.data?.error;
      if (errorKey === "server.invitations.errors.already_collaborator") {
        setError("already_collaborator");
      } else {
        setError("accept_failed");
      }
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>{t(`pages.join.errors.${error}_title`)}</CardTitle>
            <CardDescription>{t(`pages.join.errors.${error}_description`)}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} variant="outline">
              {t("pages.join.back_home")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>{t("pages.join.success_title")}</CardTitle>
            <CardDescription>{t("pages.join.success_description", { name: invitation?.restaurant.name })}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate(`/restaurant/${joinedRestaurantId}/dashboard`)}>{t("pages.join.go_to_dashboard")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{t("pages.join.title")}</CardTitle>
          <CardDescription>{t("pages.join.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Restaurant Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            {invitation?.restaurant.coverImage ? (
              <img src={invitation.restaurant.coverImage} alt={invitation.restaurant.name} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">{invitation?.restaurant.name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{invitation?.restaurant.name}</h3>
              <p className="text-sm text-muted-foreground">{invitation?.restaurant.city}</p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t("pages.join.invited_by", {
              name: `${invitation?.createdBy.forename} ${invitation?.createdBy.name}`,
            })}
          </p>

          <div className="flex flex-col gap-2">
            <Button onClick={handleAccept} disabled={accepting} className="w-full">
              {accepting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {authUser ? t("pages.join.accept") : t("pages.join.login_to_accept")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              {t("pages.join.decline")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
