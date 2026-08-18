'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Navigation, Star, Footprints, ExternalLink, Quote, Coffee, Clock, Wifi, Images } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { cn } from '@/lib/utils';

interface ShopCardLargeProps {
  shop: CoffeeShop;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
}

export function ShopCardLarge({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}: ShopCardLargeProps) {
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
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80',
  ];

  const rawPhotos = shop.photos && shop.photos.length > 0 ? shop.photos : [];
  const photo1 = rawPhotos[0] || sampleGallery[0];
  const photo2 = rawPhotos[1] || sampleGallery[1];
  const photo3 = rawPhotos[2] || sampleGallery[2];
  const extraCount = Math.max(rawPhotos.length > 3 ? rawPhotos.length - 2 : 2, 2);

  const categoryTagline =
    shop.categories && shop.categories.length > 0
      ? `Artisan ${shop.categories
          .map((c) => c.replace(/^catering\./, '').replace(/_/g, ' '))
          .filter((c) => c.length > 0)
          .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
          .join(' • ')} with specialty roasts & cozy atmosphere.`
      : 'Artisan Vietnamese drip coffee, specialty roasts & tranquil courtyard workspace.';

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className="col-span-2 row-span-2 card-glow-border bg-gradient-to-b from-dark-roast via-[#25140d] to-dark-bg rounded-3xl border border-dark-border/80 shadow-2xl hover:shadow-[0_20px_50px_rgba(212,160,87,0.15)] hover:border-amber-gold/50 hover:-translate-y-1.5 transition-all duration-300 p-0 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* 2-Column Magazine-Style Gallery (60% Left, 40% Right Stacked) */}
      <div className="relative w-full h-56 sm:h-64 p-1.5 flex gap-1.5 bg-dark-bg/60 border-b border-dark-border/60 overflow-hidden flex-shrink-0">
        {/* Left Column (60% Width) - Primary Image */}
        <div className="w-[60%] h-full rounded-2xl overflow-hidden relative bg-dark-roast border border-dark-border/40">
          {!imgError ? (
            <img
              src={photo1}
              alt={`${shop.name} main`}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-dark-roast text-warm-gray gap-1.5 p-2">
              <Coffee size={28} className="text-amber-gold opacity-60" />
              <span className="text-xs font-sans font-bold text-soft-beige">{shop.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Right Column (40% Width) - Two 50% Height Rows */}
        <div className="w-[40%] h-full flex flex-col gap-1.5">
          {/* Top Row (50% Height) */}
          <div className="h-1/2 rounded-xl overflow-hidden relative bg-dark-roast border border-dark-border/40">
            <img
              src={photo2}
              alt={`${shop.name} secondary`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Bottom Row (50% Height) with +N More Overlay */}
          <div className="h-1/2 rounded-xl overflow-hidden relative bg-dark-roast border border-dark-border/40">
            <img
              src={photo3}
              alt={`${shop.name} detail`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center text-amber-gold font-bold text-xs tracking-tight gap-1 hover:bg-black/50 transition-colors">
              <Images size={13} className="text-amber-gold" />
              <span>+{extraCount} more</span>
            </div>
          </div>
        </div>

        {/* Floating Status Badge on Top-Left */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <Badge
            variant="outline"
            className={cn(
              'text-[9px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-md',
              isOpen
                ? 'bg-[#7CAE8E]/30 text-[#A3D9B1] border-[#7CAE8E]/40'
                : 'bg-[#C97A7A]/30 text-[#E8A5A5] border-[#C97A7A]/40'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full mr-1', isOpen ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]')} />
            {isOpen ? 'Open Now' : 'Closed'}
          </Badge>
        </div>

        {/* Floating Favorite Button on Top-Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFav}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3.5 right-3.5 z-10 h-7 w-7 rounded-full bg-dark-bg/80 backdrop-blur-md hover:bg-dark-roast border border-dark-border/60 text-cream-white shadow-md transition-all focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
        >
          <Heart
            size={14}
            className={cn(
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-cream-white/80',
              isHeartAnimating && 'animate-heart-beat'
            )}
          />
        </Button>
      </div>

      {/* Structured Content Area Below Image */}
      <CardContent className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between overflow-visible min-h-0">
        {/* Section 1: Shop Name & Address */}
        <div>
          <h3 className="font-sans font-bold text-lg sm:text-xl text-cream-white tracking-tight line-clamp-1 group-hover:text-amber-gold-hover transition-colors">
            {shop.name}
          </h3>
          <p className="text-xs text-soft-beige/90 flex items-center gap-1 mt-0.5 line-clamp-1">
            <MapPin size={12} className="text-amber-gold flex-shrink-0" />
            {shop.address}
          </p>
        </div>

        {/* Section 2: Excerpt / Atmosphere Tagline Panel */}
        <div className="bg-dark-bg/70 px-3 py-2 rounded-xl border border-dark-border/60 text-xs text-soft-beige/90 leading-relaxed flex items-start gap-2 shadow-inner">
          <Quote size={13} className="text-amber-gold flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{categoryTagline}</span>
        </div>

        {/* Section 3: 4-Box Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-dark-roast/50 p-2 rounded-xl border border-dark-border/50 text-xs">
          <div className="flex items-center gap-1.5 bg-dark-bg/60 p-1.5 rounded-lg border border-dark-border/40">
            <Star size={12} className="fill-amber-gold text-amber-gold flex-shrink-0" />
            <span className="font-bold text-cream-white text-xs">{shop.rating.toFixed(1)}</span>
            <span className="text-[10px] text-warm-gray truncate">({shop.total_ratings})</span>
          </div>

          <div className="flex items-center gap-1 bg-dark-bg/60 p-1.5 rounded-lg border border-dark-border/40 text-soft-beige font-medium">
            <Footprints size={12} className="text-amber-gold/80 flex-shrink-0" />
            <span className="truncate text-[11px]">{shop.distance_text}</span>
          </div>

          <div className="flex items-center gap-1 bg-dark-bg/60 p-1.5 rounded-lg border border-dark-border/40 text-soft-beige/90 font-medium">
            <Clock size={12} className="text-amber-gold/80 flex-shrink-0" />
            <span className="truncate text-[11px]">{isOpen ? 'Closes 10:30 PM' : 'Opens 07:00 AM'}</span>
          </div>

          <div className="flex items-center gap-1 bg-dark-bg/60 p-1.5 rounded-lg border border-dark-border/40 text-soft-beige/90 font-medium">
            <Wifi size={12} className="text-soft-beige/70 flex-shrink-0" />
            <span className="truncate text-[11px]">{shop.price_range || '€€'} · Wi-Fi</span>
          </div>
        </div>

        {/* Section 4: Call-To-Action Row Aligned Bottom Right */}
        <div className="flex items-center justify-end gap-2 pt-0.5">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-dark-roast/70 border-dark-border text-cream-white hover:text-amber-gold-hover hover:border-amber-gold/40 hover:bg-dark-roast rounded-xl font-medium transition-all"
            >
              <Navigation size={12} className="mr-1 text-amber-gold" /> Directions
            </Button>
          </a>

          <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3.5 text-xs bg-amber-gold text-dark-bg hover:bg-amber-gold-hover rounded-xl font-bold transition-all shadow-md"
            >
              Explore Details <ExternalLink size={12} className="ml-1 opacity-90" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
