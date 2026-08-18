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
  size = 'small',
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}: ShopCardMediumProps) {
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
  const charCodeSum = shop.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const coverImage = shop.photos?.[0] || sampleImages[charCodeSum % sampleImages.length];

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className="col-span-1 sm:col-span-2 row-span-1 w-full h-full card-glow-border bg-gradient-to-r from-dark-roast via-dark-roast/90 to-dark-bg rounded-3xl border border-dark-border/80 shadow-md hover:shadow-2xl hover:border-amber-gold/40 hover:-translate-y-1.5 transition-all duration-300 p-3.5 flex gap-3.5 cursor-pointer group relative overflow-hidden"
    >
      {/* Left Media with 4:3 Aspect Ratio Container */}
      <div className="relative w-[36%] sm:w-[34%] h-full min-h-[130px] rounded-2xl overflow-hidden bg-dark-bg flex-shrink-0 border border-dark-border/60">
        {!imgError ? (
          <img
            src={coverImage}
            alt={shop.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-dark-roast/80 text-warm-gray gap-1.5 p-2">
            <Coffee size={24} className="text-amber-gold opacity-60" />
            <span className="text-xs font-sans font-bold tracking-wider text-soft-beige">{shop.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Status Pill */}
        <Badge
          variant="outline"
          className={cn(
            'absolute top-2.5 left-2.5 text-[9px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm',
            isOpen
              ? 'bg-[#7CAE8E]/25 text-[#A3D9B1] border-[#7CAE8E]/30'
              : 'bg-[#C97A7A]/25 text-[#E8A5A5] border-[#C97A7A]/30'
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full mr-1', isOpen ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]')} />
          {isOpen ? 'Open' : 'Closed'}
        </Badge>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 space-y-1.5">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h4 className="font-sans font-bold text-sm sm:text-base text-cream-white line-clamp-1 group-hover:text-amber-gold-hover transition-colors tracking-tight">
              {shop.name}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFav}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="h-7 w-7 rounded-full bg-dark-bg/60 hover:bg-dark-bg border border-dark-border/40 text-cream-white shadow-sm flex-shrink-0 transition-all focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
            >
              <Heart
                size={14}
                className={cn(
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-cream-white/70',
                  isHeartAnimating && 'animate-heart-beat'
                )}
              />
            </Button>
          </div>

          <p className="text-xs text-soft-beige/80 flex items-center gap-1 line-clamp-1 mt-0.5">
            <MapPin size={11} className="text-amber-gold flex-shrink-0" />
            {shop.address}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-soft-beige/70 mt-1 font-medium">
            <Clock size={10} className="text-amber-gold/80 flex-shrink-0" />
            <span className="truncate">{isOpen ? 'Closes 10:30 PM' : 'Opens 07:00 AM'}</span>
            <span className="text-dark-border">•</span>
            <Wifi size={10} className="text-soft-beige/70 flex-shrink-0" />
            <span className="truncate">{shop.price_range || '€€'} · Wi-Fi</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-dark-border/50">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-dark-bg/90 text-amber-gold border-dark-border font-bold text-[11px] py-0.5 px-2 rounded-lg flex items-center gap-1">
              <Star size={11} className="fill-amber-gold text-amber-gold" /> {shop.rating.toFixed(1)}
            </Badge>
            <span className="text-soft-beige text-[11px] font-medium flex items-center gap-1">
              <Footprints size={11} className="text-amber-gold/70" /> {shop.distance_text}
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
              className="h-7 px-2.5 text-[11px] bg-dark-bg/60 border-dark-border text-cream-white hover:text-amber-gold-hover hover:border-amber-gold/40 hover:bg-dark-bg rounded-lg font-medium transition-all"
            >
              <Navigation size={11} className="mr-1 text-amber-gold" /> Nav
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
});
