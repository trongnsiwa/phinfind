import { CalendarDays, Clock, Trash2 } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';
import { DAYS_LIST } from './constants';
import { HoursCustomMode } from './HoursCustomMode';
import { HoursUniformMode } from './HoursUniformMode';
import type { DayScheduleState } from './types';

interface HoursStepProps {
  isCustomPerDay: boolean;
  setIsCustomPerDay: (val: boolean | ((prev: boolean) => boolean)) => void;
  sameOpenTime: string;
  setSameOpenTime: (val: string) => void;
  sameCloseTime: string;
  setSameCloseTime: (val: string) => void;
  weekSchedule: Record<number, DayScheduleState>;
  setWeekSchedule: React.Dispatch<React.SetStateAction<Record<number, DayScheduleState>>>;
  handleToggleDay: (day: number) => void;
  handleDayTimeChange: (day: number, field: 'open' | 'close', value: string) => void;
  handleCopyToAllDays: (sourceDay: number) => void;
  applyTimePreset: (open: string, close: string) => void;
  clearAllHours: () => void;
  enableAllDays: () => void;
  closeWeekendDays: () => void;
  handlePresetAllDays: (open?: string, close?: string) => void;
  handlePresetWeekdays: (open?: string, close?: string) => void;
  handlePreset247: () => void;
  hasAnyHoursSet: boolean;
}

export function HoursStep({
  isCustomPerDay,
  setIsCustomPerDay,
  sameOpenTime,
  setSameOpenTime,
  sameCloseTime,
  setSameCloseTime,
  weekSchedule,
  setWeekSchedule,
  handleToggleDay,
  handleDayTimeChange,
  handleCopyToAllDays,
  applyTimePreset,
  clearAllHours,
  enableAllDays,
  closeWeekendDays,
  handlePresetAllDays,
  handlePresetWeekdays,
  handlePreset247,
  hasAnyHoursSet
}: HoursStepProps) {
  const toggleScheduleMode = () => {
    const nextMode = !isCustomPerDay;
    setIsCustomPerDay(nextMode);
    if (nextMode && sameOpenTime && sameCloseTime) {
      setWeekSchedule((prev) => {
        const next = { ...prev };
        DAYS_LIST.forEach((d) => {
          next[d.day] = {
            enabled: true,
            open: sameOpenTime,
            close: sameCloseTime
          };
        });
        return next;
      });
    }
  };

  return (
    <div className='space-y-3 pt-1'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div className='flex items-center gap-1.5'>
          <Clock size={14} className='text-amber-gold' />
          <span className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Khung giờ hoạt động
          </span>
          <span className='text-[10px] text-muted-foreground font-normal'>(Tùy chọn)</span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={toggleScheduleMode}
            className={cn(
              'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none',
              isCustomPerDay
                ? 'bg-amber-gold/15 text-amber-gold border-amber-gold/40'
                : 'bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary hover:text-foreground'
            )}
          >
            <CalendarDays size={12} />
            <span>{isCustomPerDay ? 'Đặt theo từng ngày' : 'Cùng giờ cả tuần'}</span>
          </button>

          {hasAnyHoursSet && (
            <button
              type='button'
              onClick={clearAllHours}
              className='text-[11px] text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1 px-1.5 py-1'
              title='Xóa toàn bộ giờ đã chọn'
            >
              <Trash2 size={11} />
              <span>Xóa giờ</span>
            </button>
          )}
        </div>
      </div>

      {!isCustomPerDay ? (
        <HoursUniformMode
          sameOpenTime={sameOpenTime}
          setSameOpenTime={setSameOpenTime}
          sameCloseTime={sameCloseTime}
          setSameCloseTime={setSameCloseTime}
          setWeekSchedule={setWeekSchedule}
          setIsCustomPerDay={setIsCustomPerDay}
          applyTimePreset={applyTimePreset}
        />
      ) : (
        <HoursCustomMode
          weekSchedule={weekSchedule}
          handleToggleDay={handleToggleDay}
          handleDayTimeChange={handleDayTimeChange}
          handleCopyToAllDays={handleCopyToAllDays}
          enableAllDays={enableAllDays}
          closeWeekendDays={closeWeekendDays}
          handlePresetAllDays={handlePresetAllDays}
          handlePresetWeekdays={handlePresetWeekdays}
          handlePreset247={handlePreset247}
        />
      )}
    </div>
  );
}
