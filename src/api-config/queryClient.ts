import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Analitika jonli emas — oynaga qaytilganda qayta so'ralmaydi, davr filtri
      // o'zgarganda (query key) yangi so'rov ketadi.
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});
