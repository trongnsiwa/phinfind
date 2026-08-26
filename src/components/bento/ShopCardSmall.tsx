'use client';

import React, { memo, useState } from 'react';
import { Heart, Star, Footprints, MapPin, Coffee, Clock, Wifi } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CoffeeShop } from '@/types/shop';
import { CardSize } from '@/lib/utils/bentoLayout';
import { cn } from '@/lib/utils';

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
  onSelect,
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
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&q=80',
  ];
  const charCodeSum = (shop.id || shop.place_id || 'shop').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const coverImage = shop.photos?.[0] || sampleImages[charCodeSum % sampleImages.length];

  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceDisplay = shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Nearby';
  const addressDisplay = shop.address?.trim() || 'Address unavailable';

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className="col-span-1 row-span-1 w-full h-full card-glow-border bg-gradient-to-b from-[#141414] to-[#101010]/95 rounded-3xl border border-[#2A2A2A]/80 shadow-md hover:shadow-2xl hover:border-amber-gold/40 hover:-translate-y-1.5 transition-all duration-300 p-3 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* Image Showcase with Overlapping Badges */}
      <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-[#101010] flex-shrink-0 border border-[#2A2A2A]/60">
        {!imgError ? (
          <img
            src={coverImage}
            alt={shop.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#141414]/80 text-[#A0A0A0] gap-1.5">
            <Coffee size={22} className="text-amber-gold opacity-60" />
            <span className="text-[10px] font-sans font-bold tracking-wider text-[#D0D0D0]">{(shop.name || 'Coffee').slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/80 via-transparent to-black/25 pointer-events-none" />

        {/* Floating Status Pill */}
        {hasOpenInfo && (
          <Badge
            variant="outline"
            className={cn(
              'absolute top-2.5 left-2.5 text-[9px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm',
              isOpen
                ? 'bg-[#7CAE8E]/20 text-[#A3D9B1] border-[#7CAE8E]/30'
                : 'bg-[#C97A7A]/20 text-[#E8A5A5] border-[#C97A7A]/30'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full mr-1', isOpen ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]')} />
            {isOpen ? 'Open' : 'Closed'}
          </Badge>
        )}

        {/* Floating Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFav}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-2.5 right-2.5 z-10 h-7 w-7 rounded-full bg-[#101010]/70 backdrop-blur-md hover:bg-[#141414] border border-[#2A2A2A]/50 text-white shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
        >
          <Heart
            size={13}
            className={cn(
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/80',
              isHeartAnimating && 'animate-heart-beat'
            )}
          />
        </Button>
      </div>

      {/* Content Body */}
      <div className="space-y-1 mt-2 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-sans font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-amber-gold-hover transition-colors tracking-tight">
            {shop.name}
          </h4>
          <p className="text-[11px] text-[#D0D0D0]/80 line-clamp-1 flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-amber-gold flex-shrink-0" />
            {addressDisplay}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-[#D0D0D0]/70 mt-1 font-medium">
            <Clock size={10} className="text-amber-gold/75 flex-shrink-0" />
            <span className="truncate">{isOpen ? 'Closes 10:30 PM' : 'Opens 07:00 AM'}</span>
            <span className="text-[#2A2A2A]">•</span>
            <Wifi size={10} className="text-[#D0D0D0]/70 flex-shrink-0" />
            <span className="truncate">{shop.price_range || '€€'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#2A2A2A]/50">
          <span className="font-bold text-amber-gold flex items-center gap-1 bg-[#101010]/80 border border-[#2A2A2A]/80 px-2 py-0.5 rounded-lg text-[10px]">
            {hasRating ? (
              <>
                <Star size={10} className="fill-amber-gold text-amber-gold" />
                {shop.rating.toFixed(1)}
              </>
            ) : (
              <>
                <Star size={10} className="text-amber-gold/50" />
                <span>New</span>
              </>
            )}
          </span>
          <span className="text-[#D0D0D0] flex items-center gap-1 text-[10px] font-medium">
            <Footprints size={10} className="text-amber-gold/70" />
            {distanceDisplay}
          </span>
        </div>
      </div>
    </Card>
  );
});
