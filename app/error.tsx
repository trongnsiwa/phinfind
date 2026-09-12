'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/common/ErrorFallback';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AppError]', error);
    }
  }, [error]);

  return <ErrorFallback error={error} reset={reset} scope="main" />;
}
