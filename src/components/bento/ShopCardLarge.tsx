'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Navigation, Star, Footprints, ExternalLink, Quote, Coffee, Clock, Tag, Images } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { CardSize } from '@/lib/utils/bentoLayout';
import { cn } from '@/lib/utils';
import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { ShopImage } from '@/components/common/ShopImage';
import { formatShopCategoryTagline } from '@/lib/utils/placeholders';

interface ShopCardLargeProps {
  shop: CoffeeShop;
  size?: CardSize;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
  priority?: boolean;
}

export const ShopCardLarge = memo(function ShopCardLarge({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
  priority = false,
}: ShopCardLargeProps) {
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
      // RESPONSIVE: col-span-1 at base; spans md:col-span-2 md:row-span-2 only on md+
      className="col-span-1 md:col-span-2 md:row-span-2 w-full h-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-300 p-0 flex flex-col cursor-pointer group relative overflow-hidden"
    >
      {/* 2-Column Magazine-Style Gallery - RESPONSIVE: aspect-[16/10] on mobile, fills remaining card height with flex-1 min-h-0 on md+ */}
      <div className="relative w-full aspect-[16/10] md:aspect-auto md:flex-1 md:min-h-0 p-2.5 sm:p-3.5 flex gap-2.5 bg-muted/60 border-b border-border/60 overflow-hidden">
        {photo1 ? (
          <>
            {/* Left Column (60% Width) - Primary Image */}
            <div className={cn("h-full rounded-xl overflow-hidden relative bg-secondary border border-border/40", photo2 ? "flex-1" : "w-full")}>
              <ShopImage
                src={photo1}
                alt={`${shop.name} - Ảnh chính`}
                priority={priority}
                fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
                imageClassName="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 60vw, 40vw"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
              </ShopImage>
            </div>

            {/* Right Column (40% Width) if photos exist */}
            {photo2 && (
              <div className="w-[35%] h-full flex flex-col gap-2.5">
                <div className="h-1/2 rounded-lg overflow-hidden relative bg-secondary border border-border/40">
                  <ShopImage
                    src={photo2}
                    alt={`${shop.name} - Ảnh phụ 1`}
                    fallback={<div className="w-full h-full bg-muted" />}
                    imageClassName="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 40vw, 20vw"
                  />
                </div>
                {photo3 && (
                  <div className="h-1/2 rounded-lg overflow-hidden relative bg-secondary border border-border/40">
                    <ShopImage
                      src={photo3}
                      alt={`${shop.name} - Chi tiết`}
                      fallback={<div className="w-full h-full bg-muted" />}
                      imageClassName="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 40vw, 20vw"
                    >
                      {extraCount > 0 && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-amber-gold font-bold text-[10px] sm:text-[11px] tracking-tight gap-1 hover:bg-black/50 transition-colors">
                          <Images size={11} className="text-amber-gold" />
                          <span>+{extraCount}</span>
                        </div>
                      )}
                    </ShopImage>
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
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-row items-center gap-1.5 whitespace-nowrap max-w-[calc(100%-3rem)]">
          {shop.verified === false && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border backdrop-blur-md shadow-md bg-amber-500/85 text-white border-amber-400 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
            >
              <Clock size={11} className="shrink-0" />
              <span className="whitespace-nowrap">Chờ xác minh</span>
            </Badge>
          )}

          {hasOpenInfo && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-white shadow-md tracking-wide flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
            >
              <span className={cn('w-1.5 h-1.5 rounded-full inline-block shrink-0', isOpen ? 'bg-teal animate-pulse' : 'bg-rose-400')} />
              <span className="whitespace-nowrap">{isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}</span>
            </Badge>
          )}
        </div>

        {/* Floating Favorite Button on Top-Right */}
        {/* RESPONSIVE: 44px hit zone wrapper ensures WCAG touch target compliance on mobile */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 flex items-center justify-center p-1.5 min-h-[44px] min-w-[44px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFav}
            aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
            className="h-8 w-8 md:h-7 md:w-7 rounded-full bg-background/80 backdrop-blur-md hover:bg-secondary border border-border/60 text-foreground shadow-md transition-all active:scale-90 focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
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
      </div>

      {/* Structured Content Area */}
      {/* RESPONSIVE: CardContent uses flex-shrink-0 so content stays natural height without clipping and image fills remaining space */}
      <CardContent className="flex-shrink-0 p-2.5 sm:p-3 md:p-3.5 lg:p-4 space-y-2 flex flex-col justify-between">
        {/* Section 1: Shop Name & Address */}
        <div>
          <h3 className="font-sans font-bold text-sm sm:text-base text-foreground tracking-tight line-clamp-1 truncate group-hover:text-amber-gold-hover transition-colors">
            {shop.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-foreground/80 font-medium flex items-start gap-1 mt-0.5 min-w-0">
            <MapPin size={11} className="text-amber-gold flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2 md:line-clamp-1">{addressDisplay}</span>
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

          {/* RESPONSIVE: Bumped text from 10px to 11px/xs */}
          <div className="flex items-center gap-1 bg-background/90 px-2 py-1 rounded-lg border border-border/40 text-foreground font-semibold shadow-xs">
            <Footprints size={12} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">{distanceDisplay}</span>
          </div>

          <div className="flex items-center gap-1 bg-background/90 px-2 py-1 rounded-lg border border-border/40 text-foreground font-semibold shadow-xs">
            <Clock size={12} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">{hasOpenInfo ? (isOpen ? 'Đang mở cửa' : 'Đã đóng cửa') : 'Giờ linh hoạt'}</span>
          </div>

          <div className="flex items-center gap-1 bg-background/90 px-2 py-1 rounded-lg border border-border/40 text-foreground font-semibold shadow-xs">
            <Tag size={12} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">{shop.price_range || 'Bình dân'}</span>
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
            {/* RESPONSIVE: CTA buttons h-8 md:h-7 */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 md:h-7 px-2.5 text-[11px] sm:text-xs bg-secondary border-border text-foreground hover:text-amber-gold-hover hover:border-amber-gold/40 hover:bg-accent rounded-lg font-semibold active:scale-95 transition-all shadow-xs"
            >
              <Navigation size={11} className="mr-1 text-amber-gold" /> Chỉ đường
            </Button>
          </a>

          <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="default"
              size="sm"
              className="h-8 md:h-7 px-3 text-[11px] sm:text-xs bg-gradient-to-r from-amber-gold to-amber-gold-hover text-primary-foreground font-bold hover:brightness-105 rounded-lg transition-all shadow-sm shadow-amber-gold/25 active:scale-95"
            >
              Xem chi tiết <ExternalLink size={11} className="ml-1 opacity-90" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
