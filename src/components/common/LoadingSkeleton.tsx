'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  size?: 'small' | 'medium' | 'large' | 'featured';
  className?: string;
}

export function CardSkeleton({ size = 'small', className }: CardSkeletonProps) {
  if (size === 'featured') {
    return (
      <Card
        className={cn(
          'col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 p-0 bg-card rounded-2xl border border-border shadow-md flex flex-col justify-start overflow-hidden',
          className
        )}
      >
        {/* 2-Column Gallery Skeleton Header */}
        <div className='w-full flex-1 min-h-[200px] p-3.5 flex gap-2.5 bg-secondary/60 border-b border-border/60'>
          <Skeleton className='w-[60%] h-full rounded-xl bg-secondary border border-border/40' />
          <div className='w-[40%] h-full flex flex-col gap-2.5'>
            <Skeleton className='h-1/2 rounded-lg bg-secondary border border-border/40' />
            <Skeleton className='h-1/2 rounded-lg bg-secondary border border-border/40' />
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className='flex-1 flex flex-col justify-start p-3 sm:p-3.5 space-y-1.5'>
          <div className='space-y-1'>
            <Skeleton className='h-4.5 w-1/2 bg-secondary' />
            <Skeleton className='h-3 w-3/4 bg-secondary/60' />
          </div>
          <Skeleton className='h-6 w-full rounded-xl bg-secondary/50' />
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-1'>
            <Skeleton className='h-5 rounded-lg bg-secondary/60' />
            <Skeleton className='h-5 rounded-lg bg-secondary/60' />
            <Skeleton className='h-5 rounded-lg bg-secondary/60' />
            <Skeleton className='h-5 rounded-lg bg-secondary/60' />
          </div>
          <div className='flex justify-end gap-2 mt-auto pt-1.5 border-t border-border/40'>
            <Skeleton className='h-7 w-20 rounded-lg bg-secondary' />
            <Skeleton className='h-7 w-24 rounded-lg bg-amber-gold/20' />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'large') {
    return (
      <Card
        className={cn(
          'col-span-1 sm:col-span-2 row-span-2 p-0 bg-card rounded-2xl border border-border shadow-md flex flex-col justify-start overflow-hidden',
          className
        )}
      >
        {/* 2-Column Gallery Skeleton Header */}
        <div className='w-full flex-1 min-h-[190px] p-3.5 flex gap-2.5 bg-secondary/60 border-b border-border/60'>
          <Skeleton className='w-[60%] h-full rounded-xl bg-secondary border border-border/40' />
          <div className='w-[40%] h-full flex flex-col gap-2.5'>
            <Skeleton className='h-1/2 rounded-lg bg-secondary border border-border/40' />
            <Skeleton className='h-1/2 rounded-lg bg-secondary border border-border/40' />
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className='flex-1 flex flex-col justify-start p-3 sm:p-3.5 space-y-1.5'>
          <div className='space-y-1'>
            <Skeleton className='h-4.5 w-3/5 bg-secondary' />
            <Skeleton className='h-3 w-4/5 bg-secondary/60' />
          </div>
          <Skeleton className='h-6 w-full rounded-xl bg-secondary/50' />
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-1'>
            <Skeleton className='h-5 rounded-lg bg-secondary/60' />
            <Skeleton className='h-5 rounded-lg bg-secondary/60' />
            <Skeleton className='h-5 rounded-lg bg-secondary/60' />
            <Skeleton className='h-5 rounded-lg bg-secondary/60' />
          </div>
          <div className='flex justify-end gap-2 mt-auto pt-1.5 border-t border-border/40'>
            <Skeleton className='h-7 w-20 rounded-lg bg-secondary' />
            <Skeleton className='h-7 w-24 rounded-lg bg-amber-gold/20' />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'medium') {
    return (
      <Card
        className={cn(
          'col-span-1 sm:col-span-2 row-span-1 p-3 bg-card rounded-2xl border border-border shadow-md flex gap-3 overflow-hidden',
          className
        )}
      >
        {/* Left 4:3 Image Skeleton */}
        <div className='w-[36%] sm:w-[34%] h-full min-h-[130px] rounded-xl overflow-hidden bg-secondary/80 flex-shrink-0'>
          <Skeleton className='w-full h-full rounded-xl bg-secondary border border-border/40' />
        </div>

        {/* Right Stacked Content Skeleton */}
        <div className='flex-1 flex flex-col justify-between py-0'>
          <div className='space-y-1'>
            <Skeleton className='h-4.5 w-2/3 bg-secondary' />
            <Skeleton className='h-3 w-5/6 bg-secondary/60' />
          </div>
          <div className='flex items-center gap-1.5'>
            <Skeleton className='h-4 w-14 rounded-full bg-secondary' />
            <Skeleton className='h-4 w-14 rounded-full bg-secondary' />
          </div>
          <div className='flex justify-end gap-1.5'>
            <Skeleton className='h-6.5 w-18 rounded-md bg-secondary' />
          </div>
        </div>
      </Card>
    );
  }

  // Default: Small Card Skeleton (col-span-1 row-span-1)
  return (
    <Card
      className={cn(
        'col-span-1 row-span-1 p-2.5 sm:p-3 bg-card rounded-2xl border border-border shadow-md flex flex-col justify-between overflow-hidden',
        className
      )}
    >
      <div className='relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-secondary/80 flex-shrink-0'>
        <Skeleton className='w-full h-full rounded-xl bg-secondary border border-border/40' />
      </div>

      <div className='flex-1 flex flex-col justify-between mt-1.5 min-h-0 space-y-0.5'>
        <Skeleton className='h-3.5 w-3/4 bg-secondary' />
        <Skeleton className='h-2.5 w-1/2 bg-secondary/60' />
        <div className='flex items-center justify-between pt-1 border-t border-border/40'>
          <Skeleton className='h-3.5 w-10 rounded-md bg-secondary' />
          <Skeleton className='h-4 w-12 rounded-md bg-amber-gold/20' />
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
    'small'
  ];

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[260px] [grid-auto-flow:dense] transition-opacity duration-300 animate-in fade-in'>
      {Array.from({ length: count }).map((_, index) => {
        const size = skeletonSizes[index % skeletonSizes.length];
        return <CardSkeleton key={index} size={size} />;
      })}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className='relative min-h-screen text-foreground animate-in fade-in duration-200'>
      {/* 2. Main Full-Page Container with Card Wrapper */}
      <div className='max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-24 sm:pb-28'>
        <Card className='bg-card text-card-foreground rounded-3xl border border-border/80 shadow-card p-4 sm:p-5 space-y-4 sm:space-y-5'>
          {/* Gallery Hero Collage Skeleton */}
          <div className='relative w-full h-44 sm:h-56 lg:h-64 rounded-2xl overflow-hidden bg-secondary/60 border border-border/60 shadow-xs'>
            <Skeleton className='w-full h-full bg-secondary/80' />
            <div className='absolute bottom-3 left-3'>
              <Skeleton className='h-6 w-36 rounded-lg bg-card/70 border border-border/40 backdrop-blur-xs' />
            </div>
          </div>

          {/* Shop Title, Address & Badges */}
          <div className='space-y-2.5 pt-1'>
            <Skeleton className='h-7 sm:h-8 w-3/5 sm:w-2/5 rounded-xl bg-secondary' />
            <div className='flex items-center gap-1.5'>
              <Skeleton className='h-4 w-4 rounded-full bg-secondary/80 shrink-0' />
              <Skeleton className='h-4 w-4/5 sm:w-1/2 rounded-md bg-secondary/70' />
            </div>
            <div className='flex flex-wrap items-center gap-1.5 pt-1'>
              <Skeleton className='h-6 w-14 rounded-full bg-secondary' />
              <Skeleton className='h-6 w-18 rounded-full bg-secondary' />
              <Skeleton className='h-6 w-24 rounded-full bg-secondary' />
            </div>
          </div>

          {/* 4 Skeleton Navigation Tabs (Tổng quan, Hình ảnh, Đánh giá, Tiện ích) */}
          <div className='pt-2 border-b border-border/60'>
            <div className='flex items-center justify-between gap-3 pb-2'>
              <Skeleton className='h-6 w-20 rounded-lg bg-amber-gold/25' />
              <Skeleton className='h-6 w-20 rounded-lg bg-secondary/60' />
              <Skeleton className='h-6 w-20 rounded-lg bg-secondary/60' />
              <Skeleton className='h-6 w-20 rounded-lg bg-secondary/60' />
            </div>
          </div>

          {/* Active Tab Content Area Placeholders */}
          <div className='space-y-4 pt-1'>
            {/* Features & Amenities Chips */}
            <div className='space-y-2'>
              <Skeleton className='h-3.5 w-32 rounded-md bg-secondary/70' />
              <div className='flex flex-wrap gap-2'>
                <Skeleton className='h-7 w-24 rounded-full bg-secondary/80' />
                <Skeleton className='h-7 w-28 rounded-full bg-secondary/80' />
                <Skeleton className='h-7 w-20 rounded-full bg-secondary/80' />
              </div>
            </div>

            {/* Community Rating Summary Card */}
            <div className='p-3.5 rounded-2xl bg-secondary/40 border border-border/60 flex items-center justify-between shadow-xs'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-12 rounded-xl bg-secondary' />
                <div className='space-y-1.5'>
                  <Skeleton className='h-4 w-36 rounded-md bg-secondary' />
                  <Skeleton className='h-3 w-48 rounded-md bg-secondary/60' />
                </div>
              </div>
              <Skeleton className='h-3 w-28 rounded-md bg-secondary/50' />
            </div>

            {/* Opening Hours & Contact Card */}
            <div className='p-3.5 rounded-2xl bg-secondary/40 border border-border/60 space-y-2.5 shadow-xs'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <Skeleton className='h-8 w-8 rounded-full bg-secondary' />
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-28 rounded-md bg-secondary' />
                    <Skeleton className='h-3 w-44 rounded-md bg-secondary/60' />
                  </div>
                </div>
                <Skeleton className='h-6 w-20 rounded-lg bg-secondary/60' />
              </div>
              <div className='pt-2 border-t border-border/40 flex items-center gap-2'>
                <Skeleton className='h-3.5 w-3.5 rounded-full bg-secondary/60' />
                <Skeleton className='h-3.5 w-32 rounded-md bg-secondary/70' />
              </div>
            </div>

            {/* Shop Address Card */}
            <div className='p-3.5 rounded-2xl bg-secondary/40 border border-border/60 space-y-3 shadow-xs'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1 flex-1'>
                  <Skeleton className='h-3 w-24 rounded-md bg-secondary/60' />
                  <Skeleton className='h-4 w-4/5 rounded-md bg-secondary' />
                </div>
                <Skeleton className='h-7 w-7 rounded-lg bg-secondary/60' />
              </div>
              <div className='grid grid-cols-2 gap-2 pt-1'>
                <Skeleton className='h-12 rounded-xl bg-secondary/50' />
                <Skeleton className='h-12 rounded-xl bg-secondary/50' />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Fixed Bottom Action Bar Skeleton with 4 Button Actions */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border px-3 sm:px-4 py-2.5 sm:py-3 shadow-2xl select-none pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
        <div className='max-w-3xl lg:max-w-4xl mx-auto grid grid-cols-4 gap-2 sm:gap-3'>
          {/* Back Action */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-secondary border border-border/60' />
          {/* Directions Action (Amber highlight) */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-amber-gold/30 border border-amber-gold/40' />
          {/* Favorite Action */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-secondary border border-border/60' />
          {/* Share Action */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-secondary border border-border/60' />
        </div>
      </div>
    </div>
  );
}

export const SkeletonCard = CardSkeleton;
