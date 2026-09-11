import { Clock, X } from 'lucide-react';
import type React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DAYS_LIST, POPULAR_TIME_PRESETS, TIME_GROUPS } from './constants';
import type { DayScheduleState } from './types';

interface HoursUniformModeProps {
  sameOpenTime: string;
  setSameOpenTime: (val: string) => void;
  sameCloseTime: string;
  setSameCloseTime: (val: string) => void;
  setWeekSchedule: React.Dispatch<React.SetStateAction<Record<number, DayScheduleState>>>;
  setIsCustomPerDay: (val: boolean) => void;
  applyTimePreset: (open: string, close: string) => void;
}

export function HoursUniformMode({
  sameOpenTime,
  setSameOpenTime,
  sameCloseTime,
  setSameCloseTime,
  setWeekSchedule,
  setIsCustomPerDay,
  applyTimePreset
}: HoursUniformModeProps) {
  return (
    <div className='p-3.5 bg-secondary/30 rounded-2xl border border-border/80 space-y-3 animate-in fade-in duration-200'>
      <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
        <span>Áp dụng một khung giờ mở/đóng cho tất cả các ngày (T2 - CN)</span>
        <button
          type='button'
          onClick={() => setIsCustomPerDay(true)}
          className='text-amber-gold hover:underline font-medium cursor-pointer'
        >
          Tùy chỉnh từng ngày &rarr;
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {/* Open Time */}
        <div className='space-y-1'>
          <Label
            htmlFor='same-open-time'
            className='text-[11px] font-medium text-muted-foreground flex items-center gap-1'
          >
            <span>Giờ mở cửa (Hàng ngày)</span>
          </Label>
          <div className='relative flex items-center'>
            <Select
              value={sameOpenTime || undefined}
              onValueChange={(val) => {
                const newOpen = val === '__NONE__' ? '' : val;
                setSameOpenTime(newOpen);
                if (newOpen) {
                  setWeekSchedule((prev) => {
                    const next = { ...prev };
                    DAYS_LIST.forEach((d) => {
                      next[d.day] = { ...next[d.day], open: newOpen };
                    });
                    return next;
                  });
                }
              }}
            >
              <SelectTrigger
                id='same-open-time'
                className={cn(
                  'h-10 bg-background/80 border-border text-xs rounded-xl focus:ring-1 focus:ring-amber-gold focus:border-amber-gold/60 text-foreground transition-all',
                  !sameOpenTime && 'text-muted-foreground'
                )}
              >
                <div className='flex items-center gap-2 truncate pr-4'>
                  <Clock size={13} className='text-amber-gold shrink-0' />
                  <SelectValue placeholder='Chọn giờ mở (VD: 07:00)' />
                </div>
              </SelectTrigger>
              <SelectContent className='max-h-56 bg-popover border-border rounded-xl shadow-xl z-50'>
                <SelectItem
                  value='__NONE__'
                  className='text-xs text-muted-foreground font-medium cursor-pointer'
                >
                  -- Chưa chọn --
                </SelectItem>
                {TIME_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className='text-[10px] uppercase font-bold text-amber-gold/90 px-2 py-1 tracking-wider'>
                      {group.label}
                    </SelectLabel>
                    {group.options.map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className='text-xs font-mono py-1.5 cursor-pointer'
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {sameOpenTime && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setSameOpenTime('');
                }}
                className='absolute right-8 p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer'
                title='Xóa giờ mở cửa'
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Close Time */}
        <div className='space-y-1'>
          <Label
            htmlFor='same-close-time'
            className='text-[11px] font-medium text-muted-foreground flex items-center gap-1'
          >
            <span>Giờ đóng cửa (Hàng ngày)</span>
          </Label>
          <div className='relative flex items-center'>
            <Select
              value={sameCloseTime || undefined}
              onValueChange={(val) => {
                const newClose = val === '__NONE__' ? '' : val;
                setSameCloseTime(newClose);
                if (newClose) {
                  setWeekSchedule((prev) => {
                    const next = { ...prev };
                    DAYS_LIST.forEach((d) => {
                      next[d.day] = { ...next[d.day], close: newClose };
                    });
                    return next;
                  });
                }
              }}
            >
              <SelectTrigger
                id='same-close-time'
                className={cn(
                  'h-10 bg-background/80 border-border text-xs rounded-xl focus:ring-1 focus:ring-amber-gold focus:border-amber-gold/60 text-foreground transition-all',
                  !sameCloseTime && 'text-muted-foreground'
                )}
              >
                <div className='flex items-center gap-2 truncate pr-4'>
                  <Clock size={13} className='text-amber-gold shrink-0' />
                  <SelectValue placeholder='Chọn giờ đóng (VD: 22:30)' />
                </div>
              </SelectTrigger>
              <SelectContent className='max-h-56 bg-popover border-border rounded-xl shadow-xl z-50'>
                <SelectItem
                  value='__NONE__'
                  className='text-xs text-muted-foreground font-medium cursor-pointer'
                >
                  -- Chưa chọn --
                </SelectItem>
                {TIME_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className='text-[10px] uppercase font-bold text-amber-gold/90 px-2 py-1 tracking-wider'>
                      {group.label}
                    </SelectLabel>
                    {group.options.map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className='text-xs font-mono py-1.5 cursor-pointer'
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {sameCloseTime && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setSameCloseTime('');
                }}
                className='absolute right-8 p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer'
                title='Xóa giờ đóng cửa'
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Popular Presets */}
      <div className='flex items-center flex-wrap gap-1.5 pt-0.5'>
        <span className='text-[11px] text-muted-foreground font-medium mr-1'>
          Gợi ý nhanh:
        </span>
        {POPULAR_TIME_PRESETS.map((preset) => {
          const isMatch =
            sameOpenTime === preset.open && sameCloseTime === preset.close;
          return (
            <button
              key={preset.label}
              type='button'
              onClick={() => applyTimePreset(preset.open, preset.close)}
              className={cn(
                'text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all duration-150 cursor-pointer select-none',
                isMatch
                  ? 'bg-amber-gold/15 text-amber-gold border-amber-gold/40 font-semibold shadow-xs'
                  : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
