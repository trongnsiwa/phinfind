'use client';

import { Heart, Navigation, Share2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CoffeeShop } from '@/types/shop';
import { ShopDetailsContent } from './ShopDetailsContent';

export interface ShopSidebarProps {
  shop: CoffeeShop | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (placeId: string) => void;
  isFavorite?: boolean;
}

export function ShopSidebar({
  shop,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite = false
}: ShopSidebarProps) {
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync URL query params with active shop
  useEffect(() => {
    if (!shop || !isOpen || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const currentShopParam = url.searchParams.get('shop');

    if (currentShopParam !== shop.id) {
      url.searchParams.set('shop', shop.id);
      window.history.pushState(
        { shopSidebar: true, shopId: shop.id },
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

  // Clean URL when closing
  const handleClose = () => {
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

  if (!isOpen || !shop) return null;

  return (
    <aside
      aria-label={`Bảng thông tin chi tiết ${shop.name}`}
      className='fixed top-14 right-0 bottom-0 w-full sm:w-[440px] lg:w-[440px] xl:w-[460px] 2xl:w-[480px] max-w-[90vw] z-40 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col transition-all duration-300 ease-out animate-in slide-in-from-right select-none text-foreground'
    >
      {/* Top Header Bar with Close Button */}
      <div className='flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-card/80 flex-shrink-0'>
        <span className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
          Thông Tin Chi Tiết
        </span>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleClose}
          aria-label='Đóng bảng chi tiết'
          className='h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer'
        >
          <X size={17} />
        </Button>
      </div>

      {/* Main Tabbed Details Content */}
      <div className='flex-1 min-h-0 flex flex-col overflow-hidden relative'>
        <ShopDetailsContent
          shop={shop}
          isSidebar={true}
          scrollRef={scrollContainerRef}
        />
      </div>

      {/* Fixed Bottom Action Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className='flex-shrink-0 bg-card/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-2xl select-none'
      >
        <div className='grid grid-cols-3 gap-2'>
          <a
            href={getDirectionsUrl()}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-full bg-amber-gold text-primary-foreground font-bold hover:bg-amber-gold-hover transition-all text-xs shadow-md group active:scale-95 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          >
            <Navigation
              size={15}
              className='fill-primary-foreground group-hover:scale-110 transition-transform flex-shrink-0'
            />
            <span className='truncate'>Chỉ đường</span>
          </a>

          <button
            type='button'
            onClick={handleFavoriteClick}
            className={cn(
              'flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-full border transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isFavorite
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/60'
                : 'bg-secondary border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40'
            )}
          >
            <Heart
              size={15}
              className={cn(
                'transition-all duration-200 flex-shrink-0',
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground',
                isHeartAnimating && 'scale-125'
              )}
            />
            <span className='truncate'>{isFavorite ? 'Đã lưu' : 'Lưu lại'}</span>
          </button>

          <button
            type='button'
            onClick={handleShare}
            onPointerDown={(e) => e.stopPropagation()}
            className='flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-full bg-secondary border border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40 transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          >
            <Share2 size={15} className='text-amber-gold flex-shrink-0' />
            <span className='truncate'>Chia sẻ</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
