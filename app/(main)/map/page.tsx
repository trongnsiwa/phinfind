'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Search, X, Star, SlidersHorizontal, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Map } from '@/components/map/Map';
import { ShopDrawer } from '@/components/shop/ShopDrawer';
import { ShopSidebar } from '@/components/shop/ShopSidebar';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops, useSearchShops } from '@/hooks/useShops';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { APP_ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CoffeeShop } from '@/types/shop';

export default function MapPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { lat, lng, loading: locationLoading, isFallback, refetchLocation } = useLocation();
  const { selectedShop, setSelectedShop, favorites, toggleFavorite } = useShopStore();
  const { filters, setFilters, resetFilters } = useUIStore();
  const { data: apiShops = [] } = useNearbyShops(lat, lng);
  const { data: locationName } = useReverseGeocode(lat, lng, isFallback);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLDivElement>(null);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setLocalQuery('');
    setSelectedIndex(-1);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery]);

  const { data: searchResults = [], isLoading: isSearching } = useSearchShops(
    isSearchOpen && debouncedQuery.trim().length > 0 ? debouncedQuery : '',
    lat,
    lng
  );

  // Filter and sort shops displayed on map
  const filteredShops = useMemo(() => {
    let list = [...apiShops];

    if (filters.openNowOnly) {
      list = list.filter((s) => s.opening_hours?.open_now === true);
    }

    if (filters.minRating > 0) {
      list = list.filter((s) => (s.rating || 0) >= filters.minRating);
    }

    if (filters.sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'distance') {
      list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return list;
  }, [apiShops, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.openNowOnly) count++;
    if (filters.minRating > 0) count++;
    if (filters.sortBy && filters.sortBy !== 'distance') count++;
    return count;
  }, [filters]);

  // Auto-focus input when search expands
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for search dropdown and search input
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        searchToggleRef.current &&
        !searchToggleRef.current.contains(e.target as Node)
      ) {
        handleCloseSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefetch = () => {
    refetchLocation();
    toast.info('Đang cập nhật vị trí...');
  };

  const handleToggleFav = (placeId: string) => {
    if (!isAuthenticated) {
      toast('Yêu cầu đăng nhập', {
        description: 'Đăng nhập để bắt đầu lưu lại các quán yêu thích và chia sẻ trải nghiệm cà phê của bạn.',
        action: {
          label: 'Đăng nhập',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }

    const isFav = favorites.includes(placeId);
    toggleFavorite(placeId);
    if (isFav) {
      toast.info('Đã xóa khỏi danh sách yêu thích');
    } else {
      toast.success('Đã lưu quán vào danh sách yêu thích!');
    }
  };

  const handleSelectShop = (shop: CoffeeShop) => {
    setSelectedShop(shop);
    setIsSearchOpen(false);
    setLocalQuery('');
    setSelectedIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      return;
    }

    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectShop(searchResults[selectedIndex]);
      }
    }
  };

  // Auto-open drawer if ?shop=id query param or /shop/[id] deep link is present on page load
  useEffect(() => {
    if (apiShops.length > 0 && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shopQueryId = urlParams.get('shop');
      const pathMatch = window.location.pathname.match(/\/shop\/([^/]+)/);
      const targetId = shopQueryId || (pathMatch ? pathMatch[1] : null);

      if (targetId && (!selectedShop || (selectedShop.id !== targetId && selectedShop.place_id !== targetId))) {
        const found = apiShops.find((s) => s.id === targetId || s.place_id === targetId);
        if (found) {
          setSelectedShop(found);
        }
      }
    }
  }, [apiShops, selectedShop, setSelectedShop]);

  // Handle popstate on map page to close drawer if ?shop param is removed via back button
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

  return (
    <>
      {/* Translucent Fixed Header Overlaid on Map */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card/90 backdrop-blur-md border-b border-border px-3 sm:px-4 flex items-center justify-between text-foreground shadow-md">
        {/* Left: App Logo/Brand */}
        <Link
          href={APP_ROUTES.HOME}
          className="flex items-center gap-2 group rounded-2xl p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold transition-all duration-200 flex-shrink-0"
          aria-label="Trang chủ PhinFind"
        >
          <span className="w-8.5 h-8.5 rounded-2xl bg-gradient-to-br from-amber-gold to-phin-600 text-primary-foreground flex items-center justify-center font-bold text-base shadow-md group-hover:scale-105 transition-transform duration-200">
            ☕
          </span>
          <div className="hidden xs:block sm:block">
            <h1 className="font-sans font-bold text-sm sm:text-base leading-none text-foreground tracking-tight group-hover:text-amber-gold-hover transition-colors">
              PhinFind
            </h1>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground tracking-wider font-semibold uppercase mt-0.5 group-hover:text-foreground transition-colors">
              Bản đồ Cà phê
            </p>
          </div>
        </Link>

        {/* Center: Location Pill (when search closed) OR Centered Search Bar (when search open) */}
        {!isSearchOpen ? (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-secondary/80 border border-border/80 text-xs shadow-xs max-w-[170px] xs:max-w-[220px] sm:max-w-xs truncate animate-in fade-in duration-150">
            <MapPin size={13} className="text-amber-gold flex-shrink-0" />
            <span className="font-semibold text-foreground truncate text-[11px] sm:text-xs">
              {locationLoading ? 'Đang định vị...' : locationName || 'Hà Nội'}
            </span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">•</span>
            <Badge
              variant="outline"
              className="bg-amber-gold/15 text-amber-gold border-amber-gold/30 text-[10px] font-bold px-1.5 py-0 rounded-full flex-shrink-0"
            >
              {filteredShops.length} quán
            </Badge>
          </div>
        ) : (
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-sm sm:max-w-md mx-2 sm:mx-4 relative flex items-center animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="relative w-full flex items-center">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                aria-hidden="true"
              />
              <Input
                ref={searchInputRef}
                type="text"
                value={localQuery}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm quán, đường phố, khu vực..."
                aria-label="Tìm kiếm quán cà phê"
                className="w-full h-8.5 pl-9 pr-8 text-xs bg-secondary text-foreground border-border rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold placeholder:text-muted-foreground shadow-inner"
              />
              {localQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setLocalQuery('');
                    setSelectedIndex(-1);
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Xóa nội dung tìm kiếm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5.5 w-5.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-0 transition-colors cursor-pointer"
                >
                  <X size={11} />
                </Button>
              )}
            </div>

            {/* Autocomplete Suggestions Dropdown Attached Below Centered Search Bar */}
            {debouncedQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-popover/98 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-2 z-[100] max-h-72 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-1 duration-150 text-left text-popover-foreground">
                {isSearching ? (
                  <div className="py-5 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-medium">
                    <span className="w-3 h-3 rounded-full border-2 border-amber-gold border-t-transparent animate-spin" />
                    Đang tìm kiếm quán...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-5 text-center text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-0.5">Không tìm thấy quán nào</p>
                    <p className="text-[10px]">Thử tìm kiếm theo tên đường hoặc khu vực</p>
                  </div>
                ) : (
                  <>
                    <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center justify-between border-b border-border/40 mb-1">
                      <span>Quán Cà Phê Phù Hợp</span>
                      <span>{searchResults.length} kết quả</span>
                    </div>
                    {searchResults.map((shop, index) => {
                      const isSelected = index === selectedIndex;
                      const hasRating = typeof shop.rating === 'number' && shop.rating > 0;

                      return (
                        <div
                          key={shop.id}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => handleSelectShop(shop)}
                          className={cn(
                            'p-2 rounded-xl cursor-pointer flex items-center justify-between gap-2 transition-all duration-150',
                            isSelected
                              ? 'bg-accent text-amber-gold border border-amber-gold/30 shadow-sm'
                              : 'hover:bg-accent/60 text-foreground border border-transparent'
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="font-sans font-bold text-xs truncate">
                              {shop.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                              <MapPin size={9} className="text-amber-gold flex-shrink-0" />
                              {shop.address || 'Chưa có địa chỉ'}
                            </p>
                          </div>
                          {hasRating && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-gold bg-secondary px-1.5 py-0.5 rounded-md border border-border/50 flex-shrink-0">
                              <Star size={10} className="fill-amber-gold text-amber-gold" />
                              <span>{shop.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right: Search Toggle Button / Close Button */}
        <div ref={searchToggleRef} className="flex items-center flex-shrink-0">
          {!isSearchOpen ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Tìm quán cà phê (Cmd+K)"
              className="h-8.5 w-8.5 rounded-full text-muted-foreground hover:text-amber-gold hover:bg-muted border border-border/60 hover:border-amber-gold/40 transition-all flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
            >
              <Search size={15} className="text-amber-gold" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCloseSearch}
              aria-label="Đóng tìm kiếm"
              className="h-8.5 w-8.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl p-0 flex-shrink-0 transition-colors cursor-pointer"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </header>

      {/* Responsive Full-Bleed Map Viewport Container */}
      <div
        className={cn(
          'fixed inset-0 top-14 bottom-16 md:bottom-0 z-0 overflow-hidden bg-background transition-all duration-300 ease-out',
          selectedShop && isDesktop ? 'lg:right-[440px] xl:right-[460px] 2xl:right-[480px]' : 'right-0'
        )}
      >
        <Map
          center={[lat, lng]}
          shops={filteredShops}
          selectedShop={selectedShop}
          onSelectShop={setSelectedShop}
          onRecenter={handleRefetch}
          className="w-full h-full"
        />

        {/* Floating Quick Filters Bottom Sheet Trigger */}
        <div className="absolute bottom-5 left-4 sm:bottom-6 sm:left-6 z-[400]">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="group flex items-center gap-2 px-3.5 py-2.5 h-11 rounded-full bg-card/90 backdrop-blur-md border border-border/80 hover:border-amber-gold/50 hover:bg-accent text-foreground hover:text-amber-gold text-xs font-bold shadow-xl shadow-black/20 transition-all duration-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold select-none"
              >
                <SlidersHorizontal size={15} className="text-amber-gold group-hover:scale-110 transition-transform" />
                <span className="text-foreground group-hover:text-amber-gold transition-colors">Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-gold text-primary-foreground text-[10px] font-black flex items-center justify-center shadow-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="bg-popover/95 backdrop-blur-2xl border-t border-border text-popover-foreground rounded-t-[28px] max-w-lg mx-auto p-5 pb-8 space-y-4 shadow-2xl z-[600]"
            >
              <SheetHeader className="text-left space-y-1">
                <div className="flex items-center justify-between pr-6">
                  <SheetTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-amber-gold" />
                    Bộ Lọc Nhanh Bản Đồ
                  </SheetTitle>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-xs text-muted-foreground hover:text-amber-gold hover:bg-muted h-7 px-2 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Đặt lại</span>
                    </Button>
                  )}
                </div>
                <SheetDescription className="text-xs text-muted-foreground">
                  Lọc và sắp xếp các quán cà phê hiển thị trên bản đồ theo thời gian thực.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 pt-1">
                {/* 1. Open Now Toggle */}
                <div className="flex items-center justify-between bg-secondary/60 p-3 rounded-2xl border border-border/60">
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-amber-gold" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">Chỉ quán đang mở cửa</span>
                      <span className="text-[10px] text-muted-foreground">Chỉ hiển thị các quán đang phục vụ</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={filters.openNowOnly}
                    onClick={() => setFilters({ openNowOnly: !filters.openNowOnly })}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal',
                      filters.openNowOnly ? 'bg-teal' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform',
                        filters.openNowOnly ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* 2. Minimum Rating */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Đánh giá tối thiểu</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Tất cả', value: 0 },
                      { label: '★ 4.0+', value: 4.0 },
                      { label: '★ 4.5+', value: 4.5 },
                    ].map((opt) => {
                      const isSelected = (filters.minRating || 0) === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFilters({ minRating: opt.value })}
                          className={cn(
                            'py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-amber-gold text-primary-foreground border-amber-gold shadow-md'
                              : 'bg-secondary/50 border-border/60 text-muted-foreground hover:border-amber-gold/40 hover:text-foreground'
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Sort Order */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Sắp xếp theo</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '📍 Khoảng cách (Gần nhất)', value: 'distance' as const },
                      { label: '⭐ Đánh giá (Cao nhất)', value: 'rating' as const },
                    ].map((opt) => {
                      const isSelected = filters.sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFilters({ sortBy: opt.value })}
                          className={cn(
                            'py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                            isSelected
                              ? 'bg-amber-gold text-primary-foreground border-amber-gold shadow-md'
                              : 'bg-secondary/50 border-border/60 text-muted-foreground hover:border-amber-gold/40 hover:text-foreground'
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Apply Button */}
                <Button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-full h-10 bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer mt-2"
                >
                  Áp dụng &amp; Xem {filteredShops.length} quán
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Responsive Shop Details: Persistent Right Sidebar on Desktop (>= 1024px), Bottom Drawer on Mobile (< 1024px) */}
      {isDesktop ? (
        <ShopSidebar
          shop={selectedShop}
          isOpen={Boolean(selectedShop)}
          onClose={() => setSelectedShop(null)}
          onToggleFavorite={handleToggleFav}
          isFavorite={selectedShop ? favorites.includes(selectedShop.place_id) : false}
        />
      ) : (
        <ShopDrawer
          shop={selectedShop}
          isOpen={Boolean(selectedShop)}
          onClose={() => setSelectedShop(null)}
          onToggleFavorite={handleToggleFav}
          isFavorite={selectedShop ? favorites.includes(selectedShop.place_id) : false}
        />
      )}
    </>
  );
}

