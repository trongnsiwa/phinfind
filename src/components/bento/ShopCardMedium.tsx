'use client';

import { Clock, Coffee, Footprints, Heart, MapPin, Navigation, Star, Tag } from 'lucide-react';
import React, { memo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CardSize } from '@/lib/utils/bentoLayout';
import { CoffeeShop } from '@/types/shop';

import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { ShopImage } from '@/components/common/ShopImage';

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
  onSelect
}: ShopCardMediumProps) {
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
      // RESPONSIVE: col-span-1 at base; md:col-span-2 only on md+
      className='col-span-1 md:col-span-2 row-span-1 w-full h-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-300 p-2 sm:p-2.5 md:p-3.5 lg:p-4 flex gap-2 sm:gap-2.5 md:gap-3 cursor-pointer group relative overflow-hidden'
    >
      {/* Left Media Container - RESPONSIVE: w-[30%] on mobile, w-[34%] on md+ */}
      <div className='relative w-[30%] md:w-[34%] h-full rounded-xl overflow-hidden bg-muted border border-border/60 flex-shrink-0'>
        <ShopImage
          src={coverImage}
          alt={shop.name}
          fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
          imageClassName='object-cover group-hover:scale-108 transition-transform duration-500 ease-out'
          sizes='(max-width: 640px) 40vw, 20vw'
        >
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none' />
        </ShopImage>

        {/* Floating Status Pill & Verification Badge - RESPONSIVE: flex-row with whitespace-nowrap and shrink-0 */}
        <div className='absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-10 flex flex-row items-center gap-1 whitespace-nowrap max-w-[calc(100%-0.5rem)]'>
          {shop.verified === false && (
            <Badge
              variant='outline'
              className='shrink-0 text-[9px] sm:text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-full border backdrop-blur-md shadow-sm bg-amber-500/80 text-white border-amber-400 flex items-center gap-0.5 whitespace-nowrap'
            >
              <Clock size={8} className="shrink-0" />
              <span className="whitespace-nowrap">Chờ xác minh</span>
            </Badge>
          )}

          {hasOpenInfo && (
            <Badge
              variant='outline'
              className='shrink-0 text-[9px] sm:text-[10px] md:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-md text-white shadow-sm tracking-wide flex items-center gap-1 whitespace-nowrap'
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

      {/* Right Content - RESPONSIVE: flex-1 min-h-0 overflow-hidden ensures text truncates without expanding card */}
      <div className='flex-1 min-h-0 overflow-hidden flex flex-col justify-between py-0 min-w-0'>
        <div>
          <div className='flex items-start justify-between gap-1'>
            <h4 className='font-sans font-bold text-xs sm:text-sm md:text-base text-foreground line-clamp-1 truncate group-hover:text-amber-gold-hover transition-colors tracking-tight'>
              {shop.name}
            </h4>
            {/* Floating Favorite Button with 44px hit zone */}
            {/* RESPONSIVE: 44px hit zone wrapper ensures WCAG touch target compliance on mobile */}
            <div className="flex items-center justify-center -mr-2 -mt-2 p-2 min-h-[44px] min-w-[44px] flex-shrink-0">
              <Button
                variant='ghost'
                size='icon'
                onClick={handleFav}
                aria-label={
                  isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'
                }
                className='h-8 w-8 md:h-7 md:w-7 rounded-full bg-background/80 hover:bg-secondary border border-border/60 text-foreground shadow-sm transition-all active:scale-90 focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0'
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

          <p className='text-[11px] md:text-xs text-foreground/80 font-medium flex items-start gap-1 mt-0.5 min-w-0'>
            <MapPin size={10} className='text-amber-gold flex-shrink-0 mt-0.5' />
            <span className='line-clamp-2 md:line-clamp-1'>{addressDisplay}</span>
          </p>

          {/* Meta row: rating + distance + hours */}
          {/* RESPONSIVE: Bumped text from 10px to 11px/xs */}
          <div className='flex items-center gap-1.5 md:gap-2 text-[10px] sm:text-[11px] md:text-xs text-foreground/80 mt-1 font-medium truncate'>
            <span className='flex items-center gap-0.5 text-foreground font-bold'>
              <Star size={10} className='fill-amber-gold text-amber-gold flex-shrink-0' />
              {hasRating ? shop.rating?.toFixed(1) : 'Mới'}
            </span>
            <span className='text-border'>•</span>
            <span className='flex items-center gap-0.5 text-foreground font-semibold'>
              <Footprints size={10} className='text-amber-gold flex-shrink-0' />
              {distanceDisplay}
            </span>
            <span className='text-border'>•</span>
            <span className='flex items-center gap-0.5 text-foreground/80 font-semibold'>
              <Clock size={10} className='text-amber-gold flex-shrink-0' />
              {hasOpenInfo ? (isOpen ? 'Đang mở cửa' : 'Đã đóng cửa') : 'Giờ linh hoạt'}
            </span>
          </div>
        </div>

        <div className='flex items-center justify-between text-[11px] md:text-xs mt-auto pt-1 border-t border-border/50'>
          <span className='text-[11px] sm:text-xs text-foreground/80 font-semibold flex items-center gap-1'>
            <Tag size={10} className='text-amber-gold flex-shrink-0' />
            {shop.price_range || 'Bình dân'}
          </span>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
          >
            {/* RESPONSIVE: CTA button h-7 px-2 */}
            <Button
              variant='outline'
              size='sm'
              className='h-7 px-2 text-[10px] md:text-[11px] bg-secondary border-border text-foreground hover:text-amber-gold-hover hover:border-amber-gold/40 hover:bg-accent rounded-md font-semibold active:scale-95 transition-all shadow-xs'
            >
              <Navigation size={10} className='mr-1 text-amber-gold' /> Chỉ đường
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
});
