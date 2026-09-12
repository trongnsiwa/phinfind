'use client';

import React from 'react';
import { RotateCcw, MapPin, Star, Tag, Sparkles, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { POPULAR_CATEGORIES } from '@/components/shop/AddShopDialog/constants';
import { RadiusSlider } from '@/components/shop/RadiusSlider';
import { isFilterDefault } from '@/lib/utils/filters';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

const PRICE_OPTIONS: Array<'₫' | '₫₫' | '₫₫₫' | '₫₫₫₫'> = ['₫', '₫₫', '₫₫₫', '₫₫₫₫'];
const PRICE_LABELS: Record<string, string> = {
  '₫': 'Dưới 30.000₫',
  '₫₫': '30.000₫ - 60.000₫',
  '₫₫₫': '60.000₫ - 100.000₫',
  '₫₫₫₫': 'Trên 100.000₫',
};

export function FilterChips() {
  const { searchQuery, filters, setFilters, resetFilters } = useUIStore();
  const topAmenities = React.useMemo(() => POPULAR_CATEGORIES.slice(0, 8), []);

  const isDefault = isFilterDefault(filters) && searchQuery.trim().length === 0;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
      {/* Open Now Toggle Chip */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters({ openNowOnly: !filters.openNowOnly })}
        aria-label="Lọc quán đang mở cửa"
        aria-pressed={filters.openNowOnly}
        className={cn(
          'h-7 px-2.5 text-[11px] font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
          filters.openNowOnly
            ? 'bg-teal text-primary-foreground border-teal font-bold shadow-md shadow-teal/25 hover:bg-teal-hover hover:text-primary-foreground focus-visible:ring-teal focus-visible:border-teal focus-visible:shadow-[0_0_0_2px_rgba(46,196,182,0.35)]'
            : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40 focus-visible:ring-primary/60 focus-visible:border-primary/60 focus-visible:bg-accent'
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200',
            filters.openNowOnly ? 'bg-primary-foreground' : 'bg-teal animate-pulse'
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
            'h-7 px-2.5 text-[11px] font-semibold rounded-full border border-input bg-input-bg text-foreground focus:outline-none focus:ring-1 focus:ring-amber-gold focus:ring-offset-0 focus:border-amber-gold focus:scale-[1.01] hover:bg-accent hover:border-amber-gold/40 hover:text-foreground transition-all duration-200 ease-out flex-shrink-0 w-auto gap-1',
            filters.minRating && filters.minRating > 0 && 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-primary-foreground focus:ring-amber-gold focus:border-amber-gold'
          )}
        >
          <Star size={12} className={cn('flex-shrink-0 transition-colors duration-200', filters.minRating && filters.minRating > 0 ? 'fill-primary-foreground text-primary-foreground' : 'text-amber-gold fill-amber-gold')} />
          <SelectValue placeholder="Đánh giá" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-input text-popover-foreground rounded-xl shadow-xl">
          <SelectItem value="all" className="focus:bg-primary/20 focus:text-foreground text-xs transition-colors cursor-pointer">
            Tất cả đánh giá
          </SelectItem>
          <SelectItem value="4" className="focus:bg-primary/20 focus:text-foreground text-xs transition-colors cursor-pointer">
            Từ 4.0+ sao
          </SelectItem>
          <SelectItem value="4.5" className="focus:bg-primary/20 focus:text-foreground text-xs transition-colors cursor-pointer">
            Từ 4.5+ sao
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Price Popover Chip */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Lọc theo mức giá"
            aria-pressed={filters.priceRanges.length > 0}
            className={cn(
              'h-7 px-2.5 text-[11px] font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
              filters.priceRanges.length > 0
                ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-primary-foreground focus-visible:ring-amber-gold focus-visible:border-amber-gold'
                : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40 focus-visible:ring-primary/60 focus-visible:border-primary/60 focus-visible:bg-accent'
            )}
          >
            <Tag size={12} className={cn('flex-shrink-0 transition-colors duration-200', filters.priceRanges.length > 0 ? 'text-primary-foreground' : 'text-amber-gold')} />
            <span>{filters.priceRanges.length > 0 ? `Giá · ${filters.priceRanges.length}` : 'Giá'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3 bg-popover border-input text-popover-foreground rounded-xl shadow-xl space-y-2">
          <div className="text-xs font-bold text-foreground">Mức giá</div>
          <div className="space-y-1">
            {PRICE_OPTIONS.map((price) => {
              const checked = filters.priceRanges.includes(price);
              return (
                <label
                  key={price}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-accent cursor-pointer text-xs select-none transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(isChecked) => {
                        const next = isChecked
                          ? [...filters.priceRanges, price]
                          : filters.priceRanges.filter((p) => p !== price);
                        setFilters({ priceRanges: next });
                      }}
                      className="data-[state=checked]:bg-amber-gold data-[state=checked]:border-amber-gold data-[state=checked]:text-primary-foreground"
                    />
                    <span className="font-bold text-foreground">{price}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{PRICE_LABELS[price]}</span>
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Amenity Popover Chip */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Lọc theo tiện ích"
            aria-pressed={filters.requiredAmenityIds.length > 0}
            className={cn(
              'h-7 px-2.5 text-[11px] font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
              filters.requiredAmenityIds.length > 0
                ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-primary-foreground focus-visible:ring-amber-gold focus-visible:border-amber-gold'
                : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40 focus-visible:ring-primary/60 focus-visible:border-primary/60 focus-visible:bg-accent'
            )}
          >
            <Sparkles size={12} className={cn('flex-shrink-0 transition-colors duration-200', filters.requiredAmenityIds.length > 0 ? 'text-primary-foreground' : 'text-amber-gold')} />
            <span>{filters.requiredAmenityIds.length > 0 ? `Tiện ích · ${filters.requiredAmenityIds.length}` : 'Tiện ích'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 bg-popover border-input text-popover-foreground rounded-xl shadow-xl space-y-2">
          <div className="text-xs font-bold text-foreground">Tiện ích phổ biến</div>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {topAmenities.map((cat) => {
              const Icon = cat.icon;
              const checked = filters.requiredAmenityIds.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent cursor-pointer text-xs select-none transition-colors"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const next = isChecked
                        ? [...filters.requiredAmenityIds, cat.id]
                        : filters.requiredAmenityIds.filter((id) => id !== cat.id);
                      setFilters({ requiredAmenityIds: next });
                    }}
                    className="data-[state=checked]:bg-amber-gold data-[state=checked]:border-amber-gold data-[state=checked]:text-primary-foreground"
                  />
                  <Icon size={14} className="text-amber-gold flex-shrink-0" />
                  <span className="text-foreground text-xs truncate">{cat.label}</span>
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Radius Popover Chip */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Lọc theo bán kính tìm kiếm"
            aria-pressed={filters.radiusKm !== null}
            className={cn(
              'h-7 px-2.5 text-[11px] font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
              filters.radiusKm !== null
                ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-primary-foreground focus-visible:ring-amber-gold focus-visible:border-amber-gold'
                : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40 focus-visible:ring-primary/60 focus-visible:border-primary/60 focus-visible:bg-accent'
            )}
          >
            <Navigation size={12} className={cn('flex-shrink-0 transition-colors duration-200', filters.radiusKm !== null ? 'text-primary-foreground' : 'text-amber-gold')} />
            <span>{filters.radiusKm !== null ? `${filters.radiusKm} km` : 'Bán kính'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4 bg-popover border-input text-popover-foreground rounded-xl shadow-xl">
          <RadiusSlider
            value={filters.radiusKm}
            onChange={(val) => setFilters({ radiusKm: val })}
          />
        </PopoverContent>
      </Popover>

      {/* Near Me Toggle Chip */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters({ sortBy: filters.sortBy === 'distance' ? 'rating' : 'distance' })}
        aria-label="Sắp xếp theo khoảng cách gần tôi"
        aria-pressed={filters.sortBy === 'distance'}
        className={cn(
          'h-7 px-2.5 text-[11px] font-semibold rounded-full border transition-all duration-200 ease-out flex-shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 focus-visible:scale-[1.01]',
          filters.sortBy === 'distance'
            ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-md hover:bg-amber-gold-hover hover:text-primary-foreground focus-visible:ring-amber-gold focus-visible:border-amber-gold'
            : 'bg-input-bg text-foreground border-input hover:bg-accent hover:text-foreground hover:border-amber-gold/40 focus-visible:ring-primary/60 focus-visible:border-primary/60 focus-visible:bg-accent'
        )}
      >
        <MapPin size={12} className={cn('flex-shrink-0 transition-colors duration-200', filters.sortBy === 'distance' ? 'text-primary-foreground' : 'text-amber-gold')} />
        <span>Gần tôi</span>
      </Button>

      {/* Reset Action Chip */}
      {!isDefault && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          aria-label="Đặt lại tất cả bộ lọc"
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-teal hover:bg-teal/10 hover:border-teal/30 border border-transparent rounded-full flex-shrink-0 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 focus-visible:border-amber-gold"
        >
          <RotateCcw size={12} className="mr-1" />
          Đặt lại
        </Button>
      )}
    </div>
  );
}
