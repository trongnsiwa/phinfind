'use client';

import { CheckCircle2, Heart, Navigation, Share2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CoffeeShop } from '@/types/shop';
import { useShopStore } from '@/stores/useShopStore';
import { useToggleVisit, VisitedShopItem } from '@/hooks/useShops';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { VisitNoteDialog } from './VisitNoteDialog';
import { ShopDetailsContent } from './ShopDetailsContent';

export interface ShopSidebarProps {
  shop: CoffeeShop | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (placeId: string) => void;
  isFavorite?: boolean;
  onToggleVisit?: (placeId: string) => void;
  isVisited?: boolean;
}

export function ShopSidebar({
  shop,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite,
  onToggleVisit,
  isVisited
}: ShopSidebarProps) {
  const [displayedShop, setDisplayedShop] = useState<CoffeeShop | null>(shop);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [isVisitAnimating, setIsVisitAnimating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const storeIsFavorite = useShopStore((state) =>
    displayedShop ? state.favorites.includes(displayedShop.place_id) : false
  );
  const currentIsFavorite = isFavorite !== undefined ? isFavorite : storeIsFavorite;

  const storeIsVisited = useShopStore((state) =>
    displayedShop ? state.visits.includes(displayedShop.place_id) : false
  );
  const currentIsVisited = isVisited !== undefined ? isVisited : storeIsVisited;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  const visitsData = queryClient.getQueryData<VisitedShopItem[]>(['user', 'visits', user?.id]);
  const existingVisit = visitsData?.find(
    (v) => v.shop_place_id === (displayedShop?.place_id || displayedShop?.id)
  );
  const existingNote = existingVisit?.note || null;

  const toggleVisitMutation = useToggleVisit();

  // Keep displayed shop cached during exit animations
  useEffect(() => {
    if (shop) {
      setDisplayedShop(shop);
    }
  }, [shop]);

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
    if (!displayedShop) return;
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(displayedShop.place_id);
  };

  const handleVisitClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!displayedShop) return;
    setIsVisitAnimating(true);
    setTimeout(() => setIsVisitAnimating(false), 300);

    if (currentIsVisited) {
      if (onToggleVisit) {
        onToggleVisit(displayedShop.place_id || displayedShop.id);
      } else {
        toggleVisitMutation(displayedShop.place_id || displayedShop.id);
      }
    } else {
      setIsNoteDialogOpen(true);
    }
  };

  const handleConfirmVisitNote = (note: string | null) => {
    if (!displayedShop) return;
    toggleVisitMutation(displayedShop.place_id || displayedShop.id, {
      name: displayedShop.name,
      address: displayedShop.address,
      note,
    });
  };

  const handleShare = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!displayedShop || typeof window === 'undefined') return;
    const url = `${window.location.origin}/?shop=${displayedShop.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: displayedShop.name,
          text: `Khám phá quán cà phê ${displayedShop.name} trên PhinFind!`,
          url
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết vào bộ nhớ tạm!');
    }
  };

  const getDirectionsUrl = () => {
    if (!displayedShop) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${displayedShop.lat},${displayedShop.lon}`;
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && displayedShop && (
        <>
          {/* Full-Screen Transparent Backdrop Overlay to capture outside clicks on map */}
          <motion.div
            key='shop-sidebar-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-hidden='true'
            className='fixed inset-0 z-40 bg-transparent pointer-events-auto'
          />

          <motion.aside
            key={`shop-sidebar-${displayedShop.id}`}
            aria-label={`Bảng thông tin chi tiết ${displayedShop.name}`}
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className='fixed top-14 right-0 bottom-0 w-full sm:w-[440px] lg:w-[440px] xl:w-[460px] 2xl:w-[480px] max-w-[90vw] z-50 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col select-none text-foreground'
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
              shop={displayedShop}
              isSidebar={true}
              scrollRef={scrollContainerRef}
              isVisited={currentIsVisited}
            />
          </div>

          {/* Fixed Bottom Action Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className='flex-shrink-0 bg-card/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-2xl select-none'
          >
            <div className='grid grid-cols-4 gap-2'>
              {/* 1. Directions Button */}
              <a
                href={getDirectionsUrl()}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Chỉ đường'
                title='Chỉ đường'
                className='flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground text-xs font-bold shadow-md group active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              >
                <Navigation
                  size={15}
                  className='fill-primary-foreground group-hover:scale-110 transition-transform flex-shrink-0'
                />
                <span className='truncate'>Chỉ đường</span>
              </a>

              {/* 2. Favorite Toggle Button */}
              <button
                type='button'
                onClick={handleFavoriteClick}
                aria-pressed={currentIsFavorite}
                aria-label={currentIsFavorite ? 'Đã lưu' : 'Lưu lại'}
                title={currentIsFavorite ? 'Đã lưu' : 'Lưu lại'}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full border text-xs font-bold shadow-sm transition-all active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  currentIsFavorite
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 hover:bg-rose-500/25 hover:border-rose-500/60'
                    : 'bg-secondary border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40'
                )}
              >
                <Heart
                  size={15}
                  className={cn(
                    'transition-all duration-200 flex-shrink-0',
                    currentIsFavorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground',
                    isHeartAnimating && 'scale-125'
                  )}
                />
                <span className='truncate'>{currentIsFavorite ? 'Đã lưu' : 'Lưu lại'}</span>
              </button>

              {/* 3. Visit Toggle Button */}
              <button
                type='button'
                onClick={handleVisitClick}
                aria-pressed={currentIsVisited}
                aria-label={currentIsVisited ? 'Đã ghé' : 'Ghé thăm'}
                title={currentIsVisited ? 'Đã ghé quán này' : 'Đánh dấu đã ghé thăm'}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full border text-xs font-bold shadow-sm transition-all active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  currentIsVisited
                    ? 'bg-teal/15 border-teal/40 text-teal hover:bg-teal/25 hover:border-teal/60'
                    : 'bg-secondary border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40'
                )}
              >
                <CheckCircle2
                  size={15}
                  className={cn(
                    'transition-all duration-200 flex-shrink-0',
                    currentIsVisited ? 'text-teal fill-teal/20' : 'text-muted-foreground',
                    isVisitAnimating && 'scale-125'
                  )}
                />
                <span className='truncate'>{currentIsVisited ? 'Đã ghé' : 'Ghé thăm'}</span>
              </button>

              {/* 4. Share Button */}
              <button
                type='button'
                onClick={handleShare}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label='Chia sẻ'
                title='Chia sẻ'
                className='flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full bg-secondary border border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40 transition-all text-xs font-bold shadow-sm active:scale-95 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              >
                <Share2 size={15} className='text-amber-gold flex-shrink-0' />
                <span className='truncate'>Chia sẻ</span>
              </button>
            </div>
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>

  {displayedShop && (
    <VisitNoteDialog
      open={isNoteDialogOpen}
      onOpenChange={setIsNoteDialogOpen}
      shop={displayedShop}
      existingNote={existingNote}
      onConfirm={handleConfirmVisitNote}
    />
  )}
  </>
);
}
