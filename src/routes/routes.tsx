import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import OverviewPage from "@/pages/OverviewPage";
import TariffsPage from "@/pages/TariffsPage";
import RevenuePage from "@/pages/RevenuePage";
import GrowthPage from "@/pages/GrowthPage";
import FunnelPage from "@/pages/FunnelPage";
import RetentionPage from "@/pages/RetentionPage";
import ChannelsPage from "@/pages/ChannelsPage";
import FeatureUsagePage from "@/pages/FeatureUsagePage";
import OrganizationsPage from "@/pages/OrganizationsPage";

// Yo'llar const/navigation.ts dagi sidebar bilan bir xil bo'lishi kerak.
export const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "tariffs", element: <TariffsPage /> },
      { path: "revenue", element: <RevenuePage /> },
      { path: "growth", element: <GrowthPage /> },
      { path: "funnel", element: <FunnelPage /> },
      { path: "retention", element: <RetentionPage /> },
      { path: "channels", element: <ChannelsPage /> },
      { path: "feature-usage", element: <FeatureUsagePage /> },
      { path: "organizations", element: <OrganizationsPage /> },
      { path: "*", element: <Navigate to="/overview" replace /> },
    ],
  },
];
