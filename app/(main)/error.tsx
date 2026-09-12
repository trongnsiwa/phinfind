'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/common/ErrorFallback';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[main]', error);
    }
  }, [error]);

  return <ErrorFallback error={error} reset={reset} scope="main" />;
}
