import { useRoutes } from "react-router-dom";
import { useSessionStore } from "@/store/session.store";
import { CusLoader } from "@/components/ui/loader/CusLoader";
import FeatureLogin from "@/widgets/features/login/FeatureLogin";
import { adminRoutes } from "./routes";

/**
 * Auth gate: sessiya tekshirilayotganda — yuklanish, sessiya yo'q bo'lsa — butun router
 * o'rniga login. URL o'zgarmaydi, shuning uchun kirgandan keyin o'sha sahifa ochiladi.
 */
export function AppRoutes() {
  const status = useSessionStore((s) => s.status);
  const routes = useRoutes(adminRoutes);

  if (status === "authenticating") return <CusLoader fullScreen />;
  if (status !== "authenticated") return <FeatureLogin />;
  return routes;
}
