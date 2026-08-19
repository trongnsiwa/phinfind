'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import {
  X,
  Heart,
  MapPin,
  Star,
  Footprints,
  Navigation,
  Share2,
  Coffee,
  Clock,
  Wifi,
  Sparkles,
  Wind,
  Zap,
  CupSoda,
  Sun,
  CreditCard,
  Utensils,
  Phone,
  Globe,
  Copy,
  Check,
  CheckCircle2,
  Compass,
  Images,
  Flame,
  ChevronRight,
  ChevronDown,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoffeeShop } from '@/types/shop';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ShopDrawerProps {
  shop: CoffeeShop | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (placeId: string) => void;
  isFavorite?: boolean;
}

// Curated high-res coffeehouse atmosphere photography gallery
const SAMPLE_GALLERY = [
  {
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    title: 'Warm Rustic Espresso Bar & Seating',
    category: 'Interior',
  },
  {
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    title: 'Signature Handcrafted Latte Art',
    category: 'Coffee',
  },
  {
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    title: 'Sunlit Window Study Nook with Natural Light',
    category: 'Ambience',
  },
  {
    url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
    title: 'Artisan Vietnamese Phin Drip Station',
    category: 'Coffee',
  },
  {
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    title: 'Quiet Second-Floor Laptop Work Sanctuary',
    category: 'Workspace',
  },
  {
    url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
    title: 'Breezy Balcony Garden Patio Seating',
    category: 'Outdoor',
  },
];

// Curated customer pull quotes and testimonials
const MOCK_REVIEWS = [
  {
    author: 'Minh Anh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 days ago',
    highlight: 'Best Salted Egg Coffee in Town',
    comment:
      'The signature traditional phin drip with sweetened condensed milk and salted cream is phenomenal. Quiet second-floor space with fast Wi-Fi and plenty of outlets for remote work.',
  },
  {
    author: 'Thanh Tùng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 week ago',
    highlight: 'Cozy Work & Study Vibe',
    comment:
      'Cozy, authentic vibes and friendly baristas. Great selection of specialty single-origin beans from Da Lat and refreshing cold brew.',
  },
  {
    author: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 weeks ago',
    highlight: 'Airy Ambience & Great Music',
    comment:
      'Loved the sunlit ambiance and gentle acoustic playlist. Perfect spot for reading or casual coffee dates. Definitely try their homemade pastries!',
  },
];

// Snap points: 50% preview and 92% full height expansion
const SNAP_POINTS = [0.5, 0.92];

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
    formatted: `${displayH}:${displayM} ${period}`,
  };
}

export function getShopSchedule(openingHours?: CoffeeShop['opening_hours']): ComputedSchedule {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const DAYS_ORDER = [
    { name: 'Monday', short: 'Mon', index: 1 },
    { name: 'Tuesday', short: 'Tue', index: 2 },
    { name: 'Wednesday', short: 'Wed', index: 3 },
    { name: 'Thursday', short: 'Thu', index: 4 },
    { name: 'Friday', short: 'Fri', index: 5 },
    { name: 'Saturday', short: 'Sat', index: 6 },
    { name: 'Sunday', short: 'Sun', index: 0 },
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
          isOpenDay: false,
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
        isOpenDay: true,
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
      peakVibeTime: '08:30 AM – 10:00 AM',
    };
  }

  // Fallback when periods are not available
  const defaultOpenMinutes = 7 * 60; // 07:00 AM
  const defaultCloseMinutes = 22 * 60 + 30; // 10:30 PM
  const isWithinDefaultHours = currentMinutes >= defaultOpenMinutes && currentMinutes < defaultCloseMinutes;
  const isOpenNow = openingHours?.open_now !== undefined ? openingHours.open_now : isWithinDefaultHours;

  const scheduleList: DaySchedule[] = DAYS_ORDER.map((d) => ({
    dayName: d.name,
    dayShort: d.short,
    dayIndex: d.index,
    isToday: d.index === currentDay,
    timeText: d.index === 0 || d.index === 6 ? '07:00 AM – 11:00 PM' : '07:00 AM – 10:30 PM',
    isOpenDay: true,
  }));

  const todaySchedule = scheduleList.find((s) => s.isToday);
  const statusText = isOpenNow ? 'Open Now • Closes 10:30 PM' : 'Closed • Opens 07:00 AM';

  return {
    isOpenNow,
    statusText,
    scheduleList,
    todaySchedule,
    isApproximate: true,
    peakVibeTime: '08:30 AM – 10:00 AM',
  };
}

// Memoized Overview Tab
const OverviewTab = memo(function OverviewTab({
  shop,
  experienceTagline,
  getDirectionsUrl,
  onSelectShop,
  similarShops,
  scheduleInfo,
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
  const isOpenNow = scheduleInfo.isOpenNow;
  const validRating = shop.rating && shop.rating > 0 ? shop.rating : 4.8;
  const ratingScorePercent = Math.min(Math.round((validRating / 5) * 100), 100);
  const distanceText = shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Nearby';

  const handleCopyAddress = () => {
    if (shop.address) {
      navigator.clipboard.writeText(shop.address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Popular Spot in Town Banner with Social Proof */}
      <div className="bg-gradient-to-r from-amber-gold/15 via-dark-roast to-dark-roast/80 p-3.5 rounded-2xl border border-amber-gold/30 space-y-2 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-gold font-bold text-xs tracking-wide">
            <Flame size={14} className="text-amber-gold animate-pulse" />
            <span>Popular Spot in Town</span>
          </div>
          <span className="text-[11px] text-soft-beige/90 bg-dark-bg/70 px-2.5 py-0.5 rounded-full border border-dark-border/50 font-medium">
            ⚡️ 32 coffee lovers checked in today
          </span>
        </div>
        <p className="text-xs text-soft-beige leading-relaxed font-medium">
          {experienceTagline}
        </p>
      </div>

      {/* 2. Signature Recommendation Section */}
      <div className="bg-dark-roast/50 p-3.5 rounded-2xl border border-dark-border/60 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-gold/10 border border-amber-gold/30 flex items-center justify-center text-amber-gold flex-shrink-0 mt-0.5">
          <Coffee size={16} />
        </div>
        <div className="space-y-0.5 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-amber-gold uppercase tracking-wider block">
            Signature Recommendation
          </span>
          <p className="text-xs font-semibold text-cream-white leading-snug">
            Traditional Phin Drip with Condensed Milk & Salted Cream Foam
          </p>
          <p className="text-[11px] text-soft-beige/75">
            Handcrafted with slow-dripped single-origin Da Lat beans.
          </p>
        </div>
      </div>

      {/* 3. Amenities Grid with Friendly Labels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="flex items-center gap-2 bg-dark-roast/70 border border-dark-border/60 p-2.5 rounded-xl text-soft-beige shadow-xs">
          <Wifi size={14} className="text-amber-gold flex-shrink-0" />
          <span className="text-xs font-medium truncate">Fast Wi-Fi</span>
        </div>
        <div className="flex items-center gap-2 bg-dark-roast/70 border border-dark-border/60 p-2.5 rounded-xl text-soft-beige shadow-xs">
          <Zap size={14} className="text-amber-gold flex-shrink-0" />
          <span className="text-xs font-medium truncate">Charging Sockets</span>
        </div>
        <div className="flex items-center gap-2 bg-dark-roast/70 border border-dark-border/60 p-2.5 rounded-xl text-soft-beige shadow-xs">
          <Wind size={14} className="text-amber-gold flex-shrink-0" />
          <span className="text-xs font-medium truncate">Air Conditioned</span>
        </div>
        <div className="flex items-center gap-2 bg-dark-roast/70 border border-dark-border/60 p-2.5 rounded-xl text-soft-beige shadow-xs">
          <Sun size={14} className="text-amber-gold flex-shrink-0" />
          <span className="text-xs font-medium truncate">Outdoor Patio</span>
        </div>
      </div>

      {/* 4. Explorer Satisfaction Rating Card */}
      <div className="bg-dark-roast/40 p-3.5 rounded-2xl border border-dark-border/50 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-soft-beige font-medium">Explorer Satisfaction Rating</span>
          <span className="font-bold text-amber-gold">{ratingScorePercent}% positive</span>
        </div>
        <Progress value={ratingScorePercent} className="h-2 bg-dark-bg border border-dark-border/50" />
        <div className="flex items-center justify-between text-[11px] text-warm-gray pt-0.5">
          <span>Based on {shop.total_ratings || 120}+ verified explorer ratings</span>
          <span className="text-amber-gold font-semibold">★ {validRating.toFixed(1)} / 5.0</span>
        </div>
      </div>

      {/* 5. What People Love Section (Review Pull Quotes) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cream-white flex items-center gap-1.5">
            <Quote size={13} className="text-amber-gold" />
            What People Love
          </span>
          <span className="text-[11px] text-amber-gold font-medium">
            4.8 ★★★★★
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MOCK_REVIEWS.slice(0, 2).map((rev, idx) => (
            <div
              key={idx}
              className="bg-dark-roast/40 p-3 rounded-2xl border border-dark-border/50 space-y-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-5 h-5 rounded-full object-cover border border-amber-gold/40"
                />
                <span className="font-bold text-cream-white text-xs">{rev.author}</span>
                <span className="text-[10px] text-amber-gold ml-auto font-semibold">
                  "{rev.highlight}"
                </span>
              </div>
              <p className="text-[11px] text-soft-beige/85 leading-relaxed line-clamp-2">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Opening Hours & Contact Card (Collapsible Google Maps-Style) */}
      <div className="bg-dark-roast/40 p-3.5 rounded-2xl border border-dark-border/50 space-y-2.5 text-xs transition-all">
        {/* Clickable Header Accordion Trigger */}
        <button
          type="button"
          onClick={() => setIsHoursExpanded((prev) => !prev)}
          aria-expanded={isHoursExpanded}
          aria-controls="weekly-schedule-panel"
          className="w-full flex items-center justify-between gap-3 text-left group/hours focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-gold/10 border border-amber-gold/25 flex items-center justify-center text-amber-gold flex-shrink-0">
              <Clock size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-cream-white text-xs block group-hover/hours:text-amber-gold transition-colors">
                  Opening Hours
                </span>
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    scheduleInfo.isOpenNow ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]'
                  )}
                />
              </div>
              <p className="text-[11px] text-soft-beige/80 truncate">
                <span className={cn('font-semibold', scheduleInfo.isOpenNow ? 'text-[#A3D9B1]' : 'text-[#E8A5A5]')}>
                  {scheduleInfo.isOpenNow ? 'Open Now' : 'Closed'}
                </span>
                {scheduleInfo.todaySchedule && (
                  <span className="text-soft-beige/65"> • Today: {scheduleInfo.todaySchedule.timeText}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 bg-dark-bg/60 border border-dark-border/40 px-2 py-1 rounded-xl group-hover/hours:border-amber-gold/40 transition-colors">
            <span className="text-[10px] font-semibold text-amber-gold">
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

        {/* Collapsible Weekly Schedule & Peak Vibe Container */}
        <div
          id="weekly-schedule-panel"
          className={cn(
            'grid transition-all duration-300 ease-in-out overflow-hidden',
            isHoursExpanded
              ? 'grid-rows-[1fr] opacity-100 mt-2.5 pt-2.5 border-t border-dark-border/40'
              : 'grid-rows-[0fr] opacity-0 mt-0 pt-0'
          )}
        >
          <div className="min-h-0 space-y-2.5">
            {/* Peak Vibe Recommendation Callout */}
            <div className="flex items-center gap-2 bg-dark-bg/70 border border-dark-border/40 px-3 py-2 rounded-xl text-[11px] text-amber-gold">
              <Sparkles size={13} className="text-amber-gold flex-shrink-0" />
              <span className="font-medium">
                <strong className="text-cream-white font-semibold">Peak Vibe:</strong> {scheduleInfo.peakVibeTime} — best time for slow pour-overs and calm seating.
              </span>
            </div>

            {/* 7-Day Google Maps-Style Weekly Table */}
            <div className="bg-dark-bg/80 rounded-xl border border-dark-border/40 p-2 space-y-1">
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
                  <div className="flex items-center gap-2">
                    {day.isToday ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-gold animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-warm-gray/30" />
                    )}
                    <span className={cn(day.isToday && 'text-amber-gold')}>{day.dayName}</span>
                    {day.isToday && (
                      <span className="text-[9px] uppercase tracking-wider bg-amber-gold text-dark-bg px-1.5 py-0.2 rounded font-extrabold ml-1">
                        Today
                      </span>
                    )}
                  </div>
                  <span className={cn('text-[11px]', day.isToday ? 'text-cream-white font-bold' : 'text-soft-beige/70')}>
                    {day.timeText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Info (Phone & Website) */}
        {(shop.phone || shop.website) && (
          <div className="pt-2 border-t border-dark-border/40 space-y-2">
            {shop.phone && (
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-amber-gold flex-shrink-0" />
                <span className="text-[11px] text-warm-gray">Phone:</span>
                <a
                  href={`tel:${shop.phone}`}
                  className="text-amber-gold hover:text-amber-gold-hover hover:underline transition-colors font-medium text-xs ml-auto"
                >
                  {shop.phone}
                </a>
              </div>
            )}

            {shop.website && (
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-amber-gold flex-shrink-0" />
                <span className="text-[11px] text-warm-gray">Website:</span>
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-gold hover:text-amber-gold-hover hover:underline transition-colors font-medium truncate block max-w-[200px] text-xs ml-auto text-right"
                >
                  {shop.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Physical Location & Navigation CTA */}
      <div className="bg-dark-roast/60 p-4 rounded-2xl border border-dark-border/60 space-y-3.5 shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold text-amber-gold uppercase tracking-wider block">
              Physical Location
            </span>
            <p className="text-xs sm:text-sm font-semibold text-cream-white leading-snug">
              {shop.address || 'Address information unavailable'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyAddress}
            aria-label="Copy address"
            className="h-8 w-8 rounded-xl bg-dark-bg/80 text-soft-beige hover:text-amber-gold hover:bg-dark-roast border border-dark-border/60 flex-shrink-0"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-dark-bg/70 p-2.5 rounded-xl border border-dark-border/40 flex items-center gap-2">
            <Footprints size={15} className="text-amber-gold flex-shrink-0" />
            <div>
              <span className="text-[10px] text-warm-gray block">Distance</span>
              <span className="font-bold text-cream-white text-xs">{distanceText}</span>
            </div>
          </div>

          <div className="bg-dark-bg/70 p-2.5 rounded-xl border border-dark-border/40 flex items-center gap-2">
            <Compass size={15} className="text-amber-gold flex-shrink-0" />
            <div>
              <span className="text-[10px] text-warm-gray block">GPS Coordinates</span>
              <span className="font-bold text-cream-white text-xs">
                {shop.lat.toFixed(4)}, {shop.lon.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* High-Energy Directions Button */}
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="block pt-1"
        >
          <Button className="w-full h-12 bg-gradient-to-r from-amber-gold to-[#E5B56D] text-dark-bg hover:brightness-110 font-bold text-sm rounded-xl shadow-lg shadow-amber-gold/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2">
            <Navigation size={16} className="fill-dark-bg" />
            Go There Now • Open in Google Maps
          </Button>
        </a>
      </div>

      {/* 8. "You Might Also Like" Nearby Recommendations */}
      {similarShops.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cream-white flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-gold" />
              You Might Also Like
            </span>
            <span className="text-[11px] text-soft-beige/70">Nearby spots</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {similarShops.slice(0, 2).map((simShop) => (
              <div
                key={simShop.id}
                onClick={() => onSelectShop(simShop)}
                className="bg-dark-roast/40 hover:bg-dark-roast/80 p-2.5 rounded-2xl border border-dark-border/50 flex items-center gap-2.5 cursor-pointer transition-all hover:border-amber-gold/40 group"
              >
                <div className="w-12 h-12 rounded-xl bg-dark-bg overflow-hidden flex-shrink-0 border border-dark-border/40">
                  <img
                    src={simShop.photos?.[0] || SAMPLE_GALLERY[0].url}
                    alt={simShop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-bold text-cream-white text-xs block truncate group-hover:text-amber-gold transition-colors">
                    {simShop.name}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-warm-gray">
                    <Star size={10} className="fill-amber-gold text-amber-gold" />
                    <span>{(simShop.rating || 4.5).toFixed(1)}</span>
                    <span>•</span>
                    <span>{simShop.distance_text || 'Nearby'}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-warm-gray group-hover:text-amber-gold transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Memoized Photos Tab (6+ Curated Atmosphere Photos with Category Tags)
const PhotosTab = memo(function PhotosTab({ shop }: { shop: CoffeeShop }) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);

  const photoList = useMemo(() => {
    if (shop.photos && shop.photos.length > 0) {
      return shop.photos.map((url, i) => ({
        url,
        title: `${shop.name} - Photo ${i + 1}`,
        category: i === 0 ? 'Featured' : i % 2 === 0 ? 'Interior' : 'Coffee',
      }));
    }
    return SAMPLE_GALLERY.map((g) => ({
      ...g,
      title: `${shop.name} - ${g.title}`,
    }));
  }, [shop]);

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-cream-white block">Atmosphere & Gallery</span>
          <span className="text-[11px] text-soft-beige/70">{photoList.length} curated explorer photos</span>
        </div>
        <Badge variant="outline" className="bg-dark-roast text-amber-gold border-dark-border text-[10px] font-bold">
          Full-Screen View
        </Badge>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {photoList.map((item, idx) => (
          <div
            key={idx}
            onClick={() => openImagePreview(photoList, idx)}
            className="group relative h-28 sm:h-36 rounded-2xl overflow-hidden bg-dark-roast border border-dark-border/60 cursor-pointer shadow-md active:scale-95 transition-transform select-none pointer-events-auto"
          >
            <img
              draggable={false}
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-[10px] font-semibold text-cream-white truncate">
                {item.title}
              </span>
            </div>
            <div className="absolute top-1.5 right-1.5 bg-dark-bg/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-bold text-amber-gold border border-dark-border/40">
              {item.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Memoized Reviews Tab
const ReviewsTab = memo(function ReviewsTab({ shop }: { shop: CoffeeShop }) {
  const rating = shop.rating && shop.rating > 0 ? shop.rating : 4.8;
  const total = shop.total_ratings || 128;

  return (
    <div className="space-y-4 pb-16">
      {/* Rating Breakdown Score Card */}
      <div className="bg-dark-roast/50 p-4 rounded-2xl border border-dark-border/60 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start min-w-[100px]">
          <span className="text-4xl font-extrabold text-cream-white tracking-tight">
            {rating.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 text-amber-gold my-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={star <= Math.round(rating) ? 'fill-amber-gold text-amber-gold' : 'text-dark-border'}
              />
            ))}
          </div>
          <span className="text-[11px] text-warm-gray">{total} Verified Reviews</span>
        </div>

        {/* Rating Distribution Bars */}
        <div className="flex-1 w-full space-y-1.5 text-xs text-soft-beige">
          {[
            { star: 5, pct: 84 },
            { star: 4, pct: 11 },
            { star: 3, pct: 3 },
            { star: 2, pct: 1 },
            { star: 1, pct: 1 },
          ].map((bar) => (
            <div key={bar.star} className="flex items-center gap-2">
              <span className="w-3 text-right text-[10px] text-warm-gray">{bar.star}</span>
              <div className="flex-1 h-2 bg-dark-bg rounded-full overflow-hidden border border-dark-border/40">
                <div
                  className="h-full bg-amber-gold rounded-full transition-all duration-500"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-[10px] text-warm-gray font-medium">{bar.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Comments Feed */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-cream-white block">
          Community Highlights & Stories
        </span>
        {MOCK_REVIEWS.map((rev, idx) => (
          <div
            key={idx}
            className="bg-dark-roast/40 p-3.5 rounded-2xl border border-dark-border/50 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-6 h-6 rounded-full object-cover border border-amber-gold/40"
                />
                <span className="font-bold text-cream-white text-xs">{rev.author}</span>
                <CheckCircle2 size={12} className="text-emerald-400" />
              </div>
              <span className="text-[10px] text-warm-gray">{rev.date}</span>
            </div>
            <div className="flex items-center gap-0.5 text-amber-gold">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} size={11} className="fill-amber-gold text-amber-gold" />
              ))}
            </div>
            <p className="text-xs text-soft-beige leading-relaxed">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

// Memoized Amenities Tab ("Amenities & Features")
const AmenitiesTab = memo(function AmenitiesTab() {
  const amenitiesList = [
    {
      icon: Wifi,
      title: 'High-Speed Wi-Fi',
      desc: '100+ Mbps connection optimized for remote work, video calls & browsing',
      badge: '100 Mbps',
    },
    {
      icon: Zap,
      title: 'Plentiful Power Outlets',
      desc: 'Accessible charging sockets located at almost every table and booth',
      badge: 'At Tables',
    },
    {
      icon: Wind,
      title: 'Air Conditioned Sanctuary',
      desc: 'Cool and comfortable indoor temperature year-round',
      badge: 'Cool Vibe',
    },
    {
      icon: Sun,
      title: 'Balcony & Garden Seating',
      desc: 'Breezy open-air outdoor tables surrounded by lush greenery',
      badge: 'Scenic',
    },
    {
      icon: Coffee,
      title: 'Specialty Single-Origin Roasts',
      desc: 'Authentic Da Lat Robusta & Arabica beans roasted to perfection',
      badge: 'Da Lat Beans',
    },
    {
      icon: CupSoda,
      title: 'Signature Artisan Drinks',
      desc: 'Traditional egg coffee, coconut coffee, matcha latte & cold brews',
      badge: 'Must Try',
    },
    {
      icon: CreditCard,
      title: 'Contactless Payments',
      desc: 'VietQR, Apple Pay, Visa, Mastercard & cash all welcome',
      badge: 'All Accepted',
    },
    {
      icon: Utensils,
      title: 'Fresh Bakery & Light Bites',
      desc: 'Warm croissants, artisan banh mi, and homemade pastries',
      badge: 'Fresh Daily',
    },
  ];

  return (
    <div className="space-y-4 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {amenitiesList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-3 bg-dark-roast/50 p-3 rounded-2xl border border-dark-border/50 text-xs shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-dark-bg border border-dark-border/70 flex items-center justify-center text-amber-gold flex-shrink-0">
                <Icon size={16} />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-cream-white text-xs">{item.title}</span>
                  <span className="text-[9px] bg-dark-bg px-1.5 py-0.5 rounded-md text-amber-gold font-semibold border border-dark-border/40 flex-shrink-0">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-soft-beige/75 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-dark-roast/30 p-3.5 rounded-2xl border border-dark-border/40 text-xs text-soft-beige/85">
        <p className="flex items-center gap-2 font-medium text-xs">
          <Sparkles size={14} className="text-amber-gold flex-shrink-0" />
          Atmosphere: Laptop-friendly, quiet study zones & relaxing lounge seating.
        </p>
      </div>
    </div>
  );
});

export function ShopDrawer({
  shop,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite = false,
}: ShopDrawerProps) {
  const { shops, setSelectedShop } = useShopStore();
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | string | null>(0.5);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'amenities'>('overview');
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // When drawer opens, reset snap point to 0.5 preview and reset tab/scroll
  useEffect(() => {
    if (shop && isOpen) {
      setImgError(false);
      setActiveTab('overview');
      setActiveSnapPoint(0.5);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [shop?.id, isOpen]);

  // Reset scroll position on tab switch
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Handle URL query parameter synchronization & browser back button
  useEffect(() => {
    if (!shop || !isOpen || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const currentShopParam = url.searchParams.get('shop');

    if (currentShopParam !== shop.id) {
      url.searchParams.set('shop', shop.id);
      window.history.pushState({ shopDrawer: true, shopId: shop.id }, '', url.pathname + url.search);
    }

    const handlePopState = () => {
      const currentUrl = new URL(window.location.href);
      if (!currentUrl.searchParams.get('shop')) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shop, isOpen, onClose]);

  // Revert URL query parameter when drawer closes
  const handleDrawerClose = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('shop')) {
        url.searchParams.delete('shop');
        const newSearch = url.searchParams.toString();
        const newUrl = url.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.pushState(null, '', newUrl);
      }
    }
    onClose();
  };

  const handleFavoriteClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!shop) return;
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id);
  };

  const handleShare = () => {
    if (!shop || typeof window === 'undefined') return;
    const url = `${window.location.origin}/?shop=${shop.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: shop.name,
          text: `Check out ${shop.name} on PhinFind!`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const getDirectionsUrl = () => {
    if (!shop) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`;
  };

  // Convert technical category tags into warm, inviting experience copy
  const experienceTagline = useMemo(() => {
    if (!shop) return 'Artisan Vietnamese coffee spot featuring specialty beans and a relaxing atmosphere.';
    return `Cozy artisan coffeehouse with specialty single-origin roasts, inviting study nooks & handcrafted brews.`;
  }, [shop]);

  // Similar nearby shops for discovery
  const similarShops = useMemo(() => {
    if (!shop || !shops) return [];
    return shops.filter((s) => s.id !== shop.id).slice(0, 3);
  }, [shop, shops]);

  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const isImagePreviewOpen = useUIStore((state) => state.imagePreview.isOpen);

  // Gallery photos for full-screen viewer
  const galleryPhotos = useMemo(() => {
    if (shop?.photos && shop.photos.length > 0) {
      return shop.photos.map((url, i) => ({
        url,
        title: `${shop.name} - Photo ${i + 1}`,
        category: i === 0 ? 'Featured' : i % 2 === 0 ? 'Interior' : 'Coffee',
      }));
    }
    return SAMPLE_GALLERY.map((g) => ({
      ...g,
      title: `${shop?.name || 'Coffee Shop'} - ${g.title}`,
    }));
  }, [shop]);

  // Compute live day-by-day schedule & real open/closed status
  const scheduleInfo = useMemo(() => getShopSchedule(shop?.opening_hours), [shop?.opening_hours]);

  if (!shop) return null;

  const isOpenNow = scheduleInfo.isOpenNow;
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceText = shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Nearby';

  const charCodeSum = (shop.id || shop.place_id || 'coffee')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const coverImage = shop.photos?.[0] || SAMPLE_GALLERY[charCodeSum % SAMPLE_GALLERY.length].url;

  return (
    <DrawerPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (isImagePreviewOpen) return;
          handleDrawerClose();
        }
      }}
      dismissible={!isImagePreviewOpen}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      fadeFromIndex={0}
      direction="bottom"
      shouldScaleBackground={false}
      modal={true}
    >
      <DrawerPrimitive.Portal>
        {/* Backdrop Overlay */}
        <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300" />

        {/* Drawer Content Panel with 100dvh reference for exact 92% snap expansion */}
        <DrawerPrimitive.Content
          aria-describedby="shop-drawer-description"
          onPointerDownOutside={(e) => {
            if (isImagePreviewOpen) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isImagePreviewOpen) e.preventDefault();
          }}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[100dvh] max-h-[100dvh] flex-col rounded-t-[28px] border-t border-x border-dark-border/80 bg-dark-bg/95 backdrop-blur-2xl text-cream-white shadow-2xl max-w-2xl mx-auto focus:outline-none overflow-hidden"
        >
          {/* Main Layout Container with Radix Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as typeof activeTab)}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* FIXED/STICKY HEADER SECTION */}
            <div className="flex-shrink-0 px-4 sm:px-6 pt-0 pb-2 space-y-2 bg-dark-bg/95 backdrop-blur-xl z-10 border-b border-dark-border/40 select-none">
              {/* Native Drag Handle Pill */}
              <DrawerPrimitive.Handle className="mx-auto my-2.5 h-1.5 w-12 rounded-full bg-warm-gray/40 shrink-0 hover:bg-warm-gray/60 active:bg-warm-gray/80 transition-colors cursor-grab active:cursor-grabbing" />

              {/* 1. Dynamic Hero Image Grid (Single vs 60/40 Magazine Split) */}
              <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-dark-bg/80 border border-dark-border/60 flex-shrink-0 p-1 select-none">
                {/* Floating Badges on Top-Left */}
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 pointer-events-none">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-md backdrop-blur-md',
                      isOpenNow
                        ? 'bg-[#7CAE8E]/35 text-[#A3D9B1] border-[#7CAE8E]/60'
                        : 'bg-[#C97A7A]/35 text-[#E8A5A5] border-[#C97A7A]/60'
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full mr-1.5',
                        isOpenNow ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]'
                      )}
                    />
                    {isOpenNow ? 'Open Now' : 'Closed'}
                  </Badge>

                  {shop.price_range && (
                    <Badge
                      variant="secondary"
                      className="bg-dark-bg/80 text-amber-gold border border-dark-border/60 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-md"
                    >
                      {shop.price_range}
                    </Badge>
                  )}
                </div>

                {/* Top Right: Single Clean Close Action */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrawerClose();
                    }}
                    aria-label="Close drawer"
                    className="h-7 w-7 rounded-full bg-dark-bg/80 backdrop-blur-md border border-dark-border/60 text-warm-gray hover:text-cream-white hover:bg-white/10 shadow-md transition-colors active:scale-95 cursor-pointer"
                  >
                    <X size={14} />
                  </Button>
                </div>

                {galleryPhotos.length < 2 || imgError ? (
                  /* Single Full-Width Hero */
                  <div
                    onClick={() => openImagePreview(galleryPhotos, 0)}
                    className="relative w-full h-full rounded-xl overflow-hidden bg-dark-roast cursor-pointer group select-none pointer-events-auto"
                  >
                    {!imgError ? (
                      <img
                        draggable={false}
                        src={coverImage}
                        alt={shop.name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-roast text-warm-gray gap-2">
                        <Coffee size={24} className="text-amber-gold" />
                        <span className="text-xs font-semibold text-soft-beige">{shop.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-black/20 pointer-events-none" />
                  </div>
                ) : (
                  /* 2-Column Multi-Photo Grid (60% Left, 40% Right) */
                  <div className="w-full h-full flex gap-1.5 select-none">
                    {/* Left Column: Primary 60% Image */}
                    <div
                      onClick={() => openImagePreview(galleryPhotos, 0)}
                      className="w-[60%] h-full rounded-xl overflow-hidden relative bg-dark-roast border border-dark-border/40 cursor-pointer group flex-shrink-0 select-none pointer-events-auto"
                    >
                      <img
                        draggable={false}
                        src={galleryPhotos[0]?.url || coverImage}
                        alt={`${shop.name} - Photo 1`}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-transparent to-black/20 pointer-events-none" />
                    </div>

                    {/* Right Column: 40% Width (Stacked) */}
                    <div className="w-[40%] h-full flex flex-col gap-1 flex-1 min-w-0 select-none">
                      {galleryPhotos.length === 2 ? (
                        /* Exactly 2 photos: 1 right image spanning full height */
                        <div
                          onClick={() => openImagePreview(galleryPhotos, 1)}
                          className="w-full h-full rounded-xl overflow-hidden relative bg-dark-roast border border-dark-border/40 cursor-pointer group select-none pointer-events-auto"
                        >
                          <img
                            draggable={false}
                            src={galleryPhotos[1]?.url}
                            alt={`${shop.name} - Photo 2`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        /* 3 or more photos: 2 stacked rows */
                        <>
                          {/* Top Row (50% Height) */}
                          <div
                            onClick={() => openImagePreview(galleryPhotos, 1)}
                            className="h-[calc(50%-2px)] rounded-xl overflow-hidden relative bg-dark-roast border border-dark-border/40 cursor-pointer group select-none pointer-events-auto"
                          >
                            <img
                              draggable={false}
                              src={galleryPhotos[1]?.url}
                              alt={`${shop.name} - Photo 2`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]"
                            />
                          </div>

                          {/* Bottom Row (50% Height) with Optional +N more overlay */}
                          <div
                            onClick={() => openImagePreview(galleryPhotos, 2)}
                            className="h-[calc(50%-2px)] rounded-xl overflow-hidden relative bg-dark-roast border border-dark-border/40 cursor-pointer group select-none pointer-events-auto"
                          >
                            <img
                              draggable={false}
                              src={galleryPhotos[2]?.url}
                              alt={`${shop.name} - Photo 3`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]"
                            />
                            {galleryPhotos.length > 3 && (
                              <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center text-amber-gold font-bold text-xs tracking-tight gap-1 hover:bg-black/50 transition-colors pointer-events-none">
                                <Images size={12} className="text-amber-gold" />
                                <span>+{galleryPhotos.length - 2} more</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Shop Title, Address & Metrics */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <DrawerPrimitive.Title className="font-sans font-bold text-lg sm:text-xl text-cream-white tracking-tight leading-tight">
                    {shop.name}
                  </DrawerPrimitive.Title>
                </div>

                <DrawerPrimitive.Description id="shop-drawer-description" className="text-xs text-soft-beige/85 flex items-start gap-1">
                  <MapPin size={12} className="text-amber-gold flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{shop.address || 'Address unavailable'}</span>
                </DrawerPrimitive.Description>

                {/* Quick Metrics Bar */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <Badge
                    variant="outline"
                    className="bg-dark-roast text-amber-gold border-dark-border flex items-center gap-1 font-bold text-[11px] py-0.5 px-2 rounded-xl shadow-xs"
                  >
                    {hasRating ? (
                      <>
                        <Star size={11} className="fill-amber-gold text-amber-gold" />
                        <span>{shop.rating.toFixed(1)}</span>
                        {shop.total_ratings ? (
                          <span className="text-[10px] text-warm-gray font-normal">
                            ({shop.total_ratings})
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <Star size={11} className="text-amber-gold/50" />
                        <span>4.8 (120+)</span>
                      </>
                    )}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="bg-dark-roast text-soft-beige border-dark-border flex items-center gap-1 font-medium text-[11px] py-0.5 px-2 rounded-xl shadow-xs"
                  >
                    <Footprints size={11} className="text-amber-gold/80" />
                    <span>{distanceText}</span>
                  </Badge>

                  <Badge
                    variant="outline"
                    className="bg-dark-roast text-soft-beige border-dark-border flex items-center gap-1 font-medium text-[11px] py-0.5 px-2 rounded-xl shadow-xs"
                  >
                    <Clock size={11} className="text-amber-gold/80" />
                    <span>{isOpenNow ? 'Open Now' : 'Closed'}</span>
                  </Badge>
                </div>
              </div>

              {/* 3. Google Maps-Style Underline Navigation Tabs */}
              <div className="pt-1.5 border-b border-dark-border/50">
                <TabsList className="flex items-center justify-between bg-transparent p-0 h-auto rounded-none w-full gap-2">
                  <TabsTrigger
                    value="overview"
                    className="flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-soft-beige/70 hover:text-cream-white data-[state=active]:text-amber-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-gold rounded-none transition-all"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="photos"
                    className="flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-soft-beige/70 hover:text-cream-white data-[state=active]:text-amber-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-gold rounded-none transition-all"
                  >
                    Photos
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-soft-beige/70 hover:text-cream-white data-[state=active]:text-amber-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-gold rounded-none transition-all"
                  >
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger
                    value="amenities"
                    className="flex-1 pb-2 pt-1 px-1 font-semibold text-xs text-soft-beige/70 hover:text-cream-white data-[state=active]:text-amber-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-gold rounded-none transition-all"
                  >
                    Amenities
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* SCROLLABLE BODY SECTION with bottom clearance for fixed bar */}
            <div
              ref={scrollContainerRef}
              data-vaul-no-drag
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 pt-3 pb-28"
            >
              <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                <OverviewTab
                  shop={shop}
                  experienceTagline={experienceTagline}
                  getDirectionsUrl={getDirectionsUrl}
                  onSelectShop={(s) => setSelectedShop(s)}
                  similarShops={similarShops}
                  scheduleInfo={scheduleInfo}
                />
              </TabsContent>

              <TabsContent value="photos" className="mt-0 focus-visible:outline-none">
                <PhotosTab shop={shop} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0 focus-visible:outline-none">
                <ReviewsTab shop={shop} />
              </TabsContent>

              <TabsContent value="amenities" className="mt-0 focus-visible:outline-none">
                <AmenitiesTab />
              </TabsContent>
            </div>
          </Tabs>
        </DrawerPrimitive.Content>

        {/* ALWAYS-VISIBLE FIXED BOTTOM ACTION BAR (Positioned in Portal outside DrawerContent) */}
        <div
          data-vaul-no-drag
          className="fixed inset-x-0 bottom-0 z-50 pointer-events-auto bg-dark-bg/95 backdrop-blur-xl border-t border-dark-border/70 px-4 sm:px-6 py-3 shadow-2xl max-w-2xl mx-auto rounded-t-2xl select-none"
        >
          <div className="grid grid-cols-3 gap-2.5">
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-amber-gold text-dark-bg font-bold hover:bg-amber-gold-hover transition-all text-xs shadow-md group active:scale-95 min-h-[44px]"
            >
              <Navigation size={15} className="fill-dark-bg group-hover:scale-110 transition-transform" />
              <span>Directions</span>
            </a>

            <button
              type="button"
              onClick={() => handleFavoriteClick()}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px]',
                isFavorite
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-dark-roast/90 border-dark-border/80 text-soft-beige hover:text-cream-white hover:bg-dark-roast'
              )}
            >
              <Heart
                size={15}
                className={cn(
                  'transition-all duration-200',
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-warm-gray',
                  isHeartAnimating && 'scale-125'
                )}
              />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-dark-roast/90 border border-dark-border/80 text-soft-beige hover:text-cream-white hover:bg-dark-roast transition-all text-xs font-semibold shadow-xs active:scale-95 min-h-[44px]"
            >
              <Share2 size={15} className="text-amber-gold" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
