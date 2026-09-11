'use client';

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { POPULAR_CATEGORIES } from '@/components/shop/AddShopDialog';
import { RadiusSlider } from '@/components/shop/RadiusSlider';
import { countActiveFilters } from '@/lib/utils/filters';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

const PRICE_OPTIONS: Array<'₫' | '₫₫' | '₫₫₫' | '₫₫₫₫'> = ['₫', '₫₫', '₫₫₫', '₫₫₫₫'];

export function FilterCard() {
  const { filters, setFilters, resetFilters } = useUIStore();
  const [expanded, setExpanded] = useState(false);

  const topAmenities = useMemo(() => POPULAR_CATEGORIES.slice(0, 8), []);
  const activeCount = countActiveFilters(filters, '');

  return (
    <Card
      className={cn(
        'col-span-2 row-span-1 bg-gradient-to-br from-phin-900 via-phin-800 to-phin-700 text-white rounded-3xl border border-phin-600 shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between p-4 relative',
        expanded && 'row-span-2 md:row-span-2'
      )}
    >
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm leading-tight flex items-center gap-1.5">
              Lọc &amp; Khám phá
              {activeCount > 0 && (
                <Badge variant="secondary" className="bg-amber-400 text-phin-950 font-bold text-[10px] h-4 px-1.5 rounded-full">
                  {activeCount}
                </Badge>
              )}
            </h3>
            <p className="text-[11px] text-phin-200">Tùy chỉnh trải nghiệm tìm quán cà phê</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-2.5 h-8 gap-1 backdrop-blur-md focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
        >
          <SlidersHorizontal size={13} />
          <span>{expanded ? 'Thu gọn' : 'Tùy chọn'}</span>
          <ChevronDown size={13} className={cn('transition-transform duration-300', expanded && 'rotate-180')} />
        </Button>
      </div>

      {!expanded ? (
        <div className="flex items-center gap-2 pt-2 z-10 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ openNowOnly: !filters.openNowOnly })}
            className={cn(
              'h-7 px-2.5 text-[11px] rounded-lg border backdrop-blur-md transition-all focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0',
              filters.openNowOnly
                ? 'bg-teal text-[#101010] border-teal font-bold shadow-md shadow-teal/25 hover:bg-teal-hover'
                : 'bg-white/10 text-phin-100 border-white/20 hover:bg-white/20 hover:text-teal'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full inline-block mr-1.5', filters.openNowOnly ? 'bg-[#101010]' : 'bg-teal animate-pulse')} />
            Đang mở cửa
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ minRating: filters.minRating === 4 ? 0 : 4 })}
            className={cn(
              'h-7 px-2.5 text-[11px] rounded-lg border backdrop-blur-md transition-all focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0',
              filters.minRating === 4
                ? 'bg-amber-400 text-phin-950 border-amber-300 font-bold'
                : 'bg-white/10 text-phin-100 border-white/20 hover:bg-white/20'
            )}
          >
            ⭐ Từ 4.0+ sao
          </Button>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2 text-[10px] text-phin-300 hover:text-white focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
            >
              <RotateCcw size={11} className="mr-1" />
              Đặt lại
            </Button>
          )}
        </div>
      ) : (
        <CardContent className="p-0 pt-3 space-y-3 z-10 text-xs max-h-[380px] overflow-y-auto no-scrollbar pr-0.5">
          {/* 1. Open Now Toggle */}
          <div className="flex items-center justify-between pt-1">
            <Label htmlFor="bento-open-now" className="text-phin-100 font-medium cursor-pointer">
              Chỉ quán đang mở cửa
            </Label>
            <Switch
              id="bento-open-now"
              checked={filters.openNowOnly}
              onCheckedChange={(checked) => setFilters({ openNowOnly: checked })}
            />
          </div>

          {/* 2. Min Rating Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-phin-200">
              <span>Đánh giá tối thiểu</span>
              <span className="font-bold text-amber-300">{filters.minRating || 0} ⭐</span>
            </div>
            <Slider
              value={[filters.minRating || 0]}
              min={0}
              max={5}
              step={0.5}
              onValueChange={([val]) => setFilters({ minRating: val })}
              className="py-1"
            />
          </div>

          {/* 3. Price Range Inline Chips */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-phin-200">
              <span>Mức giá</span>
              {filters.priceRanges.length > 0 && (
                <span className="font-bold text-amber-300">{filters.priceRanges.join(', ')}</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {PRICE_OPTIONS.map((price) => {
                const isSelected = filters.priceRanges.includes(price);
                return (
                  <button
                    key={price}
                    type="button"
                    onClick={() => {
                      const next = isSelected
                        ? filters.priceRanges.filter((p) => p !== price)
                        : [...filters.priceRanges, price];
                      setFilters({ priceRanges: next });
                    }}
                    className={cn(
                      'py-1 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold',
                      isSelected
                        ? 'bg-amber-400 text-phin-950 border-amber-300 shadow-md font-bold'
                        : 'bg-white/10 text-phin-100 border-white/20 hover:bg-white/20'
                    )}
                  >
                    {price}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Amenities Inline Chips */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-phin-200">
              <span>Tiện ích phổ biến</span>
              {filters.requiredAmenityIds.length > 0 && (
                <span className="font-bold text-amber-300">{filters.requiredAmenityIds.length} đã chọn</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topAmenities.map((cat) => {
                const Icon = cat.icon;
                const isSelected = filters.requiredAmenityIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      const next = isSelected
                        ? filters.requiredAmenityIds.filter((id) => id !== cat.id)
                        : [...filters.requiredAmenityIds, cat.id];
                      setFilters({ requiredAmenityIds: next });
                    }}
                    className={cn(
                      'py-1 px-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold',
                      isSelected
                        ? 'bg-amber-400 text-phin-950 border-amber-300 font-bold shadow-md'
                        : 'bg-white/10 text-phin-100 border-white/20 hover:bg-white/20'
                    )}
                  >
                    <Icon size={12} className={isSelected ? 'text-phin-950' : 'text-amber-300'} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Radius Shared Component */}
          <RadiusSlider
            value={filters.radiusKm}
            onChange={(val) => setFilters({ radiusKm: val })}
            className="pt-1"
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2.5 text-[11px] text-phin-300 hover:text-white focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
            >
              <RotateCcw size={11} className="mr-1" />
              Đặt lại tất cả
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setExpanded(false)}
              className="h-7 px-3 text-[11px] bg-amber-400 text-phin-950 font-bold hover:bg-amber-300 rounded-lg focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
            >
              Áp dụng bộ lọc
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
