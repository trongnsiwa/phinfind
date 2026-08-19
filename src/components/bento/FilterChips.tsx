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
        aria-label="Toggle open now filter"
        aria-pressed={filters.openNowOnly}
        className={cn(
          'h-8 px-3 text-xs font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
          filters.openNowOnly
            ? 'bg-[#7CAE8E] text-dark-bg border-[#7CAE8E] font-bold shadow-md shadow-[#7CAE8E]/25 hover:bg-[#8BBF9F] hover:text-dark-bg focus-visible:ring-[#7CAE8E] focus-visible:border-[#7CAE8E] focus-visible:shadow-[0_0_0_2px_rgba(124,174,142,0.35)]'
            : 'bg-dark-roast text-cream-white border-dark-border hover:bg-white/10 hover:text-amber-gold-hover hover:border-amber-gold/40 focus-visible:ring-amber-gold/60 focus-visible:border-amber-gold/60 focus-visible:bg-white/10'
        )}
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200',
            filters.openNowOnly ? 'bg-dark-bg' : 'bg-[#7CAE8E] animate-pulse'
          )}
          aria-hidden="true"
        />
        <span>Open Now</span>
      </Button>

      {/* Minimum Rating Filter Dropdown Chip */}
      <Select
        value={filters.minRating ? String(filters.minRating) : 'all'}
        onValueChange={(val) => setFilters({ minRating: val === 'all' ? 0 : Number(val) })}
      >
        <SelectTrigger
          aria-label="Filter by minimum rating"
          className={cn(
            'h-8 px-3 text-xs font-semibold rounded-full border border-dark-border bg-dark-roast text-cream-white focus:outline-none focus:ring-1 focus:ring-amber-gold/60 focus:ring-offset-0 focus:border-amber-gold/60 focus:scale-[1.01] hover:bg-white/10 hover:border-amber-gold/40 hover:text-amber-gold-hover transition-all duration-200 ease-out flex-shrink-0 w-auto gap-1.5',
            filters.minRating && filters.minRating > 0 && 'bg-amber-gold text-dark-bg border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-dark-bg focus:ring-amber-gold focus:border-amber-gold'
          )}
        >
          <Star size={14} className={cn('flex-shrink-0 transition-colors duration-200', filters.minRating && filters.minRating > 0 ? 'fill-dark-bg text-dark-bg' : 'text-amber-gold fill-amber-gold')} />
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent className="bg-dark-roast border-dark-border text-cream-white rounded-xl shadow-xl">
          <SelectItem value="all" className="focus:bg-dark-bg focus:text-amber-gold text-xs transition-colors cursor-pointer">
            All Ratings
          </SelectItem>
          <SelectItem value="4" className="focus:bg-dark-bg focus:text-amber-gold text-xs transition-colors cursor-pointer">
            4.0+ Stars
          </SelectItem>
          <SelectItem value="4.5" className="focus:bg-dark-bg focus:text-amber-gold text-xs transition-colors cursor-pointer">
            4.5+ Stars
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Near Me Toggle Chip */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters({ sortBy: filters.sortBy === 'distance' ? 'rating' : 'distance' })}
        aria-label="Toggle near me sort"
        aria-pressed={filters.sortBy === 'distance'}
        className={cn(
          'h-8 px-3.5 text-xs font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
          filters.sortBy === 'distance'
            ? 'bg-amber-gold text-dark-bg border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-dark-bg focus-visible:ring-amber-gold focus-visible:border-amber-gold'
            : 'bg-dark-roast text-cream-white border-dark-border hover:bg-white/10 hover:text-amber-gold-hover hover:border-amber-gold/40 focus-visible:ring-amber-gold/60 focus-visible:border-amber-gold/60 focus-visible:bg-white/10'
        )}
      >
        <MapPin size={13} className={cn('flex-shrink-0 transition-colors duration-200', filters.sortBy === 'distance' ? 'text-dark-bg' : 'text-amber-gold')} />
        <span>Near Me</span>
      </Button>

      {/* Reset Action Chip */}
      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          aria-label="Reset all filters"
          className="h-8 px-3 text-xs text-soft-beige hover:text-cream-white hover:bg-white/10 border border-transparent rounded-full flex-shrink-0 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold/60 focus-visible:ring-offset-0 focus-visible:border-amber-gold/60"
        >
          <RotateCcw size={13} className="mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}



