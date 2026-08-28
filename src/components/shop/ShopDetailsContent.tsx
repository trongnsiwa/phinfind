'use client';

import {
  Check, CheckCircle2, ChevronDown, ChevronRight, Clock, Coffee, Compass, Copy, CreditCard,
  CupSoda, Edit3, Flame, Footprints, Globe, Images, Loader2, LogIn, MapPin, Navigation,
  Phone, Quote, Send, Sparkles, Star, Sun, Utensils, Wifi, Wind, X, Zap, Camera, MessageSquare, Tag
} from 'lucide-react';
import Link from 'next/link';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
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
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { CoffeeShop } from '@/types/shop';






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

function parseHHMM(timeStr: string): { hours: number; minutes: number; formatted: string } {
  const clean = timeStr.padStart(4, '0');
  const h = parseInt(clean.slice(0, 2), 10);
  const m = parseInt(clean.slice(2, 4), 10);
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
  scheduleInfo
}: {
  shop: CoffeeShop;
  experienceTagline: string;
  getDirectionsUrl: () => string;
  onSelectShop: (s: CoffeeShop) => void;
  similarShops: CoffeeShop[];
  scheduleInfo: ComputedSchedule;
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


  return (
    <div className='space-y-4 pb-16'>
      {/* 1. Real Amenities & Categories Chips */}
      {shop.categories && shop.categories.length > 0 && (
        <div className='space-y-2'>
          <span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider block'>
            Đặc điểm &amp; Tiện ích
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {shop.categories.map((cat) => (
              <div
                key={cat}
                className='flex items-center gap-1.5 bg-secondary/70 border border-border/60 px-3 py-1.5 rounded-xl text-secondary-foreground text-xs font-medium'
              >
                <Tag size={12} className='text-amber-gold flex-shrink-0' />
                <span>{cat.replace('catering.', '').replace(/_/g, ' ')}</span>
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

export const PhotosTab = memo(function PhotosTab({ shop }: { shop: CoffeeShop }) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);

  const photoList = useMemo(() => {
    if (shop.photos && shop.photos.length > 0) {
      return shop.photos.map((url, i) => ({
        url,
        title: `${shop.name} - Ảnh ${i + 1}`,
        category: i === 0 ? 'Nổi bật' : i % 2 === 0 ? 'Không gian' : 'Cà phê'
      }));
    }
    return [];
  }, [shop]);

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

interface ReviewItem {
  id?: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  highlight?: string;
  comment: string;
  isUserSubmission?: boolean;
}

export const ReviewsTab = memo(function ReviewsTab({
  shop,
  isSidebar = false
}: {
  shop: CoffeeShop;
  isSidebar?: boolean;
}) {
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasShopRating = typeof shop.rating === 'number' && shop.rating > 0;
  const shopRating = shop.rating || 0;
  const totalReviews = shop.total_ratings || reviewsList.length;

  useEffect(() => {
    if (!isFormOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        formRef.current &&
        !formRef.current.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setIsFormOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isFormOpen]);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const placeId = shop.place_id || shop.id;
        if (!placeId) return;
        const res = await fetch(`/api/reviews?placeId=${encodeURIComponent(placeId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          const formatted: ReviewItem[] = data.reviews.map((r: any) => ({
            id: r.id,
            author: r.profiles?.full_name || r.profiles?.username || 'Tín đồ cà phê',
            avatar: r.profiles?.avatar_url || undefined,
            rating: r.rating,
            date: new Date(r.created_at).toLocaleDateString('vi-VN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            highlight: 'Đánh giá từ cộng đồng',
            comment: r.comment
          }));
          if (isMounted) {
            setReviewsList(formatted);
          }
        }
      } catch {
        // No fake fallback
      }
    };
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [shop.place_id, shop.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast('Yêu cầu đăng nhập', {
        description: 'Đăng nhập để chia sẻ câu chuyện cà phê của bạn cùng cộng đồng.',
        action: {
          label: 'Đăng nhập',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn số sao đánh giá từ 1 đến 5.');
      return;
    }

    if (!comment || comment.trim().length < 3) {
      toast.error('Vui lòng viết ít nhất 3 ký tự cho bài đánh giá của bạn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const placeId = shop.place_id || shop.id;
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_place_id: placeId,
          rating,
          comment: comment.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gửi đánh giá thất bại');
      }

      const newReview: ReviewItem = {
        id: data.review?.id || String(Date.now()),
        author:
          profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Bạn',
        avatar:
          profile?.avatar_url ||
          user.user_metadata?.avatar_url ||
          undefined,
        rating,
        date: 'Vừa xong',
        highlight: 'Đánh giá của bạn',
        comment: comment.trim(),
        isUserSubmission: true
      };

      setReviewsList((prev) => [newReview, ...prev]);
      setComment('');
      setRating(5);
      setIsFormOpen(false);
      toast.success('Cảm ơn bạn! Đánh giá của bạn đã được đăng tải.');
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='relative flex flex-col flex-1 min-h-full space-y-4'>
      {/* 1. Rating Breakdown Score Card */}
      {hasShopRating || reviewsList.length > 0 ? (
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
                    star <= Math.round(shopRating)
                      ? 'fill-amber-gold text-amber-gold'
                      : 'text-border'
                  }
                />
              ))}
            </div>
            <span className='text-[10px] text-muted-foreground font-medium leading-none'>
              {totalReviews} Đánh giá
            </span>
          </div>

          <div className='space-y-1 text-xs text-secondary-foreground'>
            <p className='text-xs text-muted-foreground font-medium'>
              Đánh giá trung bình từ cộng đồng người dùng PhinFind.
            </p>
          </div>
        </div>
      ) : (
        <div className='bg-secondary/40 p-4 rounded-2xl border border-border/60 flex flex-col items-center justify-center text-center space-y-1.5 shadow-xs'>
          <MessageSquare size={24} className='text-amber-gold' />
          <span className='text-xs font-bold text-foreground'>Chưa có điểm đánh giá</span>
          <p className='text-[11px] text-muted-foreground'>Hãy là người đầu tiên để lại đánh giá cho quán này!</p>
        </div>
      )}

      {/* 2. Inline "Write a Review" Action / Guest Auth Prompt */}
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
            ref={triggerRef}
            type='button'
            onClick={() => setIsFormOpen((prev) => !prev)}
            className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-3.5 py-1.5 h-8.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer flex-shrink-0'
          >
            <Edit3 size={13} />
            <span>{isFormOpen ? 'Đang viết đánh giá' : 'Viết đánh giá'}</span>
          </Button>
        </div>
      )}

      {/* 3. Review Comments Feed */}
      <div className={cn('space-y-2.5', isFormOpen ? 'pb-48' : 'pb-6')}>
        <span className='text-xs font-bold text-foreground block'>
          Đánh giá &amp; Trải nghiệm cộng đồng ({reviewsList.length})
        </span>
        {reviewsList.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 px-4 text-center space-y-3 bg-secondary/20 rounded-2xl border border-dashed border-border'>
            <EmptyIllustration type='no-reviews' size={140} />
            <div className='space-y-1 max-w-xs'>
              <h4 className='text-xs font-bold text-foreground'>Chưa có đánh giá nào</h4>
              <p className='text-[11px] text-muted-foreground leading-relaxed'>
                Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận về quán này cùng cộng đồng!
              </p>
            </div>
            <Button
              type='button'
              onClick={() => setIsFormOpen(true)}
              className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-4 py-2 h-8 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer'
            >
              <Edit3 size={13} />
              <span>Viết đánh giá đầu tiên</span>
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-2.5'>
            {reviewsList.map((rev, idx) => (
              <div
                key={rev.id || idx}
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
                        <span className='font-bold text-foreground text-xs truncate'>{rev.author}</span>
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
                  <span className='text-[10px] text-muted-foreground font-medium whitespace-nowrap flex-shrink-0 pt-0.5'>
                    {rev.date}
                  </span>
                </div>

                {/* Review Comment Body with natural wrapping */}
                <p className='text-xs text-secondary-foreground leading-relaxed break-words whitespace-normal'>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* 4. Sticky Bottom Review Form with smooth slide-up animation */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            ref={formRef}
            key='sticky-review-form'
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'sticky bottom-0 z-30 bg-card/98 backdrop-blur-md border-t border-border/70 select-none text-foreground flex flex-col gap-2.5 mt-auto shadow-none',
              isSidebar
                ? '-mx-4 px-4 pt-3 pb-3.5'
                : '-mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3.5'
            )}
          >
            {/* Header with Title and Close Button */}
            <div className='flex items-center justify-between border-b border-border/40 pb-1.5'>
              <div className='flex items-center gap-1.5'>
                <div className='w-5 h-5 rounded-md bg-amber-gold/15 flex items-center justify-center text-amber-gold'>
                  <Edit3 size={12} />
                </div>
                <span className='font-bold text-xs text-foreground'>Viết Đánh Giá Của Bạn</span>
              </div>
              <button
                type='button'
                onClick={() => setIsFormOpen(false)}
                className='text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors cursor-pointer'
                aria-label='Đóng form đánh giá'
              >
                <X size={14} />
              </button>
            </div>

            {/* Interactive Star Rating Selector */}
            <div className='flex items-center justify-between'>
              <span className='text-[11px] font-semibold text-muted-foreground'>Đánh giá tổng quan</span>
              <div className='flex items-center gap-0.5'>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className='p-0.5 text-amber-gold transition-transform hover:scale-125 focus:outline-none cursor-pointer'
                    >
                      <Star
                        size={18}
                        className={cn(
                          'transition-colors',
                          active ? 'fill-amber-gold text-amber-gold' : 'text-muted-foreground/30'
                        )}
                      />
                    </button>
                  );
                })}
                <span className='text-xs font-bold text-foreground ml-1.5 min-w-[40px] text-right'>
                  {hoverRating || rating} / 5
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div className='space-y-0.5'>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Bạn cảm thấy thế nào về hương vị cà phê, chỗ ngồi, tốc độ Wi-Fi hay không gian quán?'
                rows={2}
                className='w-full bg-secondary/50 border border-border/60 rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-gold resize-none transition-colors'
              />
            </div>

            {/* Action Buttons */}
            <div className='flex items-center justify-end gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
                className='text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-3 py-1 h-7.5 cursor-pointer'
              >
                Hủy
              </Button>
              <Button
                type='button'
                onClick={handleSubmitReview}
                disabled={isSubmitting || comment.trim().length < 3}
                className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-3.5 py-1 h-7.5 shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={12} className='animate-spin' />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    Gửi đánh giá
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export const AmenitiesTab = memo(function AmenitiesTab() {
  const amenitiesList = [
    {
      icon: Wifi,
      title: 'Wi-Fi Tốc Độ Cao',
      desc: 'Kết nối 100+ Mbps tối ưu cho làm việc từ xa, gọi video và lướt web',
      badge: '100 Mbps'
    },
    {
      icon: Zap,
      title: 'Nhiều Ổ Cắm Điện',
      desc: 'Ổ cắm sạc thuận tiện bố trí tại hầu hết các bàn và góc ngồi',
      badge: 'Tại các bàn'
    },
    {
      icon: Wind,
      title: 'Không Gian Điều Hòa Mát Lạnh',
      desc: 'Nhiệt độ phòng luôn mát mẻ và dễ chịu quanh năm',
      badge: 'Mát mẻ'
    },
    {
      icon: Sun,
      title: 'Ban Công & Sân Vườn',
      desc: 'Khu vực bàn ngoài trời thoáng đãng rợp bóng cây xanh',
      badge: 'Thoáng đãng'
    },
    {
      icon: Coffee,
      title: 'Hạt Cà Phê Đặc Sản Nguyên Bản',
      desc: 'Hạt Robusta & Arabica Cầu Đất, Đà Lạt được rang mộc tỉ mỉ',
      badge: 'Hạt Đà Lạt'
    },
    {
      icon: CupSoda,
      title: 'Đồ Uống Thủ Công Đặc Trưng',
      desc: 'Cà phê trứng, cà phê cốt dừa, matcha latte và cold brew',
      badge: 'Món phải thử'
    },
    {
      icon: CreditCard,
      title: 'Thanh Toán Không Tiền Mặt',
      desc: 'Hỗ trợ VietQR, Apple Pay, Visa, Mastercard và tiền mặt',
      badge: 'Đa dạng'
    },
    {
      icon: Utensils,
      title: 'Bánh Ngọt & Đồ Ăn Nhẹ',
      desc: 'Bánh sừng bò nóng hổi, bánh mì thủ công và bánh ngọt tươi mỗi ngày',
      badge: 'Tươi mỗi ngày'
    }
  ];

  return (
    <div className='space-y-4 pb-16'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
        {amenitiesList.map((item, idx) => {
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
                <span className='inline-flex items-center text-[9px] bg-muted px-1.5 py-0.5 rounded-md text-amber-gold font-semibold border border-border/40 self-start text-left'>
                  {item.badge}
                </span>
                <p className='text-[11px] text-secondary-foreground leading-relaxed text-left'>{item.desc}</p>
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
  onSelectShop?: (shop: CoffeeShop) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export function ShopDetailsContent({
  shop,
  isSidebar = false,
  onSelectShop,
  scrollRef
}: ShopDetailsContentProps) {
  const { shops, setSelectedShop } = useShopStore();
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'amenities'>('overview');
  const [imgError, setImgError] = useState(false);

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

  const galleryPhotos = useMemo(() => {
    if (shop.photos && shop.photos.length > 0) {
      return shop.photos.map((url, i) => ({
        url,
        title: `${shop.name} - Ảnh ${i + 1}`,
        category: i === 0 ? 'Nổi bật' : i % 2 === 0 ? 'Không gian' : 'Cà phê'
      }));
    }
    return [];
  }, [shop]);

  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceText =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const isOpenNow = scheduleInfo.isOpenNow;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as any)}
      className='flex-1 flex flex-col min-h-0'
    >
      {/* HEADER SECTION: Gallery collage, title, metrics, and tab navigation */}
      <div className={cn('flex-shrink-0 space-y-3.5 select-none', isSidebar ? 'px-4 pt-3' : 'px-4 sm:px-6 pt-2')}>
        {/* 1. Curated Interactive Visual Collage Banner */}
        <div className='relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-card shadow-md border border-border/80 group'>
          {imgError || galleryPhotos.length === 0 ? (
            <div className='w-full h-full relative overflow-hidden'>
              <ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />
            </div>
          ) : (
            <div className='w-full h-full flex gap-1.5 p-1.5 bg-card'>
              <div
                onClick={() => openImagePreview(galleryPhotos, 0)}
                className='flex-1 h-full rounded-xl overflow-hidden relative cursor-pointer group select-none pointer-events-auto bg-card border border-border/40'
              >
                <img
                  draggable={false}
                  src={galleryPhotos[0]?.url}
                  alt={shop.name}
                  onError={() => setImgError(true)}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5'>
                  <span className='text-xs font-bold text-white drop-shadow-md flex items-center gap-1.5'>
                    <Images size={13} className='text-amber-gold' />
                    <span>Xem bộ sưu tập ảnh</span>
                  </span>
                </div>
              </div>

              {galleryPhotos.length > 1 && (
                <div className='hidden xs:flex sm:flex flex-col w-28 sm:w-36 gap-1.5'>
                  <div
                    onClick={() => openImagePreview(galleryPhotos, 1)}
                    className='h-[calc(50%-3px)] rounded-xl overflow-hidden relative bg-card border border-border/40 cursor-pointer group select-none pointer-events-auto'
                  >
                    <img
                      draggable={false}
                      src={galleryPhotos[1]?.url}
                      alt={`${shop.name} - Ảnh 2`}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                    />
                  </div>

                  <div
                    onClick={() => openImagePreview(galleryPhotos, 2)}
                    className='h-[calc(50%-3px)] rounded-xl overflow-hidden relative bg-card border border-border/40 cursor-pointer group select-none pointer-events-auto'
                  >
                    <img
                      draggable={false}
                      src={galleryPhotos[2]?.url}
                      alt={`${shop.name} - Ảnh 3`}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                    />
                    {galleryPhotos.length > 3 && (
                      <div className='absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center text-amber-gold font-bold text-xs tracking-tight gap-1 hover:bg-black/50 transition-colors pointer-events-none'>
                        <Images size={12} className='text-amber-gold' />
                        <span>+{galleryPhotos.length - 2} ảnh</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Shop Title, Address & Metrics */}
        <div className='space-y-1.5'>
          <h2 className='font-sans font-bold text-lg sm:text-xl text-foreground tracking-tight leading-snug break-words'>
            {shop.name}
          </h2>

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
        <div className='pt-1.5 border-b border-border/50'>
          <TabsList className='flex items-center justify-between bg-transparent p-0 h-auto rounded-none w-full gap-2'>
            <TabsTrigger
              value='overview'
              className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all cursor-pointer'
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value='photos'
              className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all cursor-pointer'
            >
              Hình ảnh
            </TabsTrigger>
            <TabsTrigger
              value='reviews'
              className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all cursor-pointer'
            >
              Đánh giá
            </TabsTrigger>
            <TabsTrigger
              value='amenities'
              className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all cursor-pointer'
            >
              Tiện ích
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* SCROLLABLE BODY SECTION */}
      <div
        ref={scrollRef}
        data-vaul-no-drag
        className={cn(
          'flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pt-3',
          isSidebar ? 'px-4' : 'px-4 sm:px-6'
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
          />
        </TabsContent>

        <TabsContent value='photos' className='mt-0 focus-visible:outline-none'>
          <PhotosTab shop={shop} />
        </TabsContent>

        <TabsContent value='reviews' className='mt-0 focus-visible:outline-none min-h-full flex flex-col flex-1'>
          <ReviewsTab shop={shop} isSidebar={isSidebar} />
        </TabsContent>

        <TabsContent value='amenities' className='mt-0 focus-visible:outline-none'>
          <AmenitiesTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
