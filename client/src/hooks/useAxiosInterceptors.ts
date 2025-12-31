import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/authContext";

export const useAxiosInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { setAuthUser } = useAuthContext();

  useEffect(() => {
    const interceptor = axiosConfig.interceptors.response.use(
      (response) => response,
      (error) => {
        const path = window.location.pathname;
        if (error.response?.status === 401 && path !== "/" && path !== "/login" && path !== "/register" && !path.startsWith("/app")) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosConfig.interceptors.response.eject(interceptor);
    };
  }, [navigate, location]);
};
