'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/common/ErrorFallback';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[auth]', error);
    }
  }, [error]);

  return <ErrorFallback error={error} reset={reset} scope="auth" variant="auth" />;
}
