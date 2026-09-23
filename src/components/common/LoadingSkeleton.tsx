'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BENTO_GRID_CLASSES } from '@/components/bento/BentoGrid';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CardSkeletonProps {
  size?: 'small' | 'medium' | 'large' | 'featured';
  className?: string;
}

export function CardSkeleton({ size = 'small', className }: CardSkeletonProps) {
  if (size === 'featured') {
    return (
      <Card
        className={cn(
          // RESPONSIVE: col-span-1 row-span-3 on mobile (< md); md:col-span-2 lg:col-span-3 md:row-span-2 on md+
          'col-span-1 row-span-3 md:col-span-2 lg:col-span-3 md:row-span-2 p-2.5 xs:p-3 md:p-0 bg-card rounded-2xl border border-border shadow-md flex flex-col justify-between overflow-hidden',
          className
        )}
      >
        {/* Mobile Header: Single Hero Image */}
        <div className='block md:hidden relative w-full aspect-[16/10] max-h-36 xs:max-h-40 rounded-2xl overflow-hidden bg-secondary flex-shrink-0 border border-border/40'>
          <Skeleton className='w-full h-full bg-secondary' />
        </div>

        {/* Desktop Header: 2-Column Gallery Skeleton Header */}
        <div className='hidden md:flex w-full aspect-[16/10] md:aspect-[16/9] p-2.5 sm:p-3.5 gap-2.5 bg-secondary/60 border-b border-border/60 flex-shrink-0'>
          <Skeleton className='w-[60%] h-full rounded-xl bg-secondary border border-border/40' />
          <div className='w-[40%] h-full flex flex-col gap-2.5'>
            <Skeleton className='h-1/2 rounded-lg bg-secondary border border-border/40' />
            <Skeleton className='h-1/2 rounded-lg bg-secondary border border-border/40' />
          </div>
        </div>

        {/* Mobile Content Skeleton (below image) */}
        <div className='flex md:hidden flex-1 min-h-0 flex-col justify-between p-3.5 pt-2 pb-0 space-y-2'>
          <div className='space-y-1'>
            <Skeleton className='h-3 w-28 bg-amber-gold/20 rounded' />
            <Skeleton className='h-5 w-3/5 bg-secondary' />
            <Skeleton className='h-3.5 w-4/5 bg-secondary/60' />
            <div className='flex items-center gap-1.5 pt-0.5'>
              <Skeleton className='h-3.5 w-12 rounded bg-secondary' />
              <Skeleton className='h-3.5 w-16 rounded bg-secondary/60' />
              <Skeleton className='h-3.5 w-16 rounded bg-secondary/60' />
            </div>
          </div>
          <Skeleton className='h-9 w-full rounded-r-lg bg-secondary/50' />
          <div className='flex items-center gap-2 pt-1 border-t border-border/40'>
            <Skeleton className='h-9 flex-1 rounded-xl bg-secondary' />
            <Skeleton className='h-9 flex-1 rounded-xl bg-amber-gold/20' />
          </div>
        </div>

        {/* Desktop Content Skeleton */}
        <CardContent className='hidden md:flex flex-1 flex-col justify-start p-3 sm:p-3.5 space-y-1.5'>
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
          // RESPONSIVE: col-span-1 at base; md:col-span-2 md:row-span-2 on md+
          'col-span-1 md:col-span-2 md:row-span-2 p-0 bg-card rounded-2xl border border-border shadow-md flex flex-col justify-start overflow-hidden',
          className
        )}
      >
        {/* 2-Column Gallery Skeleton Header - fixed aspect ratio */}
        <div className='w-full aspect-[16/10] md:aspect-[16/9] p-2.5 sm:p-3.5 flex gap-2.5 bg-secondary/60 border-b border-border/60 flex-shrink-0'>
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
          // RESPONSIVE: col-span-1 at base; md:col-span-2 row-span-1 on md+
          'col-span-1 md:col-span-2 row-span-1 p-2.5 sm:p-3 bg-card rounded-2xl border border-border shadow-md flex gap-2.5 sm:gap-3 overflow-hidden',
          className
        )}
      >
        {/* Left Media Container Skeleton */}
        <div className='w-[30%] md:w-[34%] h-full rounded-xl overflow-hidden bg-secondary/80 flex-shrink-0'>
          <Skeleton className='w-full h-full rounded-xl bg-secondary border border-border/40' />
        </div>

        {/* Right Stacked Content Skeleton */}
        <div className='flex-1 min-h-0 overflow-hidden flex flex-col justify-between py-0'>
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
        // RESPONSIVE: Fixed height h-[112px] self-start on mobile (< md) matching ShopCardSmall, vertical card on md+
        'col-span-1 row-span-1 h-[112px] md:h-full self-start md:self-auto p-0 md:p-3.5 lg:p-4 bg-card rounded-2xl border border-border shadow-md flex flex-row md:flex-col justify-between overflow-hidden gap-0',
        className
      )}
    >
      <div className='relative h-full w-28 md:w-full md:h-28 md:aspect-auto rounded-none md:rounded-xl overflow-hidden bg-secondary/80 flex-shrink-0 border-r md:border-r-0 border-border/40'>
        <Skeleton className='w-full h-full bg-secondary' />
      </div>

      <div className='flex-1 min-w-0 h-full overflow-hidden flex flex-col justify-between pl-2.5 pr-2.5 py-2 md:p-0 md:mt-1.5 space-y-0.5'>
        <div className='space-y-0.5 min-w-0'>
          <Skeleton className='h-3.5 w-3/4 bg-secondary' />
          <Skeleton className='h-2.5 w-1/2 bg-secondary/60' />
        </div>
        {/* Mobile meta skeleton */}
        <div className='flex md:hidden items-center gap-1 text-[11px] pt-0.5'>
          <Skeleton className='h-3 w-10 rounded bg-secondary' />
          <Skeleton className='h-3 w-12 rounded bg-secondary/60' />
        </div>
        {/* Mobile status pill skeleton */}
        <div className='flex md:hidden items-center'>
          <Skeleton className='h-4 w-16 rounded-full bg-secondary/60' />
        </div>
        {/* Tablet/Desktop meta skeleton */}
        <div className='hidden md:flex items-center justify-between pt-1 border-t border-border/40'>
          <Skeleton className='h-3.5 w-10 rounded-md bg-secondary' />
          <Skeleton className='h-4 w-12 rounded-md bg-amber-gold/20' />
        </div>
      </div>
    </Card>
  );
}

export function ListSkeleton({ count = 12 }: { count?: number }) {
  // RESPONSIVE: Gate skeleton layout based on viewport to match ShopCardSmall / ShopCardFeaturedMobile behavior
  const isTabletOrLarger = useMediaQuery('(min-width: 768px)');
  const desktopSkeletonSizes: ('small' | 'medium' | 'large' | 'featured')[] = [
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
  // RESPONSIVE: Repeating pattern of 3 standard + 1 featured skeletons matching real mobile feed
  const mobileSkeletonSizes: ('small' | 'featured')[] = ['small', 'small', 'small', 'featured'];

  return (
    // RESPONSIVE: Shares exact BENTO_GRID_CLASSES with BentoGrid for zero layout shift
    <div className={cn(BENTO_GRID_CLASSES, 'transition-opacity duration-300 animate-in fade-in')}>
      {Array.from({ length: count }).map((_, index) => {
        // RESPONSIVE: 3 standard + 1 featured on mobile (< md), full bento variety on tablet/desktop (md+)
        const size = isTabletOrLarger
          ? desktopSkeletonSizes[index % desktopSkeletonSizes.length]
          : mobileSkeletonSizes[index % mobileSkeletonSizes.length];
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

          {/* 5 Skeleton Navigation Tabs (Tổng quan, Hình ảnh, Đánh giá, Tiện ích, Video) */}
          <div className='pt-2 border-b border-border/60'>
            <div className='flex items-center justify-between gap-1.5 sm:gap-2 pb-2'>
              <Skeleton className='h-6 flex-1 rounded-lg bg-amber-gold/25' />
              <Skeleton className='h-6 flex-1 rounded-lg bg-secondary/60' />
              <Skeleton className='h-6 flex-1 rounded-lg bg-secondary/60' />
              <Skeleton className='h-6 flex-1 rounded-lg bg-secondary/60' />
              <Skeleton className='h-6 flex-1 rounded-lg bg-secondary/60' />
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

      {/* 3. Fixed Bottom Action Bar Skeleton with 5 Button Actions */}
      {/* RESPONSIVE: Mirrors ShopDetailClient 5-action grid layout and safe-area padding */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border px-2 sm:px-4 py-2.5 sm:py-3 shadow-2xl select-none pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
        <div className='max-w-3xl lg:max-w-4xl mx-auto grid grid-cols-5 gap-1 sm:gap-2.5'>
          {/* Back Action */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-secondary border border-border/60' />
          {/* Directions Action (Amber highlight) */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-amber-gold/30 border border-amber-gold/40' />
          {/* Favorite Action */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-secondary border border-border/60' />
          {/* Visited Action */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-secondary border border-border/60' />
          {/* Share Action */}
          <Skeleton className='h-10 sm:h-11 rounded-full bg-secondary border border-border/60' />
        </div>
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <Card className="p-4 sm:p-5 bg-card border border-border shadow-card rounded-2xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <Skeleton className="h-4 w-40 rounded-md bg-muted/60" />
          <Skeleton className="h-3 w-60 rounded-md bg-muted/60" />
          <Skeleton className="h-3 w-32 rounded-md bg-muted/60" />
        </div>
        <Skeleton className="h-4 w-12 rounded-md bg-muted/60" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl bg-muted/60" />
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16 animate-in fade-in duration-200">
      {/* 1. Header Skeleton (Unified Card) */}
      <Card className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5 relative">
        {/* Top-Right: Edit Icon Button Placeholder */}
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4">
          <Skeleton className="w-8 h-8 rounded-full bg-muted/60" />
        </div>

        {/* Left: Avatar + User Info */}
        <div className="flex items-center gap-4 min-w-0 pr-12 sm:pr-36">
          <Skeleton className="w-16 h-16 rounded-full bg-muted/60 shrink-0 border-2 border-border/80" />
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32 rounded-md bg-muted/60" />
              <Skeleton className="h-4 w-16 rounded-full bg-muted/60" />
            </div>
            <Skeleton className="h-3.5 w-48 rounded-md bg-muted/60" />
          </div>
        </div>
      </Card>

      {/* 2. Stats Row Skeleton (Separate Card) */}
      <Card className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-4">
          {/* Stat 1: Đã lưu */}
          <div className="text-left space-y-1.5">
            <Skeleton className="h-6 w-8 rounded-md bg-muted/60" />
            <Skeleton className="h-3 w-12 rounded-md bg-muted/60" />
          </div>

          {/* Stat 2: Đã ghé */}
          <div className="text-left space-y-1.5">
            <Skeleton className="h-6 w-8 rounded-md bg-muted/60" />
            <Skeleton className="h-3 w-12 rounded-md bg-muted/60" />
          </div>

          {/* Stat 3: Huy hiệu */}
          <div className="text-left space-y-1.5">
            <Skeleton className="h-6 w-8 rounded-md bg-muted/60" />
            <Skeleton className="h-3 w-12 rounded-md bg-muted/60" />
          </div>
        </div>
      </Card>

      {/* 3. Tabs Skeleton */}
      <div className="border-b border-border pb-3">
        <div className="flex gap-6">
          <Skeleton className="h-6 w-20 rounded-md bg-muted/60" />
          <Skeleton className="h-6 w-20 rounded-md bg-muted/60" />
          <Skeleton className="h-6 w-20 rounded-md bg-muted/60" />
        </div>
      </div>

      {/* 4. Content Skeleton (Reviews Tab by default) */}
      <div className="space-y-3.5">
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
      </div>
    </div>
  );
}

export const SkeletonCard = CardSkeleton;
