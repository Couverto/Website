import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";

export const useAxiosInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthUser } = useAuthContext();

  useEffect(() => {
    const interceptor = axiosConfig.interceptors.response.use(
      (response) => response,
      (error) => {
        const path = window.location.pathname;
        const requestUrl = error.config?.url;

        // Don't redirect if the 401 comes from the auth check itself
        if (requestUrl?.includes("/auth/me")) {
          return Promise.reject(error);
        }

        if (
          error.response?.status === 401 &&
          path !== "/" &&
          path !== "/login" &&
          path !== "/register" &&
          path !== "/register/google" &&
          path !== "/pro" &&
          !path.startsWith("/app")
        ) {
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
