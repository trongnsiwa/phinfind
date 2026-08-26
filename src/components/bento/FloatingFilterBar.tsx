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
      aria-label="Thanh tìm kiếm và bộ lọc nhanh"
      className={cn(
        'fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl transition-all duration-300 ease-out',
        shouldShow
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="bg-[#101010]/98 backdrop-blur-xl border border-[#2A2A2A]/40 hover:border-amber-gold/30 shadow-[0_-4px_30px_rgba(212,160,87,0.2)] shadow-[0_0_30px_rgba(212,160,87,0.08)] rounded-2xl sm:rounded-full p-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 transition-all duration-300">
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
              placeholder="Tìm kiếm..."
              aria-label="Tìm nhanh quán cà phê"
              className="h-8 pl-8 pr-7 text-xs bg-[#141414] text-white border-[#2A2A2A] rounded-xl sm:rounded-full focus-visible:ring-1 focus-visible:ring-amber-gold/60 focus-visible:border-amber-gold/60 placeholder:text-[#A0A0A0]"
            />
            {localValue && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                aria-label="Xóa nội dung tìm kiếm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A0A0A0] hover:text-white rounded-full"
              >
                <X size={12} />
              </Button>
            )}
          </div>

          <Badge
            variant="outline"
            className="hidden sm:inline-flex bg-[#141414] text-white border-[#2A2A2A] text-[11px] px-2.5 py-1 rounded-full font-bold flex-shrink-0"
          >
            {shopCount} quán
          </Badge>
        </div>

        {/* Right Side: Quick Filters + Sort Selector + Back to Top + Dismiss */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Open Now Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ openNowOnly: !filters.openNowOnly })}
            aria-label="Lọc quán đang mở cửa"
            aria-pressed={filters.openNowOnly}
            className={cn(
              'h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-full border transition-all duration-200 flex items-center gap-1.5 flex-shrink-0',
              filters.openNowOnly
                ? 'bg-teal text-[#101010] border-teal font-bold shadow-md shadow-teal/20 hover:bg-teal-hover'
                : 'bg-[#141414] text-white border-[#2A2A2A] hover:border-teal/40 hover:text-teal'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                filters.openNowOnly ? 'bg-[#101010]' : 'bg-teal animate-pulse'
              )}
            />
            <span className="hidden xs:inline sm:inline">Mở cửa</span>
          </Button>

          {/* Rating Dropdown */}
          <Select
            value={filters.minRating ? String(filters.minRating) : 'all'}
            onValueChange={(val) => setFilters({ minRating: val === 'all' ? 0 : Number(val) })}
          >
            <SelectTrigger
              aria-label="Lọc theo đánh giá"
              className={cn(
                'h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-full border border-[#2A2A2A] bg-[#141414] text-white hover:border-amber-gold/40 hover:text-amber-gold-hover flex-shrink-0 w-auto gap-1',
                filters.minRating && filters.minRating > 0 && 'bg-amber-gold text-[#101010] border-amber-gold font-bold'
              )}
            >
              <Star
                size={12}
                className={cn(
                  filters.minRating && filters.minRating > 0
                    ? 'fill-[#101010] text-[#101010]'
                    : 'fill-amber-gold text-amber-gold'
                )}
              />
              <SelectValue placeholder="Đánh giá" />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-[#2A2A2A] text-white rounded-xl shadow-xl z-50">
              <SelectItem value="all" className="focus:bg-[#101010] focus:text-amber-gold text-xs cursor-pointer">
                Tất cả
              </SelectItem>
              <SelectItem value="4" className="focus:bg-[#101010] focus:text-amber-gold text-xs cursor-pointer">
                4.0+
              </SelectItem>
              <SelectItem value="4.5" className="focus:bg-[#101010] focus:text-amber-gold text-xs cursor-pointer">
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
              aria-label="Sắp xếp quán cà phê"
              className="h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-full border border-[#2A2A2A] bg-[#141414] text-white hover:border-amber-gold/40 hover:text-amber-gold-hover flex-shrink-0 w-auto gap-1"
            >
              <ArrowUpDown size={12} className="text-amber-gold" />
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-[#2A2A2A] text-white rounded-xl shadow-xl z-50">
              <SelectItem value="distance" className="focus:bg-[#101010] focus:text-amber-gold text-xs cursor-pointer">
                Khoảng cách
              </SelectItem>
              <SelectItem value="rating" className="focus:bg-[#101010] focus:text-amber-gold text-xs cursor-pointer">
                Đánh giá
              </SelectItem>
              <SelectItem value="name" className="focus:bg-[#101010] focus:text-amber-gold text-xs cursor-pointer">
                Tên quán
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters (if active) */}
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              aria-label="Đặt lại bộ lọc"
              title="Đặt lại bộ lọc"
              className="h-8 w-8 text-[#D0D0D0] hover:text-teal hover:bg-teal/10 rounded-full flex-shrink-0"
            >
              <RotateCcw size={13} />
            </Button>
          )}

          {/* Scroll Back to Top Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
            title="Cuộn lên đầu"
            className="h-8 w-8 bg-[#141414] hover:bg-white/10 text-amber-gold hover:text-amber-gold-hover border border-[#2A2A2A] rounded-full flex-shrink-0"
          >
            <ChevronUp size={15} />
          </Button>

          {/* Dismiss Floating Bar Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            aria-label="Ẩn thanh bộ lọc nhanh"
            title="Ẩn"
            className="h-8 w-8 text-[#A0A0A0] hover:text-white hover:bg-white/10 rounded-full flex-shrink-0"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </aside>
  );
});
