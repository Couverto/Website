import { useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useAuthContext } from "../contexts/authContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  const logout = async () => {
    setLoading(true);
    try {
      const response = await axiosConfig.get("/auth/logout");
      localStorage.removeItem("accessToken");
      setAuthUser(null);
      navigate("/");
      toast.success(response.data.message || "Déconnexion réussie");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la déconnexion");
    } finally {
      setLoading(false);
    }
  };
  return { loading, logout };
};
