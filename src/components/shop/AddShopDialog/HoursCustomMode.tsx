import { Clock, Copy, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DAYS_LIST, TIME_GROUPS } from './constants';
import type { DayScheduleState } from './types';

interface HoursCustomModeProps {
  weekSchedule: Record<number, DayScheduleState>;
  handleToggleDay: (day: number) => void;
  handleDayTimeChange: (day: number, field: 'open' | 'close', value: string) => void;
  handleCopyToAllDays: (sourceDay: number) => void;
  enableAllDays: () => void;
  closeWeekendDays: () => void;
  handlePresetAllDays: (open?: string, close?: string) => void;
  handlePresetWeekdays: (open?: string, close?: string) => void;
  handlePreset247: () => void;
}

export function HoursCustomMode({
  weekSchedule,
  handleToggleDay,
  handleDayTimeChange,
  handleCopyToAllDays,
  enableAllDays,
  closeWeekendDays,
  handlePresetAllDays,
  handlePresetWeekdays,
  handlePreset247
}: HoursCustomModeProps) {
  return (
    <div className='p-2.5 sm:p-3 bg-secondary/25 rounded-2xl border border-border/80 space-y-2.5 animate-in fade-in duration-200'>
      <div className='flex items-center justify-between text-[11px] text-muted-foreground flex-wrap gap-1.5 pb-1 border-b border-border/60'>
        <span className='font-medium text-foreground/80'>Lịch theo từng ngày:</span>
        <div className='flex items-center gap-2 text-[10px]'>
          <button
            type='button'
            onClick={enableAllDays}
            className='text-amber-gold hover:underline font-medium cursor-pointer'
          >
            Bật tất cả
          </button>
          <span>•</span>
          <button
            type='button'
            onClick={closeWeekendDays}
            className='text-muted-foreground hover:text-foreground font-medium cursor-pointer'
          >
            Đóng T7 &amp; CN
          </button>
        </div>
      </div>

      {/* Day by Day Rows */}
      <div className='space-y-1.5'>
        {DAYS_LIST.map((d) => {
          const dayState = weekSchedule[d.day] || { enabled: true, open: '', close: '' };
          const isDayOpen = dayState.enabled;

          return (
            <div
              key={d.day}
              className={cn(
                'p-2 rounded-xl border transition-all duration-150',
                isDayOpen
                  ? 'bg-background/95 border-border/80 shadow-2xs'
                  : 'bg-secondary/30 border-dashed border-border/50 opacity-70'
              )}
            >
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2'>
                {/* Left: Switch and Day label */}
                <div className='flex items-center justify-between sm:justify-start sm:w-28 shrink-0 gap-1.5'>
                  <div className='flex items-center gap-1.5 min-w-0'>
                    <Switch
                      id={`switch-day-${d.day}`}
                      checked={isDayOpen}
                      onCheckedChange={() => handleToggleDay(d.day)}
                      className='data-[state=checked]:bg-amber-gold scale-75 origin-left'
                    />
                    <Label
                      htmlFor={`switch-day-${d.day}`}
                      className='text-xs font-bold text-foreground cursor-pointer truncate'
                    >
                      {d.name}
                    </Label>
                  </div>

                  {/* Mobile actions & status */}
                  <div className='sm:hidden flex items-center gap-1'>
                    {isDayOpen ? (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleCopyToAllDays(d.day)}
                        disabled={!dayState.open || !dayState.close}
                        title='Sao chép giờ sang các ngày khác'
                        className='h-6 px-1.5 text-[10px] text-muted-foreground hover:text-amber-gold hover:bg-amber-gold/10 rounded-md cursor-pointer disabled:opacity-30'
                      >
                        <Copy size={11} className='mr-1' />
                        <span>Sao chép</span>
                      </Button>
                    ) : (
                      <Badge
                        variant='outline'
                        className='text-[9px] px-1.5 py-0 bg-rose-500/10 text-rose-500 border-rose-500/20'
                      >
                        Đóng cửa
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Middle: Open & Close Time selects */}
                {isDayOpen ? (
                  <div className='flex-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2'>
                    <div className='grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 flex-1'>
                      {/* Open Time */}
                      <div className='relative flex-1'>
                        <Select
                          value={dayState.open || undefined}
                          onValueChange={(val) =>
                            handleDayTimeChange(d.day, 'open', val)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              'h-8 text-xs bg-secondary/50 border-border rounded-lg focus:ring-1 focus:ring-amber-gold text-foreground transition-all px-2',
                              !dayState.open && 'text-muted-foreground'
                            )}
                          >
                            <div className='flex items-center gap-1.5 truncate'>
                              <Clock size={11} className='text-amber-gold shrink-0' />
                              <SelectValue placeholder='Giờ mở' />
                            </div>
                          </SelectTrigger>
                          <SelectContent className='max-h-52 bg-popover border-border rounded-xl shadow-xl z-50'>
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
                      </div>

                      <span className='hidden sm:inline text-xs text-muted-foreground font-semibold'>
                        -
                      </span>

                      {/* Close Time */}
                      <div className='relative flex-1'>
                        <Select
                          value={dayState.close || undefined}
                          onValueChange={(val) =>
                            handleDayTimeChange(d.day, 'close', val)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              'h-8 text-xs bg-secondary/50 border-border rounded-lg focus:ring-1 focus:ring-amber-gold text-foreground transition-all px-2',
                              !dayState.close && 'text-muted-foreground'
                            )}
                          >
                            <div className='flex items-center gap-1.5 truncate'>
                              <Clock size={11} className='text-amber-gold shrink-0' />
                              <SelectValue placeholder='Giờ đóng' />
                            </div>
                          </SelectTrigger>
                          <SelectContent className='max-h-52 bg-popover border-border rounded-xl shadow-xl z-50'>
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
                      </div>
                    </div>

                    {/* Desktop Copy Button */}
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleCopyToAllDays(d.day)}
                      disabled={!dayState.open || !dayState.close}
                      title='Sao chép khung giờ này sang các ngày khác'
                      className='hidden sm:inline-flex h-8 px-2 text-[11px] text-muted-foreground hover:text-amber-gold hover:bg-amber-gold/10 rounded-lg shrink-0 cursor-pointer disabled:opacity-30'
                    >
                      <Copy size={11} className='mr-1' />
                      <span>Sao chép</span>
                    </Button>
                  </div>
                ) : (
                  /* When Closed (Desktop) */
                  <div className='hidden sm:flex flex-1 items-center justify-end gap-2 text-[11px] text-muted-foreground py-0.5'>
                    <Badge
                      variant='outline'
                      className='text-[9px] px-2 py-0.5 bg-secondary text-muted-foreground border-border'
                    >
                      Đóng cửa cả ngày
                    </Badge>
                    <button
                      type='button'
                      onClick={() => handleToggleDay(d.day)}
                      className='text-amber-gold hover:underline font-medium text-[11px] cursor-pointer'
                    >
                      Bật mở cửa
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Preset Buttons below schedule */}
      <div className='p-2 bg-secondary/35 rounded-xl border border-border/60 space-y-1.5 mt-2'>
        <span className='text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1'>
          <Sparkles size={11} className='text-amber-gold' />
          <span>Cài đặt mẫu nhanh cho cả tuần:</span>
        </span>
        <div className='flex items-center flex-wrap gap-1.5'>
          <button
            type='button'
            onClick={() => handlePresetAllDays('07:00', '22:00')}
            className='text-[11px] px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary border-border text-foreground hover:border-amber-gold/40 transition-all cursor-pointer font-medium shadow-2xs'
          >
            Mở tất cả (07:00 - 22:00)
          </button>
          <button
            type='button'
            onClick={() => handlePresetWeekdays('07:00', '22:00')}
            className='text-[11px] px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary border-border text-foreground hover:border-amber-gold/40 transition-all cursor-pointer font-medium shadow-2xs'
          >
            Mở T2-T6, đóng T7 &amp; CN
          </button>
          <button
            type='button'
            onClick={handlePreset247}
            className='text-[11px] px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary border-border text-foreground hover:border-amber-gold/40 transition-all cursor-pointer font-medium shadow-2xs'
          >
            Mở 24/7 cả tuần
          </button>
        </div>
      </div>
    </div>
  );
}
