'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { invalidateShopQueries } from '@/hooks/useShops';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const MIGRATION_KEY = 'phinfind_slug_migration_v1';
    if (!localStorage.getItem(MIGRATION_KEY)) {
      invalidateShopQueries(queryClient);
      localStorage.setItem(MIGRATION_KEY, 'true');
    }
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
