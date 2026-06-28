import { type ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/query/queryClient';
import { AppRouter } from '@/core/router/AppRouter';
import { useThemeInit } from '@/core/store/useTheme';

export function Root(): ReactElement {
  useThemeInit();
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}
