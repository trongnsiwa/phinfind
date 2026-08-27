'use client';

import {
  Clock,
  Coffee,
  ExternalLink,
  Footprints,
  Heart,
  Images,
  MapPin,
  Navigation,
  Quote,
  Sparkles,
  Star,
  Wifi
} from 'lucide-react';
import Link from 'next/link';
import React, { memo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CardSize } from '@/lib/utils/bentoLayout';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

interface ShopCardFeaturedProps {
  shop: CoffeeShop;
  size?: CardSize;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
}

export const ShopCardFeatured = memo(function ShopCardFeatured({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect
}: ShopCardFeaturedProps) {
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

  const sampleGallery = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80'
  ];

  const rawPhotos = shop.photos && shop.photos.length > 0 ? shop.photos : [];
  const photo1 = rawPhotos[0] || sampleGallery[0];
  const photo2 = rawPhotos[1] || sampleGallery[1];
  const photo3 = rawPhotos[2] || sampleGallery[2];
  const extraCount = Math.max(rawPhotos.length > 3 ? rawPhotos.length - 2 : 2, 2);

  const formatCategories = () => {
    if (!shop.categories || shop.categories.length === 0) {
      return 'Quán cà phê được yêu thích với cà phê phin đặc trưng, hạt rang mộc & không gian yên tĩnh.';
    }
    const cleaned = shop.categories
      .map((c) =>
        c
          .replace(/^catering\./i, '')
          .replace(/^catering/i, '')
          .replace(/^cafe\./i, '')
          .replace(/_/g, ' ')
          .replace(/\./g, ' ')
          .trim()
      )
      .filter(
        (c) =>
          c.length > 0 &&
          !['cafe', 'coffee', 'catering', 'coffee shop', 'internet access', 'cafe coffee'].includes(
            c.toLowerCase()
          )
      )
      .map((c) => c.charAt(0).toUpperCase() + c.slice(1));

    if (cleaned.length === 0) {
      return 'Quán cà phê được yêu thích với cà phê phin đặc trưng, hạt rang mộc & không gian yên tĩnh.';
    }
    return `Cà phê đặc sản ${cleaned.slice(0, 2).join(' • ')} với hương vị nguyên bản & không gian ấm cúng.`;
  };

  const categoryTagline = formatCategories();
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const hasTotalRatings = typeof shop.total_ratings === 'number' && shop.total_ratings > 0;
  const distanceDisplay =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const addressDisplay = shop.address?.trim() || 'Chưa có địa chỉ';

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 w-full h-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 text-foreground rounded-2xl border border-amber-gold/40 shadow-card hover:shadow-card-hover hover:border-amber-gold/70 hover:-translate-y-1 transition-all duration-500 p-0 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* 2-Column Magazine-Style Gallery (60% Left, 40% Right Stacked) - Stretching flex-1 */}
      <div className="relative w-full flex-1 min-h-[200px] p-3.5 flex gap-2.5 bg-muted/60 border-b border-border/60 overflow-hidden">
        {/* Left Column (60% Width) - Primary Image */}
        <div className="w-[60%] h-full rounded-xl overflow-hidden relative bg-secondary border border-border/40">
          {!imgError ? (
            <img
              src={photo1}
              alt={`${shop.name} main`}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-secondary text-muted-foreground gap-1 p-2">
              <Coffee size={24} className="text-amber-gold opacity-60" />
              <span className="text-xs font-sans font-bold text-secondary-foreground">
                {shop.name}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
        </div>

        {/* Right Column (40% Width) - Two 50% Height Rows */}
        <div className="w-[40%] h-full flex flex-col gap-2.5">
          {/* Top Row (50% Height) */}
          <div className="h-1/2 rounded-lg overflow-hidden relative bg-secondary border border-border/40">
            <img
              src={photo2}
              alt={`${shop.name} secondary`}
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Bottom Row (50% Height) with +N More Overlay */}
          <div className="h-1/2 rounded-lg overflow-hidden relative bg-secondary border border-border/40">
            <img
              src={photo3}
              alt={`${shop.name} detail`}
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-amber-gold font-bold text-xs tracking-tight gap-1 hover:bg-black/50 transition-colors">
              <Images size={12} className="text-amber-gold" />
              <span>+{extraCount} ảnh</span>
            </div>
          </div>
        </div>

        {/* Floating Badges on Top-Left */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="badge-featured-gradient font-bold text-xs px-4 py-1.5 rounded-full shadow-md tracking-wide"
          >
            <Sparkles size={12} className="mr-1 fill-white text-white" /> Lựa chọn nổi bật
          </Badge>

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
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full mr-1.5',
                  isOpen ? 'bg-teal animate-pulse' : 'bg-rose-400'
                )}
              />
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

      {/* Structured Editorial Content Card */}
      <CardContent className="flex-shrink-0 p-3.5 space-y-1.5 bg-card/95 backdrop-blur-md overflow-visible min-h-0">
        {/* Section 1: Title & Address */}
        <div>
          <h3 className="font-sans font-bold text-sm sm:text-base text-foreground tracking-tight line-clamp-1 group-hover:text-amber-gold-hover transition-colors">
            {shop.name}
          </h3>
          <p className="text-xs text-foreground/80 font-medium flex items-center gap-1.5 mt-0.5 line-clamp-1">
            <MapPin size={11} className="text-amber-gold flex-shrink-0" />
            {addressDisplay}
          </p>
        </div>

        {/* Section 2: Excerpt / Tagline Panel */}
        <div className="bg-secondary/70 px-2.5 py-1 rounded-xl border border-border/60 text-[11px] sm:text-xs text-foreground/90 font-medium leading-snug flex items-start gap-1.5 shadow-xs">
          <Quote size={11} className="text-amber-gold flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1 sm:line-clamp-2">{categoryTagline}</span>
        </div>

        {/* Section 3: 4-Box Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-secondary/40 p-1 rounded-xl border border-border/50 text-xs">
          <div className="flex items-center gap-1 bg-background/90 p-1 rounded-lg border border-border/40 shadow-xs">
            {hasRating ? (
              <>
                <Star size={11} className="fill-amber-gold text-amber-gold flex-shrink-0" />
                <span className="font-bold text-foreground text-xs">
                  {shop.rating.toFixed(1)}
                </span>
                {hasTotalRatings && (
                  <span className="text-[10px] text-foreground/70 truncate">
                    ({shop.total_ratings})
                  </span>
                )}
              </>
            ) : (
              <>
                <Star size={11} className="text-amber-gold/50 flex-shrink-0" />
                <span className="font-semibold text-foreground text-xs">Mới</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 bg-background/90 p-1 rounded-lg border border-border/40 text-foreground font-semibold shadow-xs">
            <Footprints size={11} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-xs">{distanceDisplay}</span>
          </div>

          <div className="flex items-center gap-1 bg-background/90 p-1 rounded-lg border border-border/40 text-foreground/90 font-semibold shadow-xs">
            <Clock size={11} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-xs">{isOpen ? 'Đóng 22:30' : 'Mở 07:00'}</span>
          </div>

          <div className="flex items-center gap-1 bg-background/90 p-1 rounded-lg border border-border/40 text-foreground/90 font-semibold shadow-xs">
            <Wifi size={11} className="text-amber-gold flex-shrink-0" />
            <span className="truncate text-xs">{shop.price_range || '25k - 65k'}</span>
          </div>
        </div>

        {/* Section 4: CTA Action Row with Visual Separator Line */}
        <div className="flex items-center justify-end gap-2 mt-auto pt-1.5 border-t border-border/60">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs bg-secondary border-border text-foreground hover:text-amber-gold-hover hover:border-amber-gold/40 hover:bg-accent rounded-lg font-semibold active:scale-95 transition-all shadow-xs"
            >
              <Navigation size={11} className="mr-1.5 text-amber-gold" /> Chỉ đường
            </Button>
          </a>

          <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="default"
              size="sm"
              className="h-7 px-3.5 text-xs bg-gradient-to-r from-amber-gold to-amber-gold-hover text-primary-foreground font-bold hover:brightness-105 rounded-lg shadow-sm shadow-amber-gold/25 active:scale-95 transition-all"
            >
              Xem chi tiết <ExternalLink size={11} className="ml-1.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
