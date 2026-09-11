'use client';

import React, { memo, useMemo } from 'react';
import { EmptyIllustration } from '@/components/common/EmptyIllustration';
import { ShopImage } from '@/components/common/ShopImage';
import { Badge } from '@/components/ui/badge';
import { useShopReviews } from '@/hooks/useShops';
import { useUIStore } from '@/stores/useUIStore';
import type { CoffeeShop } from '@/types/shop';
import type { GalleryPhoto } from './types';

export const PhotosTab = memo(function PhotosTab({
  shop,
  photos
}: {
  shop: CoffeeShop;
  photos?: GalleryPhoto[];
}) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const placeId = shop.place_id || shop.id || '';
  const { data: reviews = [] } = useShopReviews(photos ? '' : placeId);

  const photoList = useMemo(() => {
    if (photos) return photos;

    const list: GalleryPhoto[] = [];
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
                title: `${shop.name} - Đánh giá từ ${rev.author || 'cộng đồng'}`,
                category: 'Từ đánh giá cộng đồng',
                isCommunity: true
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
            <ShopImage
              src={item.url}
              alt={item.title}
              sizes="(max-width: 640px) 33vw, 12vw"
              imageClassName='object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
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
