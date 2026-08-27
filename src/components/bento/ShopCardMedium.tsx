'use client';

import React, { memo, useState } from 'react';
import { Heart, MapPin, Navigation, Star, Footprints, Coffee, Clock, Wifi } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoffeeShop } from '@/types/shop';
import { CardSize } from '@/lib/utils/bentoLayout';
import { cn } from '@/lib/utils';

interface ShopCardMediumProps {
  shop: CoffeeShop;
  size?: CardSize;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
}

export const ShopCardMedium = memo(function ShopCardMedium({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}: ShopCardMediumProps) {
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
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80',
  ];
  const charCodeSum = (shop.id || shop.place_id || 'shop').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const coverImage = shop.photos?.[0] || sampleImages[charCodeSum % sampleImages.length];

  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const hasTotalRatings = typeof shop.total_ratings === 'number' && shop.total_ratings > 0;
  const distanceDisplay = shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const addressDisplay = shop.address?.trim() || 'Chưa có địa chỉ';

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className="col-span-1 sm:col-span-2 row-span-1 w-full h-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-3xl border border-border/80 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 hover:-translate-y-1.5 transition-all duration-300 p-3.5 flex gap-3.5 cursor-pointer group relative overflow-hidden"
    >
      {/* Left Media with 4:3 Aspect Ratio Container */}
      <div className="relative w-[36%] sm:w-[34%] h-full min-h-[130px] rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border/60">
        {!imgError ? (
          <img
            src={coverImage}
            alt={shop.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary text-muted-foreground gap-1.5 p-2">
            <Coffee size={24} className="text-amber-gold opacity-60" />
            <span className="text-xs font-sans font-bold tracking-wider text-secondary-foreground">{(shop.name || 'Coffee').slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Floating Status Pill */}
        {hasOpenInfo && (
          <Badge
            variant="outline"
            className={cn(
              'absolute top-3.5 left-3.5 text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm',
              isOpen
                ? 'bg-teal/20 text-teal border-teal/30'
                : 'bg-[#C97A7A]/25 text-[#E8A5A5] border-[#C97A7A]/30'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full mr-1', isOpen ? 'bg-teal animate-pulse' : 'bg-[#C97A7A]')} />
            {isOpen ? 'Mở cửa' : 'Đóng cửa'}
          </Badge>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 space-y-1.5">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h4 className="font-sans font-extrabold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-amber-gold-hover transition-colors tracking-tight">
              {shop.name}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFav}
              aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
              className="h-7 w-7 rounded-full bg-background/70 hover:bg-secondary border border-border/50 text-foreground shadow-sm flex-shrink-0 transition-all active:scale-90 focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
            >
              <Heart
                size={14}
                className={cn(
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-foreground/70',
                  isHeartAnimating && 'animate-heart-beat'
                )}
              />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1 mt-0.5">
            <MapPin size={11} className="text-amber-gold flex-shrink-0" />
            {addressDisplay}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1 font-medium">
            <Clock size={10} className="text-amber-gold/80 flex-shrink-0" />
            <span className="truncate">{isOpen ? 'Đóng 22:30' : 'Mở 07:00'}</span>
            <span className="text-border">•</span>
            <Wifi size={10} className="text-muted-foreground flex-shrink-0" />
            <span className="truncate">{shop.price_range || '25k - 65k'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-secondary text-amber-gold border-border font-bold text-[11px] py-0.5 px-2 rounded-lg flex items-center gap-1 shadow-xs">
              {hasRating ? (
                <>
                  <Star size={11} className="fill-amber-gold text-amber-gold" /> {shop.rating.toFixed(1)}
                  {hasTotalRatings && (
                    <span className="text-[10px] text-muted-foreground">({shop.total_ratings})</span>
                  )}
                </>
              ) : (
                <>
                  <Star size={11} className="text-amber-gold/50" />
                  <span className="text-secondary-foreground">Mới</span>
                </>
              )}
            </Badge>
            <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
              <Footprints size={11} className="text-amber-gold/70" /> {distanceDisplay}
            </span>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[11px] bg-secondary border-border text-foreground hover:text-amber-gold-hover hover:border-amber-gold/40 hover:bg-accent rounded-lg font-semibold active:scale-95 transition-all shadow-xs"
            >
              <Navigation size={11} className="mr-1 text-amber-gold" /> Chỉ đường
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
});
