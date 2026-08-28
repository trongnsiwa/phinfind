'use client';

import { Clock, Coffee, Footprints, Heart, MapPin, Navigation, Star, Wifi } from 'lucide-react';
import React, { memo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CardSize } from '@/lib/utils/bentoLayout';
import { CoffeeShop } from '@/types/shop';

import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';

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
  const [imgError, setImgError] = useState(false);

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

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className='col-span-1 sm:col-span-2 row-span-1 w-full h-full card-glow-border bg-gradient-to-b from-card via-card to-secondary/30 rounded-2xl border border-border/80 shadow-card hover:shadow-card-hover hover:border-amber-gold/50 hover:-translate-y-1 transition-all duration-300 p-3 flex gap-3 cursor-pointer group relative overflow-hidden'
    >
      {/* Left Media Container */}
      <div className='relative w-[36%] sm:w-[34%] h-full min-h-[130px] rounded-xl overflow-hidden bg-muted border border-border/60 flex-shrink-0'>
        {coverImage && !imgError ? (
          <>
            <img
              src={coverImage}
              alt={shop.name}
              onError={() => setImgError(true)}
              className='w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none' />
          </>
        ) : (
          <ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />
        )}

        {/* Floating Status Pill & Verification Badge */}
        <div className='absolute top-2 left-2 z-10 flex flex-col gap-1 items-start'>
          {shop.verified === false && (
            <Badge
              variant='outline'
              className='text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm bg-amber-500/80 text-white border-amber-400 flex items-center gap-1'
            >
              <Clock size={9} />
              <span>Chờ xác minh</span>
            </Badge>
          )}

          {hasOpenInfo && (
            <Badge
              variant='outline'
              className={cn(
                'text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border backdrop-blur-md shadow-sm tracking-wide',
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
      </div>

      {/* Right Content */}
      <div className='flex-1 flex flex-col justify-between py-0 min-w-0'>
        <div>
          <div className='flex items-start justify-between gap-1'>
            <h4 className='font-sans font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-amber-gold-hover transition-colors tracking-tight'>
              {shop.name}
            </h4>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleFav}
              aria-label={
                isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'
              }
              className='h-7 w-7 rounded-full bg-background/80 hover:bg-secondary border border-border/60 text-foreground shadow-sm flex-shrink-0 transition-all active:scale-90 focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0'
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

          <p className='text-xs text-foreground/80 font-medium text-wrap flex items-center gap-1 mt-0.5'>
            <MapPin size={11} className='text-amber-gold flex-shrink-0' />
            {addressDisplay}
          </p>

          {/* Meta row: rating + distance + hours */}
          <div className='flex items-center gap-2 text-[10px] text-foreground/80 mt-1 font-medium'>
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

        <div className='flex items-center justify-between text-xs mt-auto pt-1 border-t border-border/50'>
          <span className='text-[11px] text-foreground/80 font-semibold flex items-center gap-1'>
            <Wifi size={10} className='text-amber-gold flex-shrink-0' />
            {shop.price_range || 'Bình dân'}
          </span>


          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant='outline'
              size='sm'
              className='h-6.5 px-2.5 text-[10px] bg-secondary border-border text-foreground hover:text-amber-gold-hover hover:border-amber-gold/40 hover:bg-accent rounded-md font-semibold active:scale-95 transition-all shadow-xs'
            >
              <Navigation size={10} className='mr-1 text-amber-gold' /> Chỉ đường
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
});
