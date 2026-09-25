'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Coffee, Footprints, MapPin, Plus, RotateCcw, SlidersHorizontal, Sparkles, Star, TrendingUp, X } from 'lucide-react';
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { RadiusSlider } from '@/components/shop/RadiusSlider';
import { POPULAR_CATEGORIES } from '@/components/shop/AddShopDialog/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import dynamic from 'next/dynamic';

const ShopDrawer = dynamic(
  () => import('@/components/shop/ShopDrawer').then((mod) => mod.ShopDrawer),
  { ssr: false, loading: () => null }
);
const AddShopDialog = dynamic(
  () => import('@/components/shop/AddShopDialog').then((mod) => mod.AddShopDialog),
  { ssr: false, loading: () => null }
);


import { BentoGrid } from '@/components/bento/BentoGrid';
import { SearchBar } from '@/components/bento/SearchBar';
import { FilterChips } from '@/components/bento/FilterChips';
import { FloatingFilterBar } from '@/components/bento/FloatingFilterBar';
import { TrendingCarousel } from '@/components/bento/TrendingCarousel';
import { ShopCardSmall } from '@/components/bento/ShopCardSmall';
import { ShopCardMedium } from '@/components/bento/ShopCardMedium';
import { ShopCardLarge } from '@/components/bento/ShopCardLarge';
import { ShopCardFeatured } from '@/components/bento/ShopCardFeatured';
import { ShopCardFeaturedMobile } from '@/components/bento/ShopCardFeaturedMobile';
import { InfiniteScroll } from '@/components/bento/InfiniteScroll';
import { ListSkeleton, SkeletonCard } from '@/components/common/LoadingSkeleton';

import { useLocation } from '@/hooks/useLocation';
import { useInfiniteShops, useToggleFavorite, useUserFavorites, useTrendingShops, useNewShops } from '@/hooks/useShops';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { useAuth } from '@/hooks/useAuth';
import { useShopStore, closeActiveShop, clearShopQueryParam, isShopRecentlyDeleted } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { generateCardSizes, generateMobileCardSizes, type MobileCardSize } from '@/lib/utils/bentoLayout';
import { applyShopFilters, countActiveFilters } from '@/lib/utils/filters';
import type { CoffeeShop } from '@/types/shop';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APP_ROUTES, API_ENDPOINTS } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';

const MOBILE_PRICE_OPTIONS: Array<{ key: '₫' | '₫₫' | '₫₫₫' | '₫₫₫₫'; label: string }> = [
  { key: '₫', label: '₫ · Dưới 30k' },
  { key: '₫₫', label: '₫₫ · 30k – 60k' },
  { key: '₫₫₫', label: '₫₫₫ · 60k – 100k' },
  { key: '₫₫₫₫', label: '₫₫₫₫ · Trên 100k' },
];

export function DiscoverClient() {
  const router = useRouter();
  const topAmenities = useMemo(() => POPULAR_CATEGORIES.slice(0, 8), []);
  const { isAuthenticated } = useAuth();
  const { lat, lng, isFallback, loading: locationLoading, refetchLocation } = useLocation();
  const {
    searchQuery,
    filters,
    setFilters,
    resetFilters,
    mobileFilterSheetOpen,
    setMobileFilterSheetOpen,
    isAddShopDialogOpen,
  } = useUIStore();
  const { selectedShop, setSelectedShop, favorites } = useShopStore();

  useUserFavorites();
  const { toggleFavorite: toggleFavoriteMutation } = useToggleFavorite();

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
  } = useInfiniteShops(lat, lng, 12, filters.radiusKm);

  const {
    data: trendingShops = [],
    isLoading: trendingLoading,
    isError: trendingError,
  } = useTrendingShops(7, 10, lat, lng);

  const {
    data: newShops = [],
    isLoading: newShopsLoading,
    isError: newShopsError,
  } = useNewShops(10, lat, lng);

  const hasAnyCarousel =
    trendingLoading ||
    newShopsLoading ||
    trendingShops.length > 0 ||
    newShops.length > 0;

  useEffect(() => {
    if (trendingError) {
      console.warn('[DiscoverClient] Failed to load trending shops');
    }
  }, [trendingError]);

  useEffect(() => {
    if (newShopsError) {
      console.warn('[DiscoverClient] Failed to load new shops');
    }
  }, [newShopsError]);

  const scrollToGrid = () => {
    const gridElem = document.getElementById('bento-grid-container');
    if (gridElem) {
      gridElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  // RESPONSIVE: Viewport gating for card sizing and sheet vs inline filter layout
  const isTabletOrLarger = useMediaQuery('(min-width: 768px)');
  const activeFilterCount = countActiveFilters(filters, searchQuery);

  // RESPONSIVE: Reset mobileFilterSheetOpen on unmount to guarantee BottomNav restoration
  useEffect(() => {
    return () => {
      setMobileFilterSheetOpen(false);
    };
  }, [setMobileFilterSheetOpen]);


  const handleAddShopClick = () => {
    if (!isAuthenticated) {
      toast('Yêu cầu đăng nhập', {
        description: 'Đăng nhập để thêm quán cà phê yêu thích của bạn vào bản đồ.',
        action: {
          label: 'Đăng nhập',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }
    setIsAddShopOpen(true);
  };

  // RESPONSIVE: Computes removable active-filter chips for mobile horizontal strip
  const activeFilterChips = useMemo(() => {
    const items: Array<{ id: string; label: string; onRemove: () => void }> = [];

    if (filters.openNowOnly) {
      items.push({
        id: 'openNow',
        label: 'Mở cửa',
        onRemove: () => setFilters({ openNowOnly: false }),
      });
    }

    if (filters.minRating && filters.minRating > 0) {
      items.push({
        id: 'rating',
        label: `${filters.minRating}★`,
        onRemove: () => setFilters({ minRating: 0 }),
      });
    }

    if (filters.radiusKm !== null) {
      items.push({
        id: 'radius',
        label: `≤ ${filters.radiusKm} km`,
        onRemove: () => setFilters({ radiusKm: null }),
      });
    }

    filters.priceRanges.forEach((price) => {
      items.push({
        id: `price-${price}`,
        label: price,
        onRemove: () =>
          setFilters({
            priceRanges: filters.priceRanges.filter((p) => p !== price),
          }),
      });
    });

    filters.requiredAmenityIds.forEach((amenityId) => {
      const cat = POPULAR_CATEGORIES.find((c) => c.id === amenityId);
      items.push({
        id: `amenity-${amenityId}`,
        label: cat?.label || amenityId,
        onRemove: () =>
          setFilters({
            requiredAmenityIds: filters.requiredAmenityIds.filter((id) => id !== amenityId),
          }),
      });
    });

    if (filters.sortBy && filters.sortBy !== 'distance') {
      items.push({
        id: 'sort',
        label: filters.sortBy === 'rating' ? 'Đánh giá' : 'Tên quán',
        onRemove: () => setFilters({ sortBy: 'distance' }),
      });
    }

    return items;
  }, [filters, setFilters]);

  const handleToggleFav = (placeId: string) => {
    const shop =
      rawShops.find((s) => s.place_id === placeId || s.id === placeId) ||
      (selectedShop?.place_id === placeId ? selectedShop : undefined);
    toggleFavoriteMutation(placeId, shop);
  };

  // RESPONSIVE: auto-open from URL only on initial mount; intentionally-closed drawers must not resurrect.
  const hasRunAutoOpen = useRef(false);

  useEffect(() => {
    if (hasRunAutoOpen.current || typeof window === 'undefined' || rawShops.length === 0) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const shopQueryId = urlParams.get('shop');
    const pathMatch = window.location.pathname.match(/\/shop\/([^/]+)/);
    const targetId = shopQueryId || (pathMatch ? pathMatch[1] : null);

    hasRunAutoOpen.current = true;

    if (!targetId || isShopRecentlyDeleted(targetId)) {
      if (targetId && isShopRecentlyDeleted(targetId)) {
        clearShopQueryParam();
      }
      return;
    }

    const found =
      rawShops.find(
        (s) =>
          (s.slug === targetId || s.place_id === targetId || s.id === targetId) &&
          !isShopRecentlyDeleted(s.id) &&
          !isShopRecentlyDeleted(s.place_id) &&
          !(s.slug && isShopRecentlyDeleted(s.slug))
      ) ||
      trendingShops.find(
        (s) =>
          (s.slug === targetId || s.place_id === targetId || s.id === targetId) &&
          !isShopRecentlyDeleted(s.id) &&
          !isShopRecentlyDeleted(s.place_id) &&
          !(s.slug && isShopRecentlyDeleted(s.slug))
      ) ||
      newShops.find(
        (s) =>
          (s.slug === targetId || s.place_id === targetId || s.id === targetId) &&
          !isShopRecentlyDeleted(s.id) &&
          !isShopRecentlyDeleted(s.place_id) &&
          !(s.slug && isShopRecentlyDeleted(s.slug))
      );

    if (found) {
      setSelectedShop(found);
    } else {
      // Reconstruct shop details from server if not present in initial nearby feed
      const fetchShop = async () => {
        try {
          const res = await axios.get<{ shop: CoffeeShop }>(API_ENDPOINTS.SHOP_DETAILS, {
            params: { placeId: targetId },
          });
          const shop = res.data?.shop;
          if (
            shop &&
            !isShopRecentlyDeleted(shop.id) &&
            !isShopRecentlyDeleted(shop.place_id) &&
            !(shop.slug && isShopRecentlyDeleted(shop.slug))
          ) {
            setSelectedShop(shop);
            return;
          }
        } catch {
          // not found or error
        }
        clearShopQueryParam();
      };
      fetchShop();
    }
  }, [rawShops, trendingShops, newShops, setSelectedShop]);

  // Handle popstate on page to close drawer if ?shop param is removed via back button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get('shop') && selectedShop) {
        closeActiveShop({ clearUrl: false });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedShop]);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredFilters = useDeferredValue(filters);

  const isFilterActive = countActiveFilters(filters, searchQuery) > 0;
  const isFiltered = countActiveFilters(deferredFilters, deferredSearchQuery) > 0;

  // Filter & sort shop results using central pure utility
  const filteredShops = useMemo(() => {
    let result = applyShopFilters(rawShops, deferredFilters);

    const q = deferredSearchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.address && s.address.toLowerCase().includes(q))
      );
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

  // RESPONSIVE: On mobile (< md), compute mobile card sizes ('standard' | 'featured');
  // on tablet/desktop (md+), compute full bento sizes ('small' | 'medium' | 'large' | 'featured')
  const cardSizes = useMemo(() => {
    if (!isTabletOrLarger) {
      return generateMobileCardSizes(displayedShops);
    }
    return generateCardSizes(displayedShops);
  }, [displayedShops, isTabletOrLarger]);

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
    // RESPONSIVE: pb-28 md:pb-16 provides bottom clearance (~7rem / 112px on mobile)
    // ensuring the last card's status pill and actions sit fully above BottomNav and the grounded pill FAB
    <div className="space-y-6 max-w-7xl mx-auto text-foreground pb-28 md:pb-16">
      {/* MOBILE (< md): Compact sticky header with SearchBar, single controls row, and active filters */}
      {/* RESPONSIVE: Mobile uses compact sticky header; filters live in bottom sheet */}
      <div className="md:hidden sticky top-14 z-30 bg-background/95 backdrop-blur-md pt-2 pb-2.5 px-1 border-b border-border/40 space-y-1.5">
        <SearchBar />
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Left: Results count collapsed into compact line */}
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            {displayedShops.length} quán
          </span>

          {/* Right: "Bộ lọc" trigger button and Sort dropdown */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterSheetOpen(true)}
              aria-label="Mở bộ lọc tìm kiếm"
              className={cn(
                "h-8 px-2.5 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center gap-1.5 shadow-xs min-h-[44px]",
                activeFilterCount > 0
                  ? "bg-amber-gold text-primary-foreground border-amber-gold hover:bg-amber-gold-hover hover:text-primary-foreground font-bold"
                  : "bg-input-bg text-foreground border-input hover:bg-accent hover:border-amber-gold/40"
              )}
            >
              <SlidersHorizontal size={12} className={cn(activeFilterCount > 0 ? "text-primary-foreground" : "text-amber-gold")} />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0 text-[10px] leading-tight rounded-full bg-primary-foreground text-primary font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Select
              value={filters.sortBy}
              onValueChange={(val) => setFilters({ sortBy: val as 'distance' | 'rating' | 'name' })}
            >
              <SelectTrigger
                aria-label="Sắp xếp quán cà phê theo"
                className="h-8 min-h-[44px] text-xs font-semibold bg-input-bg text-foreground border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-gold/60 focus:ring-offset-0 focus:border-amber-gold/60 hover:border-amber-gold/40 hover:text-foreground hover:bg-accent transition-all duration-200 w-auto gap-1 px-2.5 shadow-xs"
              >
                <ArrowUpDown size={12} className="text-amber-gold flex-shrink-0" />
                <SelectValue placeholder="Sắp xếp..." />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-popover border-input text-popover-foreground rounded-xl shadow-xl">
                <SelectItem value="distance" className="focus:bg-primary/15 focus:text-foreground text-xs transition-colors cursor-pointer">
                  Khoảng cách
                </SelectItem>
                <SelectItem value="rating" className="focus:bg-primary/15 focus:text-foreground text-xs transition-colors cursor-pointer">
                  Đánh giá
                </SelectItem>
                <SelectItem value="name" className="focus:bg-primary/15 focus:text-foreground text-xs transition-colors cursor-pointer">
                  Tên quán
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS ROW (< md): Visible only when activeFilterChips.length > 0 */}
        {/* RESPONSIVE: Horizontal scrollable strip of active filter chips with ✕ dismiss action */}
        {activeFilterChips.length > 0 && (
          <div
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5 -mx-1 px-1"
            role="region"
            aria-label="Các bộ lọc đang áp dụng"
          >
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={chip.onRemove}
                aria-label={`Xóa bộ lọc ${chip.label}`}
                className="relative inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[11px] font-medium bg-amber-gold/15 text-foreground border border-amber-gold/40 hover:bg-amber-gold/25 active:scale-95 transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold before:absolute before:-inset-1 before:content-['']"
              >
                <span>{chip.label}</span>
                <X size={11} className="text-foreground/70 hover:text-foreground shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TABLET/DESKTOP (≥ md): Full filter card exactly as today */}
      {/* RESPONSIVE: Full inline filter card visible on tablet and desktop (md+) */}
      <div
        ref={topFilterRef}
        className="hidden md:block bg-gradient-to-b from-card to-card/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-border/80 shadow-card hover:border-amber-gold/30 transition-all duration-300 space-y-2.5"
      >
        {/* Row 1: Prominent Full-Width Search Bar */}
        <SearchBar />

        {/* Row 2: Single Cohesive Controls Bar (Filter Chips + Results Count & Location + Sort Dropdown) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-1.5 border-t border-border/50">
          {/* Left: Scrollable Filter Chips */}
          <div className="flex-1 min-w-0">
            <FilterChips />
          </div>

          {/* Right: Results Count, Location Badge, & Sort Selector */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 text-[11px] flex-shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-foreground tracking-tight">{displayedShops.length} quán gần bạn</span>
              <Badge variant="outline" className="bg-secondary text-secondary-foreground border-input text-[9px] px-2 py-0.5 rounded-full font-medium transition-all duration-200 shadow-xs">
                {locationLoading || isCityLoading ? 'Đang định vị...' : cityName}
              </Badge>
            </div>

            <div className="flex items-center">
              <Select
                value={filters.sortBy}
                onValueChange={(val) => setFilters({ sortBy: val as 'distance' | 'rating' | 'name' })}
              >
                <SelectTrigger
                  aria-label="Sắp xếp quán cà phê theo"
                  className="h-7 text-[11px] font-semibold bg-input-bg text-foreground border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-gold/60 focus:ring-offset-0 focus:border-amber-gold/60 focus:scale-[1.01] hover:border-amber-gold/40 hover:text-foreground hover:bg-accent transition-all duration-200 ease-out w-auto gap-1.5 px-2.5 group shadow-xs"
                >
                  <ArrowUpDown size={12} className="text-amber-gold flex-shrink-0 transition-colors duration-200 group-hover:text-amber-gold-hover group-focus-within:text-amber-gold-hover" />
                  <SelectValue placeholder="Sắp xếp..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-input text-popover-foreground rounded-xl shadow-xl">
                  <SelectItem value="distance" className="focus:bg-primary/15 focus:text-foreground text-xs transition-colors cursor-pointer">
                    Khoảng cách
                  </SelectItem>
                  <SelectItem value="rating" className="focus:bg-primary/15 focus:text-foreground text-xs transition-colors cursor-pointer">
                    Đánh giá
                  </SelectItem>
                  <SelectItem value="name" className="focus:bg-primary/15 focus:text-foreground text-xs transition-colors cursor-pointer">
                    Tên quán
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {/* RESPONSIVE: Modern bottom sheet with drag handle, clean sections, and sticky footer on mobile (< md) */}
      <Sheet open={mobileFilterSheetOpen} onOpenChange={setMobileFilterSheetOpen}>
        <SheetContent
          side="bottom"
          // RESPONSIVE: pb-[env(safe-area-inset-bottom)] clears physical home indicator;
          // flex flex-col isolates drag handle, title row, scrollable body, and sticky footer;
          // ~250ms open and 200ms close duration with ease-out slide-up/slide-down transitions.
          className="max-h-[85vh] flex flex-col rounded-t-3xl border-t border-border bg-background p-0 pb-[env(safe-area-inset-bottom)] ease-out data-[state=open]:duration-250 data-[state=closed]:duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom [&>button:last-child]:hidden"
        >
          {/* Drag Handle: centered pill at top (═══ style) */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-border" />
          </div>

          {/* Title row: "Bộ lọc" on left, ✕ close icon on right */}
          <SheetHeader className="text-left px-4 pt-1 pb-3 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-bold flex items-center gap-2">
                <span>Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <Badge className="bg-amber-gold text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTitle>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Đóng bộ lọc"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
                >
                  <X size={16} />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* Scrollable body content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-5">
            {/* Section a: Vị trí hiện tại */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider">Vị trí hiện tại</div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refetchLocation()}
                  aria-label="Cập nhật vị trí hiện tại"
                  className="h-9 min-h-[44px] px-3 text-xs font-medium rounded-full bg-secondary/60 text-foreground border-input flex items-center gap-1.5 hover:bg-secondary transition-all"
                >
                  <MapPin size={13} className="text-amber-gold flex-shrink-0" />
                  <span>{locationLoading || isCityLoading ? 'Đang định vị...' : (cityName || 'Xã An Phước')}</span>
                </Button>
              </div>
            </div>

            {/* Section b: Bộ lọc nhanh */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider">Bộ lọc nhanh</div>
              <div className="flex flex-wrap gap-2">
                {/* Chip 1: Đang mở cửa */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ openNowOnly: !filters.openNowOnly })}
                  aria-label="Lọc quán đang mở cửa"
                  aria-pressed={filters.openNowOnly}
                  className={cn(
                    'h-9 min-h-[44px] px-3.5 text-xs font-semibold rounded-full border transition-all duration-200 ease-out flex items-center gap-1.5',
                    filters.openNowOnly
                      ? 'bg-teal text-primary-foreground border-teal font-bold shadow-md shadow-teal/25 hover:bg-teal-hover hover:text-primary-foreground'
                      : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200',
                      filters.openNowOnly ? 'bg-primary-foreground' : 'bg-teal animate-pulse'
                    )}
                    aria-hidden="true"
                  />
                  <span>Đang mở cửa</span>
                </Button>

                {/* Chip 2: Gần tôi */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ sortBy: filters.sortBy === 'distance' ? 'rating' : 'distance' })}
                  aria-label="Sắp xếp theo khoảng cách gần tôi"
                  aria-pressed={filters.sortBy === 'distance'}
                  className={cn(
                    'h-9 min-h-[44px] px-3.5 text-xs font-semibold rounded-full border transition-all duration-200 ease-out flex items-center gap-1.5',
                    filters.sortBy === 'distance'
                      ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-primary-foreground'
                      : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40'
                  )}
                >
                  <MapPin
                    size={13}
                    className={cn(
                      'flex-shrink-0 transition-colors duration-200',
                      filters.sortBy === 'distance' ? 'text-primary-foreground' : 'text-amber-gold'
                    )}
                  />
                  <span>Gần tôi</span>
                </Button>

                {/* Chip 3: Đặt lại (only visible when activeFilterCount > 0) */}
                {activeFilterCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    aria-label="Đặt lại tất cả bộ lọc"
                    className="h-9 min-h-[44px] px-3.5 text-xs font-medium rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 ease-out flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} className="flex-shrink-0 text-muted-foreground" />
                    <span>Đặt lại</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Section c: Đánh giá tối thiểu */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider">Đánh giá tối thiểu</div>
              <div
                role="radiogroup"
                aria-label="Đánh giá tối thiểu"
                className="grid grid-cols-3 p-1 bg-secondary/80 rounded-xl gap-1 border border-border/40"
              >
                {[
                  { value: 0, label: 'Tất cả' },
                  { value: 4.0, label: '★ 4.0+' },
                  { value: 4.5, label: '★ 4.5+' },
                ].map((opt) => {
                  const isChecked = (filters.minRating || 0) === opt.value;
                  return (
                    <Button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ minRating: opt.value })}
                      className={cn(
                        'min-h-[44px] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 shadow-none',
                        isChecked
                          ? 'bg-background text-foreground shadow-xs border border-border/60'
                          : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                      )}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Section d: Mức giá */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider">Mức giá</div>
              <div className="flex flex-wrap gap-2">
                {MOBILE_PRICE_OPTIONS.map((opt) => {
                  const isChecked = filters.priceRanges.includes(opt.key);
                  return (
                    <Button
                      key={opt.key}
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-pressed={isChecked}
                      aria-label={opt.label}
                      onClick={() => {
                        const next = isChecked
                          ? filters.priceRanges.filter((p) => p !== opt.key)
                          : [...filters.priceRanges, opt.key];
                        setFilters({ priceRanges: next });
                      }}
                      className={cn(
                        'h-9 min-h-[44px] px-3.5 text-xs font-semibold rounded-full border transition-all duration-200 ease-out flex items-center justify-center',
                        isChecked
                          ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-primary-foreground'
                          : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40'
                      )}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Section e: Tiện ích phổ biến */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider">Tiện ích phổ biến</div>
              <div className="flex flex-wrap gap-2">
                {topAmenities.map((cat) => {
                  const Icon = cat.icon;
                  const isChecked = filters.requiredAmenityIds.includes(cat.id);
                  return (
                    <Button
                      key={cat.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-pressed={isChecked}
                      aria-label={cat.label}
                      onClick={() => {
                        const next = isChecked
                          ? filters.requiredAmenityIds.filter((id) => id !== cat.id)
                          : [...filters.requiredAmenityIds, cat.id];
                        setFilters({ requiredAmenityIds: next });
                      }}
                      className={cn(
                        'h-9 min-h-[44px] px-3 text-xs font-semibold rounded-full border transition-all duration-200 ease-out flex items-center gap-1.5',
                        isChecked
                          ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-primary-foreground'
                          : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40'
                      )}
                    >
                      <Icon
                        size={14}
                        className={cn(
                          'flex-shrink-0 transition-colors duration-200',
                          isChecked ? 'text-primary-foreground' : 'text-amber-gold'
                        )}
                      />
                      <span>{cat.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Section f: Bán kính tìm kiếm */}
            <div className="border-t border-border/60 pt-4">
              <RadiusSlider
                compact
                value={filters.radiusKm}
                onChange={(val) => setFilters({ radiusKm: val })}
              />
            </div>

            {/* Section g: Sắp xếp theo */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider">Sắp xếp theo</div>
              <div
                role="radiogroup"
                aria-label="Sắp xếp theo"
                className="grid grid-cols-2 p-1 bg-secondary/80 rounded-xl gap-1 border border-border/40"
              >
                <Button
                  type="button"
                  role="radio"
                  aria-checked={filters.sortBy === 'distance'}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ sortBy: 'distance' })}
                  className={cn(
                    'min-h-[44px] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-none',
                    filters.sortBy === 'distance'
                      ? 'bg-background text-foreground shadow-xs border border-border/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                  )}
                >
                  <Footprints
                    size={14}
                    className={cn(
                      filters.sortBy === 'distance' ? 'text-amber-gold' : 'text-muted-foreground'
                    )}
                  />
                  <span>Khoảng cách</span>
                </Button>
                <Button
                  type="button"
                  role="radio"
                  aria-checked={filters.sortBy === 'rating'}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ sortBy: 'rating' })}
                  className={cn(
                    'min-h-[44px] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-none',
                    filters.sortBy === 'rating'
                      ? 'bg-background text-foreground shadow-xs border border-border/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                  )}
                >
                  <Star
                    size={14}
                    className={cn(
                      filters.sortBy === 'rating'
                        ? 'fill-amber-gold text-amber-gold'
                        : 'text-muted-foreground'
                    )}
                  />
                  <span>Đánh giá</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          {/* RESPONSIVE: sticky bottom-0 with top border ensures Reset & Apply are always visible above safe-area */}
          <SheetFooter className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-md px-4 py-3 border-t border-border/50 shrink-0">
            <div className="flex items-center gap-2.5 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="flex-1 min-h-[44px] h-11 text-xs font-bold rounded-xl border-input hover:bg-secondary transition-all"
              >
                Đặt lại
              </Button>
              <Button
                type="button"
                onClick={() => setMobileFilterSheetOpen(false)}
                className="flex-[2] min-h-[44px] h-11 bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Áp dụng · {displayedShops.length} quán
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Pure Coffee Dynamic Bento Grid Area */}
      {isInitialLoading ? (
        <ListSkeleton count={12} />
      ) : isError && rawShops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/60 rounded-3xl border border-border/60">
          <Coffee size={40} className="text-rose-400 mb-3" />
          <h3 className="font-sans font-bold text-lg text-foreground mb-1">Không thể tải danh sách quán cà phê</h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            Đã xảy ra sự cố khi tải các quán cà phê gần bạn. Vui lòng thử lại.
          </p>
          <Button
            onClick={() => refetch()}
            // RESPONSIVE: min-h-[44px] touch target for mobile ergonomics
            className="min-h-[44px] bg-amber-gold text-primary-foreground hover:bg-amber-gold-hover font-bold rounded-xl text-xs px-4 py-2"
          >
            Thử lại
          </Button>
        </div>
      ) : displayedShops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/60 rounded-3xl border border-border/60 animate-in fade-in duration-300">
          <Coffee size={40} className="text-amber-gold/60 mb-3" />
          <h3 className="font-sans font-bold text-lg text-foreground mb-1">Không tìm thấy quán cà phê nào</h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc các bộ lọc để tìm thêm các quán gần bạn.
          </p>
          <Button
            onClick={resetFilters}
            // RESPONSIVE: min-h-[44px] touch target for mobile ergonomics
            className="min-h-[44px] bg-amber-gold text-primary-foreground hover:bg-amber-gold-hover font-bold rounded-xl text-xs px-4 py-2"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {!isFilterActive && hasAnyCarousel && (
            <div className="mb-6 md:mb-8 border-b border-border/40 pb-6 md:pb-8 space-y-6 md:space-y-8">
              <TrendingCarousel
                title="Đang thịnh hành"
                subtitle="Những quán được cộng đồng ghé nhiều nhất tuần này"
                icon={<TrendingUp size={18} />}
                shops={trendingShops}
                isLoading={trendingLoading}
                favorites={favorites}
                onSelect={setSelectedShop}
                onToggleFavorite={handleToggleFav}
                onViewAll={scrollToGrid}
              />
              <TrendingCarousel
                title="Mới được thêm"
                subtitle="Những quán vừa được cập nhật gần đây"
                icon={<Sparkles size={18} />}
                shops={newShops}
                isLoading={newShopsLoading}
                favorites={favorites}
                onSelect={setSelectedShop}
                onToggleFavorite={handleToggleFav}
                onViewAll={scrollToGrid}
              />
            </div>
          )}

          <BentoGrid id="bento-grid-container">
            {displayedShops.map((shop, index) => {
            const isFav = favorites.includes(shop.place_id);

            // RESPONSIVE: On mobile (< md), render standard card or 1x2 featured hero card
            if (!isTabletOrLarger) {
              const mobileSize = (cardSizes[index] as MobileCardSize) || 'standard';

              if (mobileSize === 'featured') {
                return (
                  <ShopCardFeaturedMobile
                    key={shop.id}
                    shop={shop}
                    isFavorite={isFav}
                    priority={index === 0}
                    onToggleFavorite={handleToggleFav}
                    onSelect={setSelectedShop}
                  />
                );
              }

              return (
                <ShopCardSmall
                  key={shop.id}
                  shop={shop}
                  size="small"
                  isFavorite={isFav}
                  priority={index === 0}
                  onToggleFavorite={handleToggleFav}
                  onSelect={setSelectedShop}
                />
              );
            }

            // RESPONSIVE: On tablet/desktop (md+), render full bento card sizes
            const size = (cardSizes[index] as 'small' | 'medium' | 'large' | 'featured') || 'small';

            if (size === 'featured') {
              return (
                <ShopCardFeatured
                  key={shop.id}
                  shop={shop}
                  size={size}
                  isFavorite={isFav}
                  priority={index === 0}
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
                  priority={index === 0}
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
                  priority={index === 0}
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
                priority={index === 0}
                onToggleFavorite={handleToggleFav}
                onSelect={setSelectedShop}
              />
            );
          })}

          {/* Next Page Skeleton Placeholders (only in unfiltered view when scrolling at the bottom) */}
          {!isFiltered && isFetchingNextPage &&
            (isTabletOrLarger ? nextBatchSkeletonSizes : (['small', 'small', 'small', 'featured', 'small', 'small'] as const)).map((size, idx) => (
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
      </div>
    )}

      {/* Floating Sticky Quick Filter Bar - tablet and desktop only (mobile uses sticky header) */}
      {/* RESPONSIVE: Only render floating filter bar on tablet/desktop (md+) */}
      {isTabletOrLarger && <FloatingFilterBar isVisible={isFilterFloating} shopCount={displayedShops.length} />}

      {/* Unified Google Maps-Style Tabbed Shop Drawer */}
      <ShopDrawer
        shop={selectedShop}
        isOpen={Boolean(selectedShop)}
        onClose={() => closeActiveShop({ clearUrl: true })}
        onToggleFavorite={handleToggleFav}
        isFavorite={selectedShop ? favorites.includes(selectedShop.place_id) : false}
      />

      {/* MOBILE (< md): Floating Pill Add Shop FAB Button */}
      {/* RESPONSIVE: Compact pill FAB positioned ~8-12px above BottomNav + safe area at bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4.
          (68px = BottomNav ~60px + ~8px gap) visually clusters the FAB with the bottom navigation without physical collision.
          Hidden when mobile filter sheet is open to prevent overlap with sheet/footer.
          Z-index hierarchy: Filter sheet (z-50) > FAB (z-40) > BottomNav (z-40) > scroll content (z-0..20). */}
      {!mobileFilterSheetOpen && !isAddShopDialogOpen && (
        <div className="md:hidden fixed right-4 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 m-0">
          <Button
            type="button"
            onClick={handleAddShopClick}
            className="min-h-[48px] min-w-[48px] px-3 xs:px-4 py-3 rounded-full bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs sm:text-sm shadow-[0_6px_16px_rgba(0,0,0,0.15)] hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer"
            aria-label="Thêm quán cà phê mới"
          >
            <Plus size={18} strokeWidth={2.5} className="shrink-0" />
            <span className="hidden xs:inline whitespace-nowrap">Thêm quán</span>
          </Button>
        </div>
      )}

      {/* TABLET / DESKTOP (≥ md): Floating Add Shop FAB Button */}
      {/* RESPONSIVE: Keeps floating FAB on tablet/desktop (md+), accounting for floating filter bar if visible */}
      <div
        className={cn(
          'hidden md:block fixed right-6 lg:right-8 z-50 transition-all duration-300 ease-out animate-in fade-in zoom-in-95',
          isTabletOrLarger && isFilterFloating ? 'bottom-16' : 'bottom-8'
        )}
      >
        <Button
          type="button"
          onClick={handleAddShopClick}
          className="h-12 px-4 rounded-full bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 border border-white/20 backdrop-blur-md cursor-pointer"
          aria-label="Thêm quán cà phê mới"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Thêm quán</span>
        </Button>
      </div>

      {/* Add Shop Dialog Modal */}
      <AddShopDialog open={isAddShopOpen} onOpenChange={setIsAddShopOpen} />
    </div>
  );
}
