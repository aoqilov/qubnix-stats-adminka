import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { organizationsApi } from "@/api/organizations/organizations.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { PeriodQuery } from "@/types/analytics";
import type { OrganizationsListParams } from "@/api/organizations/organizations.types";

export const ORGANIZATIONS_KEYS = {
  all: ["organizations"] as const,
  list: (params: OrganizationsListParams) => [...ORGANIZATIONS_KEYS.all, "list", params] as const,
  segments: (params: PeriodQuery) => [...ORGANIZATIONS_KEYS.all, "segments", params] as const,
};

/** Davr — global filtrdan; qidiruv, filtrlar, saralash va sahifa — sahifaning o'zidan. */
export function useOrganizationsList(filters: Omit<OrganizationsListParams, "from" | "to">) {
  const { from, to } = usePeriodQuery();
  const params: OrganizationsListParams = { from, to, ...filters };
  return useQuery({
    queryKey: ORGANIZATIONS_KEYS.list(params),
    queryFn: () => organizationsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrganizationSegments() {
  const params = usePeriodQuery();
  return useQuery({
    queryKey: ORGANIZATIONS_KEYS.segments(params),
    queryFn: () => organizationsApi.segments(params),
    placeholderData: keepPreviousData,
  });
}
