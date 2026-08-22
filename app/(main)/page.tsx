'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShopDrawer } from '@/components/shop/ShopDrawer';

import { BentoGrid } from '@/components/bento/BentoGrid';
import { SearchBar } from '@/components/bento/SearchBar';
import { FilterChips } from '@/components/bento/FilterChips';
import { FloatingFilterBar } from '@/components/bento/FloatingFilterBar';
import { ShopCardSmall } from '@/components/bento/ShopCardSmall';
import { ShopCardMedium } from '@/components/bento/ShopCardMedium';
import { ShopCardLarge } from '@/components/bento/ShopCardLarge';
import { ShopCardFeatured } from '@/components/bento/ShopCardFeatured';
import { InfiniteScroll } from '@/components/bento/InfiniteScroll';
import { ListSkeleton, SkeletonCard } from '@/components/common/LoadingSkeleton';

import { useLocation } from '@/hooks/useLocation';
import { useInfiniteShops } from '@/hooks/useShops';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { useAuth } from '@/hooks/useAuth';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { generateCardSizes } from '@/lib/utils/bentoLayout';
import type { CoffeeShop } from '@/types/shop';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/lib/utils/constants';

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { lat, lng, isFallback, loading: locationLoading } = useLocation();
  const { searchQuery, filters, setFilters, resetFilters } = useUIStore();
  const { selectedShop, setSelectedShop, favorites, toggleFavorite } = useShopStore();

  const {
    data,
    isLoading: shopsLoading,
    isFetching: shopsFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isPending: shopsPending,
    isError,
    refetch,
  } = useInfiniteShops(lat, lng, 12);

  const rawShops = useMemo(() => {
    return data?.pages.flatMap((page) => page.shops) || [];
  }, [data]);

  const { data: cityName = 'Hà Nội', isLoading: isCityLoading } = useReverseGeocode(
    lat,
    lng,
    isFallback
  );

  const hasLoadedOnceRef = useRef(false);
  if (rawShops.length > 0) {
    hasLoadedOnceRef.current = true;
  }

  const isInitialLoading =
    !hasLoadedOnceRef.current &&
    (!data || shopsLoading || shopsPending || (rawShops.length === 0 && locationLoading));

  const topFilterRef = useRef<HTMLDivElement>(null);
  const [isFilterFloating, setIsFilterFloating] = useState(false);

  const handleToggleFav = (placeId: string) => {
    if (!isAuthenticated) {
      toast('Sign in required', {
        description: 'Sign in to start saving your favorite spots and share your coffee experiences.',
        action: {
          label: 'Sign in',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }

    const isFav = favorites.includes(placeId);
    toggleFavorite(placeId);
    if (isFav) {
      toast.info('Removed from favorites');
    } else {
      toast.success('Shop saved to favorites!');
    }
  };

  // Auto-open drawer if ?shop=id query param or /shop/[id] deep link is present on page load
  useEffect(() => {
    if (rawShops.length > 0 && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shopQueryId = urlParams.get('shop');
      const pathMatch = window.location.pathname.match(/\/shop\/([^/]+)/);
      const targetId = shopQueryId || (pathMatch ? pathMatch[1] : null);

      if (targetId && (!selectedShop || (selectedShop.id !== targetId && selectedShop.place_id !== targetId))) {
        const found = rawShops.find((s) => s.id === targetId || s.place_id === targetId);
        if (found) {
          setSelectedShop(found);
        }
      }
    }
  }, [rawShops, selectedShop, setSelectedShop]);

  // Handle popstate on page to close drawer if ?shop param is removed via back button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get('shop') && selectedShop) {
        setSelectedShop(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedShop, setSelectedShop]);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredFilters = useDeferredValue(filters);

  const isFilterActive = Boolean(
    searchQuery.trim() ||
    filters.openNowOnly ||
    (filters.minRating && filters.minRating > 0)
  );

  const isFiltered = Boolean(
    deferredSearchQuery.trim() ||
    deferredFilters.openNowOnly ||
    (deferredFilters.minRating && deferredFilters.minRating > 0)
  );

  // Filter & sort shop results
  const filteredShops = useMemo(() => {
    let result = [...rawShops];

    if (deferredFilters.openNowOnly) {
      result = result.filter((s) => s.opening_hours?.open_now);
    }

    if (deferredFilters.minRating && deferredFilters.minRating > 0) {
      result = result.filter((s) => (s.rating || 0) >= (deferredFilters.minRating || 0));
    }

    const q = deferredSearchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.address && s.address.toLowerCase().includes(q))
      );
    }

    if (deferredFilters.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (deferredFilters.sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return result;
  }, [rawShops, deferredFilters, deferredSearchQuery]);

  // Persistent displayed shops state to eliminate transient empty state flashes
  const [displayedShops, setDisplayedShops] = useState<CoffeeShop[]>([]);

  useEffect(() => {
    if (filteredShops.length > 0) {
      setDisplayedShops(filteredShops);
    } else if (isFilterActive) {
      setDisplayedShops([]);
    }
  }, [filteredShops, isFilterActive]);

  // Generate dynamic, balanced card sizes (Small 50%, Medium 25%, Large 15%, Featured 10%)
  const cardSizes = useMemo(() => generateCardSizes(displayedShops), [displayedShops]);

  const nextBatchSkeletonSizes: ('small' | 'medium' | 'large' | 'featured')[] = [
    'small',
    'medium',
    'small',
    'large',
    'small',
    'small',
    'small',
  ];

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
              <span className="font-bold text-cream-white tracking-tight">{displayedShops.length} shops nearby</span>
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
      {isInitialLoading ? (
        <ListSkeleton count={12} />
      ) : isError && rawShops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-dark-bg/60 rounded-3xl border border-dark-border/60">
          <Coffee size={40} className="text-rose-400 mb-3" />
          <h3 className="font-sans font-bold text-lg text-cream-white mb-1">Failed to load coffee spots</h3>
          <p className="text-xs text-soft-beige/80 max-w-sm mb-4">
            We encountered an issue fetching spots nearby. Please try again.
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-amber-gold text-dark-bg hover:bg-amber-gold-hover font-bold rounded-xl text-xs px-4 py-2"
          >
            Try Again
          </Button>
        </div>
      ) : displayedShops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-dark-bg/60 rounded-3xl border border-dark-border/60 animate-in fade-in duration-300">
          <Coffee size={40} className="text-amber-gold/60 mb-3" />
          <h3 className="font-sans font-bold text-lg text-cream-white mb-1">No coffee spots found</h3>
          <p className="text-xs text-soft-beige/80 max-w-sm mb-4">
            Try adjusting your search query or filters to find more artisan spots nearby.
          </p>
          <Button
            onClick={resetFilters}
            className="bg-amber-gold text-dark-bg hover:bg-amber-gold-hover font-bold rounded-xl text-xs px-4 py-2"
          >
            Reset Filters
          </Button>
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

          {/* Next Page Skeleton Placeholders (only in unfiltered view when scrolling at the bottom) */}
          {!isFiltered && isFetchingNextPage &&
            nextBatchSkeletonSizes.map((size, idx) => (
              <SkeletonCard key={`skeleton-next-${idx}`} size={size} />
            ))}

          {/* Infinite Scroll Sentinel (only active in unfiltered view) */}
          {!isFiltered && (
            <InfiniteScroll
              onLoadMore={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              hasMore={Boolean(hasNextPage)}
              isLoading={isFetchingNextPage}
            />
          )}
        </BentoGrid>
      )}

      {/* Floating Sticky Quick Filter Bar */}
      <FloatingFilterBar isVisible={isFilterFloating} shopCount={displayedShops.length} />

      {/* Unified Google Maps-Style Tabbed Shop Drawer */}
      <ShopDrawer
        shop={selectedShop}
        isOpen={Boolean(selectedShop)}
        onClose={() => setSelectedShop(null)}
        onToggleFavorite={handleToggleFav}
        isFavorite={selectedShop ? favorites.includes(selectedShop.place_id) : false}
      />
    </div>
  );
}


