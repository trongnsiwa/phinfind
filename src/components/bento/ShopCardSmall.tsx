'use client';

import { Clock, Coffee, Footprints, Heart, MapPin, Star, Tag } from 'lucide-react';
import React, { memo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CardSize } from '@/lib/utils/bentoLayout';
import { CoffeeShop } from '@/types/shop';

import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { ShopImage } from '@/components/common/ShopImage';

interface ShopCardSmallProps {
  shop: CoffeeShop;
  size?: CardSize;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
}

export const ShopCardSmall = memo(function ShopCardSmall({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect
}: ShopCardSmallProps) {
  const hasOpenInfo = shop.opening_hours?.open_now !== undefined;
  const isOpen = shop.opening_hours?.open_now ?? true;
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id);
  };

  const coverImage = shop.photos?.[0];

  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceDisplay =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const addressDisplay = shop.address?.trim() || 'Chưa có địa chỉ';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') {
        e.preventDefault();
      }
      onSelect?.(shop);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(shop)}
      onKeyDown={handleKeyDown}
      // RESPONSIVE: Fixed height h-[112px] self-start on mobile (< md) to keep cards genuinely compact, vertical card on tablet/desktop (md+) with h-full
      className="col-span-1 row-span-1 w-full h-[112px] md:h-full self-start md:self-auto card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-300 p-0 md:p-3.5 lg:p-4 flex flex-row md:flex-col justify-between cursor-pointer group relative overflow-hidden gap-0 md:gap-0"
    >
      {/* Media Container - RESPONSIVE: Left flush column on mobile (w-28 h-full fills 112px edge-to-edge), full width h-28 on md+ */}
      <div className="relative h-full w-28 md:w-full md:h-28 md:aspect-auto flex-shrink-0 overflow-hidden bg-muted border-r md:border-r-0 md:rounded-xl border-border/60">
        <ShopImage
          src={coverImage}
          alt={shop.name}
          fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
          imageClassName="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 112px, (max-width: 1024px) 33vw, 25vw"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
        </ShopImage>

        {/* Floating Status Pill & Verification Badge - RESPONSIVE: flex-row with whitespace-nowrap and shrink-0 */}
        <div className="absolute top-1 left-1 md:top-1.5 md:left-1.5 z-10 flex flex-row items-center gap-1.5 whitespace-nowrap max-w-[calc(100%-0.5rem)]">
          {shop.verified === false && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] sm:text-[11px] font-bold px-1.5 md:px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm bg-amber-500/80 text-white border-amber-400 flex items-center gap-1 whitespace-nowrap"
            >
              <Clock size={9} className="shrink-0" />
              <span className="whitespace-nowrap">Chờ xác minh</span>
            </Badge>
          )}

          {hasOpenInfo && (
            <Badge
              variant="outline"
              className="hidden md:flex shrink-0 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-white shadow-sm tracking-wide items-center gap-1 sm:gap-1.5 whitespace-nowrap"
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full inline-block shrink-0',
                  isOpen ? 'bg-teal animate-pulse' : 'bg-rose-400'
                )}
              />
              <span className="whitespace-nowrap">{isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Floating Favorite Button with 44px hit zone - RESPONSIVE: top-right in both layouts */}
      <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 z-20 flex items-center justify-center p-1.5 min-h-[44px] min-w-[44px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFav}
          aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          className="h-8 w-8 md:h-7 md:w-7 rounded-full bg-background/80 backdrop-blur-md hover:bg-secondary border border-border/60 text-foreground shadow-sm transition-all active:scale-90 focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
        >
          <Heart
            size={13}
            className={cn(
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-foreground/80',
              isHeartAnimating && 'animate-heart-beat'
            )}
          />
        </Button>
      </div>

      {/* Content Body - RESPONSIVE: flex-1 min-w-0 h-full with three tight rows on mobile:
          (a) title + address, (b) metrics row, (c) status pill row. Eliminates dead space below pill. */}
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col justify-between pl-2.5 pr-2.5 py-2 sm:p-2.5 md:p-0 md:mt-1.5 space-y-0.5 md:space-y-0.5">
        <div className="min-w-0 pr-8 md:pr-0 space-y-0.5">
          <h4 className="font-sans font-bold text-sm md:text-base text-foreground line-clamp-1 group-hover:text-amber-gold-hover transition-colors tracking-tight">
            {shop.name}
          </h4>
          <p className="text-[11px] sm:text-xs text-foreground/80 font-medium flex items-center gap-1 min-w-0">
            <MapPin size={10} className="text-amber-gold flex-shrink-0" />
            <span className="line-clamp-1 truncate">{addressDisplay}</span>
          </p>
        </div>

        {/* MOBILE METRICS ROW (< md): single line with gap-1, rating (⭐ value), distance (walking icon + text) */}
        <div className="flex md:hidden items-center gap-1 text-[11px] text-foreground/80 font-medium whitespace-nowrap overflow-hidden">
          <span className="font-bold text-amber-gold flex items-center gap-0.5 shrink-0">
            <Star size={10} className={cn(hasRating ? 'fill-amber-gold text-amber-gold' : 'text-amber-gold/50')} />
            <span className="text-foreground text-[11px]">{hasRating ? shop.rating.toFixed(1) : 'Mới'}</span>
          </span>
          <span className="text-border shrink-0">•</span>
          <span className="text-foreground/80 font-medium flex items-center gap-0.5 shrink-0 text-[11px]">
            <Footprints size={10} className="text-amber-gold shrink-0" />
            <span>{distanceDisplay}</span>
          </span>
        </div>

        {/* MOBILE STATUS PILL ROW (< md): colored pill on bottom-left */}
        <div className="flex md:hidden items-center">
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap border inline-flex items-center gap-1',
              isOpen
                ? 'bg-teal/10 text-teal border-teal/30'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isOpen ? 'bg-teal animate-pulse' : 'bg-rose-500')} />
            <span>{hasOpenInfo ? (isOpen ? 'Đang mở cửa' : 'Đã đóng cửa') : 'Đang mở cửa'}</span>
          </span>
        </div>

        {/* TABLET / DESKTOP META ROWS (md+) */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] sm:text-xs text-foreground/80 font-semibold mt-0.5">
          <Clock size={10} className="text-amber-gold flex-shrink-0" />
          <span className="truncate">{hasOpenInfo ? (isOpen ? 'Đang mở cửa' : 'Đã đóng cửa') : 'Giờ linh hoạt'}</span>
          <span className="text-border">•</span>
          <Tag size={10} className="text-amber-gold flex-shrink-0" />
          <span className="truncate">{shop.price_range || 'Bình dân'}</span>
        </div>

        <div className="hidden md:flex items-center justify-between text-[11px] sm:text-xs pt-1 border-t border-border/50">
          <span className="font-bold text-amber-gold flex items-center gap-1 bg-secondary border border-border/80 px-1.5 py-0.5 rounded-md shadow-xs">
            {hasRating ? (
              <>
                <Star size={10} className="fill-amber-gold text-amber-gold" />
                <span className="text-foreground">{shop.rating.toFixed(1)}</span>
              </>
            ) : (
              <>
                <Star size={10} className="text-amber-gold/50" />
                <span className="text-foreground">Mới</span>
              </>
            )}
          </span>
          <span className="text-foreground font-semibold flex items-center gap-1">
            <Footprints size={10} className="text-amber-gold flex-shrink-0" />
            {distanceDisplay}
          </span>
        </div>
      </div>
    </Card>
  );
});
