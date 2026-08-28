'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Navigation, Star, Footprints, ExternalLink, Quote, Coffee, Clock, Wifi, Images } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { CardSize } from '@/lib/utils/bentoLayout';
import { cn } from '@/lib/utils';
import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { formatShopCategoryTagline } from '@/lib/utils/placeholders';

interface ShopCardLargeProps {
  shop: CoffeeShop;
  size?: CardSize;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
}

export const ShopCardLarge = memo(function ShopCardLarge({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}: ShopCardLargeProps) {
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

  const rawPhotos = shop.photos && shop.photos.length > 0 ? shop.photos : [];
  const photo1 = rawPhotos[0];
  const photo2 = rawPhotos[1];
  const photo3 = rawPhotos[2];
  const extraCount = Math.max(rawPhotos.length > 3 ? rawPhotos.length - 2 : 0, 0);

  const categoryTagline = formatShopCategoryTagline(shop.categories);
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const hasTotalRatings = typeof shop.total_ratings === 'number' && shop.total_ratings > 0;
  const distanceDisplay = shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const addressDisplay = shop.address?.trim() || 'Chưa có địa chỉ';

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className="col-span-1 sm:col-span-2 row-span-2 w-full h-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 hover:-translate-y-1 transition-all duration-300 p-0 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* 2-Column Magazine-Style Gallery (60% Left, 40% Right Stacked) - Stretching flex-1 */}
      <div className="relative w-full flex-1 min-h-[190px] p-3.5 flex gap-2.5 bg-muted/60 border-b border-border/60 overflow-hidden">
        {photo1 && !imgError ? (
          <>
            {/* Left Column (60% Width) - Primary Image */}
            <div className="flex-1 h-full rounded-xl overflow-hidden relative bg-secondary border border-border/40">
              <img
                src={photo1}
                alt={`${shop.name} main`}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Right Column (40% Width) if photos exist */}
            {photo2 && (
              <div className="w-[35%] h-full flex flex-col gap-2.5">
                <div className="h-1/2 rounded-lg overflow-hidden relative bg-secondary border border-border/40">
                  <img
                    src={photo2}
                    alt={`${shop.name} secondary`}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  />
                </div>
                {photo3 && (
                  <div className="h-1/2 rounded-lg overflow-hidden relative bg-secondary border border-border/40">
                    <img
                      src={photo3}
                      alt={`${shop.name} detail`}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                    />
                    {extraCount > 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-amber-gold font-bold text-[10px] sm:text-[11px] tracking-tight gap-1 hover:bg-black/50 transition-colors">
                        <Images size={11} className="text-amber-gold" />
                        <span>+{extraCount}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full rounded-xl overflow-hidden relative border border-border/40">
            <ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />
          </div>
        )}


        {/* Floating Status Badge & Verification Badge on Top-Left */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 items-start">
          {shop.verified === false && (
            <Badge
              variant="outline"
              className="text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-md shadow-md bg-amber-500/85 text-white border-amber-400 flex items-center gap-1.5"
            >
              <Clock size={12} />
              <span>Chờ xác minh</span>
            </Badge>
          )}

          {hasOpenInfo && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-bold px-4 py-1.5 rounded-full border backdrop-blur-md shadow-md tracking-wide',
                isOpen
                  ? 'bg-teal/30 text-teal dark:text-teal border-teal/40'
                  : 'bg-rose-500/30 text-rose-300 dark:text-rose-300 border-rose-500/40'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', isOpen ? 'bg-teal animate-pulse' : 'bg-rose-400')} />
              {isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
            </Badge>
          )}
        </div>

        {/* Floating Favorite Button on Top-Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFav}
          aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          className="absolute top-6 right-6 z-10 h-7.5 w-7.5 rounded-full bg-background/80 backdrop-blur-md hover:bg-secondary border border-border/60 text-foreground shadow-md transition-all active:scale-90 focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
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

      {/* Structured Content Area */}
      <CardContent className="flex-shrink-0 p-3.5 sm:p-4 space-y-2 overflow-visible min-h-0">
        {/* Section 1: Shop Name & Address */}
        <div>
          <h3 className="font-sans font-bold text-sm sm:text-base text-foreground tracking-tight line-clamp-1 group-hover:text-amber-gold-hover transition-colors">
            {shop.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-foreground/80 font-medium flex items-center gap-1 mt-0.5 line-clamp-1">
            <MapPin size={11} className="text-amber-gold flex-shrink-0" />
            {addressDisplay}
          </p>
        </div>

        {/* Section 2: Excerpt / Atmosphere Tagline Panel */}
        <div className="bg-secondary/70 px-3 py-1.5 rounded-xl border border-border/60 text-[11px] sm:text-xs text-foreground font-medium leading-relaxed flex items-start gap-1.5 shadow-xs">
          <Quote size={12} className="text-amber-gold flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1 sm:line-clamp-2">{categoryTagline}</span>
        </div>

        {/* Section 3: 4-Box Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-secondary/40 p-1.5 rounded-xl border border-border/50 text-xs">
          <div className="flex items-center gap-1 bg-background/90 px-2 py-1 rounded-lg border border-border/40 shadow-xs">
            {hasRating ? (
              <>
                <Star size={12} className="fill-amber-gold text-amber-gold flex-shrink-0" />
                <span className="font-bold text-foreground text-[11px]">{shop.rating.toFixed(1)}</span>
                {hasTotalRatings && (
                  <span className="text-[9px] text-foreground/70 truncate">({shop.total_ratings})</span>
                )}
              </>
            ) : (
              <>
                <Star size={12} className="text-amber-gold/50 flex-shrink-0" />
                <span className="font-semibold text-foreground text-[11px]">Mới</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 bg-background/90 px-2 py-1 rounded-lg border border-border/40 text-foreground font-semibold shadow-xs">
            <Footprints size={12} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-[10px] sm:text-[11px]">{distanceDisplay}</span>
          </div>

          <div className="flex items-center gap-1 bg-background/90 px-2 py-1 rounded-lg border border-border/40 text-foreground font-semibold shadow-xs">
            <Clock size={12} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-[10px] sm:text-[11px]">{hasOpenInfo ? (isOpen ? 'Đang mở cửa' : 'Đã đóng cửa') : 'Giờ linh hoạt'}</span>
          </div>

          <div className="flex items-center gap-1 bg-background/90 px-2 py-1 rounded-lg border border-border/40 text-foreground font-semibold shadow-xs">
            <Wifi size={12} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-[10px] sm:text-[11px]">{shop.price_range || 'Bình dân'}</span>
          </div>
        </div>


        {/* Section 4: Call-To-Action Row Aligned Bottom Right */}
        <div className="flex items-center justify-end gap-2 mt-auto pt-1.5 border-t border-border/40">
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

          <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="default"
              size="sm"
              className="h-7 px-3 text-[11px] bg-gradient-to-r from-amber-gold to-amber-gold-hover text-primary-foreground font-bold hover:brightness-105 rounded-lg transition-all shadow-sm shadow-amber-gold/25 active:scale-95"
            >
              Xem chi tiết <ExternalLink size={11} className="ml-1 opacity-90" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
