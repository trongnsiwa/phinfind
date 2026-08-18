'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, Heart, MapPin, Star } from 'lucide-react';
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

  const displayedShops = useMemo(() => {
    return filteredShops.slice(0, visibleCount);
  }, [filteredShops, visibleCount]);

  const hasMore = visibleCount < filteredShops.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto text-cream-white">
      {/* Compact Premium Filter Card */}
      <div className="bg-dark-bg/95 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border border-dark-border shadow-xl shadow-black/30 space-y-3">
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

      {/* Pure Coffee Bento Grid Area (Below Filter Area) */}
      {shopsLoading ? (
        <ListSkeleton count={8} />
      ) : (
        <BentoGrid>
          {displayedShops.map((shop, index) => {
            const isFav = favorites.includes(shop.place_id);

            // Bento Grid Card Size Assignment Logic:
            // Every 15th card: Featured (3 columns × 2 rows)
            // Every 10th card: Large (2 columns × 2 rows)
            // Every 5th card: Medium (2 columns × 1 row)
            // All others: Small (1 column × 1 row)
            if (index % 15 === 14) {
              return (
                <ShopCardFeatured
                  key={shop.id}
                  shop={shop}
                  isFavorite={isFav}
                  onToggleFavorite={handleToggleFav}
                  onSelect={setSelectedShop}
                />
              );
            }

            if (index % 10 === 9) {
              return (
                <ShopCardLarge
                  key={shop.id}
                  shop={shop}
                  isFavorite={isFav}
                  onToggleFavorite={handleToggleFav}
                  onSelect={setSelectedShop}
                />
              );
            }

            if (index % 5 === 4) {
              return (
                <ShopCardMedium
                  key={shop.id}
                  shop={shop}
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

