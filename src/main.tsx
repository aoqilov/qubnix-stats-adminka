import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api-config/queryClient";
import "./api-config/interceptors";
import "./i18n"; // App'dan oldin — birinchi render'dayoq tarjima tayyor bo'lsin.
import { restoreSession } from "./components/layout/session/restoreSession";
import App from "./App";
import "./styles/globals.css";

// Saqlangan token fon rejimida tekshiriladi — AppRoutes `status`ga qarab yuklanish/login/panelni ko'rsatadi.
void restoreSession();

const root = document.getElementById("root")!;
createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
