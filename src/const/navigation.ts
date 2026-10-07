import type { IconType } from "react-icons";
import {
  LuBuilding2,
  LuFilter,
  LuGrid3X3,
  LuLayers,
  LuLayoutDashboard,
  LuMegaphone,
  LuPuzzle,
  LuTrendingUp,
  LuWallet,
} from "react-icons/lu";

// Matn emas, i18n kalit saqlanadi — t() render vaqtida chaqiriladi.
export const NAV_GROUPS = [
  {
    labelKey: "layout.nav.groups.main",
    items: [{ to: "/overview", labelKey: "layout.nav.overview", icon: LuLayoutDashboard }],
  },
  {
    labelKey: "layout.nav.groups.money",
    items: [
      { to: "/tariffs", labelKey: "layout.nav.tariffs", icon: LuLayers },
      { to: "/revenue", labelKey: "layout.nav.revenue", icon: LuWallet },
    ],
  },
  {
    labelKey: "layout.nav.groups.users",
    items: [
      { to: "/growth", labelKey: "layout.nav.growth", icon: LuTrendingUp },
      { to: "/funnel", labelKey: "layout.nav.funnel", icon: LuFilter },
      { to: "/retention", labelKey: "layout.nav.retention", icon: LuGrid3X3 },
      { to: "/channels", labelKey: "layout.nav.channels", icon: LuMegaphone },
    ],
  },
  {
    labelKey: "layout.nav.groups.product",
    items: [
      { to: "/feature-usage", labelKey: "layout.nav.featureUsage", icon: LuPuzzle },
      { to: "/organizations", labelKey: "layout.nav.organizations", icon: LuBuilding2 },
    ],
  },
] as const satisfies readonly {
  labelKey: string;
  items: readonly { to: string; labelKey: string; icon: IconType }[];
}[];
