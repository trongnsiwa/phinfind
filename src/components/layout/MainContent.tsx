'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { APP_ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMap = pathname === APP_ROUTES.MAP;

  useEffect(() => {
    if (isMap) {
      document.documentElement.classList.add('overflow-hidden');
      document.body.classList.add('overflow-hidden');
    } else {
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMap]);

  return (
    <main
      className={cn(
        'flex-1 w-full',
        isMap ? 'p-0 m-0 h-full overflow-hidden' : 'max-w-7xl mx-auto p-4 sm:p-6 pb-20 md:pb-8'
      )}
    >
      {children}
    </main>
  );
}
