'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  ExternalLink,
  Footprints,
  Heart,
  MapPin,
  Navigation,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { ShopImage } from '@/components/common/ShopImage';
import { cn } from '@/lib/utils';
import { APP_ROUTES, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

interface FavoriteShopCardProps {
  shop: CoffeeShop;
  isFavorite?: boolean;
  isMissingDetails?: boolean;
  compactHero?: boolean;
  onToggleFavorite?: (placeId: string, shop: CoffeeShop) => void;
  onRequestRemove?: (shop: CoffeeShop) => void;
  onSelect?: (shop: CoffeeShop) => void;
}

export const FavoriteShopCard = memo(function FavoriteShopCard({
  shop,
  isFavorite = true,
  isMissingDetails = false,
  compactHero = false,
  onToggleFavorite,
  onRequestRemove,
  onSelect,
}: FavoriteShopCardProps) {
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const hasOpenInfo = shop.opening_hours?.open_now !== undefined;
  const isOpen = shop.opening_hours?.open_now ?? true;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id, shop);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRequestRemove?.(shop);
  };

  const coverImage = shop.photos?.[0];
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceDisplay =
    shop.distance_text && shop.distance_text !== '0 m'
      ? shop.distance_text
      : isMissingDetails
      ? 'Đã lưu'
      : 'Gần đây';
  const addressDisplay = shop.address?.trim() || 'Chưa có địa chỉ';

  const directionsUrl =
    shop.lat && shop.lon && shop.lat !== DEFAULT_LOCATION.lat
      ? `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          shop.address ? `${shop.name}, ${shop.address}` : shop.name
        )}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') {
        e.preventDefault();
      }
      onSelect?.(shop);
    }
  };

  // RESPONSIVE: favorites mobile uses hero cards but caps image height to keep the list scannable.
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(shop)}
      onKeyDown={handleKeyDown}
      className="w-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Image Container */}
      <div
        className={cn(
          'relative w-full flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-border/60',
          compactHero
            ? 'aspect-[16/10] max-h-[140px] sm:aspect-auto sm:max-h-none sm:h-36'
            : 'aspect-[16/10] max-h-[200px] sm:aspect-auto sm:max-h-none sm:h-36'
        )}
      >
        <ShopImage
          src={coverImage}
          alt={shop.name}
          fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
          imageClassName="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
        </ShopImage>

        {/* Status badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {isMissingDetails ? (
            <Badge
              variant="outline"
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-xs bg-muted/80 text-foreground/80 border-border/80"
            >
              Chưa cập nhật chi tiết
            </Badge>
          ) : (
            <>
              {shop.verified === false && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-xs bg-amber-500/80 text-white border-amber-400 flex items-center gap-1"
                >
                  <Clock size={9} />
                  <span>Chờ xác minh</span>
                </Badge>
              )}

              {hasOpenInfo && (
                <Badge
                  variant="outline"
                  className="text-xs font-bold px-2.5 py-1 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-white shadow-xs tracking-wide flex items-center gap-1.5"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full inline-block',
                      isOpen ? 'bg-teal animate-pulse' : 'bg-rose-400'
                    )}
                  />
                  <span>{isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}</span>
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Top-right Actions: Heart & Remove */}
        {/* RESPONSIVE: >= 44x44px tap targets on mobile (< md) via hit area wrapper, h-7 w-7 on desktop */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 flex items-center gap-0.5 sm:gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveClick}
            aria-label="Xóa khỏi danh sách yêu thích"
            title="Xóa khỏi danh sách yêu thích"
            className="w-11 h-11 min-h-[44px] min-w-[44px] md:w-7 md:h-7 md:min-h-0 md:min-w-0 p-0 rounded-full hover:bg-transparent focus-visible:ring-1 focus-visible:ring-rose-500 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            <span className="h-8 w-8 md:h-7 md:w-7 rounded-full bg-background/80 backdrop-blur-md hover:bg-rose-500/20 hover:text-rose-500 border border-border/60 text-muted-foreground shadow-xs transition-all flex items-center justify-center">
              <Trash2 size={12} />
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHeartClick}
            aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
            className="w-11 h-11 min-h-[44px] min-w-[44px] md:w-7 md:h-7 md:min-h-0 md:min-w-0 p-0 rounded-full hover:bg-transparent focus-visible:ring-1 focus-visible:ring-rose-500 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            <span className="h-8 w-8 md:h-7 md:w-7 rounded-full bg-background/80 backdrop-blur-md hover:bg-secondary border border-border/60 text-foreground shadow-xs transition-all flex items-center justify-center">
              <Heart
                size={13}
                className={cn(
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-foreground/80',
                  isHeartAnimating && 'animate-heart-beat'
                )}
              />
            </span>
          </Button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 flex flex-col justify-between mt-2 sm:mt-2.5 space-y-1.5 min-h-0">
        <div>
          <h4 className="font-sans font-bold text-base text-foreground line-clamp-1 group-hover:text-amber-gold-hover transition-colors tracking-tight">
            {shop.name}
          </h4>
          <p className="text-xs text-foreground/80 font-medium line-clamp-1 flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-amber-gold flex-shrink-0" />
            {addressDisplay}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-foreground/80 font-semibold">
          <Clock size={10} className="text-amber-gold flex-shrink-0" />
          <span className="truncate">
            {hasOpenInfo ? (isOpen ? 'Đang mở cửa' : 'Đã đóng cửa') : 'Giờ linh hoạt'}
          </span>
          <span className="text-border">•</span>
          <Tag size={10} className="text-amber-gold flex-shrink-0" />
          <span className="truncate">{shop.price_range || 'Bình dân'}</span>
        </div>

        {/* Rating & Distance info */}
        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/50">
          <span className="font-bold text-amber-gold flex items-center gap-1 bg-secondary border border-border/80 px-2 py-0.5 rounded-md shadow-xs">
            {hasRating ? (
              <>
                <Star size={11} className="fill-amber-gold text-amber-gold" />
                <span className="text-foreground">{shop.rating.toFixed(1)}</span>
                {shop.total_ratings > 0 && (
                  <span className="text-muted-foreground text-[10px]">
                    ({shop.total_ratings})
                  </span>
                )}
              </>
            ) : (
              <>
                <Star size={11} className="text-amber-gold/50" />
                <span className="text-foreground">Mới</span>
              </>
            )}
          </span>
          <span className="text-foreground font-semibold flex items-center gap-1">
            <Footprints size={11} className="text-amber-gold flex-shrink-0" />
            {distanceDisplay}
          </span>
        </div>

        {/* Action Buttons Row - Equal width grid with matching heights >= 44px on mobile */}
        <div className="grid grid-cols-2 gap-2 pt-1.5 sm:pt-2 border-t border-border/50 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-11 min-h-[44px] sm:h-8 sm:min-h-0 text-xs sm:text-[11px] font-semibold border-border rounded-xl cursor-pointer hover:bg-secondary flex items-center justify-center gap-1.5"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation size={12} className="text-amber-gold shrink-0" />
              <span>Chỉ đường</span>
            </a>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="w-full h-11 min-h-[44px] sm:h-8 sm:min-h-0 text-xs sm:text-[11px] bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={APP_ROUTES.SHOP_DETAIL(shop.place_id || shop.id)}>
              <span>Xem chi tiết</span>
              <ExternalLink size={11} className="opacity-80 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
});
