'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface RadiusSliderProps {
  value: number | null;
  onChange: (v: number | null) => void;
  className?: string;
  compact?: boolean;
}

export function RadiusSlider({ value, onChange, className, compact = false }: RadiusSliderProps) {
  const isEnabled = value !== null;
  const sliderValue = value ?? 20;

  const handleToggle = (checked: boolean) => {
    if (checked) {
      onChange(20);
    } else {
      onChange(null);
    }
  };

  const handleSliderChange = (vals: number[]) => {
    if (vals.length > 0) {
      onChange(vals[0]);
    }
  };

  if (compact) {
    return (
      // RESPONSIVE: Compact 2-row layout for bottom sheet
      <div className={cn('space-y-2.5', className)}>
        {/* Row 1: Label + Toggle switch */}
        <div className="flex items-center justify-between">
          <Label
            htmlFor="radius-filter-switch-compact"
            className="text-xs font-bold text-foreground uppercase tracking-wider cursor-pointer select-none"
          >
            Bán kính tìm kiếm
          </Label>
          <Switch
            id="radius-filter-switch-compact"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            className="focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 data-[state=checked]:bg-amber-gold cursor-pointer"
          />
        </div>

        {/* Row 2: Slider + Value display */}
        <div className={cn('flex items-center gap-3 pt-0.5 transition-all', !isEnabled && 'opacity-40 pointer-events-none')}>
          <div className="flex-1 min-w-0 touch-none">
            <Slider
              value={[sliderValue]}
              min={1}
              max={100}
              step={1}
              disabled={!isEnabled}
              onValueChange={handleSliderChange}
              className="py-1 touch-none"
            />
          </div>
          <span className={cn('text-xs font-bold whitespace-nowrap min-w-[5.5rem] text-right', isEnabled ? 'text-foreground' : 'text-muted-foreground')}>
            {isEnabled ? `${value} km` : 'Không giới hạn'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor="radius-filter-switch"
          className="text-xs font-medium cursor-pointer select-none"
        >
          Giới hạn bán kính tìm kiếm
        </Label>
        <Switch
          id="radius-filter-switch"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          className="focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 data-[state=checked]:bg-amber-gold"
        />
      </div>

      <div className={cn('space-y-1.5 transition-opacity', !isEnabled && 'opacity-50 pointer-events-none')}>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground select-none">
          <span>1 km</span>
          <span>100 km</span>
        </div>
        <Slider
          value={[sliderValue]}
          min={1}
          max={100}
          step={1}
          disabled={!isEnabled}
          onValueChange={handleSliderChange}
          className="py-1"
        />
      </div>

      <div className="text-xs text-muted-foreground select-none">
        {isEnabled ? (
          <span className="font-semibold text-foreground">
            Đang tìm trong bán kính: <span className="text-amber-gold font-bold">{value} km</span>
          </span>
        ) : (
          <span>Không giới hạn — hiển thị tất cả quán</span>
        )}
      </div>
    </div>
  );
}
