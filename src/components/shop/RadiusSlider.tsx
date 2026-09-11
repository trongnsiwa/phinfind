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
}

export function RadiusSlider({ value, onChange, className }: RadiusSliderProps) {
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
