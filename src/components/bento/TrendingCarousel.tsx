'use client';

import React, { memo, useState } from 'react';
import { ChevronRight, Footprints, Heart, Star } from 'lucide-react';
import { ShopImage } from '@/components/common/ShopImage';
import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { DiscoverCarouselSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { CoffeeShop } from '@/types/shop';

export interface TrendingCarouselProps {
  title: string;
  subtitle?: string;
  shops: CoffeeShop[];
  isLoading?: boolean;
  onSelect: (shop: CoffeeShop) => void;
  onToggleFavorite: (placeId: string) => void;
  favorites: string[];
  icon?: React.ReactNode;
  onViewAll?: () => void;
  className?: string;
}

interface CarouselCardProps {
  shop: CoffeeShop;
  isFav: boolean;
  onSelect: (shop: CoffeeShop) => void;
  onToggleFavorite: (placeId: string) => void;
}

const CarouselCard = memo(function CarouselCard({
  shop,
  isFav,
  onSelect,
  onToggleFavorite,
}: CarouselCardProps) {
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite(shop.place_id);
  };

  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const hasDistance = Boolean(shop.distance_text && shop.distance_text !== '0 m');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(shop)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(shop);
        }
      }}
      aria-label={`Xem chi tiết quán ${shop.name}`}
      className="group relative flex flex-col bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 p-2.5 sm:p-3 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 cursor-pointer overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold h-full"
    >
      {/* Media container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/60">
        <ShopImage
          src={shop.photos?.[0]}
          alt={shop.name}
          fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
          imageClassName="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          sizes="(max-width: 640px) 70vw, (max-width: 768px) 45vw, (max-width: 1024px) 32vw, 24vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Favorite Heart Button - min 44px tap target */}
        <button
          type="button"
          onClick={handleFav}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
            }
          }}
          aria-label={isFav ? `Bỏ lưu ${shop.name}` : `Lưu ${shop.name}`}
          className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 z-20 min-h-[44px] min-w-[44px] p-1.5 flex items-center justify-center rounded-full transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold active:scale-90"
        >
          <span className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-secondary border border-border/60 text-foreground shadow-sm flex items-center justify-center transition-colors">
            <Heart
              size={14}
              className={cn(
                'transition-colors',
                isFav ? 'fill-rose-500 text-rose-500' : 'text-foreground/80 hover:text-foreground',
                isHeartAnimating && 'animate-heart-beat'
              )}
            />
          </span>
        </button>
      </div>

      {/* Info area */}
      <div className="pt-2.5 space-y-1 min-w-0 flex-1 flex flex-col justify-between">
        <h4 className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-amber-gold transition-colors tracking-tight">
          {shop.name}
        </h4>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap overflow-hidden">
          {hasRating && (
            <span className="flex items-center gap-0.5 font-semibold text-foreground shrink-0">
              <Star size={11} className="fill-amber-gold text-amber-gold flex-shrink-0" />
              <span>{shop.rating?.toFixed(1)}</span>
            </span>
          )}
          {hasRating && hasDistance && (
            <span className="text-border shrink-0">•</span>
          )}
          {hasDistance && (
            <span className="flex items-center gap-0.5 truncate text-muted-foreground">
              <Footprints size={11} className="text-amber-gold/80 flex-shrink-0" />
              <span className="truncate">{shop.distance_text}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export const TrendingCarousel = memo(function TrendingCarousel({
  title,
  subtitle,
  shops,
  isLoading = false,
  onSelect,
  onToggleFavorite,
  favorites,
  icon,
  onViewAll,
  className,
}: TrendingCarouselProps) {
  if (isLoading) {
    return <DiscoverCarouselSkeleton className={className} />;
  }

  if (!shops || shops.length === 0) {
    return null;
  }

  return (
    <section className={cn('w-full', className)} aria-label={title}>
      {/* Header bar: Icon + Title + Subtitle on left, "Xem tất cả" button on right */}
      <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {icon && <span className="flex-shrink-0 text-amber-gold">{icon}</span>}
            <h3 className="text-base font-bold text-foreground truncate tracking-tight">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="group/all text-xs font-semibold text-amber-gold hover:text-amber-gold-hover hover:underline min-h-[44px] px-2 flex items-center shrink-0 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold rounded-lg transition-colors gap-0.5"
          >
            <span>Xem tất cả</span>
            <ChevronRight size={14} className="shrink-0 transition-transform group-hover/all:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Horizontal scroll container with padding + negative margin to prevent shadow clipping */}
      <div className="overflow-x-auto no-scrollbar py-3 px-1 -my-3 -mx-1 snap-x snap-proximity">
        <div className="flex gap-3 sm:gap-3.5">
          {shops.map((shop) => (
            <div
              key={shop.id || shop.place_id}
              role="group"
              aria-roledescription="slide"
              className="shrink-0 w-[70vw] sm:w-[45vw] md:w-[32vw] lg:w-[24vw] xl:w-[20vw] min-w-[220px] max-w-[320px] snap-start"
            >
              <CarouselCard
                shop={shop}
                isFav={favorites.includes(shop.place_id)}
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
