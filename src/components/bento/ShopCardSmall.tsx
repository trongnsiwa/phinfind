'use client';

import { Clock, Coffee, Footprints, Heart, MapPin, Star, Wifi } from 'lucide-react';
import React, { memo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CardSize } from '@/lib/utils/bentoLayout';
import { CoffeeShop } from '@/types/shop';

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
  const [imgError, setImgError] = useState(false);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id);
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&q=80'
  ];
  const charCodeSum = (shop.id || shop.place_id || 'shop')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const coverImage = shop.photos?.[0] || sampleImages[charCodeSum % sampleImages.length];

  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceDisplay =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const addressDisplay = shop.address?.trim() || 'Chưa có địa chỉ';

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className="col-span-1 row-span-1 w-full h-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 hover:-translate-y-1 transition-all duration-300 p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* Compact Image Container */}
      <div className="relative w-full h-24 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-border/60">
        {!imgError ? (
          <img
            src={coverImage}
            alt={shop.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary text-muted-foreground gap-1">
            <Coffee size={20} className="text-amber-gold opacity-60" />
            <span className="text-[10px] font-sans font-bold tracking-wider text-secondary-foreground">
              {(shop.name || 'Coffee').slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Floating Status Pill & Verification Badge */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {shop.verified === false && (
            <Badge
              variant="outline"
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm bg-amber-500/80 text-white border-amber-400 flex items-center gap-1"
            >
              <Clock size={9} />
              <span>Chờ xác minh</span>
            </Badge>
          )}

          {hasOpenInfo && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm tracking-wide',
                isOpen
                  ? 'bg-teal/30 text-teal dark:text-teal border-teal/40'
                  : 'bg-rose-500/30 text-rose-300 dark:text-rose-300 border-rose-500/40'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full mr-1',
                  isOpen ? 'bg-teal animate-pulse' : 'bg-rose-400'
                )}
              />
              {isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
            </Badge>
          )}
        </div>


        {/* Floating Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFav}
          aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-background/80 backdrop-blur-md hover:bg-secondary border border-border/60 text-foreground shadow-sm transition-all active:scale-90 focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
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

      {/* Content Body - Balanced spacing */}
      <div className="flex-1 flex flex-col justify-between mt-1.5 min-h-0 space-y-0.5">
        <h4 className="font-sans font-bold text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-amber-gold-hover transition-colors tracking-tight">
          {shop.name}
        </h4>
        <p className="text-[11px] text-foreground/80 font-medium line-clamp-1 flex items-center gap-1 mt-0.5">
          <MapPin size={10} className="text-amber-gold flex-shrink-0" />
          {addressDisplay}
        </p>

        <div className="flex items-center gap-1.5 text-[10px] text-foreground/80 font-semibold mt-0.5">
          <Clock size={10} className="text-amber-gold flex-shrink-0" />
          <span className="truncate">{isOpen ? 'Đóng 22:30' : 'Mở 07:00'}</span>
          <span className="text-border">•</span>
          <Wifi size={10} className="text-amber-gold flex-shrink-0" />
          <span className="truncate">{shop.price_range || '25k - 65k'}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border/50">
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
