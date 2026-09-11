'use client';

import {
  Check, CheckCircle2, ChevronDown, ChevronRight, Clock, Coffee, Compass, Copy, CreditCard,
  CupSoda, Edit3, Flame, Footprints, Globe, Heart, Images, Loader2, LogIn, MapPin, MoreVertical,
  Navigation, Pencil, Phone, Quote, Send, Sparkles, Star, Sun, Trash2, Utensils, Wifi, Wind, X,
  Zap, Camera, Tag, ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';
import { EmptyIllustration } from '@/components/common/EmptyIllustration';
import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { cleanCategoryLabel } from '@/lib/utils/placeholders';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { useShopReviews, useDeleteShop, useUserVisits, useToggleVisit, useToggleReviewLike, useDeleteReview, useUserSuggestions } from '@/hooks/useShops';
import { CoffeeShop } from '@/types/shop';
import { ReviewModal, ReviewItem } from './ReviewModal';
import { AddShopDialog } from '@/components/shop/AddShopDialog';
import { SuggestEditDialog } from '@/components/shop/SuggestEditDialog';
import { VisitNoteDialog } from '@/components/shop/VisitNoteDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';






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

function parseHHMM(timeStr?: string): { hours: number; minutes: number; formatted: string } {
  if (!timeStr) {
    return { hours: 0, minutes: 0, formatted: '--:--' };
  }
  const clean = timeStr.replace(/[^0-9]/g, '').padStart(4, '0');
  const h = parseInt(clean.slice(0, 2), 10);
  const m = parseInt(clean.slice(2, 4), 10);
  if (isNaN(h) || isNaN(m)) {
    return { hours: 0, minutes: 0, formatted: '--:--' };
  }
  const displayH = h < 10 ? `0${h}` : `${h}`;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return {
    hours: h,
    minutes: m,
    formatted: `${displayH}:${displayM}`
  };
}

export function getShopSchedule(openingHours?: CoffeeShop['opening_hours']): ComputedSchedule {
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const DAYS_ORDER = [
    { name: 'Thứ Hai', short: 'T2', index: 1 },
    { name: 'Thứ Ba', short: 'T3', index: 2 },
    { name: 'Thứ Tư', short: 'T4', index: 3 },
    { name: 'Thứ Năm', short: 'T5', index: 4 },
    { name: 'Thứ Sáu', short: 'T6', index: 5 },
    { name: 'Thứ Bảy', short: 'T7', index: 6 },
    { name: 'Chủ Nhật', short: 'CN', index: 0 }
  ];

  const periods = openingHours?.periods;

  if (periods && periods.length > 0) {
    const scheduleList: DaySchedule[] = DAYS_ORDER.map((d) => {
      const period = periods.find(
        (p) => p.open.day === d.index || (p.open.day === 0 && d.index === 0)
      );

      if (!period) {
        return {
          dayName: d.name,
          dayShort: d.short,
          dayIndex: d.index,
          isToday: d.index === currentDay,
          timeText: 'Đóng cửa',
          isOpenDay: false
        };
      }

      const openParsed = parseHHMM(period.open.time);
      const closeParsed = parseHHMM(period.close.time);

      return {
        dayName: d.name,
        dayShort: d.short,
        dayIndex: d.index,
        isToday: d.index === currentDay,
        timeText: `${openParsed.formatted} – ${closeParsed.formatted}`,
        isOpenDay: true
      };
    });

    const todayPeriod = periods.find((p) => p.open.day === currentDay);
    let isOpenNow = false;
    let statusText = 'Đã đóng cửa';

    if (todayPeriod) {
      const openTime = parseHHMM(todayPeriod.open.time);
      const closeTime = parseHHMM(todayPeriod.close.time);
      const openMins = openTime.hours * 60 + openTime.minutes;
      const closeMins = closeTime.hours * 60 + closeTime.minutes;

      if (currentMinutes >= openMins && currentMinutes < closeMins) {
        isOpenNow = true;
        statusText = `Đang mở cửa • Đóng cửa lúc ${closeTime.formatted}`;
      } else if (currentMinutes < openMins) {
        isOpenNow = false;
        statusText = `Đã đóng cửa • Mở cửa lúc ${openTime.formatted}`;
      } else {
        isOpenNow = false;
        statusText = 'Đã đóng cửa hôm nay';
      }
    } else {
      isOpenNow = false;
      statusText = 'Đóng cửa hôm nay';
    }

    const todaySchedule = scheduleList.find((s) => s.isToday);

    return {
      isOpenNow,
      statusText,
      scheduleList,
      todaySchedule,
      hasRealSchedule: true,
      isApproximate: false,
      peakVibeTime: undefined
    };
  }

  // When periods are not available: do not fabricate fake hours
  const isOpenNow = openingHours?.open_now;
  const statusText =
    isOpenNow === true
      ? 'Đang mở cửa'
      : isOpenNow === false
        ? 'Đã đóng cửa'
        : 'Chưa có thông tin giờ mở cửa';

  return {
    isOpenNow,
    statusText,
    scheduleList: [],
    todaySchedule: undefined,
    hasRealSchedule: false,
    isApproximate: false,
    peakVibeTime: undefined
  };
}


export const OverviewTab = memo(function OverviewTab({
  shop,
  experienceTagline,
  getDirectionsUrl,
  onSelectShop,
  similarShops,
  scheduleInfo,
  isStandalone = false,
  hideActions = false,
  hideInlineActions = false,
  isVisited = false,
  visitNote = null,
  onEditNote
}: {
  shop: CoffeeShop;
  experienceTagline: string;
  getDirectionsUrl: () => string;
  onSelectShop: (s: CoffeeShop) => void;
  similarShops: CoffeeShop[];
  scheduleInfo: ComputedSchedule;
  isStandalone?: boolean;
  hideActions?: boolean;
  hideInlineActions?: boolean;
  isVisited?: boolean;
  visitNote?: string | null;
  onEditNote?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const hasRatings = typeof shop.rating === 'number' && shop.rating > 0 && shop.total_ratings && shop.total_ratings > 0;
  const ratingScorePercent = hasRatings ? Math.min(Math.round(((shop.rating || 0) / 5) * 100), 100) : 0;
  const distanceText =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';

  const handleCopyAddress = () => {
    if (shop.address) {
      navigator.clipboard.writeText(shop.address);
      setCopied(true);
      toast.success('Đã sao chép địa chỉ vào bộ nhớ tạm');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const visibleCategories = useMemo(() => {
    if (shop.amenities && shop.amenities.length > 0) {
      const labels = shop.amenities
        .map((a) => a.name?.trim())
        .filter((label): label is string => Boolean(label && label.length > 0));
      return Array.from(new Set(labels));
    }
    if (!shop.categories || shop.categories.length === 0) return [];
    const labels = shop.categories
      .map((cat) => cleanCategoryLabel(cat))
      .filter((label) => Boolean(label && label.trim().length > 0));
    return Array.from(new Set(labels));
  }, [shop.amenities, shop.categories]);

  return (
    <div className='space-y-4 pb-16'>
      {/* User's Visit Note Card */}
      {isVisited && visitNote && (
        <div className='bg-secondary/40 p-3.5 rounded-2xl border border-border/50 space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-xs font-bold text-foreground'>
              <Quote size={13} className='text-amber-gold flex-shrink-0' />
              <span>Ghi chú của bạn</span>
            </div>
            {onEditNote && (
              <button
                type='button'
                onClick={onEditNote}
                className='text-xs font-semibold text-amber-gold hover:text-amber-gold-hover hover:underline transition-colors cursor-pointer'
              >
                Chỉnh sửa
              </button>
            )}
          </div>
          <p className='text-xs text-muted-foreground italic leading-relaxed break-words whitespace-pre-wrap'>
            &ldquo;{visitNote}&rdquo;
          </p>
        </div>
      )}

      {/* 1. Real Amenities & Categories Chips */}
      {visibleCategories.length > 0 && (
        <div className='space-y-2'>
          <span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider block'>
            Đặc điểm &amp; Tiện ích
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {visibleCategories.map((label) => (
              <div
                key={label}
                className='flex items-center gap-1.5 bg-secondary/70 border border-border/60 px-3 py-1.5 rounded-xl text-secondary-foreground text-xs font-medium'
              >
                <Tag size={12} className='text-amber-gold flex-shrink-0' />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Customer Satisfaction Rating Card */}
      {hasRatings ? (
        <div className='bg-secondary/40 p-3.5 rounded-2xl border border-border/50 space-y-1.5'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-secondary-foreground font-medium'>Mức Độ Hài Lòng Của Khách Hàng</span>
            <span className='font-bold text-teal'>{ratingScorePercent}% hài lòng</span>
          </div>
          <Progress
            value={ratingScorePercent}
            indicatorClassName='bg-gradient-to-r from-teal to-teal-hover'
            className='h-2 bg-muted border border-border/50'
          />
          <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-0.5'>
            <span>Dựa trên {shop.total_ratings} lượt đánh giá</span>
            <span className='text-foreground font-semibold flex items-center gap-1'>
              <Star size={11} className='fill-amber-gold text-amber-gold' /> {(shop.rating || 0).toFixed(1)} / 5.0
            </span>
          </div>
        </div>
      ) : (
        <div className='bg-secondary/40 p-3.5 rounded-2xl border border-border/50 flex items-center justify-between text-xs'>
          <span className='text-secondary-foreground font-medium'>Đánh giá từ cộng đồng</span>
          <span className='text-muted-foreground text-[11px]'>Chưa có đánh giá nào</span>
        </div>
      )}

      {/* 3. Opening Hours & Contact Card */}
      <div className='bg-secondary/40 p-3.5 rounded-2xl border border-border/50 space-y-2.5 text-xs transition-all'>
        {scheduleInfo.hasRealSchedule ? (
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
                        <span className={cn(day.isToday ? 'text-foreground font-bold' : 'text-muted-foreground')}>{day.dayName}</span>
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
        ) : (
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
        )}

        {/* Contact Info (Phone & Website) */}
        {(shop.phone || shop.website) && (
          <div className='pt-2 border-t border-border/40 space-y-2'>
            {shop.phone && (
              <div className='flex items-center gap-2.5'>
                <Phone size={14} className='text-amber-gold flex-shrink-0' />
                <span className='text-[11px] text-muted-foreground'>Điện thoại:</span>
                <a
                  href={`tel:${shop.phone}`}
                  className='text-foreground hover:text-primary hover:underline transition-colors font-medium text-xs ml-auto'
                >
                  {shop.phone}
                </a>
              </div>
            )}

            {shop.website && (
              <div className='flex items-center gap-2.5'>
                <Globe size={14} className='text-amber-gold flex-shrink-0' />
                <span className='text-[11px] text-muted-foreground'>Website:</span>
                <a
                  href={shop.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-foreground hover:text-primary hover:underline transition-colors font-medium truncate block max-w-[200px] text-xs ml-auto text-right'
                >
                  {shop.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>


      {/* 6. Physical Location & Navigation CTA */}
      <div className='bg-secondary/60 p-4 rounded-2xl border border-border/60 space-y-3.5 shadow-md'>
        <div className='flex items-start justify-between gap-2'>
          <div className='space-y-1 min-w-0'>
            <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider block'>
              Địa Chỉ Quán
            </span>
            <p className='text-xs sm:text-sm font-semibold text-foreground leading-snug'>
              {shop.address || 'Chưa có thông tin địa chỉ'}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleCopyAddress}
            aria-label='Sao chép địa chỉ'
            className='h-8 w-8 rounded-xl bg-card text-muted-foreground hover:text-amber-gold hover:bg-accent border border-border/60 flex-shrink-0 cursor-pointer'
          >
            {copied ? <Check size={14} className='text-teal' /> : <Copy size={14} />}
          </Button>
        </div>

        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div className='bg-card p-2.5 rounded-xl border border-border/40 flex items-center gap-2'>
            <Footprints size={15} className='text-amber-gold flex-shrink-0' />
            <div>
              <span className='text-[10px] text-muted-foreground block'>Khoảng cách</span>
              <span className='font-bold text-foreground text-xs'>{distanceText}</span>
            </div>
          </div>

          <div className='bg-card p-2.5 rounded-xl border border-border/40 flex items-center gap-2'>
            <Compass size={15} className='text-amber-gold flex-shrink-0' />
            <div>
              <span className='text-[10px] text-muted-foreground block'>Tọa độ GPS</span>
              <span className='font-bold text-foreground text-xs'>
                {shop.lat.toFixed(4)}, {shop.lon.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {!(isStandalone || hideActions || hideInlineActions) && (
          <a
            href={getDirectionsUrl()}
            target='_blank'
            rel='noopener noreferrer'
            className='block pt-1'
          >
            <Button className='w-full h-12 bg-amber-gold text-primary-foreground hover:bg-amber-gold-hover font-bold text-sm rounded-xl shadow-lg shadow-amber-gold/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer'>
              <Navigation size={16} className='fill-primary-foreground' />
              Đến Quán Ngay • Mở Google Maps
            </Button>
          </a>
        )}
      </div>

      {/* 7. Nearby Recommendations */}
      {similarShops.length > 0 && (
        <div className='space-y-2.5 pt-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-foreground flex items-center gap-1.5'>
              <Sparkles size={13} className='text-amber-gold' />
              Có Thể Bạn Cũng Thích
            </span>
            <span className='text-[11px] text-muted-foreground'>Quán cà phê lân cận</span>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {similarShops.slice(0, 2).map((simShop) => (
              <div
                key={simShop.id}
                onClick={() => onSelectShop(simShop)}
                className='bg-secondary/40 hover:bg-secondary/80 p-2.5 rounded-2xl border border-border/50 flex items-center gap-2.5 cursor-pointer transition-all hover:border-amber-gold/40 group'
              >
                <div className='w-12 h-12 rounded-xl bg-card overflow-hidden flex-shrink-0 border border-border/40 flex items-center justify-center'>
                  {simShop.photos?.[0] ? (
                    <img
                      src={simShop.photos[0]}
                      alt={simShop.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                    />
                  ) : (
                    <Coffee size={18} className='text-amber-gold/70' />
                  )}
                </div>
                <div className='min-w-0 flex-1 space-y-0.5'>
                  <span className='font-bold text-foreground text-xs block truncate group-hover:text-amber-gold transition-colors'>
                    {simShop.name}
                  </span>
                  <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                    <Star size={10} className='fill-amber-gold text-amber-gold' />
                    <span>{(simShop.rating || 0).toFixed(1)}</span>
                    <span>•</span>
                    <span>{simShop.distance_text || 'Gần đây'}</span>
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className='text-muted-foreground group-hover:text-amber-gold transition-colors flex-shrink-0'
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export const PhotosTab = memo(function PhotosTab({
  shop,
  photos
}: {
  shop: CoffeeShop;
  photos?: Array<{ url: string; title: string; category: string }>;
}) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const placeId = shop.place_id || shop.id || '';
  const { data: reviews = [] } = useShopReviews(photos ? '' : placeId);

  const photoList = useMemo(() => {
    if (photos) return photos;

    const list: Array<{ url: string; title: string; category: string }> = [];
    const seenUrls = new Set<string>();

    // 1. Official shop photos
    if (shop.photos && shop.photos.length > 0) {
      shop.photos.forEach((url, i) => {
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          list.push({
            url,
            title: `${shop.name} - Ảnh ${i + 1}`,
            category: i === 0 ? 'Nổi bật' : i % 2 === 0 ? 'Không gian' : 'Cà phê'
          });
        }
      });
    }

    // 2. Aggregated review photos from community
    if (reviews && reviews.length > 0) {
      reviews.forEach((rev) => {
        if (rev.images && Array.isArray(rev.images)) {
          rev.images.forEach((imgUrl) => {
            if (imgUrl && !seenUrls.has(imgUrl)) {
              seenUrls.add(imgUrl);
              list.push({
                url: imgUrl,
                title: `${shop.name} - Đánh giá từ ${rev.author || 'cộng đồng'}`,
                category: 'Từ đánh giá cộng đồng'
              });
            }
          });
        }
      });
    }

    return list;
  }, [shop, reviews, photos]);

  if (photoList.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-10 px-4 text-center space-y-3 bg-secondary/20 rounded-2xl border border-dashed border-border'>
        <EmptyIllustration type='no-photos' size={140} />
        <div className='space-y-1 max-w-xs'>
          <h4 className='text-xs font-bold text-foreground'>Chưa có hình ảnh nào</h4>
          <p className='text-[11px] text-muted-foreground leading-relaxed'>
            Quán cà phê này chưa có hình ảnh được đăng tải.
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className='space-y-4 pb-16'>
      <div className='flex items-center justify-between'>
        <div>
          <span className='text-xs font-bold text-foreground block'>Không gian &amp; Hình ảnh</span>
          <span className='text-[11px] text-muted-foreground'>
            {photoList.length} hình ảnh thực tế từ cộng đồng
          </span>
        </div>
        <Badge
          variant='outline'
          className='bg-secondary text-amber-gold border-border text-[10px] font-bold'
        >
          Xem toàn màn hình
        </Badge>
      </div>

      <div className='grid grid-cols-3 gap-2.5'>
        {photoList.map((item, idx) => (
          <div
            key={idx}
            onClick={() => openImagePreview(photoList, idx)}
            className='group relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/60 cursor-pointer shadow-sm active:scale-95 transition-transform select-none pointer-events-auto'
          >
            <img
              draggable={false}
              src={item.url}
              alt={item.title}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 sm:p-2'>
              <span className='text-[9.5px] sm:text-[10px] font-semibold text-white truncate'>
                {item.title}
              </span>
            </div>
            <div className='absolute top-1.5 right-1.5 bg-card/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9px] font-bold text-amber-gold border border-border/40'>
              {item.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const ReviewsTab = memo(function ReviewsTab({
  shop,
}: {
  shop: CoffeeShop;
  isSidebar?: boolean;
  isStandalone?: boolean;
}) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const { user, profile, isAuthenticated } = useAuth();
  const router = useRouter();
  const toggleLikeMutation = useToggleReviewLike();
  const deleteReviewMutation = useDeleteReview();

  const placeId = shop.place_id || shop.id || '';
  const { data: dbReviews = [], isLoading: isLoadingReviews } = useShopReviews(placeId);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<ReviewItem | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  const hasShopRating = typeof shop.rating === 'number' && shop.rating > 0;
  const shopRating = shop.rating || 0;
  const totalReviews = shop.total_ratings || reviewsList.length;

  // Sync reviewsList from React Query cache
  useEffect(() => {
    if (dbReviews && Array.isArray(dbReviews)) {
      const formatted: ReviewItem[] = dbReviews.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        author:
          r.author ||
          r.profiles?.full_name ||
          r.profiles?.username ||
          'Tín đồ cà phê',
        avatar: r.avatar || r.profiles?.avatar_url || undefined,
        username: r.username || r.profiles?.username || undefined,
        rating: r.rating,
        date: new Date(r.created_at).toLocaleDateString('vi-VN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        highlight: 'Đánh giá từ cộng đồng',
        comment: r.comment,
        images: Array.isArray(r.images) ? r.images : [],
        like_count: r.like_count || 0,
        liked_by_me: Boolean(r.liked_by_me),
        is_edited: Boolean(r.is_edited),
      }));
      setReviewsList(formatted);
    }
  }, [dbReviews]);

  const handleToggleLike = (rev: ReviewItem) => {
    if (!isAuthenticated) {
      toast('Yêu cầu đăng nhập', {
        description: 'Vui lòng đăng nhập để đánh dấu bài đánh giá này là hữu ích.',
        action: {
          label: 'Đăng nhập',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }

    if (user && rev.user_id === user.id) {
      toast.error('Bạn không thể tự đánh dấu hữu ích cho đánh giá của mình.');
      return;
    }

    if (!rev.id) return;

    toggleLikeMutation.mutate({
      reviewId: rev.id,
      isCurrentlyLiked: Boolean(rev.liked_by_me),
      placeId,
    });
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* 1. Top Section: Score Breakdown & Auth / Review Trigger Action */}
      <div className='space-y-3'>
        {/* Rating Breakdown Score Card */}
        <div className='bg-secondary/50 p-3.5 rounded-2xl border border-border/60 grid grid-cols-[110px_1fr] items-center gap-4 shadow-sm'>
          <div className='flex flex-col items-center justify-center text-center pr-3 border-r border-border/50'>
            <span className='text-3xl font-black text-foreground tracking-tight leading-none'>
              {shopRating.toFixed(1)}
            </span>
            <div className='flex items-center gap-0.5 text-amber-gold my-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={
                    hasShopRating && star <= Math.round(shopRating)
                      ? 'fill-amber-gold text-amber-gold'
                      : 'text-border'
                  }
                />
              ))}
            </div>
            <span className='text-[10px] text-muted-foreground font-medium leading-none'>
              {totalReviews > 0 ? `${totalReviews} Đánh giá` : 'Chưa có đánh giá'}
            </span>
          </div>

          <div className='space-y-1 text-xs text-secondary-foreground'>
            <p className='text-xs text-muted-foreground font-medium'>
              {hasShopRating || totalReviews > 0
                ? 'Đánh giá trung bình từ cộng đồng người dùng PhinFind.'
                : 'Chưa có đánh giá từ cộng đồng cho quán này.'}
            </p>
          </div>
        </div>

        {/* Inline "Write a Review" Action / Guest Auth Prompt */}
        {!isAuthenticated ? (
          <div className='bg-secondary/40 p-3 rounded-2xl border border-border/60 flex items-center justify-between gap-3 shadow-xs'>
            <div className='flex items-center gap-2.5 min-w-0 flex-1'>
              <div className='w-8 h-8 rounded-xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold flex-shrink-0'>
                <Edit3 size={15} />
              </div>
              <div className='min-w-0'>
                <span className='font-bold text-foreground text-xs block truncate'>
                  Bạn đã từng ghé quán cà phê này?
                </span>
                <p className='text-[11px] text-muted-foreground truncate'>
                  Chia sẻ cảm nhận và trải nghiệm của bạn
                </p>
              </div>
            </div>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/?shop=${shop.id}`)}`}
              className='flex-shrink-0'
            >
              <Button
                type='button'
                className='bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl px-3.5 py-1.5 h-8.5 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md'
              >
                <LogIn size={13} />
                <span>Đăng nhập</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className='flex items-center justify-between bg-secondary/40 p-3 rounded-2xl border border-border/60 gap-3 shadow-xs'>
            <div className='flex items-center gap-2.5 min-w-0 flex-1'>
              <div className='w-8 h-8 rounded-full overflow-hidden border border-amber-gold/40 bg-muted flex-shrink-0 flex items-center justify-center'>
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <img
                    src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                    alt='Ảnh đại diện của bạn'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-amber-gold/20 flex items-center justify-center text-amber-gold text-xs font-bold'>
                    {(profile?.full_name || user?.user_metadata?.full_name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className='min-w-0'>
                <span className='text-xs font-bold text-foreground block truncate'>
                  Đánh giá với tư cách {profile?.full_name || user?.user_metadata?.full_name || 'Tín đồ cà phê'}
                </span>
                <p className='text-[11px] text-muted-foreground truncate'>
                  Chia sẻ cảm nhận của bạn cùng cộng đồng
                </p>
              </div>
            </div>
            <Button
              type='button'
              onClick={() => setIsModalOpen(true)}
              className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-3.5 py-1.5 h-8.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer flex-shrink-0'
            >
              <Edit3 size={13} />
              <span>Viết đánh giá</span>
            </Button>
          </div>
        )}
      </div>

      {/* 2. Reviews List */}
      <div className='space-y-2.5'>
        <span className='text-xs font-bold text-foreground block'>
          Đánh giá &amp; Trải nghiệm cộng đồng ({reviewsList.length})
        </span>

        {isLoadingReviews ? (
          <div className='space-y-2.5'>
            {[1, 2].map((i) => (
              <div
                key={i}
                className='p-3.5 rounded-2xl border border-border/60 bg-secondary/30 animate-pulse space-y-2.5'
              >
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-full bg-muted-foreground/20' />
                  <div className='space-y-1 flex-1'>
                    <div className='h-3 w-28 bg-muted-foreground/20 rounded' />
                    <div className='h-2.5 w-16 bg-muted-foreground/15 rounded' />
                  </div>
                </div>
                <div className='h-3 w-full bg-muted-foreground/15 rounded' />
                <div className='h-3 w-3/4 bg-muted-foreground/10 rounded' />
              </div>
            ))}
          </div>
        ) : reviewsList.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 px-4 text-center space-y-3 bg-secondary/20 rounded-2xl border border-dashed border-border'>
            <EmptyIllustration type='no-reviews' size={140} />
            <div className='space-y-1 max-w-xs'>
              <h4 className='text-xs font-bold text-foreground'>Chưa có đánh giá nào</h4>
              <p className='text-[11px] text-muted-foreground leading-relaxed'>
                Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận về quán này cùng cộng đồng!
              </p>
            </div>
            {isAuthenticated ? (
              <Button
                type='button'
                onClick={() => setIsModalOpen(true)}
                className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-4 py-2 h-8 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer'
              >
                <Edit3 size={13} />
                <span>Viết đánh giá đầu tiên</span>
              </Button>
            ) : (
              <Link href={`/login?redirect=${encodeURIComponent(`/?shop=${shop.id}`)}`}>
                <Button
                  type='button'
                  className='bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded-xl px-4 py-2 h-8 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer'
                >
                  <LogIn size={13} />
                  <span>Đăng nhập để đánh giá</span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-2.5'>
            <AnimatePresence initial={false}>
              {reviewsList.map((rev, idx) => (
                <motion.div
                  key={rev.id || idx}
                  initial={{ opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={cn(
                    'p-3.5 rounded-2xl border flex flex-col gap-2 transition-all shadow-xs',
                    rev.isUserSubmission
                      ? 'bg-amber-gold/10 border-amber-gold/40 shadow-sm'
                      : 'bg-secondary/50 border-border/60 hover:border-border/90'
                  )}
                >
                  {/* Header Row: Avatar, Author, Verified, Rating, and Date */}
                  <div className='flex items-start justify-between gap-2 min-w-0'>
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div className='w-7 h-7 rounded-full overflow-hidden border border-amber-gold/30 bg-muted flex-shrink-0 flex items-center justify-center'>
                        {rev.avatar ? (
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-amber-gold/20 flex items-center justify-center text-amber-gold text-[10px] font-bold'>
                            {rev.author[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className='min-w-0 flex flex-col'>
                        <div className='flex items-center gap-1.5 min-w-0'>
                          {rev.username ? (
                            <Link
                              href={`/u/${encodeURIComponent(rev.username)}`}
                              className='font-bold text-foreground text-xs truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold rounded-xs'
                            >
                              {rev.author}
                            </Link>
                          ) : (
                            <span className='font-bold text-foreground text-xs truncate'>{rev.author}</span>
                          )}
                          <CheckCircle2 size={12} className='text-teal flex-shrink-0' />
                          {rev.isUserSubmission && (
                            <span className='text-[9px] bg-amber-gold text-primary-foreground font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider flex-shrink-0'>
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-0.5 text-amber-gold mt-0.5'>
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={10} className='fill-amber-gold text-amber-gold' />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0 pt-0.5'>
                      {user && rev.user_id === user.id && (
                        <div className='flex items-center gap-1.5'>
                          <button
                            type='button'
                            onClick={() => {
                              setReviewToEdit(rev);
                              setIsModalOpen(true);
                            }}
                            className='text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer'
                          >
                            Chỉnh sửa
                          </button>
                          <span className='text-muted-foreground/40 text-[10px]'>•</span>
                          <button
                            type='button'
                            onClick={() => setReviewToDelete(rev)}
                            className='text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer'
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                      <div className='flex items-center gap-1 text-[10px] text-muted-foreground font-medium whitespace-nowrap'>
                        <span>{rev.date}</span>
                        {rev.is_edited && (
                          <span className='text-[10px] text-muted-foreground/70 italic'>(đã chỉnh sửa)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Comment Body with natural wrapping */}
                  <p className='text-xs text-secondary-foreground leading-relaxed break-words whitespace-normal'>
                    {rev.comment}
                  </p>

                  {/* Review Attached Photos */}
                  {rev.images && rev.images.length > 0 && (
                    <div className='flex items-center gap-2 pt-1 overflow-x-auto pb-1'>
                      {rev.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          onClick={() => openImagePreview(rev.images || [], imgIdx)}
                          className='relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border/80 bg-muted cursor-pointer flex-shrink-0 group hover:border-amber-gold/60 transition-all shadow-xs'
                        >
                          <img
                            src={imgUrl}
                            alt={`Ảnh đánh giá từ ${rev.author}`}
                            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful Vote Button */}
                  <div className='flex items-center gap-2 pt-1'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleToggleLike(rev)}
                      className={cn(
                        'rounded-full h-7 px-2.5 text-[11px] font-medium gap-1.5 border transition-all cursor-pointer shadow-none',
                        rev.liked_by_me
                          ? 'bg-amber-gold/15 text-amber-gold border-amber-gold/40 hover:bg-amber-gold/25'
                          : 'bg-background/60 hover:bg-secondary border-border/60 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <ThumbsUp
                        size={12}
                        className={cn(
                          'transition-colors',
                          rev.liked_by_me ? 'fill-amber-gold text-amber-gold' : 'text-muted-foreground'
                        )}
                      />
                      <span>Hữu ích{rev.like_count && rev.like_count > 0 ? ` (${rev.like_count})` : ''}</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 3. Review Modal */}
      <ReviewModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setReviewToEdit(null);
        }}
        shop={shop}
        existingReview={reviewToEdit || undefined}
        onSuccess={(newReview) => {
          if (newReview) {
            setReviewsList((prev) => [newReview, ...prev]);
          }
        }}
      />

      {/* 4. Delete Review Confirmation */}
      {reviewToDelete && (
        <AlertDialog open={Boolean(reviewToDelete)} onOpenChange={(open) => !open && setReviewToDelete(null)}>
          <AlertDialogContent className='bg-card text-card-foreground border-border max-w-sm rounded-2xl'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-foreground text-base font-bold'>
                Xóa bài đánh giá?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-xs'>
                Bạn có chắc chắn muốn xóa bài đánh giá này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-row gap-2 justify-end mt-4'>
              <AlertDialogCancel className='rounded-xl text-xs h-8'>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (reviewToDelete.id) {
                    deleteReviewMutation.mutate(reviewToDelete.id);
                    setReviewsList((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
                  }
                  setReviewToDelete(null);
                }}
                className='bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs h-8'
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
});

const PREDEFINED_AMENITIES_MAP: Record<
  string,
  { icon: React.ElementType; title: string; badge: string; desc: string }
> = {
  'catering.cafe': {
    icon: Coffee,
    title: 'Cà phê phin truyền thống',
    badge: 'Đậm đà',
    desc: 'Phục vụ cà phê phin nguyên chất Robusta và Arabica rang mộc truyền thống'
  },
  'catering.cafe.specialty': {
    icon: Coffee,
    title: 'Cà Phê Đặc Sản Specialty',
    badge: 'Chất lượng cao',
    desc: 'Tuyển chọn các mẻ hạt rang thủ công chất lượng cao từ Cầu Đất & Buôn Ma Thuột'
  },
  specialty_coffee: {
    icon: Coffee,
    title: 'Cà phê đặc sản',
    badge: 'Chất lượng cao',
    desc: 'Tuyển chọn các mẻ hạt rang thủ công chất lượng cao từ Cầu Đất & Buôn Ma Thuột'
  },
  wifi: {
    icon: Wifi,
    title: 'Wi-Fi Tốc Độ Cao',
    badge: '100+ Mbps',
    desc: 'Kết nối mạng tốc độ cao tối ưu cho làm việc từ xa, gọi video và lướt web'
  },
  high_speed_wifi: {
    icon: Wifi,
    title: 'Wi-Fi tốc độ cao',
    badge: '100+ Mbps',
    desc: 'Kết nối mạng tốc độ cao 100+ Mbps, ổn định cho làm việc từ xa và giải trí'
  },
  power: {
    icon: Zap,
    title: 'Nhiều Ổ Cắm Điện',
    badge: 'Tại các bàn',
    desc: 'Ổ cắm sạc thuận tiện bố trí tại hầu hết các bàn và góc ngồi'
  },
  air_conditioning: {
    icon: Wind,
    title: 'Không Gian Điều Hòa Mát Lạnh',
    badge: 'Mát mẻ',
    desc: 'Nhiệt độ phòng luôn mát mẻ và dễ chịu quanh năm'
  },
  air_conditioned: {
    icon: Wind,
    title: 'Máy lạnh',
    badge: 'Mát mẻ',
    desc: 'Không gian điều hòa mát lạnh, thoáng đãng và dễ chịu quanh năm'
  },
  outdoor_seating: {
    icon: Sun,
    title: 'Ban Công & Sân Vườn',
    badge: 'Thoáng đãng',
    desc: 'Khu vực bàn ngoài trời thoáng đãng rợp bóng cây xanh'
  },
  outdoor_garden: {
    icon: Sun,
    title: 'Sân vườn',
    badge: 'Thoáng đãng',
    desc: 'Khu vực ngoài trời rợp bóng cây xanh, có quạt hơi nước thoáng mát'
  },
  quiet_space: {
    icon: Sparkles,
    title: 'Không Gian Học Tập & Yên Tĩnh',
    badge: 'Yên tĩnh',
    desc: 'Không gian học tập yên tĩnh, bàn rộng và ánh sáng dịu mắt phù hợp làm việc'
  },
  quiet_workspace: {
    icon: Sparkles,
    title: 'Yên tĩnh học tập',
    badge: 'Yên tĩnh',
    desc: 'Không gian yên tĩnh, bàn rộng, ánh sáng dịu mắt tối ưu cho làm việc và học tập'
  },
  bakery: {
    icon: Utensils,
    title: 'Bánh Ngọt & Đồ Ăn Nhẹ',
    badge: 'Tươi mỗi ngày',
    desc: 'Bánh sừng bò nóng hổi, bánh mì thủ công và bánh ngọt tươi mỗi ngày'
  },
  bakery_dessert: {
    icon: Utensils,
    title: 'Bánh ngọt',
    badge: 'Tươi mỗi ngày',
    desc: 'Bánh ngọt tươi mới mỗi ngày, bánh mì thủ công và đồ ăn nhẹ'
  },
  parking: {
    icon: Navigation,
    title: 'Chỗ Đỗ Xe Thuận Tiện',
    badge: 'Rộng rãi',
    desc: 'Khu vực đỗ xe máy và ô tô thuận tiện, có bảo vệ trông giữ an toàn'
  },
  parking_available: {
    icon: Navigation,
    title: 'Chỗ đỗ xe',
    badge: 'Rộng rãi',
    desc: 'Bãi đỗ xe máy và ô tô thuận tiện, có người trông giữ an toàn'
  },
  pet_friendly: {
    icon: Heart,
    title: 'Thú cưng',
    badge: 'Thân thiện',
    desc: 'Chào đón thú cưng, không gian thân thiện và thoải mái'
  },
  open_24_7: {
    icon: Clock,
    title: 'Mở 24/7',
    badge: '24/7',
    desc: 'Mở cửa phục vụ 24/7 suốt ngày đêm'
  },
  takeaway_service: {
    icon: Coffee,
    title: 'Dịch vụ mang đi',
    badge: 'Nhanh chóng',
    desc: 'Phục vụ mang đi nhanh chóng, đóng gói cẩn thận giữ trọn hương vị'
  },
  'payment.cards': {
    icon: CreditCard,
    title: 'Thanh Toán Không Tiền Mặt',
    badge: 'Đa dạng',
    desc: 'Hỗ trợ VietQR, Apple Pay, chuyển khoản ngân hàng và thẻ Visa/Mastercard'
  }
};

export interface AmenitiesTabProps {
  shop?: CoffeeShop;
}

export const AmenitiesTab = memo(function AmenitiesTab({ shop }: AmenitiesTabProps) {
  const combinedList = useMemo(() => {
    const list: Array<{
      icon: React.ElementType;
      title: string;
      desc: string;
      badge: string;
      isCustom?: boolean;
    }> = [];

    // 1. Primary: Unified amenities structure
    if (shop?.amenities && shop.amenities.length > 0) {
      shop.amenities.forEach((amenity) => {
        const lowerId = (amenity.id || '').toLowerCase();
        const matchedKey = Object.keys(PREDEFINED_AMENITIES_MAP).find(
          (k) => lowerId === k.toLowerCase() || lowerId.includes(k.toLowerCase())
        );
        const config = matchedKey ? PREDEFINED_AMENITIES_MAP[matchedKey] : undefined;
        const Icon = config?.icon || (amenity.type === 'custom' ? Sparkles : Tag);
        const title = amenity.name?.trim() || config?.title || cleanCategoryLabel(amenity.id);
        const badge =
          amenity.type === 'custom'
            ? 'Tự định nghĩa'
            : config?.badge || 'Tiện ích';
        const desc =
          amenity.description?.trim() ||
          config?.desc ||
          (amenity.type === 'custom'
            ? 'Tiện ích đặc trưng do quán tự định nghĩa và cung cấp.'
            : 'Tiện ích & dịch vụ đặc trưng được phục vụ tại quán.');

        if (title && !list.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
          list.push({
            icon: Icon,
            title,
            desc,
            badge,
            isCustom: amenity.type === 'custom'
          });
        }
      });

      return list;
    }

    // 2. Backward compatibility: Custom Amenities with user-written descriptions
    if (shop?.custom_amenities && shop.custom_amenities.length > 0) {
      shop.custom_amenities.forEach((custom) => {
        if (custom.name?.trim()) {
          list.push({
            icon: Sparkles,
            title: custom.name.trim(),
            desc:
              custom.description?.trim() ||
              'Tiện ích đặc trưng do quán tự định nghĩa và cung cấp.',
            badge: 'Tự định nghĩa',
            isCustom: true
          });
        }
      });
    }

    // 3. Backward compatibility: Predefined Categories with generated default descriptions
    if (shop?.categories && shop.categories.length > 0) {
      shop.categories.forEach((cat) => {
        const lower = cat.toLowerCase();
        const matchedKey = Object.keys(PREDEFINED_AMENITIES_MAP).find(
          (k) => lower === k.toLowerCase() || lower.includes(k.toLowerCase())
        );

        if (matchedKey) {
          const config = PREDEFINED_AMENITIES_MAP[matchedKey];
          if (!list.some((item) => item.title.toLowerCase() === config.title.toLowerCase())) {
            list.push({
              icon: config.icon,
              title: config.title,
              desc: config.desc,
              badge: config.badge
            });
          }
        } else {
          const cleanLabel = cleanCategoryLabel(cat);
          if (cleanLabel && !list.some((item) => item.title.toLowerCase() === cleanLabel.toLowerCase())) {
            list.push({
              icon: Tag,
              title: cleanLabel,
              desc: 'Tiện ích & dịch vụ đặc trưng được phục vụ tại quán.',
              badge: 'Tiện ích'
            });
          }
        }
      });
    }

    return list;
  }, [shop?.amenities, shop?.custom_amenities, shop?.categories]);

  if (combinedList.length === 0) {
    return (
      <div className='py-12 px-4 flex flex-col items-center justify-center text-center space-y-3 bg-secondary/20 rounded-2xl border border-dashed border-border/60 pb-16'>
        <div className='w-12 h-12 rounded-2xl bg-amber-gold/10 text-amber-gold flex items-center justify-center'>
          <Sparkles size={22} />
        </div>
        <div className='space-y-1 max-w-sm'>
          <p className='text-sm font-bold text-foreground'>Chưa có tiện ích nào được thêm vào</p>
          <p className='text-xs text-muted-foreground'>
            Quán chưa cập nhật thông tin tiện ích chi tiết. Bạn có thể đóng góp thêm thông tin cho quán.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 pb-16'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
        {combinedList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className='flex items-start gap-3 bg-secondary/50 p-3 rounded-2xl border border-border/50 text-xs shadow-xs'
            >
              <div className='w-8 h-8 rounded-xl bg-muted border border-border/70 flex items-center justify-center text-amber-gold flex-shrink-0'>
                <Icon size={16} />
              </div>
              <div className='flex flex-col items-start gap-1 min-w-0 flex-1 text-left'>
                <span className='font-bold text-foreground text-xs leading-snug text-left'>
                  {item.title}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-md font-semibold border self-start text-left',
                    item.isCustom
                      ? 'bg-amber-gold/15 text-amber-gold border-amber-gold/40'
                      : 'bg-muted text-amber-gold border-border/40'
                  )}
                >
                  {item.badge}
                </span>
                <p className='text-[11px] text-secondary-foreground leading-relaxed text-left'>
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className='bg-secondary/30 p-3.5 rounded-2xl border border-border/40 text-xs text-secondary-foreground'>
        <p className='flex items-center gap-2 font-medium text-xs'>
          <Sparkles size={14} className='text-amber-gold flex-shrink-0' />
          Không gian: Thân thiện với laptop, khu vực học tập yên tĩnh &amp; chỗ ngồi thư giãn.
        </p>
      </div>
    </div>
  );
});

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

export const ShopDetailsContent = memo(function ShopDetailsContent({
  shop,
  isSidebar = false,
  isStandalone = false,
  hideActions = false,
  hideInlineActions = false,
  onSelectShop,
  scrollRef,
  onTabChange,
  isVisited: isVisitedProp
}: ShopDetailsContentProps) {
  const { shops, setSelectedShop } = useShopStore();
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const deleteShopMutation = useDeleteShop();
  const { data: userVisits = [] } = useUserVisits();
  const toggleVisitMutation = useToggleVisit();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'amenities'>('overview');
  const [imgError, setImgError] = useState(false);
  const isFirstRender = useRef(true);

  const isOwner = Boolean(user && shop.created_by && user.id === shop.created_by);
  const shopPlaceId = shop.place_id || shop.id;

  const { data: userSuggestionData } = useUserSuggestions(
    isAuthenticated && !isOwner ? shopPlaceId : undefined
  );
  const hasPendingSuggestion = Boolean(userSuggestionData?.hasPending);
  const currentVisit = userVisits.find((v) => v.shop_place_id === shopPlaceId);
  const storeIsVisited = useShopStore((state) => state.visits.includes(shopPlaceId));
  const currentIsVisited = isVisitedProp !== undefined ? isVisitedProp : Boolean(storeIsVisited || currentVisit);
  const currentVisitNote = currentVisit?.note || null;

  const handleConfirmVisitNote = (note: string | null) => {
    toggleVisitMutation(shopPlaceId, {
      name: shop.name,
      address: shop.address,
      note,
      updateOnly: true
    });
  };

  const handleDeleteShop = async () => {
    try {
      await deleteShopMutation.mutateAsync(shop.place_id || shop.id);
      setIsDeleteDialogOpen(false);
      setSelectedShop(null);
      if (isStandalone) {
        router.push('/');
      }
    } catch {
      // Error is handled by useDeleteShop toast
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onTabChange) {
      onTabChange();
    }
  }, [activeTab, onTabChange]);

  useEffect(() => {
    setActiveTab('overview');
    isFirstRender.current = true;
  }, [shop?.id]);

  const handleSelectShop = (s: CoffeeShop) => {
    if (onSelectShop) {
      onSelectShop(s);
    } else {
      setSelectedShop(s);
    }
  };

  const scheduleInfo = useMemo(() => getShopSchedule(shop.opening_hours), [shop.opening_hours]);

  const experienceTagline = useMemo(() => {
    return `Quán cà phê thủ công ấm cúng với các mẻ rang đặc sản, góc ngồi học tập yên tĩnh & đồ uống thơm ngon.`;
  }, []);

  const similarShops = useMemo(() => {
    if (!shops) return [];
    return shops.filter((s) => s.id !== shop.id).slice(0, 3);
  }, [shop.id, shops]);

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`;
  };

  const placeId = shop.place_id || shop.id || '';
  const { data: reviews = [], isLoading: isReviewsLoading } = useShopReviews(placeId);

  const galleryPhotos = useMemo(() => {
    const list: Array<{ url: string; title: string; category: string; isCommunity?: boolean }> = [];
    const seenUrls = new Set<string>();

    // 1. Official shop photos
    if (shop.photos && shop.photos.length > 0) {
      shop.photos.forEach((url, i) => {
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          list.push({
            url,
            title: `${shop.name} - Ảnh ${i + 1}`,
            category: i === 0 ? 'Nổi bật' : i % 2 === 0 ? 'Không gian' : 'Cà phê',
            isCommunity: false
          });
        }
      });
    }

    // 2. Aggregated review photos from community
    if (reviews && reviews.length > 0) {
      reviews.forEach((rev) => {
        if (rev.images && Array.isArray(rev.images)) {
          rev.images.forEach((imgUrl) => {
            if (imgUrl && !seenUrls.has(imgUrl)) {
              seenUrls.add(imgUrl);
              list.push({
                url: imgUrl,
                title: `${shop.name} - Ảnh từ đánh giá của ${rev.author || rev.profiles?.full_name || 'cộng đồng'}`,
                category: 'Từ đánh giá cộng đồng',
                isCommunity: true
              });
            }
          });
        }
      });
    }

    return list;
  }, [shop, reviews]);

  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceText =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const isOpenNow = scheduleInfo.isOpenNow;

  const imageCount = galleryPhotos.length;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as any)}
      className='flex-1 flex flex-col min-h-0 h-full w-full'
    >
      {/* HEADER SECTION: Gallery collage, title, metrics, and tab navigation */}
      <div className={cn('flex-shrink-0 space-y-3.5 select-none', isSidebar ? 'px-4 pt-3' : isStandalone ? 'px-0 pt-0' : 'px-4 sm:px-6 pt-2')}>
        {/* 1. Curated Interactive Visual Collage Banner */}
        <div className='relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-card shadow-md border border-border/80 group'>
          {isReviewsLoading && (!shop.photos || shop.photos.length === 0) ? (
            <div className='w-full h-full flex gap-1.5 p-1.5 bg-card animate-pulse'>
              <div className='flex-[3] h-full rounded-xl bg-muted/60' />
              <div className='flex-[2] flex flex-col gap-1.5'>
                <div className='h-[calc(50%-3px)] rounded-xl bg-muted/50' />
                <div className='h-[calc(50%-3px)] rounded-xl bg-muted/50' />
              </div>
            </div>
          ) : imgError || imageCount === 0 ? (
            <div className='w-full h-full relative overflow-hidden'>
              <ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />
            </div>
          ) : imageCount === 1 ? (
            /* Layout 1 Image: Full width & full height */
            <div className='w-full h-full p-1.5 bg-card'>
              <div
                onClick={() => openImagePreview(galleryPhotos, 0)}
                className='w-full h-full rounded-xl overflow-hidden relative cursor-pointer group select-none pointer-events-auto bg-card border border-border/40'
              >
                <img
                  draggable={false}
                  src={galleryPhotos[0]?.url}
                  alt={galleryPhotos[0]?.title || shop.name}
                  onError={() => setImgError(true)}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                />
                {galleryPhotos[0]?.isCommunity && (
                  <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-medium text-amber-gold flex items-center gap-1 shadow-xs z-10'>
                    <Camera size={10} />
                    <span>Từ đánh giá cộng đồng</span>
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5 pointer-events-none'>
                  <span className='text-xs font-bold text-white drop-shadow-md flex items-center gap-1.5'>
                    <Images size={13} className='text-amber-gold' />
                    <span>Xem bộ sưu tập ảnh (1)</span>
                  </span>
                </div>
              </div>
            </div>
          ) : imageCount === 2 ? (
            /* Layout 2 Images: 60/40 side-by-side split */
            <div className='w-full h-full flex gap-1.5 p-1.5 bg-card'>
              {/* Left: main image (60%) */}
              <div
                onClick={() => openImagePreview(galleryPhotos, 0)}
                className='flex-[3] h-full rounded-xl overflow-hidden relative cursor-pointer group select-none pointer-events-auto bg-card border border-border/40'
              >
                <img
                  draggable={false}
                  src={galleryPhotos[0]?.url}
                  alt={galleryPhotos[0]?.title || shop.name}
                  onError={() => setImgError(true)}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                />
                {galleryPhotos[0]?.isCommunity && (
                  <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-medium text-amber-gold flex items-center gap-1 shadow-xs z-10'>
                    <Camera size={10} />
                    <span>Từ đánh giá cộng đồng</span>
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5 pointer-events-none'>
                  <span className='text-xs font-bold text-white drop-shadow-md flex items-center gap-1.5'>
                    <Images size={13} className='text-amber-gold' />
                    <span>Xem bộ sưu tập ảnh (2)</span>
                  </span>
                </div>
              </div>

              {/* Right: second image occupying entire right column (40%) */}
              <div
                onClick={() => openImagePreview(galleryPhotos, 1)}
                className='flex-[2] h-full rounded-xl overflow-hidden relative bg-card border border-border/40 cursor-pointer group select-none pointer-events-auto'
              >
                <img
                  draggable={false}
                  src={galleryPhotos[1]?.url}
                  alt={galleryPhotos[1]?.title || `${shop.name} - Ảnh 2`}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                />
                {galleryPhotos[1]?.isCommunity && (
                  <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium text-amber-gold flex items-center gap-1 z-10 border border-white/10 shadow-xs'>
                    <Camera size={10} />
                    <span>Đánh giá</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Layout 3+ Images: 60/40 magazine grid with 2 stacked images on right */
            <div className='w-full h-full flex gap-1.5 p-1.5 bg-card'>
              {/* Left: main image (60%) */}
              <div
                onClick={() => openImagePreview(galleryPhotos, 0)}
                className='flex-[3] h-full rounded-xl overflow-hidden relative cursor-pointer group select-none pointer-events-auto bg-card border border-border/40'
              >
                <img
                  draggable={false}
                  src={galleryPhotos[0]?.url}
                  alt={galleryPhotos[0]?.title || shop.name}
                  onError={() => setImgError(true)}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                />
                {galleryPhotos[0]?.isCommunity && (
                  <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-medium text-amber-gold flex items-center gap-1 shadow-xs z-10'>
                    <Camera size={10} />
                    <span>Từ đánh giá cộng đồng</span>
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5 pointer-events-none'>
                  <span className='text-xs font-bold text-white drop-shadow-md flex items-center gap-1.5'>
                    <Images size={13} className='text-amber-gold' />
                    <span>Xem bộ sưu tập ảnh ({imageCount})</span>
                  </span>
                </div>
              </div>

              {/* Right: two stacked images (40%) */}
              <div className='flex-[2] flex flex-col h-full gap-1.5'>
                <div
                  onClick={() => openImagePreview(galleryPhotos, 1)}
                  className='flex-1 h-[calc(50%-3px)] rounded-xl overflow-hidden relative bg-card border border-border/40 cursor-pointer group select-none pointer-events-auto'
                >
                  <img
                    draggable={false}
                    src={galleryPhotos[1]?.url}
                    alt={galleryPhotos[1]?.title || `${shop.name} - Ảnh 2`}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                  />
                  {galleryPhotos[1]?.isCommunity && (
                    <div className='absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-medium text-amber-gold flex items-center gap-1 z-10'>
                      <Camera size={8} />
                      <span>Đánh giá</span>
                    </div>
                  )}
                </div>

                <div
                  onClick={() => openImagePreview(galleryPhotos, 2)}
                  className='flex-1 h-[calc(50%-3px)] rounded-xl overflow-hidden relative bg-card border border-border/40 cursor-pointer group select-none pointer-events-auto'
                >
                  <img
                    draggable={false}
                    src={galleryPhotos[2]?.url}
                    alt={galleryPhotos[2]?.title || `${shop.name} - Ảnh 3`}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                  />
                  {galleryPhotos[2]?.isCommunity && imageCount <= 3 && (
                    <div className='absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-medium text-amber-gold flex items-center gap-1 z-10'>
                      <Camera size={8} />
                      <span>Đánh giá</span>
                    </div>
                  )}
                  {imageCount > 3 && (
                    <div className='absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center text-amber-gold font-bold text-xs sm:text-sm tracking-tight gap-1 hover:bg-black/50 transition-colors pointer-events-none'>
                      <Images size={13} className='text-amber-gold' />
                      <span>+{imageCount - 2} ảnh</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Shop Title, Address & Metrics */}
        <div className='space-y-1.5'>
          <div className='flex items-start justify-between gap-2'>
            <h2 className='flex-1 min-w-0 font-sans font-bold text-lg sm:text-xl text-foreground tracking-tight leading-snug break-words'>
              {shop.name}
            </h2>

            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Tùy chọn quán cà phê'
                    className='h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 flex-shrink-0 cursor-pointer'
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48 bg-popover text-popover-foreground border-border'>
                  {isOwner ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => setIsEditDialogOpen(true)}
                        className='cursor-pointer gap-2'
                      >
                        <Pencil size={14} className='text-muted-foreground' />
                        <span>Chỉnh sửa quán</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className='cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive'
                      >
                        <Trash2 size={14} />
                        <span>Xóa quán</span>
                      </DropdownMenuItem>
                    </>
                  ) : hasPendingSuggestion ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <DropdownMenuItem
                              disabled
                              className='gap-2 opacity-50 cursor-not-allowed'
                            >
                              <Pencil size={14} className='text-muted-foreground' />
                              <span>Đề xuất chỉnh sửa</span>
                            </DropdownMenuItem>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side='left'>
                          <p>Bạn đã có một đề xuất đang chờ duyệt</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => setIsSuggestDialogOpen(true)}
                      className='cursor-pointer gap-2'
                    >
                      <Pencil size={14} className='text-muted-foreground' />
                      <span>Đề xuất chỉnh sửa</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className='text-xs text-secondary-foreground flex items-start gap-1.5'>
            <MapPin size={13} className='text-amber-gold flex-shrink-0 mt-0.5' />
            <span className='break-words leading-relaxed'>{shop.address || 'Chưa có địa chỉ'}</span>
          </div>

          {/* Quick Metrics Bar */}
          <div className='flex flex-wrap items-center gap-1.5 pt-0.5'>
            {shop.verified === false && (
              <Badge
                variant='outline'
                className='bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 flex items-center gap-1 font-bold text-[11px] py-0.5 px-2 rounded-xl shadow-xs flex-shrink-0 whitespace-nowrap'
              >
                <Clock size={11} className='text-amber-500 flex-shrink-0' />
                <span className='whitespace-nowrap'>Chờ xác minh</span>
              </Badge>
            )}

            <Badge
              variant='outline'
              className='bg-secondary text-amber-gold border-border flex items-center gap-1 font-bold text-[11px] py-0.5 px-2 rounded-xl shadow-xs flex-shrink-0 whitespace-nowrap'
            >
              {hasRating ? (
                <>
                  <Star size={11} className='fill-amber-gold text-amber-gold flex-shrink-0' />
                  <span className='whitespace-nowrap'>{shop.rating.toFixed(1)}</span>
                  {shop.total_ratings ? (
                    <span className='text-[10px] text-muted-foreground font-normal whitespace-nowrap'>
                      ({shop.total_ratings})
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <Star size={11} className='text-amber-gold/50 flex-shrink-0' />
                  <span className='whitespace-nowrap'>Mới</span>
                </>
              )}
            </Badge>



            <Badge
              variant='outline'
              className='bg-secondary text-secondary-foreground border-border flex items-center gap-1 font-medium text-[11px] py-0.5 px-2 rounded-xl shadow-xs flex-shrink-0 whitespace-nowrap'
            >
              <Footprints size={11} className='text-amber-gold/80 flex-shrink-0' />
              <span className='whitespace-nowrap'>{distanceText}</span>
            </Badge>

            <Badge
              variant='outline'
              className='bg-secondary text-secondary-foreground border-border flex items-center gap-1 font-medium text-[11px] py-0.5 px-2 rounded-xl shadow-xs flex-shrink-0 whitespace-nowrap max-w-full'
            >
              <Clock size={11} className='text-amber-gold/80 flex-shrink-0' />
              <span className='whitespace-nowrap truncate'>{isOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa'}</span>
            </Badge>
          </div>
        </div>

        {/* 3. Underline Navigation Tabs */}
        <div className={cn('pt-1.5', isStandalone && 'sticky top-14 z-30 bg-card/95 backdrop-blur-md')}>
          <div className='relative'>
            <TabsList
              onClick={() => onTabChange?.()}
              className='flex items-center justify-between bg-transparent p-0 h-auto rounded-none w-full gap-2 mb-0'
            >
              <TabsTrigger
                value='overview'
                className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10'
              >
                Tổng quan
              </TabsTrigger>
              <TabsTrigger
                value='photos'
                className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10'
              >
                Hình ảnh
              </TabsTrigger>
              <TabsTrigger
                value='reviews'
                className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10'
              >
                Đánh giá
              </TabsTrigger>
              <TabsTrigger
                value='amenities'
                className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-all cursor-pointer relative z-10'
              >
                Tiện ích
              </TabsTrigger>
            </TabsList>
            {/* Separator line flush with the bottom of the tabs */}
            <div className='absolute bottom-0 left-0 right-0 border-b border-border/50 pointer-events-none' />
          </div>
        </div>
      </div>

      {/* SCROLLABLE BODY SECTION */}
      <div
        ref={isStandalone ? undefined : scrollRef}
        data-vaul-no-drag={!isStandalone}
        className={cn(
          isStandalone
            ? 'w-full pt-3'
            : 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pt-3 pb-24 sm:pb-28',
          isSidebar ? 'px-4' : isStandalone ? 'px-0' : 'px-4 sm:px-6'
        )}
      >
        <TabsContent value='overview' className='mt-0 focus-visible:outline-none'>
          <OverviewTab
            shop={shop}
            experienceTagline={experienceTagline}
            getDirectionsUrl={getDirectionsUrl}
            onSelectShop={handleSelectShop}
            similarShops={similarShops}
            scheduleInfo={scheduleInfo}
            isStandalone={isStandalone}
            hideActions={hideActions}
            hideInlineActions={hideInlineActions}
            isVisited={currentIsVisited}
            visitNote={currentVisitNote}
            onEditNote={() => setIsNoteDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value='photos' className='mt-0 focus-visible:outline-none'>
          <PhotosTab shop={shop} photos={galleryPhotos} />
        </TabsContent>

        <TabsContent value='reviews' className='mt-0 focus-visible:outline-none'>
          <ReviewsTab shop={shop} isSidebar={isSidebar} isStandalone={isStandalone} />
        </TabsContent>

        <TabsContent value='amenities' className='mt-0 focus-visible:outline-none'>
          <AmenitiesTab shop={shop} />
        </TabsContent>
      </div>

      {/* Dialogs for Shop Owner */}
      {isOwner && (
        <>
          <AddShopDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            shop={shop}
            onSuccess={(updatedShop) => {
              setSelectedShop(updatedShop);
            }}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className='bg-card text-card-foreground border-border max-w-md rounded-2xl'>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-foreground text-base sm:text-lg font-bold'>
                  Xác nhận xóa quán cà phê
                </AlertDialogTitle>
                <AlertDialogDescription className='text-muted-foreground text-xs sm:text-sm'>
                  Bạn có chắc chắn muốn xóa quán &ldquo;{shop.name}&rdquo; không? Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn thông tin quán cùng tất cả lượt đánh giá liên quan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className='flex-row gap-2 justify-end mt-4'>
                <AlertDialogCancel
                  disabled={deleteShopMutation.isPending}
                  className='rounded-xl text-xs h-9 px-4 cursor-pointer mt-0'
                >
                  Hủy bỏ
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteShop();
                  }}
                  disabled={deleteShopMutation.isPending}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs font-bold h-9 px-4 cursor-pointer disabled:opacity-50 flex items-center gap-1.5'
                >
                  {deleteShopMutation.isPending ? (
                    <>
                      <Loader2 size={14} className='animate-spin' />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Xóa quán</span>
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* Community Suggest Edit Dialog */}
      {isAuthenticated && !isOwner && (
        <SuggestEditDialog
          open={isSuggestDialogOpen}
          onOpenChange={setIsSuggestDialogOpen}
          shop={shop}
        />
      )}

      {/* Visit Note Dialog for Editing/Adding Notes from Overview tab */}
      <VisitNoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        shop={shop}
        existingNote={currentVisitNote}
        onConfirm={handleConfirmVisitNote}
      />
    </Tabs>
  );
});
