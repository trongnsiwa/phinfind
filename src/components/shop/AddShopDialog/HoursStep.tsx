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
    <div id='step-4' data-step='4' className='space-y-3 pt-5 border-t border-border/40'>
      {/* MOBILE HEADER ( < md ): Two-line hierarchy */}
      <div className='md:hidden flex items-center justify-between'>
        <div className='space-y-0.5'>
          <div className='flex items-center gap-2'>
            <span className='text-[10px] font-bold uppercase tracking-wider text-amber-gold'>Bước 4</span>
            <h3 className='text-sm font-bold text-foreground'>Khung giờ hoạt động</h3>
          </div>
          <p className='text-[11px] text-muted-foreground'>Không bắt buộc</p>
        </div>

        {hasAnyHoursSet && (
          <button
            type='button'
            onClick={clearAllHours}
            className='text-[11px] text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1 px-2 py-1'
            title='Xóa toàn bộ giờ đã chọn'
          >
            <Trash2 size={11} />
            <span>Xóa giờ</span>
          </button>
        )}
      </div>

      {/* TABLET / DESKTOP HEADER ( >= md ): Preserved */}
      <div className='hidden md:flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <Clock size={14} className='text-amber-gold' />
          <span className='text-xs font-bold text-foreground uppercase tracking-wider'>
            Khung giờ hoạt động
          </span>
          <span className='text-[10px] text-muted-foreground font-normal'>(Tùy chọn)</span>
        </div>

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

      {/* Segmented Control for Schedule Mode at top of section */}
      <div className='w-full bg-secondary/50 p-1 rounded-xl border border-border/60 grid grid-cols-2 gap-1 select-none'>
        <button
          type='button'
          onClick={() => isCustomPerDay && toggleScheduleMode()}
          className={cn(
            'h-9 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            !isCustomPerDay
              ? 'bg-card text-foreground shadow-xs border border-border/40 font-bold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Clock size={13} className={cn(!isCustomPerDay ? 'text-amber-gold' : 'text-muted-foreground')} />
          <span>Cùng giờ cả tuần</span>
        </button>
        <button
          type='button'
          onClick={() => !isCustomPerDay && toggleScheduleMode()}
          className={cn(
            'h-9 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            isCustomPerDay
              ? 'bg-card text-foreground shadow-xs border border-border/40 font-bold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <CalendarDays size={13} className={cn(isCustomPerDay ? 'text-amber-gold' : 'text-muted-foreground')} />
          <span>Tùy chỉnh từng ngày</span>
        </button>
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
