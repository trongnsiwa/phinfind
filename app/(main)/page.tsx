'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Coffee, Heart, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';

import { BentoGrid } from '@/components/bento/BentoGrid';
import { SearchBar } from '@/components/bento/SearchBar';
import { FilterChips } from '@/components/bento/FilterChips';
import { FloatingFilterBar } from '@/components/bento/FloatingFilterBar';
import { ShopCardSmall } from '@/components/bento/ShopCardSmall';
import { ShopCardMedium } from '@/components/bento/ShopCardMedium';
import { ShopCardLarge } from '@/components/bento/ShopCardLarge';
import { ShopCardFeatured } from '@/components/bento/ShopCardFeatured';
import { InfiniteScroll } from '@/components/bento/InfiniteScroll';
import { ListSkeleton } from '@/components/common/LoadingSkeleton';

import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops } from '@/hooks/useShops';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { generateCardSizes } from '@/lib/utils/bentoLayout';
import { toast } from 'sonner';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/utils/constants';

export default function DiscoverPage() {
  const { lat, lng, isFallback, loading: locationLoading } = useLocation();
  const { filters, setFilters } = useUIStore();
  const { selectedShop, setSelectedShop, favorites, toggleFavorite } = useShopStore();

  const { data: apiShops = [], isLoading: shopsLoading } = useNearbyShops(lat, lng);
  const { data: cityName = 'Hà Nội', isLoading: isCityLoading } = useReverseGeocode(
    lat,
    lng,
    isFallback
  );

  const topFilterRef = useRef<HTMLDivElement>(null);
  const [isFilterFloating, setIsFilterFloating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const handleToggleFav = (placeId: string) => {
    const isFav = favorites.includes(placeId);
    toggleFavorite(placeId);
    if (isFav) {
      toast.info('Removed from favorites');
    } else {
      toast.success('Shop saved to favorites!');
    }
  };

  // Filter & sort shop results
  const filteredShops = useMemo(() => {
    let result = [...apiShops];

    if (filters.openNowOnly) {
      result = result.filter((s) => s.opening_hours?.open_now);
    }

    if (filters.minRating && filters.minRating > 0) {
      result = result.filter((s) => s.rating >= (filters.minRating || 0));
    }

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [apiShops, filters]);

  // Generate dynamic, balanced card sizes (Small 50%, Medium 25%, Large 15%, Featured 10%)
  const cardSizes = useMemo(() => generateCardSizes(filteredShops), [filteredShops]);

  const displayedShops = useMemo(() => {
    return filteredShops.slice(0, visibleCount);
  }, [filteredShops, visibleCount]);

  const hasMore = visibleCount < filteredShops.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  // IntersectionObserver to reveal sticky floating filter bar when top filter exits viewport
  useEffect(() => {
    const target = topFilterRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFilterFloating(!entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: '-60px 0px 0px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-5 max-w-7xl mx-auto text-cream-white">
      {/* Compact Premium Top Filter Card */}
      <div
        ref={topFilterRef}
        className="bg-dark-bg/95 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border border-dark-border shadow-xl shadow-black/30 space-y-3"
      >
        {/* Row 1: Prominent Full-Width Search Bar */}
        <SearchBar />

        {/* Row 2: Single Cohesive Controls Bar (Filter Chips + Results Count & Location + Sort Dropdown) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-dark-border/60">
          {/* Left: Scrollable Filter Chips */}
          <div className="flex-1 min-w-0">
            <FilterChips />
          </div>

          {/* Right: Results Count, Location Badge, & Sort Selector */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-dark-border/40">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-cream-white tracking-tight">{filteredShops.length} shops nearby</span>
              <Badge variant="outline" className="bg-dark-roast text-soft-beige border-dark-border text-[10px] px-2 py-0.5 rounded-full font-medium transition-all duration-200">
                {locationLoading || isCityLoading ? 'Locating...' : cityName}
              </Badge>
            </div>

            <div className="flex items-center">
              <Select
                value={filters.sortBy}
                onValueChange={(val) => setFilters({ sortBy: val as 'distance' | 'rating' | 'name' })}
              >
                <SelectTrigger
                  aria-label="Sort coffee shops by"
                  className="h-8 text-xs font-semibold bg-dark-roast text-cream-white border-dark-border rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-gold/60 focus:ring-offset-0 focus:border-amber-gold/60 focus:scale-[1.01] hover:border-amber-gold/40 hover:text-amber-gold-hover hover:bg-white/10 transition-all duration-200 ease-out w-auto gap-2 px-3 group"
                >
                  <ArrowUpDown size={14} className="text-amber-gold flex-shrink-0 transition-colors duration-200 group-hover:text-amber-gold-hover group-focus-within:text-amber-gold-hover" />
                  <SelectValue placeholder="Sort..." />
                </SelectTrigger>
                <SelectContent className="bg-dark-roast border-dark-border text-cream-white rounded-xl shadow-xl">
                  <SelectItem value="distance" className="focus:bg-dark-bg focus:text-amber-gold text-xs transition-colors cursor-pointer">
                    Distance
                  </SelectItem>
                  <SelectItem value="rating" className="focus:bg-dark-bg focus:text-amber-gold text-xs transition-colors cursor-pointer">
                    Rating
                  </SelectItem>
                  <SelectItem value="name" className="focus:bg-dark-bg focus:text-amber-gold text-xs transition-colors cursor-pointer">
                    Name
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Pure Coffee Dynamic Bento Grid Area */}
      {shopsLoading ? (
        <ListSkeleton count={8} />
      ) : filteredShops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-dark-bg/60 rounded-3xl border border-dark-border/60">
          <Coffee size={40} className="text-amber-gold/60 mb-3" />
          <h3 className="font-sans font-bold text-lg text-cream-white mb-1">No coffee spots found</h3>
          <p className="text-xs text-soft-beige/80 max-w-sm">
            Try adjusting your search query or filters to find more artisan spots nearby.
          </p>
        </div>
      ) : (
        <BentoGrid>
          {displayedShops.map((shop, index) => {
            const size = cardSizes[index] || 'small';
            const isFav = favorites.includes(shop.place_id);

            if (size === 'featured') {
              return (
                <ShopCardFeatured
                  key={shop.id}
                  shop={shop}
                  size={size}
                  isFavorite={isFav}
                  onToggleFavorite={handleToggleFav}
                  onSelect={setSelectedShop}
                />
              );
            }

            if (size === 'large') {
              return (
                <ShopCardLarge
                  key={shop.id}
                  shop={shop}
                  size={size}
                  isFavorite={isFav}
                  onToggleFavorite={handleToggleFav}
                  onSelect={setSelectedShop}
                />
              );
            }

            if (size === 'medium') {
              return (
                <ShopCardMedium
                  key={shop.id}
                  shop={shop}
                  size={size}
                  isFavorite={isFav}
                  onToggleFavorite={handleToggleFav}
                  onSelect={setSelectedShop}
                />
              );
            }

            return (
              <ShopCardSmall
                key={shop.id}
                shop={shop}
                size={size}
                isFavorite={isFav}
                onToggleFavorite={handleToggleFav}
                onSelect={setSelectedShop}
              />
            );
          })}

          {/* Infinite Scroll Sentinel */}
          <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} isLoading={false} />
        </BentoGrid>
      )}

      {/* Floating Sticky Quick Filter Bar */}
      <FloatingFilterBar isVisible={isFilterFloating} shopCount={filteredShops.length} />

      {/* Mobile Drawer Preview Modal for Selected Shop */}
      {selectedShop && (
        <Drawer open={!!selectedShop} onOpenChange={(open) => !open && setSelectedShop(null)}>
          <DrawerContent className="bg-dark-bg text-cream-white border-t border-dark-border p-5 space-y-4 max-w-lg mx-auto rounded-t-3xl shadow-2xl">
            <DrawerHeader className="p-0 text-left space-y-1">
              <div className="flex items-center justify-between">
                <DrawerTitle className="font-sans text-xl text-amber-gold">{selectedShop.name}</DrawerTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFav(selectedShop.place_id)}
                  className="rounded-full hover:bg-dark-roast text-soft-beige"
                >
                  <Heart
                    size={20}
                    className={favorites.includes(selectedShop.place_id) ? 'fill-rose-500 text-rose-500' : 'text-warm-gray'}
                  />
                </Button>
              </div>
              <DrawerDescription className="text-xs text-soft-beige flex items-center gap-1">
                <MapPin size={14} className="text-amber-gold flex-shrink-0" />
                {selectedShop.address}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex items-center gap-3 text-xs">
              <Badge variant="outline" className="bg-dark-roast text-amber-gold border-dark-border flex items-center gap-1 font-bold">
                <Star size={12} className="fill-amber-gold text-amber-gold" />
                {selectedShop.rating.toFixed(1)} ({selectedShop.total_ratings})
              </Badge>
              <span className="text-soft-beige font-medium">📍 {selectedShop.distance_text}</span>
            </div>

            <DrawerFooter className="p-0 flex flex-row gap-3 pt-3">
              <Button variant="outline" className="flex-1 border-dark-border text-cream-white hover:bg-dark-roast rounded-xl" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShop.lat},${selectedShop.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </Button>
              <Button variant="default" className="flex-1 bg-amber-gold text-dark-bg hover:bg-amber-gold-hover rounded-xl font-bold" asChild>
                <Link href={APP_ROUTES.SHOP_DETAIL(selectedShop.id)}>View Details</Link>
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}


