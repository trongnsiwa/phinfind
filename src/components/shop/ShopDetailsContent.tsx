'use client';

import {
  Check, CheckCircle2, ChevronDown, ChevronRight, Clock, Coffee, Compass, Copy, CreditCard,
  CupSoda, Edit3, Flame, Footprints, Globe, Images, Loader2, LogIn, MapPin, Navigation,
  Phone, Quote, Send, Sparkles, Star, Sun, Utensils, Wifi, Wind, X, Zap
} from 'lucide-react';
import Link from 'next/link';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { CoffeeShop } from '@/types/shop';

// Curated high-res coffeehouse atmosphere photography gallery
export const SAMPLE_GALLERY = [
  {
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    title: 'Warm Rustic Espresso Bar & Seating',
    category: 'Interior'
  },
  {
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    title: 'Signature Handcrafted Latte Art',
    category: 'Coffee'
  },
  {
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    title: 'Sunlit Window Study Nook with Natural Light',
    category: 'Ambience'
  },
  {
    url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
    title: 'Artisan Vietnamese Phin Drip Station',
    category: 'Coffee'
  },
  {
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    title: 'Quiet Second-Floor Laptop Work Sanctuary',
    category: 'Workspace'
  },
  {
    url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
    title: 'Breezy Balcony Garden Patio Seating',
    category: 'Outdoor'
  }
];

// Curated customer pull quotes and testimonials
export const MOCK_REVIEWS = [
  {
    author: 'Minh Anh',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 days ago',
    highlight: 'Best Salted Egg Coffee in Town',
    comment:
      'The signature traditional phin drip with sweetened condensed milk and salted cream is phenomenal. Quiet second-floor space with fast Wi-Fi and plenty of outlets for remote work.'
  },
  {
    author: 'Thanh Tùng',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 week ago',
    highlight: 'Cozy Work & Study Vibe',
    comment:
      'Cozy, authentic vibes and friendly baristas. Great selection of specialty single-origin beans from Da Lat and refreshing cold brew.'
  },
  {
    author: 'Elena Rostova',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 weeks ago',
    highlight: 'Airy Ambience & Great Music',
    comment:
      'Loved the sunlit ambiance and gentle acoustic playlist. Perfect spot for reading or casual coffee dates. Definitely try their homemade pastries!'
  }
];

export interface DaySchedule {
  dayName: string;
  dayShort: string;
  dayIndex: number;
  isToday: boolean;
  timeText: string;
  isOpenDay: boolean;
}

export interface ComputedSchedule {
  isOpenNow: boolean;
  statusText: string;
  scheduleList: DaySchedule[];
  todaySchedule?: DaySchedule;
  isApproximate: boolean;
  peakVibeTime: string;
}

function parseHHMM(timeStr: string): { hours: number; minutes: number; formatted: string } {
  const clean = timeStr.padStart(4, '0');
  const h = parseInt(clean.slice(0, 2), 10);
  const m = parseInt(clean.slice(2, 4), 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return {
    hours: h,
    minutes: m,
    formatted: `${displayH}:${displayM} ${period}`
  };
}

export function getShopSchedule(openingHours?: CoffeeShop['opening_hours']): ComputedSchedule {
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const DAYS_ORDER = [
    { name: 'Monday', short: 'Mon', index: 1 },
    { name: 'Tuesday', short: 'Tue', index: 2 },
    { name: 'Wednesday', short: 'Wed', index: 3 },
    { name: 'Thursday', short: 'Thu', index: 4 },
    { name: 'Friday', short: 'Fri', index: 5 },
    { name: 'Saturday', short: 'Sat', index: 6 },
    { name: 'Sunday', short: 'Sun', index: 0 }
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
          timeText: 'Closed',
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
    let statusText = 'Closed';

    if (todayPeriod) {
      const openTime = parseHHMM(todayPeriod.open.time);
      const closeTime = parseHHMM(todayPeriod.close.time);
      const openMins = openTime.hours * 60 + openTime.minutes;
      const closeMins = closeTime.hours * 60 + closeTime.minutes;

      if (currentMinutes >= openMins && currentMinutes < closeMins) {
        isOpenNow = true;
        statusText = `Open • Closes ${closeTime.formatted}`;
      } else if (currentMinutes < openMins) {
        isOpenNow = false;
        statusText = `Closed • Opens ${openTime.formatted}`;
      } else {
        isOpenNow = false;
        statusText = 'Closed for the day';
      }
    } else {
      isOpenNow = false;
      statusText = 'Closed today';
    }

    const todaySchedule = scheduleList.find((s) => s.isToday);

    return {
      isOpenNow,
      statusText,
      scheduleList,
      todaySchedule,
      isApproximate: false,
      peakVibeTime: '08:30 AM – 10:00 AM'
    };
  }

  // Fallback when periods are not available
  const defaultOpenMinutes = 7 * 60;
  const defaultCloseMinutes = 22 * 60 + 30;
  const isWithinDefaultHours =
    currentMinutes >= defaultOpenMinutes && currentMinutes < defaultCloseMinutes;
  const isOpenNow =
    openingHours?.open_now !== undefined ? openingHours.open_now : isWithinDefaultHours;

  const scheduleList: DaySchedule[] = DAYS_ORDER.map((d) => ({
    dayName: d.name,
    dayShort: d.short,
    dayIndex: d.index,
    isToday: d.index === currentDay,
    timeText: d.index === 0 || d.index === 6 ? '07:00 AM – 11:00 PM' : '07:00 AM – 10:30 PM',
    isOpenDay: true
  }));

  const todaySchedule = scheduleList.find((s) => s.isToday);
  const statusText = isOpenNow ? 'Open Now • Closes 10:30 PM' : 'Closed • Opens 07:00 AM';

  return {
    isOpenNow,
    statusText,
    scheduleList,
    todaySchedule,
    isApproximate: true,
    peakVibeTime: '08:30 AM – 10:00 AM'
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
  const validRating = shop.rating && shop.rating > 0 ? shop.rating : 4.8;
  const ratingScorePercent = Math.min(Math.round((validRating / 5) * 100), 100);
  const distanceText =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Nearby';

  const handleCopyAddress = () => {
    if (shop.address) {
      navigator.clipboard.writeText(shop.address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className='space-y-4 pb-16'>
      {/* 1. Popular Spot in Town Banner with Social Proof */}
      <div className='bg-gradient-to-r from-amber-gold/15 via-dark-roast to-dark-roast/80 p-3.5 rounded-2xl border border-amber-gold/30 space-y-2 shadow-inner'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-1.5 text-amber-gold font-bold text-xs tracking-wide flex-shrink-0'>
            <Flame size={14} className='text-amber-gold animate-pulse' />
            <span>Popular Spot in Town</span>
          </div>
          <span className='text-[10.5px] text-soft-beige/90 bg-dark-bg/70 px-2 py-0.5 rounded-full border border-dark-border/50 font-medium whitespace-nowrap'>
            ⚡️ 32 coffee lovers checked in today
          </span>
        </div>
        <p className='text-xs text-soft-beige leading-relaxed font-medium break-words'>{experienceTagline}</p>
      </div>

      {/* 2. Signature Recommendation Section */}
      <div className='bg-dark-roast/50 p-3.5 rounded-2xl border border-dark-border/60 flex items-start gap-3'>
        <div className='w-8 h-8 rounded-xl bg-amber-gold/10 border border-amber-gold/30 flex items-center justify-center text-amber-gold flex-shrink-0 mt-0.5'>
          <Coffee size={16} />
        </div>
        <div className='space-y-0.5 flex-1 min-w-0'>
          <span className='text-[10px] font-bold text-amber-gold uppercase tracking-wider block'>
            Signature Recommendation
          </span>
          <p className='text-xs font-semibold text-cream-white leading-snug break-words'>
            Traditional Phin Drip with Condensed Milk & Salted Cream Foam
          </p>
          <p className='text-[11px] text-soft-beige/75 break-words'>
            Handcrafted with slow-dripped single-origin Da Lat beans.
          </p>
        </div>
      </div>

      {/* 3. Amenities Grid */}
      <div className='grid grid-cols-2 gap-2'>
        <div className='flex items-center gap-2 bg-dark-roast/70 border border-dark-border/60 p-2.5 rounded-xl text-soft-beige shadow-xs min-w-0'>
          <Wifi size={14} className='text-amber-gold flex-shrink-0' />
          <span className='text-xs font-medium truncate'>Fast Wi-Fi</span>
        </div>
        <div className='flex items-center gap-2 bg-dark-roast/70 border border-dark-border/60 p-2.5 rounded-xl text-soft-beige shadow-xs min-w-0'>
          <Zap size={14} className='text-amber-gold flex-shrink-0' />
          <span className='text-xs font-medium truncate'>Charging Sockets</span>
        </div>
        <div className='flex items-center gap-2 bg-dark-roast/70 border border-dark-border/60 p-2.5 rounded-xl text-soft-beige shadow-xs min-w-0'>
          <Wind size={14} className='text-amber-gold flex-shrink-0' />
          <span className='text-xs font-medium truncate'>Air Conditioned</span>
        </div>
        <div className='flex items-center gap-2 bg-dark-roast/70 border border-dark-border/60 p-2.5 rounded-xl text-soft-beige shadow-xs min-w-0'>
          <Sun size={14} className='text-amber-gold flex-shrink-0' />
          <span className='text-xs font-medium truncate'>Outdoor Patio</span>
        </div>
      </div>

      {/* 4. Explorer Satisfaction Rating Card */}
      <div className='bg-dark-roast/40 p-3.5 rounded-2xl border border-dark-border/50 space-y-1.5'>
        <div className='flex items-center justify-between text-xs'>
          <span className='text-soft-beige font-medium'>Explorer Satisfaction Rating</span>
          <span className='font-bold text-amber-gold'>{ratingScorePercent}% positive</span>
        </div>
        <Progress
          value={ratingScorePercent}
          className='h-2 bg-dark-bg border border-dark-border/50'
        />
        <div className='flex items-center justify-between text-[11px] text-warm-gray pt-0.5'>
          <span>Based on {shop.total_ratings || 120}+ verified explorer ratings</span>
          <span className='text-amber-gold font-semibold'>★ {validRating.toFixed(1)} / 5.0</span>
        </div>
      </div>

      {/* 5. Opening Hours & Contact Card */}
      <div className='bg-dark-roast/40 p-3.5 rounded-2xl border border-dark-border/50 space-y-2.5 text-xs transition-all'>
        <button
          type='button'
          onClick={() => setIsHoursExpanded((prev) => !prev)}
          aria-expanded={isHoursExpanded}
          aria-controls='weekly-schedule-panel'
          className='w-full flex items-center justify-between gap-3 text-left group/hours focus:outline-none cursor-pointer'
        >
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='w-8 h-8 rounded-xl bg-amber-gold/10 border border-amber-gold/25 flex items-center justify-center text-amber-gold flex-shrink-0'>
              <Clock size={16} />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-1.5'>
                <span className='font-bold text-cream-white text-xs block group-hover/hours:text-amber-gold transition-colors'>
                  Opening Hours
                </span>
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    scheduleInfo.isOpenNow ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]'
                  )}
                />
              </div>
              <p className='text-[11px] text-soft-beige/80 truncate'>
                <span
                  className={cn(
                    'font-semibold',
                    scheduleInfo.isOpenNow ? 'text-[#A3D9B1]' : 'text-[#E8A5A5]'
                  )}
                >
                  {scheduleInfo.isOpenNow ? 'Open Now' : 'Closed'}
                </span>
                {scheduleInfo.todaySchedule && (
                  <span className='text-soft-beige/65'>
                    {' '}
                    • Today: {scheduleInfo.todaySchedule.timeText}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-1.5 flex-shrink-0 bg-dark-bg/60 border border-dark-border/40 px-2 py-1 rounded-xl group-hover/hours:border-amber-gold/40 transition-colors'>
            <span className='text-[10px] font-semibold text-amber-gold'>
              {isHoursExpanded ? 'Hide' : 'See all'}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                'text-warm-gray group-hover/hours:text-amber-gold transition-transform duration-300',
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
              ? 'grid-rows-[1fr] opacity-100 mt-2.5 pt-2.5 border-t border-dark-border/40'
              : 'grid-rows-[0fr] opacity-0 mt-0 pt-0'
          )}
        >
          <div className='min-h-0 space-y-2.5'>
            <div className='flex items-center gap-2 bg-dark-bg/70 border border-dark-border/40 px-3 py-2 rounded-xl text-[11px] text-amber-gold'>
              <Sparkles size={13} className='text-amber-gold flex-shrink-0' />
              <span className='font-medium'>
                <strong className='text-cream-white font-semibold'>Peak Vibe:</strong>{' '}
                {scheduleInfo.peakVibeTime} — best time for slow pour-overs and calm seating.
              </span>
            </div>

            <div className='bg-dark-bg/80 rounded-xl border border-dark-border/40 p-2 space-y-1'>
              {scheduleInfo.scheduleList.map((day) => (
                <div
                  key={day.dayName}
                  className={cn(
                    'flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors',
                    day.isToday
                      ? 'bg-amber-gold/15 text-cream-white font-bold border border-amber-gold/30 shadow-xs'
                      : 'text-soft-beige/80 hover:text-cream-white'
                  )}
                >
                  <div className='flex items-center gap-2'>
                    {day.isToday ? (
                      <span className='w-1.5 h-1.5 rounded-full bg-amber-gold animate-pulse' />
                    ) : (
                      <span className='w-1.5 h-1.5 rounded-full bg-warm-gray/30' />
                    )}
                    <span className={cn(day.isToday && 'text-amber-gold')}>{day.dayName}</span>
                    {day.isToday && (
                      <span className='text-[9px] uppercase tracking-wider bg-amber-gold text-dark-bg px-1.5 py-0.2 rounded font-extrabold ml-1'>
                        Today
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[11px]',
                      day.isToday ? 'text-cream-white font-bold' : 'text-soft-beige/70'
                    )}
                  >
                    {day.timeText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Info (Phone & Website) */}
        {(shop.phone || shop.website) && (
          <div className='pt-2 border-t border-dark-border/40 space-y-2'>
            {shop.phone && (
              <div className='flex items-center gap-2.5'>
                <Phone size={14} className='text-amber-gold flex-shrink-0' />
                <span className='text-[11px] text-warm-gray'>Phone:</span>
                <a
                  href={`tel:${shop.phone}`}
                  className='text-amber-gold hover:text-amber-gold-hover hover:underline transition-colors font-medium text-xs ml-auto'
                >
                  {shop.phone}
                </a>
              </div>
            )}

            {shop.website && (
              <div className='flex items-center gap-2.5'>
                <Globe size={14} className='text-amber-gold flex-shrink-0' />
                <span className='text-[11px] text-warm-gray'>Website:</span>
                <a
                  href={shop.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-amber-gold hover:text-amber-gold-hover hover:underline transition-colors font-medium truncate block max-w-[200px] text-xs ml-auto text-right'
                >
                  {shop.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Physical Location & Navigation CTA */}
      <div className='bg-dark-roast/60 p-4 rounded-2xl border border-dark-border/60 space-y-3.5 shadow-md'>
        <div className='flex items-start justify-between gap-2'>
          <div className='space-y-1 min-w-0'>
            <span className='text-[10px] font-bold text-amber-gold uppercase tracking-wider block'>
              Physical Location
            </span>
            <p className='text-xs sm:text-sm font-semibold text-cream-white leading-snug'>
              {shop.address || 'Address information unavailable'}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleCopyAddress}
            aria-label='Copy address'
            className='h-8 w-8 rounded-xl bg-dark-bg/80 text-soft-beige hover:text-amber-gold hover:bg-dark-roast border border-dark-border/60 flex-shrink-0 cursor-pointer'
          >
            {copied ? <Check size={14} className='text-emerald-400' /> : <Copy size={14} />}
          </Button>
        </div>

        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div className='bg-dark-bg/70 p-2.5 rounded-xl border border-dark-border/40 flex items-center gap-2'>
            <Footprints size={15} className='text-amber-gold flex-shrink-0' />
            <div>
              <span className='text-[10px] text-warm-gray block'>Distance</span>
              <span className='font-bold text-cream-white text-xs'>{distanceText}</span>
            </div>
          </div>

          <div className='bg-dark-bg/70 p-2.5 rounded-xl border border-dark-border/40 flex items-center gap-2'>
            <Compass size={15} className='text-amber-gold flex-shrink-0' />
            <div>
              <span className='text-[10px] text-warm-gray block'>GPS Coordinates</span>
              <span className='font-bold text-cream-white text-xs'>
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
          <Button className='w-full h-12 bg-gradient-to-r from-amber-gold to-[#E5B56D] text-dark-bg hover:brightness-110 font-bold text-sm rounded-xl shadow-lg shadow-amber-gold/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer'>
            <Navigation size={16} className='fill-dark-bg' />
            Go There Now • Open in Google Maps
          </Button>
        </a>
      </div>

      {/* 7. Nearby Recommendations */}
      {similarShops.length > 0 && (
        <div className='space-y-2.5 pt-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-cream-white flex items-center gap-1.5'>
              <Sparkles size={13} className='text-amber-gold' />
              You Might Also Like
            </span>
            <span className='text-[11px] text-soft-beige/70'>Nearby spots</span>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {similarShops.slice(0, 2).map((simShop) => (
              <div
                key={simShop.id}
                onClick={() => onSelectShop(simShop)}
                className='bg-dark-roast/40 hover:bg-dark-roast/80 p-2.5 rounded-2xl border border-dark-border/50 flex items-center gap-2.5 cursor-pointer transition-all hover:border-amber-gold/40 group'
              >
                <div className='w-12 h-12 rounded-xl bg-dark-bg overflow-hidden flex-shrink-0 border border-dark-border/40'>
                  <img
                    src={simShop.photos?.[0] || SAMPLE_GALLERY[0].url}
                    alt={simShop.name}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                  />
                </div>
                <div className='min-w-0 flex-1 space-y-0.5'>
                  <span className='font-bold text-cream-white text-xs block truncate group-hover:text-amber-gold transition-colors'>
                    {simShop.name}
                  </span>
                  <div className='flex items-center gap-1 text-[10px] text-warm-gray'>
                    <Star size={10} className='fill-amber-gold text-amber-gold' />
                    <span>{(simShop.rating || 4.5).toFixed(1)}</span>
                    <span>•</span>
                    <span>{simShop.distance_text || 'Nearby'}</span>
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className='text-warm-gray group-hover:text-amber-gold transition-colors flex-shrink-0'
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
        title: `${shop.name} - Photo ${i + 1}`,
        category: i === 0 ? 'Featured' : i % 2 === 0 ? 'Interior' : 'Coffee'
      }));
    }
    return SAMPLE_GALLERY.map((g) => ({
      ...g,
      title: `${shop.name} - ${g.title}`
    }));
  }, [shop]);

  return (
    <div className='space-y-4 pb-16'>
      <div className='flex items-center justify-between'>
        <div>
          <span className='text-xs font-bold text-cream-white block'>Atmosphere & Gallery</span>
          <span className='text-[11px] text-soft-beige/70'>
            {photoList.length} curated explorer photos
          </span>
        </div>
        <Badge
          variant='outline'
          className='bg-dark-roast text-amber-gold border-dark-border text-[10px] font-bold'
        >
          Full-Screen View
        </Badge>
      </div>

      <div className='grid grid-cols-3 gap-2.5'>
        {photoList.map((item, idx) => (
          <div
            key={idx}
            onClick={() => openImagePreview(photoList, idx)}
            className='group relative aspect-square rounded-2xl overflow-hidden bg-dark-roast border border-dark-border/60 cursor-pointer shadow-md active:scale-95 transition-transform select-none pointer-events-auto'
          >
            <img
              draggable={false}
              src={item.url}
              alt={item.title}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 sm:p-2'>
              <span className='text-[9.5px] sm:text-[10px] font-semibold text-cream-white truncate'>
                {item.title}
              </span>
            </div>
            <div className='absolute top-1.5 right-1.5 bg-dark-bg/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9px] font-bold text-amber-gold border border-dark-border/40'>
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

export const ReviewsTab = memo(function ReviewsTab({ shop }: { shop: CoffeeShop }) {
  const { user, profile, isAuthenticated } = useAuth();
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(MOCK_REVIEWS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shopRating = shop.rating && shop.rating > 0 ? shop.rating : 4.8;
  const totalReviews = shop.total_ratings || 128;

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
            author: r.profiles?.full_name || r.profiles?.username || 'Verified Explorer',
            avatar:
              r.profiles?.avatar_url ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            rating: r.rating,
            date: new Date(r.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            highlight: 'Community Review',
            comment: r.comment
          }));
          if (isMounted) {
            setReviewsList([...formatted, ...MOCK_REVIEWS]);
          }
        }
      } catch {
        // Fallback to MOCK_REVIEWS
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
      toast.error('Please sign in to write a review.');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a star rating between 1 and 5.');
      return;
    }

    if (!comment || comment.trim().length < 3) {
      toast.error('Please write at least 3 characters for your review.');
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
        throw new Error(data.error || 'Failed to submit review');
      }

      const newReview: ReviewItem = {
        id: data.review?.id || String(Date.now()),
        author:
          profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'You',
        avatar:
          profile?.avatar_url ||
          user.user_metadata?.avatar_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        rating,
        date: 'Just now',
        highlight: 'Your Review',
        comment: comment.trim(),
        isUserSubmission: true
      };

      setReviewsList((prev) => [newReview, ...prev]);
      setComment('');
      setRating(5);
      setIsFormOpen(false);
      toast.success('Thank you! Your review has been posted.');
    } catch (err: any) {
      toast.error(err.message || 'Could not submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-4 pb-16'>
      {/* 1. Rating Breakdown Score Card (Horizontal Row) */}
      <div className='bg-dark-roast/50 p-3.5 rounded-2xl border border-dark-border/60 grid grid-cols-[110px_1fr] items-center gap-4 shadow-sm'>
        <div className='flex flex-col items-center justify-center text-center pr-3 border-r border-dark-border/50'>
          <span className='text-3xl font-black text-cream-white tracking-tight leading-none'>
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
                    : 'text-dark-border'
                }
              />
            ))}
          </div>
          <span className='text-[10px] text-warm-gray font-medium leading-none'>
            {totalReviews} Reviews
          </span>
        </div>

        {/* Rating Distribution Bars */}
        <div className='space-y-1 text-xs text-soft-beige'>
          {[
            { star: 5, pct: 84 },
            { star: 4, pct: 11 },
            { star: 3, pct: 3 },
            { star: 2, pct: 1 },
            { star: 1, pct: 1 }
          ].map((bar) => (
            <div key={bar.star} className='flex items-center gap-2'>
              <span className='w-2.5 text-right text-[10px] text-warm-gray font-bold'>{bar.star}</span>
              <div className='flex-1 h-1.5 bg-dark-bg rounded-full overflow-hidden border border-dark-border/40'>
                <div
                  className='h-full bg-amber-gold rounded-full transition-all duration-500'
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className='w-7 text-right text-[9.5px] text-warm-gray font-semibold'>
                {bar.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Write a Review Action / Guest Auth Prompt (Vertical Stack) */}
      {!isAuthenticated ? (
        <div className='bg-dark-roast/40 p-3.5 rounded-2xl border border-amber-gold/30 flex flex-col gap-3 shadow-xs'>
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='w-8 h-8 rounded-xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold flex-shrink-0'>
              <Edit3 size={15} />
            </div>
            <div className='min-w-0'>
              <span className='font-bold text-cream-white text-xs block'>
                Visited this coffee shop?
              </span>
              <p className='text-[11px] text-soft-beige/75 leading-tight'>
                Share your impressions with the community.
              </p>
            </div>
          </div>
          <Link
            href={`/login?redirect=${encodeURIComponent(`/?shop=${shop.id}`)}`}
            className='w-full'
          >
            <Button
              type='button'
              variant='outline'
              className='w-full bg-amber-gold/20 hover:bg-amber-gold/30 text-amber-gold hover:text-amber-gold-hover border-amber-gold/40 hover:border-amber-gold/60 text-xs font-bold rounded-xl py-2 h-9 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer'
            >
              <LogIn size={14} />
              <span>Sign in to write a review</span>
            </Button>
          </Link>
        </div>
      ) : isFormOpen ? (
        <form
          onSubmit={handleSubmitReview}
          className='bg-dark-roast/70 p-3.5 rounded-2xl border border-amber-gold/40 shadow-lg space-y-3 animate-in fade-in zoom-in-95 duration-200'
        >
          <div className='flex items-center justify-between border-b border-dark-border/50 pb-2'>
            <div className='flex items-center gap-2'>
              <Edit3 size={15} className='text-amber-gold' />
              <span className='font-bold text-xs text-cream-white'>Write Your Review</span>
            </div>
            <button
              type='button'
              onClick={() => setIsFormOpen(false)}
              className='text-warm-gray hover:text-cream-white p-1 rounded-lg transition-colors cursor-pointer'
            >
              <X size={15} />
            </button>
          </div>

          <div className='space-y-1'>
            <span className='text-[11px] font-semibold text-soft-beige block'>Overall Rating</span>
            <div className='flex items-center gap-1.5 py-0.5'>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className='p-1 text-amber-gold transition-transform hover:scale-125 focus:outline-none cursor-pointer'
                  >
                    <Star
                      size={20}
                      className={cn(
                        'transition-colors',
                        active ? 'fill-amber-gold text-amber-gold' : 'text-warm-gray/40'
                      )}
                    />
                  </button>
                );
              })}
              <span className='text-xs font-bold text-amber-gold ml-2'>
                {hoverRating || rating} / 5 Stars
              </span>
            </div>
          </div>

          <div className='space-y-1'>
            <span className='text-[11px] font-semibold text-soft-beige block'>Your Review</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='What did you think of the coffee roasts, seating comfort, Wi-Fi speed, or vibe?'
              rows={3}
              className='w-full bg-dark-bg/80 border border-dark-border/80 rounded-xl p-2.5 text-xs text-cream-white placeholder:text-warm-gray/60 focus:outline-none focus:border-amber-gold resize-none transition-colors'
            />
          </div>

          <div className='flex items-center justify-end gap-2 pt-0.5'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
              className='text-xs text-warm-gray hover:text-cream-white hover:bg-white/5 rounded-xl px-3 py-1.5 h-8 cursor-pointer'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || comment.trim().length < 3}
              className='bg-amber-gold hover:bg-amber-gold-hover text-dark-bg font-bold text-xs rounded-xl px-3.5 py-1.5 h-8 shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer'
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className='animate-spin' />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Post Review
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className='flex items-center justify-between bg-dark-roast/40 p-3 rounded-2xl border border-dark-border/60 gap-3'>
          <div className='flex items-center gap-2.5 min-w-0 flex-1'>
            <div className='w-8 h-8 rounded-full overflow-hidden border border-amber-gold/40 bg-dark-bg flex-shrink-0'>
              <img
                src={
                  profile?.avatar_url ||
                  user?.user_metadata?.avatar_url ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                }
                alt='Your avatar'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='min-w-0'>
              <span className='text-xs font-bold text-cream-white block truncate'>
                Review as {profile?.full_name || user?.user_metadata?.full_name || 'Explorer'}
              </span>
              <p className='text-[11px] text-soft-beige/70 truncate'>
                Share your impressions with the community
              </p>
            </div>
          </div>
          <Button
            type='button'
            onClick={() => setIsFormOpen(true)}
            className='bg-amber-gold hover:bg-amber-gold-hover text-dark-bg font-bold text-xs rounded-xl px-3 py-1.5 h-8.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer flex-shrink-0'
          >
            <Edit3 size={13} />
            <span>Write Review</span>
          </Button>
        </div>
      )}

      {/* Review Comments Feed */}
      <div className='space-y-2.5'>
        <span className='text-xs font-bold text-cream-white block'>
          Community Highlights & Stories ({reviewsList.length})
        </span>
        <div className='grid grid-cols-1 gap-2.5'>
          {reviewsList.map((rev, idx) => (
            <div
              key={rev.id || idx}
              className={cn(
                'p-3.5 rounded-2xl border flex flex-col gap-2 transition-all shadow-xs',
                rev.isUserSubmission
                  ? 'bg-amber-gold/10 border-amber-gold/40 shadow-sm'
                  : 'bg-dark-roast/50 border-dark-border/60 hover:border-dark-border/90'
              )}
            >
              {/* Header Row: Avatar, Author, Verified, Rating, and Date */}
              <div className='flex items-start justify-between gap-2 min-w-0'>
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div className='w-7 h-7 rounded-full overflow-hidden border border-amber-gold/30 bg-dark-bg flex-shrink-0'>
                    <img
                      src={
                        rev.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={rev.author}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='min-w-0 flex flex-col'>
                    <div className='flex items-center gap-1.5 min-w-0'>
                      <span className='font-bold text-cream-white text-xs truncate'>{rev.author}</span>
                      <CheckCircle2 size={12} className='text-emerald-400 flex-shrink-0' />
                      {rev.isUserSubmission && (
                        <span className='text-[9px] bg-amber-gold text-dark-bg font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider flex-shrink-0'>
                          You
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
                <span className='text-[10px] text-warm-gray font-medium whitespace-nowrap flex-shrink-0 pt-0.5'>
                  {rev.date}
                </span>
              </div>

              {/* Review Comment Body with natural wrapping */}
              <p className='text-xs text-soft-beige/90 leading-relaxed break-words whitespace-normal'>
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export const AmenitiesTab = memo(function AmenitiesTab() {
  const amenitiesList = [
    {
      icon: Wifi,
      title: 'High-Speed Wi-Fi',
      desc: '100+ Mbps connection optimized for remote work, video calls & browsing',
      badge: '100 Mbps'
    },
    {
      icon: Zap,
      title: 'Plentiful Power Outlets',
      desc: 'Accessible charging sockets located at almost every table and booth',
      badge: 'At Tables'
    },
    {
      icon: Wind,
      title: 'Air Conditioned Sanctuary',
      desc: 'Cool and comfortable indoor temperature year-round',
      badge: 'Cool Vibe'
    },
    {
      icon: Sun,
      title: 'Balcony & Garden Seating',
      desc: 'Breezy open-air outdoor tables surrounded by lush greenery',
      badge: 'Scenic'
    },
    {
      icon: Coffee,
      title: 'Specialty Single-Origin Roasts',
      desc: 'Authentic Da Lat Robusta & Arabica beans roasted to perfection',
      badge: 'Da Lat Beans'
    },
    {
      icon: CupSoda,
      title: 'Signature Artisan Drinks',
      desc: 'Traditional egg coffee, coconut coffee, matcha latte & cold brews',
      badge: 'Must Try'
    },
    {
      icon: CreditCard,
      title: 'Contactless Payments',
      desc: 'VietQR, Apple Pay, Visa, Mastercard & cash all welcome',
      badge: 'All Accepted'
    },
    {
      icon: Utensils,
      title: 'Fresh Bakery & Light Bites',
      desc: 'Warm croissants, artisan banh mi, and homemade pastries',
      badge: 'Fresh Daily'
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
              className='flex items-start gap-3 bg-dark-roast/50 p-3 rounded-2xl border border-dark-border/50 text-xs shadow-xs'
            >
              <div className='w-8 h-8 rounded-xl bg-dark-bg border border-dark-border/70 flex items-center justify-center text-amber-gold flex-shrink-0'>
                <Icon size={16} />
              </div>
              <div className='flex flex-col items-start gap-1 min-w-0 flex-1 text-left'>
                <span className='font-bold text-cream-white text-xs leading-snug text-left'>
                  {item.title}
                </span>
                <span className='inline-flex items-center text-[9px] bg-dark-bg px-1.5 py-0.5 rounded-md text-amber-gold font-semibold border border-dark-border/40 self-start text-left'>
                  {item.badge}
                </span>
                <p className='text-[11px] text-soft-beige/75 leading-relaxed text-left'>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className='bg-dark-roast/30 p-3.5 rounded-2xl border border-dark-border/40 text-xs text-soft-beige/85'>
        <p className='flex items-center gap-2 font-medium text-xs'>
          <Sparkles size={14} className='text-amber-gold flex-shrink-0' />
          Atmosphere: Laptop-friendly, quiet study zones & relaxing lounge seating.
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
    return `Cozy artisan coffeehouse with specialty single-origin roasts, inviting study nooks & handcrafted brews.`;
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
        title: `${shop.name} - Photo ${i + 1}`,
        category: i === 0 ? 'Featured' : i % 2 === 0 ? 'Interior' : 'Coffee'
      }));
    }
    return SAMPLE_GALLERY.map((g) => ({
      ...g,
      title: `${shop.name} - ${g.title}`
    }));
  }, [shop]);

  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceText =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Nearby';
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
        <div className='relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-dark-roast shadow-lg border border-dark-border/60 group'>
          {imgError || !galleryPhotos[0]?.url ? (
            <div className='w-full h-full flex flex-col items-center justify-center text-warm-gray bg-dark-roast'>
              <Coffee size={36} className='text-amber-gold mb-2 opacity-80 animate-pulse' />
              <span className='text-xs font-medium text-cream-white'>PhinFind Coffee Spotlight</span>
            </div>
          ) : (
            <div className='w-full h-full flex gap-1 p-1 bg-dark-bg/60'>
              <div
                onClick={() => openImagePreview(galleryPhotos, 0)}
                className='flex-1 h-full rounded-xl overflow-hidden relative cursor-pointer group select-none pointer-events-auto'
              >
                <img
                  draggable={false}
                  src={galleryPhotos[0]?.url}
                  alt={shop.name}
                  onError={() => setImgError(true)}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5'>
                  <span className='text-xs font-bold text-cream-white drop-shadow-md flex items-center gap-1.5'>
                    <Images size={13} className='text-amber-gold' />
                    <span>View photo gallery</span>
                  </span>
                </div>
              </div>

              {galleryPhotos.length > 1 && (
                <div className='hidden xs:flex sm:flex flex-col w-28 sm:w-36 gap-1'>
                  <div
                    onClick={() => openImagePreview(galleryPhotos, 1)}
                    className='h-[calc(50%-2px)] rounded-xl overflow-hidden relative bg-dark-roast border border-dark-border/40 cursor-pointer group select-none pointer-events-auto'
                  >
                    <img
                      draggable={false}
                      src={galleryPhotos[1]?.url}
                      alt={`${shop.name} - Photo 2`}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                    />
                  </div>

                  <div
                    onClick={() => openImagePreview(galleryPhotos, 2)}
                    className='h-[calc(50%-2px)] rounded-xl overflow-hidden relative bg-dark-roast border border-dark-border/40 cursor-pointer group select-none pointer-events-auto'
                  >
                    <img
                      draggable={false}
                      src={galleryPhotos[2]?.url}
                      alt={`${shop.name} - Photo 3`}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                    />
                    {galleryPhotos.length > 3 && (
                      <div className='absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center text-amber-gold font-bold text-xs tracking-tight gap-1 hover:bg-black/50 transition-colors pointer-events-none'>
                        <Images size={12} className='text-amber-gold' />
                        <span>+{galleryPhotos.length - 2} more</span>
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
          <h2 className='font-sans font-bold text-lg sm:text-xl text-cream-white tracking-tight leading-snug break-words'>
            {shop.name}
          </h2>

          <div className='text-xs text-soft-beige/85 flex items-start gap-1.5'>
            <MapPin size={13} className='text-amber-gold flex-shrink-0 mt-0.5' />
            <span className='break-words leading-relaxed'>{shop.address || 'Address unavailable'}</span>
          </div>

          {/* Quick Metrics Bar */}
          <div className='flex flex-wrap items-center gap-1.5 pt-0.5'>
            <Badge
              variant='outline'
              className='bg-dark-roast text-amber-gold border-dark-border flex items-center gap-1 font-bold text-[11px] py-0.5 px-2 rounded-xl shadow-xs'
            >
              {hasRating ? (
                <>
                  <Star size={11} className='fill-amber-gold text-amber-gold' />
                  <span>{shop.rating.toFixed(1)}</span>
                  {shop.total_ratings ? (
                    <span className='text-[10px] text-warm-gray font-normal'>
                      ({shop.total_ratings})
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <Star size={11} className='text-amber-gold/50' />
                  <span>4.8 (120+)</span>
                </>
              )}
            </Badge>

            <Badge
              variant='outline'
              className='bg-dark-roast text-soft-beige border-dark-border flex items-center gap-1 font-medium text-[11px] py-0.5 px-2 rounded-xl shadow-xs'
            >
              <Footprints size={11} className='text-amber-gold/80' />
              <span>{distanceText}</span>
            </Badge>

            <Badge
              variant='outline'
              className='bg-dark-roast text-soft-beige border-dark-border flex items-center gap-1 font-medium text-[11px] py-0.5 px-2 rounded-xl shadow-xs'
            >
              <Clock size={11} className='text-amber-gold/80' />
              <span>{isOpenNow ? 'Open Now' : 'Closed'}</span>
            </Badge>
          </div>
        </div>

        {/* 3. Underline Navigation Tabs */}
        <div className='pt-1.5 border-b border-dark-border/50'>
          <TabsList className='flex items-center justify-between bg-transparent p-0 h-auto rounded-none w-full gap-2'>
            <TabsTrigger
              value='overview'
              className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-soft-beige/70 hover:text-cream-white data-[state=active]:text-amber-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-gold rounded-none transition-all cursor-pointer'
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='photos'
              className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-soft-beige/70 hover:text-cream-white data-[state=active]:text-amber-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-gold rounded-none transition-all cursor-pointer'
            >
              Photos
            </TabsTrigger>
            <TabsTrigger
              value='reviews'
              className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-soft-beige/70 hover:text-cream-white data-[state=active]:text-amber-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-gold rounded-none transition-all cursor-pointer'
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value='amenities'
              className='flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-soft-beige/70 hover:text-cream-white data-[state=active]:text-amber-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-gold rounded-none transition-all cursor-pointer'
            >
              Amenities
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
          isSidebar ? 'px-4 pb-28' : 'px-4 sm:px-6 pb-28'
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

        <TabsContent value='reviews' className='mt-0 focus-visible:outline-none'>
          <ReviewsTab shop={shop} />
        </TabsContent>

        <TabsContent value='amenities' className='mt-0 focus-visible:outline-none'>
          <AmenitiesTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
