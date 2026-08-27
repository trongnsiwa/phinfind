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
      <Card className={cn("col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 p-0 bg-card rounded-2xl border border-border shadow-md flex flex-col justify-start overflow-hidden", className)}>
        {/* 2-Column Gallery Skeleton Header */}
        <div className="w-full flex-1 min-h-[200px] p-3.5 flex gap-2.5 bg-secondary/60 border-b border-border/60">
          <Skeleton className="w-[60%] h-full rounded-xl bg-secondary border border-border/40" />
          <div className="w-[40%] h-full flex flex-col gap-2.5">
            <Skeleton className="h-1/2 rounded-lg bg-secondary border border-border/40" />
            <Skeleton className="h-1/2 rounded-lg bg-secondary border border-border/40" />
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="flex-1 flex flex-col justify-start p-3 sm:p-3.5 space-y-1.5">
          <div className="space-y-1">
            <Skeleton className="h-4.5 w-1/2 bg-secondary" />
            <Skeleton className="h-3 w-3/4 bg-secondary/60" />
          </div>
          <Skeleton className="h-6 w-full rounded-xl bg-secondary/50" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <Skeleton className="h-5 rounded-lg bg-secondary/60" />
            <Skeleton className="h-5 rounded-lg bg-secondary/60" />
            <Skeleton className="h-5 rounded-lg bg-secondary/60" />
            <Skeleton className="h-5 rounded-lg bg-secondary/60" />
          </div>
          <div className="flex justify-end gap-2 mt-auto pt-1.5 border-t border-border/40">
            <Skeleton className="h-7 w-20 rounded-lg bg-secondary" />
            <Skeleton className="h-7 w-24 rounded-lg bg-amber-gold/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'large') {
    return (
      <Card className={cn("col-span-1 sm:col-span-2 row-span-2 p-0 bg-card rounded-2xl border border-border shadow-md flex flex-col justify-start overflow-hidden", className)}>
        {/* 2-Column Gallery Skeleton Header */}
        <div className="w-full flex-1 min-h-[190px] p-3.5 flex gap-2.5 bg-secondary/60 border-b border-border/60">
          <Skeleton className="w-[60%] h-full rounded-xl bg-secondary border border-border/40" />
          <div className="w-[40%] h-full flex flex-col gap-2.5">
            <Skeleton className="h-1/2 rounded-lg bg-secondary border border-border/40" />
            <Skeleton className="h-1/2 rounded-lg bg-secondary border border-border/40" />
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="flex-1 flex flex-col justify-start p-3 sm:p-3.5 space-y-1.5">
          <div className="space-y-1">
            <Skeleton className="h-4.5 w-3/5 bg-secondary" />
            <Skeleton className="h-3 w-4/5 bg-secondary/60" />
          </div>
          <Skeleton className="h-6 w-full rounded-xl bg-secondary/50" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <Skeleton className="h-5 rounded-lg bg-secondary/60" />
            <Skeleton className="h-5 rounded-lg bg-secondary/60" />
            <Skeleton className="h-5 rounded-lg bg-secondary/60" />
            <Skeleton className="h-5 rounded-lg bg-secondary/60" />
          </div>
          <div className="flex justify-end gap-2 mt-auto pt-1.5 border-t border-border/40">
            <Skeleton className="h-7 w-20 rounded-lg bg-secondary" />
            <Skeleton className="h-7 w-24 rounded-lg bg-amber-gold/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'medium') {
    return (
      <Card className={cn("col-span-1 sm:col-span-2 row-span-1 p-3 bg-card rounded-2xl border border-border shadow-md flex gap-3 overflow-hidden", className)}>
        {/* Left 4:3 Image Skeleton */}
        <div className="w-[36%] sm:w-[34%] h-full min-h-[130px] rounded-xl overflow-hidden bg-secondary/80 flex-shrink-0">
          <Skeleton className="w-full h-full rounded-xl bg-secondary border border-border/40" />
        </div>

        {/* Right Stacked Content Skeleton */}
        <div className="flex-1 flex flex-col justify-between py-0">
          <div className="space-y-1">
            <Skeleton className="h-4.5 w-2/3 bg-secondary" />
            <Skeleton className="h-3 w-5/6 bg-secondary/60" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-14 rounded-full bg-secondary" />
            <Skeleton className="h-4 w-14 rounded-full bg-secondary" />
          </div>
          <div className="flex justify-end gap-1.5">
            <Skeleton className="h-6.5 w-18 rounded-md bg-secondary" />
          </div>
        </div>
      </Card>
    );
  }

  // Default: Small Card Skeleton (col-span-1 row-span-1)
  return (
    <Card className={cn("col-span-1 row-span-1 p-2.5 sm:p-3 bg-card rounded-2xl border border-border shadow-md flex flex-col justify-between overflow-hidden", className)}>
      <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-secondary/80 flex-shrink-0">
        <Skeleton className="w-full h-full rounded-xl bg-secondary border border-border/40" />
      </div>

      <div className="flex-1 flex flex-col justify-between mt-1.5 min-h-0 space-y-0.5">
        <Skeleton className="h-3.5 w-3/4 bg-secondary" />
        <Skeleton className="h-2.5 w-1/2 bg-secondary/60" />
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <Skeleton className="h-3.5 w-10 rounded-md bg-secondary" />
          <Skeleton className="h-4 w-12 rounded-md bg-amber-gold/20" />
        </div>
      </div>
    </Card>
  );
}

export function ListSkeleton({ count = 12 }: { count?: number }) {
  const skeletonSizes: ('small' | 'medium' | 'large' | 'featured')[] = [
    'featured',
    'small',
    'small',
    'medium',
    'small',
    'large',
    'small',
    'small',
    'medium',
    'small',
    'large',
    'small',
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[260px] [grid-auto-flow:dense] transition-opacity duration-300 animate-in fade-in">
      {Array.from({ length: count }).map((_, index) => {
        const size = skeletonSizes[index % skeletonSizes.length];
        return <CardSkeleton key={index} size={size} />;
      })}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="w-full h-64 rounded-3xl overflow-hidden bg-secondary/80 border border-border/60">
        <Skeleton className="w-full h-full bg-secondary" />
      </div>

      <Card className="p-6 bg-card text-foreground rounded-3xl border border-border shadow-card space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-1/2 bg-secondary" />
          <Skeleton className="h-4 w-3/4 bg-secondary/60" />
        </div>
        <div className="h-px bg-border/60" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full bg-secondary/60" />
          <Skeleton className="h-4 w-2/3 bg-secondary/60" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl bg-amber-gold/20" />
      </Card>
    </div>
  );
}

export const SkeletonCard = CardSkeleton;
