'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface RecapSkeletonProps {
  includeActions?: boolean;
}

export function RecapSkeleton({ includeActions = true }: RecapSkeletonProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Preview Card Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-card dark:bg-[#1C120C] border border-amber-gold/30 dark:border-[#3A2A1E] shadow-card dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 sm:p-8">
        {/* Header: Title & Badge Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 dark:border-[#3A2A1E] pb-5">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl bg-amber-gold/15 dark:bg-[#C98B3B]/20 border border-amber-gold/30 dark:border-[#C98B3B]/40 shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded bg-muted/60" />
              <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 rounded-xl bg-muted/70" />
            </div>
          </div>
          <Skeleton className="h-7 w-28 rounded-full bg-amber-gold/15 dark:bg-[#C98B3B]/20 border border-amber-gold/30 dark:border-[#C98B3B]/40 shrink-0 self-start sm:self-auto" />
        </div>

        {/* Primary Stat Grid (2x3 on desktop, 1x2 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 my-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-[116px] sm:h-[124px]"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20 rounded bg-muted/60" />
                <Skeleton className="w-4 h-4 rounded-md bg-muted/60" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-7 sm:h-8 w-24 rounded-lg bg-muted/70" />
                <Skeleton className="h-2.5 w-32 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>

        {/* Special Spotlights (2 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-secondary/60 dark:bg-[#241810] border border-border dark:border-[#3A2A1E] rounded-2xl p-4 flex flex-col justify-between h-[128px] sm:h-[136px]"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28 rounded bg-muted/60" />
                <Skeleton className="h-5 w-40 rounded-lg bg-muted/70" />
                <Skeleton className="h-3 w-48 rounded bg-muted/50" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/80 dark:border-[#3A2A1E]">
                <Skeleton className="h-3.5 w-20 rounded bg-muted/50" />
                <Skeleton className="h-3.5 w-16 rounded bg-muted/60" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tagline */}
        <div className="flex items-center justify-between text-xs pt-4 border-t border-border dark:border-[#3A2A1E] mt-6">
          <Skeleton className="h-3.5 w-44 rounded bg-muted/50" />
          <Skeleton className="h-3.5 w-24 rounded bg-muted/60" />
        </div>
      </div>

      {/* Action Buttons Bar Skeleton */}
      {includeActions && (
        <div className="mt-8 flex flex-row items-center justify-center gap-3 flex-wrap">
          <Skeleton className="h-12 w-32 rounded-2xl bg-muted/60" />
          <Skeleton className="h-12 w-36 rounded-2xl bg-muted/60" />
        </div>
      )}
    </div>
  );
}
