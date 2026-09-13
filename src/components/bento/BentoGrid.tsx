import React from 'react';
import { cn } from '@/lib/utils';

// RESPONSIVE: 1-col on mobile (< md) -> 2-col on tablet portrait (md) -> 3-col tablet landscape (lg) -> 4-col desktop (xl).
// Mobile (< md) uses auto-rows-[124px] with default [grid-auto-flow:row] (no dense reordering on single-column feed).
// Standard cards span 1 row (fixed h-[112px] self-start); featured editorial hero cards span 3 rows (row-span-3, fits ~372-400px).
export const BENTO_GRID_CLASSES =
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-4 auto-rows-[124px] md:auto-rows-[260px] [grid-auto-flow:row] md:[grid-auto-flow:dense] max-md:[&>*]:!col-span-1';

export const GRID_CLASSES = BENTO_GRID_CLASSES;

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(BENTO_GRID_CLASSES, className)}>
      {children}
    </div>
  );
}
