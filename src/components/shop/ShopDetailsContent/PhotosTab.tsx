'use client';

import { Camera } from 'lucide-react';
import React, { memo, useMemo } from 'react';
import { EmptyIllustration } from '@/components/common/EmptyIllustration';
import { ShopImage } from '@/components/common/ShopImage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useShopReviews } from '@/hooks/useShops';
import { useUIStore } from '@/stores/useUIStore';
import type { GalleryPhoto, PhotosTabProps } from './types';
import { buildGalleryPhotos } from './utils';

export const PhotosTab = memo(function PhotosTab({
  shop,
  photos,
  reviewCount
}: PhotosTabProps) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const placeId = shop.place_id || shop.id || '';
  const { data: reviews = [] } = useShopReviews(photos !== undefined ? '' : placeId);

  const effectiveReviewCount =
    reviewCount !== undefined
      ? reviewCount
      : reviews.length > 0
        ? reviews.length
        : (shop.total_ratings || 0);

  const { officialPhotos, communityPhotos } = useMemo(() => {
    const rawList = photos || buildGalleryPhotos(shop, reviews);
    const seenUrls = new Set<string>();
    const official: GalleryPhoto[] = [];
    const community: GalleryPhoto[] = [];

    // 1. Official photos take precedence
    for (const p of rawList) {
      if (!p.isCommunity && p.url && !seenUrls.has(p.url)) {
        seenUrls.add(p.url);
        official.push(p);
      }
    }

    // 2. Community photos: omit duplicate URLs already present in official photos
    for (const p of rawList) {
      if (p.isCommunity && p.url && !seenUrls.has(p.url)) {
        seenUrls.add(p.url);
        community.push(p);
      }
    }

    return { officialPhotos: official, communityPhotos: community };
  }, [photos, shop, reviews]);

  // Overall empty state: 0 photos across both official and community
  if (officialPhotos.length === 0 && communityPhotos.length === 0) {
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

  const hasReviews = effectiveReviewCount > 0;

  return (
    <div className='space-y-6 pb-16'>
      {/* SECTION 1: Official Shop Photos */}
      <section className='space-y-3' aria-label='Ảnh chính thức từ quán'>
        <div className='flex items-center justify-between'>
          <div>
            <span className='text-xs font-bold text-foreground block'>Không gian &amp; Hình ảnh</span>
            <span className='text-[11px] text-muted-foreground'>
              {officialPhotos.length > 0
                ? `${officialPhotos.length} hình ảnh từ quán`
                : 'Hình ảnh chính thức từ quán'}
            </span>
          </div>
          {officialPhotos.length > 0 && (
            <Badge
              variant='outline'
              className='bg-secondary text-amber-gold border-border text-[10px] font-bold'
            >
              Xem toàn màn hình
            </Badge>
          )}
        </div>

        {officialPhotos.length > 0 ? (
          <div className='grid grid-cols-3 sm:grid-cols-4 gap-2.5'>
            {officialPhotos.map((item, idx) => (
              <button
                key={item.url + idx}
                type='button'
                onClick={() => openImagePreview(officialPhotos, idx)}
                className='group relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/60 cursor-pointer shadow-xs active:scale-95 transition-transform select-none min-h-[44px] min-w-[44px] p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold'
                aria-label={item.title || `Ảnh ${idx + 1}`}
              >
                <ShopImage
                  src={item.url}
                  alt={item.title}
                  sizes='(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw'
                  imageClassName='object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 sm:p-2 pointer-events-none'>
                  <span className='text-[9.5px] sm:text-[10px] font-semibold text-white truncate'>
                    {item.title}
                  </span>
                </div>
                <div className='absolute top-1.5 right-1.5 bg-card/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9px] font-bold text-amber-gold border border-border/40 pointer-events-none'>
                  {item.category}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Official photos empty-state when community photos exist */
          <div className='flex flex-col items-center justify-center py-6 px-4 text-center space-y-1 bg-secondary/15 rounded-2xl border border-dashed border-border/80'>
            <p className='text-xs font-medium text-muted-foreground'>
              Quán chưa cập nhật ảnh chính thức
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: Community Photo Wall (Instagram-style grid) */}
      {hasReviews && (
        <section className='space-y-3 pt-2' aria-label='Ảnh từ cộng đồng'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-bold text-foreground block'>
                  Từ cộng đồng ({communityPhotos.length})
                </span>
                <Badge
                  variant='outline'
                  className='bg-black/60 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium text-amber-gold flex items-center gap-1 shadow-xs'
                >
                  <Camera size={10} />
                  <span>Từ đánh giá cộng đồng</span>
                </Badge>
              </div>
              <span className='text-[11px] text-muted-foreground'>
                Ảnh thực tế từ những người đã ghé quán
              </span>
            </div>
            {communityPhotos.length > 0 && (
              <Badge
                variant='outline'
                className='bg-secondary text-amber-gold border-border text-[10px] font-bold'
              >
                Xem toàn màn hình
              </Badge>
            )}
          </div>

          {communityPhotos.length > 0 ? (
            /* Responsive: 3-col on mobile, 4-col on tablet, 5-col on desktop */
            <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5'>
              {communityPhotos.map((item, idx) => {
                const initial = (item.authorName?.trim() || 'C')[0]?.toUpperCase() || 'C';
                return (
                  <button
                    key={item.url + idx}
                    type='button'
                    onClick={() => openImagePreview(communityPhotos, idx)}
                    className='group relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/60 cursor-pointer shadow-xs active:scale-95 transition-transform select-none min-h-[44px] min-w-[44px] p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold'
                    aria-label={item.title || `Ảnh từ cộng đồng ${idx + 1}`}
                  >
                    <ShopImage
                      src={item.url}
                      alt={item.title || 'Ảnh cộng đồng'}
                      sizes='(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw'
                      imageClassName='object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                    />

                    {/* Faint bottom gradient overlay for legibility */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none' />

                    {/* Small circular author avatar in bottom-left corner */}
                    <div className='absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 flex items-center gap-1.5 pointer-events-none z-10'>
                      <Avatar className='w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/60 shadow-xs shrink-0'>
                        {item.authorAvatar && (
                          <AvatarImage
                            src={item.authorAvatar}
                            alt={item.authorName || 'Tác giả'}
                            className='object-cover'
                          />
                        )}
                        <AvatarFallback className='bg-amber-gold/20 text-amber-gold font-bold text-[9px] sm:text-[10px]'>
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      {item.authorName && (
                        <span className='text-[9.5px] sm:text-[10px] font-medium text-white drop-shadow-xs truncate max-w-[65px] sm:max-w-[80px]'>
                          {item.authorName}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Zero community photos with existing reviews: invite first photo */
            <div className='flex flex-col items-center justify-center py-8 px-4 text-center space-y-2 bg-secondary/15 rounded-2xl border border-dashed border-border/80'>
              <EmptyIllustration type='no-photos' size={100} />
              <div className='space-y-1 max-w-xs'>
                <h5 className='text-xs font-bold text-foreground'>Chưa có ảnh từ cộng đồng</h5>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  Hãy là người đầu tiên chia sẻ hình ảnh khi ghé quán!
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
});
