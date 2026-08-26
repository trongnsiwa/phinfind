'use client';

import React from 'react';
import { RotateCcw, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

export function FilterChips() {
  const { searchQuery, filters, setFilters, resetFilters } = useUIStore();

  const activeCount =
    (filters.openNowOnly ? 1 : 0) +
    (filters.minRating && filters.minRating > 0 ? 1 : 0) +
    (filters.sortBy !== 'distance' ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
      {/* Open Now Toggle Chip */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters({ openNowOnly: !filters.openNowOnly })}
        aria-label="Lọc quán đang mở cửa"
        aria-pressed={filters.openNowOnly}
        className={cn(
          'h-8 px-3 text-xs font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
          filters.openNowOnly
            ? 'bg-teal text-[#101010] border-teal font-bold shadow-md shadow-teal/25 hover:bg-teal-hover hover:text-[#101010] focus-visible:ring-teal focus-visible:border-teal focus-visible:shadow-[0_0_0_2px_rgba(46,196,182,0.35)]'
            : 'bg-[#141414] text-white border-[#2A2A2A] hover:bg-white/10 hover:text-amber-gold-hover hover:border-amber-gold/40 focus-visible:ring-amber-gold/60 focus-visible:border-amber-gold/60 focus-visible:bg-white/10'
        )}
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200',
            filters.openNowOnly ? 'bg-[#101010]' : 'bg-teal animate-pulse'
          )}
          aria-hidden="true"
        />
        <span>Đang mở cửa</span>
      </Button>

      {/* Minimum Rating Filter Dropdown Chip */}
      <Select
        value={filters.minRating ? String(filters.minRating) : 'all'}
        onValueChange={(val) => setFilters({ minRating: val === 'all' ? 0 : Number(val) })}
      >
        <SelectTrigger
          aria-label="Lọc theo đánh giá tối thiểu"
          className={cn(
            'h-8 px-3 text-xs font-semibold rounded-full border border-[#2A2A2A] bg-[#141414] text-white focus:outline-none focus:ring-1 focus:ring-amber-gold/60 focus:ring-offset-0 focus:border-amber-gold/60 focus:scale-[1.01] hover:bg-white/10 hover:border-amber-gold/40 hover:text-amber-gold-hover transition-all duration-200 ease-out flex-shrink-0 w-auto gap-1.5',
            filters.minRating && filters.minRating > 0 && 'bg-amber-gold text-[#101010] border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-[#101010] focus:ring-amber-gold focus:border-amber-gold'
          )}
        >
          <Star size={14} className={cn('flex-shrink-0 transition-colors duration-200', filters.minRating && filters.minRating > 0 ? 'fill-[#101010] text-[#101010]' : 'text-amber-gold fill-amber-gold')} />
          <SelectValue placeholder="Đánh giá" />
        </SelectTrigger>
        <SelectContent className="bg-[#141414] border-[#2A2A2A] text-white rounded-xl shadow-xl">
          <SelectItem value="all" className="focus:bg-[#101010] focus:text-amber-gold text-xs transition-colors cursor-pointer">
            Tất cả đánh giá
          </SelectItem>
          <SelectItem value="4" className="focus:bg-[#101010] focus:text-amber-gold text-xs transition-colors cursor-pointer">
            Từ 4.0+ sao
          </SelectItem>
          <SelectItem value="4.5" className="focus:bg-[#101010] focus:text-amber-gold text-xs transition-colors cursor-pointer">
            Từ 4.5+ sao
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Near Me Toggle Chip */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters({ sortBy: filters.sortBy === 'distance' ? 'rating' : 'distance' })}
        aria-label="Sắp xếp theo khoảng cách gần tôi"
        aria-pressed={filters.sortBy === 'distance'}
        className={cn(
          'h-8 px-3.5 text-xs font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
          filters.sortBy === 'distance'
            ? 'bg-amber-gold text-[#101010] border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-[#101010] focus-visible:ring-amber-gold focus-visible:border-amber-gold'
            : 'bg-[#141414] text-white border-[#2A2A2A] hover:bg-white/10 hover:text-amber-gold-hover hover:border-amber-gold/40 focus-visible:ring-amber-gold/60 focus-visible:border-amber-gold/60 focus-visible:bg-white/10'
        )}
      >
        <MapPin size={13} className={cn('flex-shrink-0 transition-colors duration-200', filters.sortBy === 'distance' ? 'text-[#101010]' : 'text-amber-gold')} />
        <span>Gần tôi</span>
      </Button>

      {/* Reset Action Chip */}
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          aria-label="Đặt lại tất cả bộ lọc"
          className="h-8 px-3 text-xs text-[#D0D0D0] hover:text-teal hover:bg-teal/10 hover:border-teal/30 border border-transparent rounded-full flex-shrink-0 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal/60 focus-visible:ring-offset-0 focus-visible:border-teal/60"
        >
          <RotateCcw size={13} className="mr-1" />
          Đặt lại
        </Button>
      )}
    </div>
  );
}



