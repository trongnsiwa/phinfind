'use client';

import { ChevronDown, Clock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ComputedSchedule } from './types';

interface SchedulePanelProps {
  scheduleInfo: ComputedSchedule;
}

export function SchedulePanel({ scheduleInfo }: SchedulePanelProps) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);

  if (scheduleInfo.hasRealSchedule) {
    return (
      <>
        <button
          type='button'
          onClick={() => setIsHoursExpanded((prev) => !prev)}
          aria-expanded={isHoursExpanded}
          aria-controls='weekly-schedule-panel'
          className='w-full flex items-center justify-between gap-3 text-left group/hours focus:outline-none cursor-pointer'
        >
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='w-8 h-8 rounded-xl bg-amber-gold/15 border border-amber-gold/25 flex items-center justify-center text-amber-gold flex-shrink-0'>
              <Clock size={16} />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-1.5'>
                <span className='font-bold text-foreground text-xs block group-hover/hours:text-primary transition-colors'>
                  Giờ Mở Cửa
                </span>
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    scheduleInfo.isOpenNow ? 'bg-teal animate-pulse' : 'bg-[#C97A7A]'
                  )}
                />
              </div>
              <p className='text-[11px] text-muted-foreground truncate'>
                <span
                  className={cn(
                    'font-semibold',
                    scheduleInfo.isOpenNow ? 'text-teal' : 'text-[#E8A5A5]'
                  )}
                >
                  {scheduleInfo.isOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
                </span>
                {scheduleInfo.todaySchedule && (
                  <span className='text-muted-foreground'>
                    {' '}
                    • Hôm nay: {scheduleInfo.todaySchedule.timeText}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-1.5 flex-shrink-0 bg-card border border-border/40 px-2 py-1 rounded-xl group-hover/hours:border-border transition-colors'>
            <span className='text-[10px] font-semibold text-foreground'>
              {isHoursExpanded ? 'Thu gọn' : 'Xem tất cả'}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                'text-muted-foreground group-hover/hours:text-foreground transition-transform duration-300',
                isHoursExpanded && 'rotate-180'
              )}
            />
          </div>
        </button>

        <div
          id='weekly-schedule-panel'
          className={cn(
            'grid transition-all duration-300 ease-in-out overflow-hidden',
            isHoursExpanded
              ? 'grid-rows-[1fr] opacity-100 mt-2.5 pt-2.5 border-t border-border/40'
              : 'grid-rows-[0fr] opacity-0 mt-0 pt-0'
          )}
        >
          <div className='min-h-0 space-y-2.5'>
            <div className='bg-card rounded-xl border border-border/40 p-2 space-y-1'>
              {scheduleInfo.scheduleList.map((day) => (
                <div
                  key={day.dayName}
                  className={cn(
                    'flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors',
                    day.isToday
                      ? 'bg-primary/20 text-foreground font-bold border border-primary/40 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className='flex items-center gap-2'>
                    {day.isToday ? (
                      <span className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
                    ) : (
                      <span className='w-1.5 h-1.5 rounded-full bg-muted-foreground/30' />
                    )}
                    <span className={cn(day.isToday ? 'text-foreground font-bold' : 'text-muted-foreground')}>
                      {day.dayName}
                    </span>
                    {day.isToday && (
                      <span className='text-[9px] uppercase tracking-wider bg-amber-gold text-primary-foreground px-1.5 py-0.2 rounded font-extrabold ml-1'>
                        Hôm nay
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[11px]',
                      day.isToday ? 'text-foreground font-bold' : 'text-muted-foreground'
                    )}
                  >
                    {day.timeText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className='w-full flex items-center justify-between gap-3 text-left'>
      <div className='flex items-center gap-2.5 min-w-0'>
        <div className='w-8 h-8 rounded-xl bg-amber-gold/15 border border-amber-gold/25 flex items-center justify-center text-amber-gold flex-shrink-0'>
          <Clock size={16} />
        </div>
        <div className='min-w-0'>
          <div className='flex items-center gap-1.5'>
            <span className='font-bold text-foreground text-xs block'>
              Giờ Mở Cửa
            </span>
            {scheduleInfo.isOpenNow !== undefined && (
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  scheduleInfo.isOpenNow ? 'bg-teal animate-pulse' : 'bg-[#C97A7A]'
                )}
              />
            )}
          </div>
          <p className='text-[11px] text-muted-foreground truncate'>
            {scheduleInfo.isOpenNow !== undefined ? (
              <span
                className={cn(
                  'font-semibold',
                  scheduleInfo.isOpenNow ? 'text-teal' : 'text-[#E8A5A5]'
                )}
              >
                {scheduleInfo.isOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
              </span>
            ) : (
              <span>Chưa có thông tin giờ mở cửa</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
