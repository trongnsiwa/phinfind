'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { APP_ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';
import { closeActiveShop } from '@/stores/useShopStore';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMap = pathname === APP_ROUTES.MAP;
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (!pathname?.startsWith('/shop/')) {
        closeActiveShop({ clearUrl: true });
      }
    }
  }, [pathname]);

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
        isMap
          ? 'p-0 m-0 h-full overflow-hidden'
          // RESPONSIVE: uniform vertical rhythm below the sticky header.
          : 'max-w-3xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-24 md:pb-10'
      )}
    >
      {children}
    </main>
  );
}
