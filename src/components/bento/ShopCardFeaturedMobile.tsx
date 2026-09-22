'use client';

import React, { memo, useState } from 'react';
import { ExternalLink, Footprints, Heart, MapPin, Navigation, Quote, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { ShopImage } from '@/components/common/ShopImage';
import { cn } from '@/lib/utils';
import { formatShopCategoryTagline } from '@/lib/utils/placeholders';
import { CoffeeShop } from '@/types/shop';

interface ShopCardFeaturedMobileProps {
  shop: CoffeeShop;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
  priority?: boolean;
}

/**
 * Mobile-only Featured Editorial Hero Card (1×3, row-span-3)
 *
 * RESPONSIVE: Full-width editorial hero card designed specifically for mobile (< md) single-column feeds.
 * Visual contract:
 * - Image block: aspect-[16/10] rounded-2xl full-width. Keeps ONLY heart button (top-right)
 *   and status badge (top-left) with solid dark backgrounds for 100% legibility on photos or illustrations.
 * - Text completely moved below the image into content block (p-3.5) with no text overlay:
 *   a) Editorial label: "LỰA CHỌN NỔI BẬT" (text-[10px] font-bold tracking-widest uppercase text-amber-gold, own line)
 *   b) Shop name: text-lg font-bold text-foreground line-clamp-2, mt-0.5, own line
 *   c) Address: text-xs text-muted-foreground line-clamp-1 with MapPin icon
 *   d) Meta row: ⭐ rating · distance · price_range (text-[11px] tight gaps)
 *   e) Tagline panel: bg-secondary/60 border-l-2 border-amber-gold pl-3 py-2 rounded-r-lg with Quote icon + line-clamp-2 tagline
 *   f) CTA row: "Chỉ đường" (outline, flex-1) + "Xem chi tiết" (primary, flex-1), both h-9 min-h-[44px]
 * - Fits within 3-row budget (row-span-3 in auto-rows-[124px] grid) with 0px overflow and no internal scroll.
 */
export const ShopCardFeaturedMobile = memo(function ShopCardFeaturedMobile({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
  priority = true,
}: ShopCardFeaturedMobileProps) {
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const hasOpenInfo = shop.opening_hours?.open_now !== undefined;
  const isOpen = shop.opening_hours?.open_now ?? true;

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(shop);
    }
  };

  const coverImage = shop.photos?.[0];
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceDisplay =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const addressDisplay = shop.address?.trim() || 'Chưa có địa chỉ';
  const taglineExcerpt =
    formatShopCategoryTagline(shop.categories) ||
    shop.address ||
    'Không gian thưởng thức cà phê đặc sản đậm đà hương vị Việt.';

  const mapsUrl =
    shop.lat && shop.lon
      ? `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + ' ' + (shop.address || ''))}`;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(shop)}
      onKeyDown={handleKeyDown}
      // RESPONSIVE: col-span-1 row-span-3 on mobile (< md), fits 3 row units (~372-400px) with 0px overflow
      className="col-span-1 row-span-3 w-full h-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 text-foreground rounded-2xl border border-amber-gold/40 shadow-card hover:shadow-card-hover hover:border-amber-gold/70 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-300 p-2.5 flex flex-col justify-between cursor-pointer group relative overflow-hidden select-none"
    >
      {/* 1. HERO IMAGE BLOCK: aspect-[16/10], rounded-2xl, full-width. ONLY heart button & status badge inside */}
      <div className="relative w-full aspect-[16/10] max-h-36 xs:max-h-40 rounded-2xl overflow-hidden border border-amber-gold/30 bg-muted flex-shrink-0">
        <ShopImage
          src={coverImage}
          alt={shop.name}
          priority={priority}
          fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
          imageClassName="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Top-Left inside image: status badge with solid dark background */}
        {hasOpenInfo && (
          <div className="absolute top-2 left-2 z-10">
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 bg-black/65 backdrop-blur-md text-white shadow-sm tracking-wide flex items-center gap-1.5 whitespace-nowrap"
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full inline-block shrink-0',
                  isOpen ? 'bg-teal animate-pulse' : 'bg-rose-400'
                )}
              />
              <span>{isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}</span>
            </Badge>
          </div>
        )}

        {/* Top-Right inside image: heart button (44px tap target) with solid dark background */}
        <div className="absolute top-1 right-1 z-20 flex items-center justify-center min-h-[44px] min-w-[44px]">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFav}
            aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
            className="h-9 w-9 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white hover:bg-black/75 hover:text-white shadow-sm transition-all active:scale-90 focus-visible:ring-1 focus-visible:ring-amber-gold cursor-pointer"
          >
            <Heart
              size={15}
              className={cn(
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white',
                isHeartAnimating && 'animate-heart-beat'
              )}
            />
          </Button>
        </div>
      </div>

      {/* 2. EDITORIAL CONTENT BLOCK (below image, p-3.5): Clean sequence with zero text over image */}
      <div className="flex-1 min-h-0 flex flex-col justify-between p-3.5 pt-2 pb-0 space-y-2">
        <div className="space-y-1">
          {/* a) Editorial label: "LỰA CHỌN NỔI BẬT" - text-[10px] font-bold tracking-widest uppercase text-amber-gold */}
          <div
            aria-label="Quán nổi bật"
            className="text-[10px] font-bold tracking-widest uppercase text-amber-gold font-mono"
          >
            LỰA CHỌN NỔI BẬT
          </div>

          {/* b) Shop name: text-lg font-bold text-foreground line-clamp-2, mt-0.5 */}
          <h3 className="text-base xs:text-lg font-bold text-foreground leading-tight line-clamp-2 tracking-tight group-hover:text-amber-gold-hover transition-colors">
            {shop.name}
          </h3>

          {/* c) Address: text-xs text-muted-foreground line-clamp-1 with MapPin icon */}
          <p className="text-xs text-muted-foreground flex items-center gap-1 min-w-0 pt-0.5">
            <MapPin size={11} className="text-amber-gold flex-shrink-0" />
            <span className="line-clamp-1 truncate">{addressDisplay}</span>
          </p>

          {/* d) Meta row: ⭐ rating · distance · price_range - text-[11px] tight gaps */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap overflow-hidden pt-0.5">
            <span className="font-bold text-amber-gold flex items-center gap-0.5 shrink-0">
              <Star size={11} className={cn(hasRating ? 'fill-amber-gold text-amber-gold' : 'text-amber-gold/50')} />
              <span className="text-foreground font-semibold">{hasRating ? shop.rating!.toFixed(1) : 'Mới'}</span>
              {Boolean(shop.total_ratings && shop.total_ratings > 0) && (
                <span className="text-muted-foreground font-normal ml-0.5">
                  ({shop.total_ratings})
                </span>
              )}
            </span>

            <span className="text-muted-foreground/50 font-bold">·</span>

            <span className="flex items-center gap-0.5 text-foreground/75 shrink-0">
              <Footprints size={11} className="text-amber-gold shrink-0" />
              <span>{distanceDisplay}</span>
            </span>

            <span className="text-muted-foreground/50 font-bold">·</span>

            <span className="text-foreground/75 shrink-0 truncate">
              {shop.price_range || 'Bình dân'}
            </span>
          </div>
        </div>

        {/* e) Tagline panel: bg-secondary/60 border-l-2 border-amber-gold pl-3 py-2 rounded-r-lg with Quote icon + line-clamp-2 tagline */}
        <div className="bg-secondary/60 border-l-2 border-amber-gold pl-3 py-2 pr-2.5 rounded-r-lg flex items-start gap-1.5">
          <Quote size={12} className="text-amber-gold shrink-0 mt-0.5 fill-amber-gold/20" />
          <p className="text-xs text-foreground/85 leading-relaxed line-clamp-2">
            {taglineExcerpt}
          </p>
        </div>

        {/* f) CTA row: "Chỉ đường" (outline, flex-1) + "Xem chi tiết" (primary, flex-1), both h-9 min-h-[44px] */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/40">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-h-[44px] flex items-center"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-9 min-h-[44px] text-xs font-semibold rounded-xl border-input hover:bg-accent flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation size={12} className="text-amber-gold shrink-0" />
              <span>Chỉ đường</span>
            </Button>
          </a>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(shop);
            }}
            className="flex-1 h-9 min-h-[44px] text-xs font-bold rounded-xl text-primary-foreground bg-gradient-to-r from-amber-gold to-amber-gold-hover hover:opacity-95 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Xem chi tiết</span>
            <ExternalLink size={12} className="shrink-0" />
          </Button>
        </div>
      </div>
    </Card>
  );
});
