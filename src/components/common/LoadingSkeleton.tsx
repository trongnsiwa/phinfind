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
      <Card className={cn("col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 p-0 bg-gradient-to-br from-[#141414] via-[#1A1A1A] to-[#101010] rounded-3xl border border-[#2A2A2A]/80 shadow-md flex flex-col justify-between overflow-hidden", className)}>
        {/* 2-Column Gallery Skeleton Header */}
        <div className="w-full h-52 sm:h-60 p-1.5 flex gap-1.5 bg-[#101010]/60 border-b border-[#2A2A2A]/60">
          <Skeleton className="w-[60%] h-full rounded-2xl bg-[#141414]/90 border border-[#2A2A2A]/40" />
          <div className="w-[40%] h-full flex flex-col gap-1.5">
            <Skeleton className="h-1/2 rounded-xl bg-[#141414]/90 border border-[#2A2A2A]/40" />
            <Skeleton className="h-1/2 rounded-xl bg-[#141414]/90 border border-[#2A2A2A]/40" />
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-1/2 bg-[#141414]" />
            <Skeleton className="h-4 w-3/4 bg-[#141414]/60" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl bg-[#141414]/50" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <Skeleton className="h-7 rounded-lg bg-[#141414]/60" />
            <Skeleton className="h-7 rounded-lg bg-[#141414]/60" />
            <Skeleton className="h-7 rounded-lg bg-[#141414]/60" />
            <Skeleton className="h-7 rounded-lg bg-[#141414]/60" />
          </div>
          <div className="flex justify-end gap-2 pt-0.5">
            <Skeleton className="h-8 w-24 rounded-xl bg-[#141414]" />
            <Skeleton className="h-8 w-28 rounded-xl bg-amber-gold/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'large') {
    return (
      <Card className={cn("col-span-1 sm:col-span-2 row-span-2 p-0 bg-gradient-to-b from-[#141414] via-[#1A1A1A] to-[#101010] rounded-3xl border border-[#2A2A2A]/80 shadow-md flex flex-col justify-between overflow-hidden", className)}>
        {/* 2-Column Gallery Skeleton Header */}
        <div className="w-full h-52 sm:h-60 p-1.5 flex gap-1.5 bg-[#101010]/60 border-b border-[#2A2A2A]/60">
          <Skeleton className="w-[60%] h-full rounded-2xl bg-[#141414]/90 border border-[#2A2A2A]/40" />
          <div className="w-[40%] h-full flex flex-col gap-1.5">
            <Skeleton className="h-1/2 rounded-xl bg-[#141414]/90 border border-[#2A2A2A]/40" />
            <Skeleton className="h-1/2 rounded-xl bg-[#141414]/90 border border-[#2A2A2A]/40" />
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-3/5 bg-[#141414]" />
            <Skeleton className="h-4 w-4/5 bg-[#141414]/60" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl bg-[#141414]/50" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <Skeleton className="h-7 rounded-lg bg-[#141414]/60" />
            <Skeleton className="h-7 rounded-lg bg-[#141414]/60" />
            <Skeleton className="h-7 rounded-lg bg-[#141414]/60" />
            <Skeleton className="h-7 rounded-lg bg-[#141414]/60" />
          </div>
          <div className="flex justify-end gap-2 pt-0.5">
            <Skeleton className="h-8 w-24 rounded-xl bg-[#141414]" />
            <Skeleton className="h-8 w-28 rounded-xl bg-amber-gold/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'medium') {
    return (
      <Card className={cn("col-span-1 sm:col-span-2 row-span-1 p-3.5 bg-gradient-to-r from-[#141414] via-[#141414]/90 to-[#101010] rounded-3xl border border-[#2A2A2A]/80 shadow-md flex gap-3.5 overflow-hidden", className)}>
        {/* Left 4:3 Image Skeleton */}
        <div className="w-[36%] sm:w-[34%] h-full min-h-[130px] rounded-2xl overflow-hidden bg-[#141414]/80 flex-shrink-0">
          <Skeleton className="w-full h-full rounded-2xl bg-[#141414]/90 border border-[#2A2A2A]/40" />
        </div>

        {/* Right Stacked Content Skeleton */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-2/3 bg-[#141414]" />
            <Skeleton className="h-3.5 w-5/6 bg-[#141414]/60" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full bg-[#141414]" />
            <Skeleton className="h-5 w-16 rounded-full bg-[#141414]" />
            <Skeleton className="h-5 w-20 rounded-full bg-[#141414]" />
          </div>
          <div className="flex justify-end gap-2">
            <Skeleton className="h-7 w-20 rounded-xl bg-[#141414]" />
            <Skeleton className="h-7 w-24 rounded-xl bg-amber-gold/20" />
          </div>
        </div>
      </Card>
    );
  }

  // Default: Small Card Skeleton (col-span-1 row-span-1)
  return (
    <Card className={cn("col-span-1 row-span-1 p-3 bg-gradient-to-b from-[#141414] to-[#101010]/95 rounded-3xl border border-[#2A2A2A]/80 shadow-md flex flex-col justify-between overflow-hidden", className)}>
      <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-[#141414]/80 flex-shrink-0">
        <Skeleton className="w-full h-full rounded-2xl bg-[#141414]/90 border border-[#2A2A2A]/40" />
      </div>

      <CardHeader className="p-0 space-y-1 mt-2">
        <Skeleton className="h-4 w-3/4 bg-[#141414]" />
        <Skeleton className="h-3 w-1/2 bg-[#141414]/60" />
      </CardHeader>

      <CardContent className="p-0 flex items-center justify-between mt-2 pt-1 border-t border-[#2A2A2A]/40">
        <Skeleton className="h-4 w-12 rounded-md bg-[#141414]" />
        <Skeleton className="h-6 w-14 rounded-xl bg-amber-gold/20" />
      </CardContent>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 auto-rows-[270px] [grid-auto-flow:dense] transition-opacity duration-300 animate-in fade-in">
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
      <div className="w-full h-64 rounded-3xl overflow-hidden bg-[#141414]/80 border border-[#2A2A2A]/60">
        <Skeleton className="w-full h-full bg-[#141414]/90" />
      </div>

      <Card className="p-6 bg-[#101010] text-white rounded-3xl border border-[#2A2A2A]/80 shadow-card space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-1/2 bg-[#141414]" />
          <Skeleton className="h-4 w-3/4 bg-[#141414]/60" />
        </div>
        <div className="h-px bg-[#2A2A2A]/60" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full bg-[#141414]/60" />
          <Skeleton className="h-4 w-2/3 bg-[#141414]/60" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl bg-amber-gold/20" />
      </Card>
    </div>
  );
}

export const SkeletonCard = CardSkeleton;
