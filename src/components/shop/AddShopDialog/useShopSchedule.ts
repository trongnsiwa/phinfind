import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DAYS_LIST } from './constants';
import type { DayScheduleState, OpeningPeriod } from './types';

export function useShopSchedule() {
  const [isCustomPerDay, setIsCustomPerDay] = useState(false);
  const [sameOpenTime, setSameOpenTime] = useState('');
  const [sameCloseTime, setSameCloseTime] = useState('');
  const [weekSchedule, setWeekSchedule] = useState<Record<number, DayScheduleState>>(() => {
    const initial: Record<number, DayScheduleState> = {};
    DAYS_LIST.forEach((d) => {
      initial[d.day] = { enabled: true, open: '', close: '' };
    });
    return initial;
  });

  const handleToggleDay = (day: number) => {
    setWeekSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day]?.enabled
      }
    }));
  };

  const handleDayTimeChange = (day: number, field: 'open' | 'close', value: string) => {
    setWeekSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value === '__NONE__' ? '' : value
      }
    }));
  };

  const handleCopyToAllDays = (sourceDay: number) => {
    const source = weekSchedule[sourceDay];
    if (!source || !source.open || !source.close) {
      toast.info('Vui lòng chọn cả giờ mở và giờ đóng cửa trước khi sao chép.');
      return;
    }

    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        next[d.day] = {
          enabled: true,
          open: source.open,
          close: source.close
        };
      });
      return next;
    });

    toast.success(`Đã sao chép khung giờ (${source.open} - ${source.close}) sang tất cả 7 ngày.`);
  };

  const applyTimePreset = (open: string, close: string) => {
    setSameOpenTime(open);
    setSameCloseTime(close);
    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        next[d.day] = {
          enabled: true,
          open,
          close
        };
      });
      return next;
    });
  };

  const clearAllHours = () => {
    setSameOpenTime('');
    setSameCloseTime('');
    const resetWeek: Record<number, DayScheduleState> = {};
    DAYS_LIST.forEach((d) => {
      resetWeek[d.day] = { enabled: true, open: '', close: '' };
    });
    setWeekSchedule(resetWeek);
  };

  const enableAllDays = () => {
    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        next[d.day] = { ...next[d.day], enabled: true };
      });
      return next;
    });
  };

  const closeWeekendDays = () => {
    setWeekSchedule((prev) => ({
      ...prev,
      6: { ...prev[6], enabled: false },
      0: { ...prev[0], enabled: false }
    }));
    toast.info('Đã tắt ngày Thứ Bảy và Chủ Nhật.');
  };

  const handlePresetAllDays = (open = '07:00', close = '22:00') => {
    setSameOpenTime(open);
    setSameCloseTime(close);
    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        next[d.day] = {
          enabled: true,
          open,
          close
        };
      });
      return next;
    });
    toast.success(`Đã áp dụng khung giờ (${open} - ${close}) cho cả 7 ngày.`);
  };

  const handlePresetWeekdays = (open = '07:00', close = '22:00') => {
    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        if (d.day === 6 || d.day === 0) {
          next[d.day] = { enabled: false, open: '', close: '' };
        } else {
          next[d.day] = { enabled: true, open, close };
        }
      });
      return next;
    });
    toast.success(`Đã cài đặt mở T2-T6 (${open} - ${close}), đóng T7 & CN.`);
  };

  const handlePreset247 = () => {
    handlePresetAllDays('00:00', '23:59');
  };

  const computedPeriods = useMemo<OpeningPeriod[]>(() => {
    if (isCustomPerDay) {
      return DAYS_LIST
        .filter(
          (d) =>
            weekSchedule[d.day]?.enabled &&
            weekSchedule[d.day]?.open &&
            weekSchedule[d.day]?.close
        )
        .map((d) => ({
          open: { day: d.day, time: weekSchedule[d.day].open },
          close: { day: d.day, time: weekSchedule[d.day].close }
        }));
    } else {
      if (sameOpenTime && sameCloseTime) {
        return DAYS_LIST.map((d) => ({
          open: { day: d.day, time: sameOpenTime },
          close: { day: d.day, time: sameCloseTime }
        }));
      }
      return [];
    }
  }, [isCustomPerDay, weekSchedule, sameOpenTime, sameCloseTime]);

  const hasAnyHoursSet =
    (isCustomPerDay && computedPeriods.length > 0) ||
    (!isCustomPerDay && Boolean(sameOpenTime || sameCloseTime));

  const populateSchedule = (periods?: OpeningPeriod[]) => {
    if (periods && periods.length > 0) {
      const nextSchedule: Record<number, DayScheduleState> = {};
      DAYS_LIST.forEach((d) => {
        const p = periods.find((item) => item.open.day === d.day);
        if (p) {
          nextSchedule[d.day] = {
            enabled: true,
            open: p.open.time,
            close: p.close.time
          };
        } else {
          nextSchedule[d.day] = { enabled: false, open: '', close: '' };
        }
      });
      setWeekSchedule(nextSchedule);

      const enabledPeriods = periods.filter((p) => p.open?.time && p.close?.time);
      const first = enabledPeriods[0];
      const isUniform =
        enabledPeriods.length === 7 &&
        enabledPeriods.every(
          (p) => p.open.time === first?.open.time && p.close.time === first?.close.time
        );

      if (isUniform && first) {
        setSameOpenTime(first.open.time);
        setSameCloseTime(first.close.time);
        setIsCustomPerDay(false);
      } else {
        setIsCustomPerDay(true);
      }
    } else {
      clearAllHours();
      setIsCustomPerDay(false);
    }
  };

  return {
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
    computedPeriods,
    hasAnyHoursSet,
    populateSchedule
  };
}
