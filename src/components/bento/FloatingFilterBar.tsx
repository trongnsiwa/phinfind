'use client';

import { ArrowUpDown, ChevronUp, RotateCcw, Search, Star, X } from 'lucide-react';
import React, { memo, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';

interface FloatingFilterBarProps {
  isVisible: boolean;
  shopCount: number;
}

export const FloatingFilterBar = memo(function FloatingFilterBar({
  isVisible,
  shopCount,
}: FloatingFilterBarProps) {
  const { filters, setFilters, searchQuery, setSearchQuery, resetFilters } = useUIStore();
  const [localValue, setLocalValue] = useState(searchQuery);
  const [isDismissed, setIsDismissed] = useState(false);

  // Synchronize local input with global store if changed externally
  useEffect(() => {
    setLocalValue(searchQuery);
  }, [searchQuery]);

  // Debounce updates to global store
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== searchQuery) {
        setSearchQuery(localValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, searchQuery, setSearchQuery]);

  // Reset dismissal state when user scrolls back up to the top filter section
  useEffect(() => {
    if (!isVisible) {
      setIsDismissed(false);
    }
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCount =
    (filters.openNowOnly ? 1 : 0) +
    (filters.minRating && filters.minRating > 0 ? 1 : 0) +
    (filters.sortBy !== 'distance' ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  const shouldShow = isVisible && !isDismissed;

  const handleClear = () => {
    setLocalValue('');
    setSearchQuery('');
  };

  return (
    <aside
      aria-label="Quick filters and search bar"
      className={cn(
        'fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl transition-all duration-300 ease-out',
        shouldShow
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="bg-dark-bg/98 backdrop-blur-xl border border-dark-border/40 hover:border-amber-gold/30 shadow-[0_-4px_30px_rgba(212,160,87,0.2)] shadow-[0_0_30px_rgba(212,160,87,0.08)] rounded-2xl sm:rounded-full p-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 transition-all duration-300">
        {/* Left Side: Compact Search + Results Count */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[120px] max-w-xs group">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-gold pointer-events-none transition-colors group-focus-within:text-amber-gold-hover"
              aria-hidden="true"
            />
            <Input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder="Search..."
              aria-label="Quick search coffee shops"
              className="h-8 pl-8 pr-7 text-xs bg-dark-roast text-cream-white border-dark-border rounded-xl sm:rounded-full focus-visible:ring-1 focus-visible:ring-amber-gold/60 focus-visible:border-amber-gold/60 placeholder:text-warm-gray"
            />
            {localValue && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray hover:text-cream-white rounded-full"
              >
                <X size={12} />
              </Button>
            )}
          </div>

          <Badge
            variant="outline"
            className="hidden sm:inline-flex bg-dark-roast text-cream-white border-dark-border text-[11px] px-2.5 py-1 rounded-full font-bold flex-shrink-0"
          >
            {shopCount} spots
          </Badge>
        </div>

        {/* Right Side: Quick Filters + Sort Selector + Back to Top + Dismiss */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Open Now Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ openNowOnly: !filters.openNowOnly })}
            aria-label="Toggle open now"
            aria-pressed={filters.openNowOnly}
            className={cn(
              'h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-full border transition-all duration-200 flex items-center gap-1.5 flex-shrink-0',
              filters.openNowOnly
                ? 'bg-[#7CAE8E] text-dark-bg border-[#7CAE8E] font-bold shadow-md'
                : 'bg-dark-roast text-cream-white border-dark-border hover:border-amber-gold/40 hover:text-amber-gold-hover'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                filters.openNowOnly ? 'bg-dark-bg' : 'bg-[#7CAE8E] animate-pulse'
              )}
            />
            <span className="hidden xs:inline sm:inline">Open</span>
          </Button>

          {/* Rating Dropdown */}
          <Select
            value={filters.minRating ? String(filters.minRating) : 'all'}
            onValueChange={(val) => setFilters({ minRating: val === 'all' ? 0 : Number(val) })}
          >
            <SelectTrigger
              aria-label="Filter by rating"
              className={cn(
                'h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-full border border-dark-border bg-dark-roast text-cream-white hover:border-amber-gold/40 hover:text-amber-gold-hover flex-shrink-0 w-auto gap-1',
                filters.minRating && filters.minRating > 0 && 'bg-amber-gold text-dark-bg border-amber-gold font-bold'
              )}
            >
              <Star
                size={12}
                className={cn(
                  filters.minRating && filters.minRating > 0
                    ? 'fill-dark-bg text-dark-bg'
                    : 'fill-amber-gold text-amber-gold'
                )}
              />
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent className="bg-dark-roast border-dark-border text-cream-white rounded-xl shadow-xl z-50">
              <SelectItem value="all" className="focus:bg-dark-bg focus:text-amber-gold text-xs cursor-pointer">
                All
              </SelectItem>
              <SelectItem value="4" className="focus:bg-dark-bg focus:text-amber-gold text-xs cursor-pointer">
                4.0+
              </SelectItem>
              <SelectItem value="4.5" className="focus:bg-dark-bg focus:text-amber-gold text-xs cursor-pointer">
                4.5+
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select
            value={filters.sortBy}
            onValueChange={(val) => setFilters({ sortBy: val as 'distance' | 'rating' | 'name' })}
          >
            <SelectTrigger
              aria-label="Sort coffee shops"
              className="h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-full border border-dark-border bg-dark-roast text-cream-white hover:border-amber-gold/40 hover:text-amber-gold-hover flex-shrink-0 w-auto gap-1"
            >
              <ArrowUpDown size={12} className="text-amber-gold" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-dark-roast border-dark-border text-cream-white rounded-xl shadow-xl z-50">
              <SelectItem value="distance" className="focus:bg-dark-bg focus:text-amber-gold text-xs cursor-pointer">
                Distance
              </SelectItem>
              <SelectItem value="rating" className="focus:bg-dark-bg focus:text-amber-gold text-xs cursor-pointer">
                Rating
              </SelectItem>
              <SelectItem value="name" className="focus:bg-dark-bg focus:text-amber-gold text-xs cursor-pointer">
                Name
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters (if active) */}
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              aria-label="Reset filters"
              title="Reset filters"
              className="h-8 w-8 text-soft-beige hover:text-cream-white hover:bg-white/10 rounded-full flex-shrink-0"
            >
              <RotateCcw size={13} />
            </Button>
          )}

          {/* Scroll Back to Top Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Scroll to top"
            className="h-8 w-8 bg-dark-roast hover:bg-white/10 text-amber-gold hover:text-amber-gold-hover border border-dark-border rounded-full flex-shrink-0"
          >
            <ChevronUp size={15} />
          </Button>

          {/* Dismiss Floating Bar Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss floating filter bar"
            title="Dismiss"
            className="h-8 w-8 text-warm-gray hover:text-cream-white hover:bg-white/10 rounded-full flex-shrink-0"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </aside>
  );
});
