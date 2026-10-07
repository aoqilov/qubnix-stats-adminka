import { api } from "./axiosInstance";
import { useSessionStore } from "@/store/session.store";
import i18n from "@/i18n";

api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Accept-Language"] = i18n.language;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useSessionStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);
