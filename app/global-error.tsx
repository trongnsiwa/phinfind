'use client';

import { useEffect } from 'react';
import '@/app/globals.css';
import { ErrorFallback } from '@/components/common/ErrorFallback';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[root]', error);
    }
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ErrorFallback error={error} reset={reset} scope="root" variant="app" />
      </body>
    </html>
  );
}
