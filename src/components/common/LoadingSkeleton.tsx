'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  size?: 'small' | 'medium' | 'large' | 'featured';
  className?: string;
}

export function CardSkeleton({ size = 'small', className }: CardSkeletonProps) {
  if (size === 'featured') {
    return (
      <Card className={cn("col-span-2 md:col-span-3 row-span-2 p-0 bg-gradient-to-br from-dark-roast via-[#25140d] to-dark-bg rounded-3xl border border-dark-border/80 shadow-md flex flex-col justify-between overflow-hidden", className)}>
        {/* 2-Column Gallery Skeleton Header */}
        <div className="w-full h-56 sm:h-64 p-1.5 flex gap-1.5 bg-dark-bg/60 border-b border-dark-border/60">
          <Skeleton className="w-[60%] h-full rounded-2xl bg-dark-roast/90 border border-dark-border/40" />
          <div className="w-[40%] h-full flex flex-col gap-1.5">
            <Skeleton className="h-1/2 rounded-xl bg-dark-roast/90 border border-dark-border/40" />
            <Skeleton className="h-1/2 rounded-xl bg-dark-roast/90 border border-dark-border/40" />
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-1/2 bg-dark-roast" />
            <Skeleton className="h-4 w-3/4 bg-dark-roast/60" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl bg-dark-roast/50" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <Skeleton className="h-7 rounded-lg bg-dark-roast/60" />
            <Skeleton className="h-7 rounded-lg bg-dark-roast/60" />
            <Skeleton className="h-7 rounded-lg bg-dark-roast/60" />
            <Skeleton className="h-7 rounded-lg bg-dark-roast/60" />
          </div>
          <div className="flex justify-end gap-2 pt-0.5">
            <Skeleton className="h-8 w-24 rounded-xl bg-dark-roast" />
            <Skeleton className="h-8 w-28 rounded-xl bg-amber-gold/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'large') {
    return (
      <Card className={cn("col-span-2 row-span-2 p-0 bg-gradient-to-b from-dark-roast via-[#25140d] to-dark-bg rounded-3xl border border-dark-border/80 shadow-md flex flex-col justify-between overflow-hidden", className)}>
        {/* 2-Column Gallery Skeleton Header */}
        <div className="w-full h-56 sm:h-64 p-1.5 flex gap-1.5 bg-dark-bg/60 border-b border-dark-border/60">
          <Skeleton className="w-[60%] h-full rounded-2xl bg-dark-roast/90 border border-dark-border/40" />
          <div className="w-[40%] h-full flex flex-col gap-1.5">
            <Skeleton className="h-1/2 rounded-xl bg-dark-roast/90 border border-dark-border/40" />
            <Skeleton className="h-1/2 rounded-xl bg-dark-roast/90 border border-dark-border/40" />
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-3/5 bg-dark-roast" />
            <Skeleton className="h-4 w-4/5 bg-dark-roast/60" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl bg-dark-roast/50" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <Skeleton className="h-7 rounded-lg bg-dark-roast/60" />
            <Skeleton className="h-7 rounded-lg bg-dark-roast/60" />
            <Skeleton className="h-7 rounded-lg bg-dark-roast/60" />
            <Skeleton className="h-7 rounded-lg bg-dark-roast/60" />
          </div>
          <div className="flex justify-end gap-2 pt-0.5">
            <Skeleton className="h-8 w-24 rounded-xl bg-dark-roast" />
            <Skeleton className="h-8 w-28 rounded-xl bg-amber-gold/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'medium') {
    return (
      <Card className={cn("col-span-2 row-span-1 p-3.5 bg-gradient-to-r from-dark-roast via-dark-roast/90 to-dark-bg rounded-3xl border border-dark-border/80 shadow-md flex gap-3.5 overflow-hidden", className)}>
        {/* Left 4:3 Image Skeleton */}
        <div className="w-[36%] sm:w-[34%] h-full rounded-2xl overflow-hidden bg-dark-roast/80 flex-shrink-0">
          <Skeleton className="w-full h-full rounded-2xl bg-dark-roast/90 border border-dark-border/40" />
        </div>

        {/* Right Stacked Content Skeleton */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-2/3 bg-dark-roast" />
            <Skeleton className="h-3.5 w-5/6 bg-dark-roast/60" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full bg-dark-roast" />
            <Skeleton className="h-5 w-16 rounded-full bg-dark-roast" />
            <Skeleton className="h-5 w-20 rounded-full bg-dark-roast" />
          </div>
          <div className="flex justify-end gap-2">
            <Skeleton className="h-7 w-20 rounded-xl bg-dark-roast" />
            <Skeleton className="h-7 w-24 rounded-xl bg-amber-gold/20" />
          </div>
        </div>
      </Card>
    );
  }

  // Default: Small Card Skeleton (col-span-1 row-span-1)
  return (
    <Card className={cn("col-span-1 row-span-1 p-3 bg-gradient-to-b from-dark-roast to-dark-bg/95 rounded-3xl border border-dark-border/80 shadow-md flex flex-col justify-between overflow-hidden", className)}>
      <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-dark-roast/80 flex-shrink-0">
        <Skeleton className="w-full h-full rounded-2xl bg-dark-roast/90 border border-dark-border/40" />
      </div>

      <CardHeader className="p-0 space-y-1 mt-2">
        <Skeleton className="h-4 w-3/4 bg-dark-roast" />
        <Skeleton className="h-3 w-1/2 bg-dark-roast/60" />
      </CardHeader>

      <CardContent className="p-0 flex items-center justify-between mt-2 pt-1 border-t border-dark-border/40">
        <Skeleton className="h-4 w-12 rounded-md bg-dark-roast" />
        <Skeleton className="h-6 w-14 rounded-xl bg-amber-gold/20" />
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 auto-rows-[255px] [grid-auto-flow:dense]">
      <CardSkeleton size="large" />
      <CardSkeleton size="small" />
      <CardSkeleton size="small" />
      <CardSkeleton size="medium" />
      <CardSkeleton size="small" />
      <CardSkeleton size="small" />
      <CardSkeleton size="small" />
      {count > 7 && <CardSkeleton size="small" />}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="w-full h-64 rounded-3xl overflow-hidden bg-dark-roast/80 border border-dark-border/60">
        <Skeleton className="w-full h-full bg-dark-roast/90" />
      </div>

      <Card className="p-6 bg-dark-bg text-cream-white rounded-3xl border border-dark-border/80 shadow-card space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-1/2 bg-dark-roast" />
          <Skeleton className="h-4 w-3/4 bg-dark-roast/60" />
        </div>
        <div className="h-px bg-dark-border/60" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full bg-dark-roast/60" />
          <Skeleton className="h-4 w-2/3 bg-dark-roast/60" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl bg-amber-gold/20" />
      </Card>
    </div>
  );
}
