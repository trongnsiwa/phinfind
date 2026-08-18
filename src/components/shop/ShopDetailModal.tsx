'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Heart,
  MapPin,
  Star,
  Footprints,
  Navigation,
  ExternalLink,
  Coffee,
  Clock,
  Wifi,
  Sparkles,
  Wind,
  Zap,
  CupSoda,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { cn } from '@/lib/utils';

export interface ShopDetailModalProps {
  shop: CoffeeShop | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (placeId: string) => void;
  isFavorite?: boolean;
}

export function ShopDetailModal({
  shop,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite = false,
}: ShopDetailModalProps) {
  const [imgError, setImgError] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // Close on Escape key press & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Reset img error on shop change
  useEffect(() => {
    setImgError(false);
  }, [shop?.id]);

  if (!shop) return null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id);
  };

  const isOpenNow = shop.opening_hours?.open_now;
  const hasOpenInfo = shop.opening_hours?.open_now !== undefined;
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const hasTotalRatings = typeof shop.total_ratings === 'number' && shop.total_ratings > 0;
  const distanceText = shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Nearby';
  const sampleImages = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
  ];

  const charCodeSum = (shop.id || shop.place_id || 'coffee')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const coverImage = shop.photos?.[0] || sampleImages[charCodeSum % sampleImages.length];

  const formatCategories = () => {
    if (!shop.categories || shop.categories.length === 0) {
      return 'Artisan Vietnamese coffee spot featuring specialty beans and a relaxing atmosphere.';
    }
    const cleaned = shop.categories
      .map((c) => c.replace(/^catering\./, '').replace(/_/g, ' ').trim())
      .filter((c) => c.length > 0 && c !== 'cafe' && c !== 'coffee')
      .map((c) => c.charAt(0).toUpperCase() + c.slice(1));

    if (cleaned.length === 0) {
      return 'Artisan Vietnamese coffee spot featuring specialty beans and a relaxing atmosphere.';
    }
    return `Specialty ${cleaned.join(' • ')} with handcrafted brews and cozy vibes.`;
  };

  // Amenities chips
  const amenities = [
    { icon: Wifi, label: 'Fast Wi-Fi' },
    { icon: Zap, label: 'Power Outlets' },
    { icon: Wind, label: 'A/C Cooling' },
    { icon: CupSoda, label: 'Specialty Drinks' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shop-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Full-screen Glassmorphism Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-dark-bg/80 backdrop-blur-xl"
            aria-hidden="true"
          />

          {/* Centered Premium Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-dark-bg/95 border border-dark-border/60 rounded-3xl shadow-2xl shadow-black/60 p-5 sm:p-6 space-y-4 z-10 my-auto text-cream-white overflow-hidden"
          >
            {/* Top Hero Image Header */}
            <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-dark-roast border border-dark-border/60 flex-shrink-0">
              {!imgError ? (
                <img
                  src={coverImage}
                  alt={shop.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-roast to-dark-bg text-warm-gray gap-2 p-4">
                  <div className="w-14 h-14 rounded-2xl bg-dark-roast/80 border border-dark-border/60 flex items-center justify-center shadow-inner">
                    <Coffee size={28} className="text-amber-gold" />
                  </div>
                  <span className="text-xs font-semibold text-soft-beige/90 tracking-wide uppercase">
                    {shop.name || 'PhinFind Specialty Café'}
                  </span>
                </div>
              )}

              {/* Gradient Vignette for Text & Badge Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/85 via-black/20 to-black/50 pointer-events-none" />

              {/* Top Left: Open/Closed & Price Badges */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                {hasOpenInfo && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-md backdrop-blur-md',
                      isOpenNow
                        ? 'bg-[#7CAE8E]/30 text-[#A3D9B1] border-[#7CAE8E]/50'
                        : 'bg-[#C97A7A]/30 text-[#E8A5A5] border-[#C97A7A]/50'
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full mr-1.5',
                        isOpenNow ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]'
                      )}
                    />
                    {isOpenNow ? 'Open Now' : 'Closed'}
                  </Badge>
                )}

                {shop.price_range && (
                  <Badge
                    variant="secondary"
                    className="bg-dark-bg/80 text-amber-gold border border-dark-border/60 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-md"
                  >
                    {shop.price_range}
                  </Badge>
                )}
              </div>

              {/* Top Right: Favorite & Close Actions */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteClick}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                  className="h-8 w-8 rounded-full bg-dark-bg/80 backdrop-blur-md border border-dark-border/60 text-warm-gray hover:text-cream-white hover:bg-white/10 shadow-md transition-colors active:scale-95"
                >
                  <Heart
                    size={16}
                    className={cn(
                      'transition-colors duration-200',
                      isFavorite ? 'fill-rose-500 text-rose-500' : 'text-warm-gray hover:text-rose-400',
                      isHeartAnimating && 'animate-heart-beat'
                    )}
                  />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="h-8 w-8 rounded-full bg-dark-bg/80 backdrop-blur-md border border-dark-border/60 text-warm-gray hover:text-cream-white hover:bg-white/10 shadow-md transition-colors active:scale-95"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Shop Title & Address */}
            <div className="space-y-1 max-w-full">
              <h2
                id="shop-modal-title"
                className="font-sans font-bold text-2xl text-cream-white tracking-tight leading-tight break-words"
              >
                {shop.name}
              </h2>
              <p className="text-sm text-soft-beige/80 flex items-start gap-1 break-words whitespace-normal max-w-full">
                <MapPin size={14} className="text-amber-gold flex-shrink-0 mt-0.5" />
                <span className="flex-1">{shop.address || 'Address unavailable'}</span>
              </p>
            </div>

            {/* Metrics & Badges Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="bg-dark-roast/90 text-amber-gold border-dark-border/80 flex items-center gap-1.5 font-bold py-1 px-2.5 rounded-xl shadow-sm"
              >
                {hasRating ? (
                  <>
                    <Star size={13} className="fill-amber-gold text-amber-gold" />
                    <span>{shop.rating.toFixed(1)}</span>
                    {hasTotalRatings && (
                      <span className="text-[11px] text-warm-gray font-normal">
                        ({shop.total_ratings})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Star size={13} className="text-amber-gold/50" />
                    <span>New</span>
                  </>
                )}
              </Badge>

              <Badge
                variant="outline"
                className="bg-dark-roast/90 text-soft-beige border-dark-border/80 flex items-center gap-1.5 font-medium py-1 px-2.5 rounded-xl shadow-sm"
              >
                <Footprints size={13} className="text-amber-gold/80" />
                <span>{distanceText}</span>
              </Badge>

              <Badge
                variant="outline"
                className="bg-dark-roast/90 text-soft-beige border-dark-border/80 flex items-center gap-1.5 font-medium py-1 px-2.5 rounded-xl shadow-sm"
              >
                <Clock size={13} className="text-amber-gold/80" />
                <span>{isOpenNow ? 'Open Now' : 'Closed'}</span>
              </Badge>
            </div>

            {/* Short Tagline / Category Description */}
            <div className="bg-dark-roast/40 px-3.5 py-2.5 rounded-2xl border border-dark-border/50 text-xs text-soft-beige/90 leading-relaxed flex items-start gap-2 shadow-inner">
              <Sparkles size={14} className="text-amber-gold flex-shrink-0 mt-0.5" />
              <span>{formatCategories()}</span>
            </div>

            {/* Amenities Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-soft-beige/70 uppercase tracking-wider">
                Featured Amenities
              </span>
              <div className="grid grid-cols-2 gap-2">
                {amenities.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-dark-roast/50 border border-dark-border/40 px-2.5 py-1.5 rounded-xl text-xs text-soft-beige"
                    >
                      <Icon size={13} className="text-amber-gold/90 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 bg-dark-roast/80 hover:bg-dark-roast border-dark-border text-cream-white hover:text-amber-gold hover:border-amber-gold/40 rounded-xl h-11 text-xs font-semibold transition-all shadow-sm"
                asChild
              >
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation size={14} className="mr-1.5 text-amber-gold" />
                  Get Directions
                </a>
              </Button>

              <Button
                variant="default"
                className="flex-1 bg-amber-gold text-dark-bg hover:bg-amber-gold-hover rounded-xl h-11 text-xs font-bold transition-all shadow-lg shadow-amber-gold/20"
                asChild
              >
                <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)}>
                  View Details
                  <ExternalLink size={13} className="ml-1.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
