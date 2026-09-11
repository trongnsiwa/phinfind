'use client';

import { Sparkles, Tag } from 'lucide-react';
import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { cleanCategoryLabel } from '@/lib/utils/placeholders';
import type { CoffeeShop } from '@/types/shop';
import { PREDEFINED_AMENITIES_MAP } from './constants';
import type { AmenitiesTabProps } from './types';

export { type AmenitiesTabProps };

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
