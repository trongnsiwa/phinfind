import type React from 'react';
import type { CoffeeShop } from '@/types/shop';

export interface DaySchedule {
  dayName: string;
  dayShort: string;
  dayIndex: number;
  isToday: boolean;
  timeText: string;
  isOpenDay: boolean;
}

export interface ComputedSchedule {
  isOpenNow?: boolean;
  statusText: string;
  scheduleList: DaySchedule[];
  todaySchedule?: DaySchedule;
  hasRealSchedule: boolean;
  isApproximate: boolean;
  peakVibeTime?: string;
}

export interface GalleryPhoto {
  url: string;
  title: string;
  category: string;
  isCommunity?: boolean;
}

export interface AmenitiesTabProps {
  shop?: CoffeeShop;
}

export interface ShopDetailsContentProps {
  shop: CoffeeShop;
  isSidebar?: boolean;
  isStandalone?: boolean;
  hideActions?: boolean;
  hideInlineActions?: boolean;
  onSelectShop?: (shop: CoffeeShop) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onTabChange?: () => void;
  isVisited?: boolean;
}
