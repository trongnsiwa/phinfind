'use client';

import { Camera, Images } from 'lucide-react';
import React from 'react';
import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { ShopImage } from '@/components/common/ShopImage';
import type { CoffeeShop } from '@/types/shop';
import type { GalleryPhoto } from './types';

interface GalleryProps {
  shop: CoffeeShop;
  galleryPhotos: GalleryPhoto[];
  isLoading: boolean;
  onOpenPhoto: (index: number) => void;
}

export function Gallery({
  shop,
  galleryPhotos,
  isLoading,
  onOpenPhoto
}: GalleryProps) {
  const imageCount = galleryPhotos.length;

  return (
    <div className='relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-card shadow-md border border-border/80 group'>
      {isLoading && (!shop.photos || shop.photos.length === 0) ? (
        <div className='w-full h-full flex gap-1.5 p-1.5 bg-card animate-pulse'>
          <div className='flex-[3] h-full rounded-xl bg-muted/60' />
          <div className='flex-[2] flex flex-col gap-1.5'>
            <div className='h-[calc(50%-3px)] rounded-xl bg-muted/50' />
            <div className='h-[calc(50%-3px)] rounded-xl bg-muted/50' />
          </div>
        </div>
      ) : imageCount === 0 ? (
        <div className='w-full h-full relative overflow-hidden'>
          <ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />
        </div>
      ) : imageCount === 1 ? (
        /* Layout 1 Image: Full width & full height */
        <div className='w-full h-full p-1.5 bg-card'>
          <div
            onClick={() => onOpenPhoto(0)}
            className='w-full h-full rounded-xl overflow-hidden relative cursor-pointer group select-none pointer-events-auto bg-card border border-border/40'
          >
            <ShopImage
              src={galleryPhotos[0]?.url}
              alt={galleryPhotos[0]?.title || shop.name}
              fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
              imageClassName='object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw'
            >
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
            </ShopImage>
          </div>
        </div>
      ) : imageCount === 2 ? (
        /* Layout 2 Images: 60/40 side-by-side split */
        <div className='w-full h-full flex gap-1.5 p-1.5 bg-card'>
          {/* Left: main image (60%) */}
          <div
            onClick={() => onOpenPhoto(0)}
            className='flex-[3] h-full rounded-xl overflow-hidden relative cursor-pointer group select-none pointer-events-auto bg-card border border-border/40'
          >
            <ShopImage
              src={galleryPhotos[0]?.url}
              alt={galleryPhotos[0]?.title || shop.name}
              fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
              imageClassName='object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw'
            >
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
            </ShopImage>
          </div>

          {/* Right: second image occupying entire right column (40%) */}
          <div
            onClick={() => onOpenPhoto(1)}
            className='flex-[2] h-full rounded-xl overflow-hidden relative bg-card border border-border/40 cursor-pointer group select-none pointer-events-auto'
          >
            <ShopImage
              src={galleryPhotos[1]?.url}
              alt={galleryPhotos[1]?.title || `${shop.name} - Ảnh 2`}
              fallback={<div className='w-full h-full bg-muted' />}
              imageClassName='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
              sizes='(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 20vw'
            >
              {galleryPhotos[1]?.isCommunity && (
                <div className='absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium text-amber-gold flex items-center gap-1 z-10 border border-white/10 shadow-xs'>
                  <Camera size={10} />
                  <span>Đánh giá</span>
                </div>
              )}
            </ShopImage>
          </div>
        </div>
      ) : (
        /* Layout 3+ Images: 60/40 magazine grid with 2 stacked images on right */
        <div className='w-full h-full flex gap-1.5 p-1.5 bg-card'>
          {/* Left: main image (60%) */}
          <div
            onClick={() => onOpenPhoto(0)}
            className='flex-[3] h-full rounded-xl overflow-hidden relative cursor-pointer group select-none pointer-events-auto bg-card border border-border/40'
          >
            <ShopImage
              src={galleryPhotos[0]?.url}
              alt={galleryPhotos[0]?.title || shop.name}
              fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
              imageClassName='object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw'
            >
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
            </ShopImage>
          </div>

          {/* Right: two stacked images (40%) */}
          <div className='flex-[2] flex flex-col h-full gap-1.5'>
            <div
              onClick={() => onOpenPhoto(1)}
              className='flex-1 h-[calc(50%-3px)] rounded-xl overflow-hidden relative bg-card border border-border/40 cursor-pointer group select-none pointer-events-auto'
            >
              <ShopImage
                src={galleryPhotos[1]?.url}
                alt={galleryPhotos[1]?.title || `${shop.name} - Ảnh 2`}
                fallback={<div className='w-full h-full bg-muted' />}
                imageClassName='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                sizes='(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 20vw'
              >
                {galleryPhotos[1]?.isCommunity && (
                  <div className='absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-medium text-amber-gold flex items-center gap-1 z-10'>
                    <Camera size={8} />
                    <span>Đánh giá</span>
                  </div>
                )}
              </ShopImage>
            </div>

            <div
              onClick={() => onOpenPhoto(2)}
              className='flex-1 h-[calc(50%-3px)] rounded-xl overflow-hidden relative bg-card border border-border/40 cursor-pointer group select-none pointer-events-auto'
            >
              <ShopImage
                src={galleryPhotos[2]?.url}
                alt={galleryPhotos[2]?.title || `${shop.name} - Ảnh 3`}
                fallback={<div className='w-full h-full bg-muted' />}
                imageClassName='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-auto [user-drag:none] [-webkit-user-drag:none]'
                sizes='(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 20vw'
              >
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
              </ShopImage>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
