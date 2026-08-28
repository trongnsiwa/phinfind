'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getShopPlaceholderIllustration } from '@/lib/utils/placeholders';

interface ShopCardPlaceholderProps {
  shopId?: string;
  shopName?: string;
  className?: string;
  size?: number | string;
}

export function ShopCardPlaceholder({
  shopId,
  shopName,
  className,
}: ShopCardPlaceholderProps) {
  const illustrationSrc = getShopPlaceholderIllustration(shopId || shopName);

  return (
    <div
      className={cn(
        'relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-secondary/90 via-secondary/70 to-card/95 p-3.5 sm:p-4 overflow-hidden select-none',
        className
      )}
    >
      {/* Ambient background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(212,160,87,0.16),transparent_70%)] pointer-events-none" />

      {/* Vector Illustration */}
      <img
        src={illustrationSrc}
        alt={shopName || 'Coffee Shop'}
        className="w-full h-full max-h-[88%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform duration-500 ease-out"
        loading="lazy"
      />
    </div>
  );
}
