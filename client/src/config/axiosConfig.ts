import axios from "axios";

export const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Fired when the API runs in configuration-error mode (see ServerConfigError)
export const SERVER_MISCONFIGURED_EVENT = "server-misconfigured";

axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 503 && error.response.data?.code === "SERVER_MISCONFIGURED") {
      window.dispatchEvent(new CustomEvent(SERVER_MISCONFIGURED_EVENT, { detail: error.response.data }));
    }
    return Promise.reject(error);
  },
);
