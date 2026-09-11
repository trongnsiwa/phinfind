'use client';

import {
  Check,
  ChevronRight,
  Coffee,
  Compass,
  Copy,
  Footprints,
  Globe,
  Navigation,
  Phone,
  Quote,
  Sparkles,
  Star,
  Tag
} from 'lucide-react';
import React, { memo, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { cleanCategoryLabel } from '@/lib/utils/placeholders';
import type { CoffeeShop } from '@/types/shop';
import { SchedulePanel } from './SchedulePanel';
import type { ComputedSchedule } from './types';

export const OverviewTab = memo(function OverviewTab({
  shop,
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
  const hasRatings =
    typeof shop.rating === 'number' &&
    shop.rating > 0 &&
    shop.total_ratings &&
    shop.total_ratings > 0;
  const ratingScorePercent = hasRatings
    ? Math.min(Math.round(((shop.rating || 0) / 5) * 100), 100)
    : 0;
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
        <SchedulePanel scheduleInfo={scheduleInfo} />

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
