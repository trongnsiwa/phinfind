import React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 auto-rows-[265px] sm:auto-rows-[275px] [grid-auto-flow:dense]',
        className
      )}
    >
      {children}
    </div>
  );
}
