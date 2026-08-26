'use client';

import { Heart, Navigation, Share2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';
import { CoffeeShop } from '@/types/shop';
import {
  AmenitiesTab,
  ComputedSchedule,
  DaySchedule,
  getShopSchedule,
  OverviewTab,
  PhotosTab,
  ReviewsTab,
  ShopDetailsContent
} from './ShopDetailsContent';

export type { ComputedSchedule, DaySchedule };
export { AmenitiesTab, getShopSchedule, OverviewTab, PhotosTab, ReviewsTab, ShopDetailsContent };

export interface ShopDrawerProps {
  shop: CoffeeShop | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (placeId: string) => void;
  isFavorite?: boolean;
}

const SNAP_POINTS = [0.5, 0.92];

export function ShopDrawer({
  shop,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite = false
}: ShopDrawerProps) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | string | null>(0.5);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // When drawer opens, reset snap point to 0.5 preview and reset scroll
  useEffect(() => {
    if (shop && isOpen) {
      setActiveSnapPoint(0.5);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [shop?.id, isOpen]);

  // Handle URL query parameter synchronization & browser back button
  useEffect(() => {
    if (!shop || !isOpen || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const currentShopParam = url.searchParams.get('shop');

    if (currentShopParam !== shop.id) {
      url.searchParams.set('shop', shop.id);
      window.history.pushState(
        { shopDrawer: true, shopId: shop.id },
        '',
        url.pathname + url.search
      );
    }

    const handlePopState = () => {
      const currentUrl = new URL(window.location.href);
      if (!currentUrl.searchParams.get('shop')) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shop, isOpen, onClose]);

  // Revert URL query parameter when drawer closes
  const handleDrawerClose = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('shop')) {
        url.searchParams.delete('shop');
        const newSearch = url.searchParams.toString();
        const newUrl = url.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.pushState(null, '', newUrl);
      }
    }
    onClose();
  };

  const handleFavoriteClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!shop) return;
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id);
  };

  const handleShare = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!shop || typeof window === 'undefined') return;
    const url = `${window.location.origin}/?shop=${shop.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: shop.name,
          text: `Khám phá quán cà phê ${shop.name} trên PhinFind!`,
          url
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết vào bộ nhớ tạm!');
    }
  };

  const getDirectionsUrl = () => {
    if (!shop) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`;
  };

  if (!shop) return null;

  return (
    <DrawerPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleDrawerClose();
      }}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      fadeFromIndex={0}
      shouldScaleBackground={false}
      preventScrollRestoration={true}
    >
      <DrawerPrimitive.Portal>
        {/* Subtle Semi-Transparent Backdrop Overlay */}
        <DrawerPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto',
            activeSnapPoint === 0.5 && 'opacity-0 pointer-events-none'
          )}
        />

        {/* DRAGGABLE BOTTOM SHEET DRAWER CONTAINER */}
        <DrawerPrimitive.Content
          aria-describedby='shop-drawer-description'
          className='fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#101010]/95 backdrop-blur-xl border-t border-[#2A2A2A]/80 shadow-2xl max-w-2xl mx-auto rounded-t-[2rem] outline-none h-[92vh] transition-all'
        >
          {/* Top Pill Handle Bar */}
          <div className='flex items-center justify-center pt-3 pb-1.5 cursor-grab active:cursor-grabbing touch-none select-none flex-shrink-0'>
            <div className='w-10 h-1 rounded-full bg-[#2A2A2A]/80 hover:bg-amber-gold/60 transition-colors' />
          </div>

          <div className='flex-1 min-h-0 flex flex-col overflow-hidden relative'>
            <ShopDetailsContent
              shop={shop}
              isSidebar={false}
              scrollRef={scrollContainerRef}
            />
          </div>
        </DrawerPrimitive.Content>

        {/* ALWAYS-VISIBLE FIXED BOTTOM ACTION BAR */}
        <div
          data-vaul-no-drag
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className='fixed inset-x-0 bottom-0 z-50 pointer-events-auto bg-[#101010]/95 backdrop-blur-xl border-t border-[#2A2A2A]/70 px-4 sm:px-6 py-3 shadow-2xl max-w-2xl mx-auto rounded-t-2xl select-none'
        >
          <div className='grid grid-cols-3 gap-2'>
            <a
              href={getDirectionsUrl()}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-full bg-amber-gold text-[#101010] font-bold hover:bg-amber-gold-hover transition-all text-xs shadow-md group active:scale-95 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010]'
            >
              <Navigation
                size={15}
                className='fill-[#101010] group-hover:scale-110 transition-transform flex-shrink-0'
              />
              <span className='truncate'>Chỉ đường</span>
            </a>

            <button
              type='button'
              onClick={handleFavoriteClick}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-full border transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010]',
                isFavorite
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/60'
                  : 'bg-[#141414]/90 border-[#2A2A2A]/80 text-[#D0D0D0] hover:text-white hover:bg-white/10 hover:border-amber-gold/40'
              )}
            >
              <Heart
                size={15}
                className={cn(
                  'transition-all duration-200 flex-shrink-0',
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[#A0A0A0]',
                  isHeartAnimating && 'scale-125'
                )}
              />
              <span className='truncate'>{isFavorite ? 'Đã lưu' : 'Lưu lại'}</span>
            </button>

            <button
              type='button'
              onClick={handleShare}
              onPointerDown={(e) => e.stopPropagation()}
              className='flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-full bg-[#141414]/90 border border-[#2A2A2A]/80 text-[#D0D0D0] hover:text-white hover:bg-white/10 hover:border-amber-gold/40 transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010]'
            >
              <Share2 size={15} className='text-amber-gold flex-shrink-0' />
              <span className='truncate'>Chia sẻ</span>
            </button>
          </div>
        </div>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
