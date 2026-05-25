import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min por defecto
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
