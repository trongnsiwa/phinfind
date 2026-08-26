'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Navigation, Star, Footprints, ExternalLink, Sparkles, Coffee, Clock, Wifi, Quote, Images } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { CardSize } from '@/lib/utils/bentoLayout';
import { cn } from '@/lib/utils';

interface ShopCardFeaturedProps {
  shop: CoffeeShop;
  size?: CardSize;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
}

export const ShopCardFeatured = memo(function ShopCardFeatured({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}: ShopCardFeaturedProps) {
  const hasOpenInfo = shop.opening_hours?.open_now !== undefined;
  const isOpen = shop.opening_hours?.open_now ?? true;
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id);
  };

  const sampleGallery = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80',
  ];

  const rawPhotos = shop.photos && shop.photos.length > 0 ? shop.photos : [];
  const photo1 = rawPhotos[0] || sampleGallery[0];
  const photo2 = rawPhotos[1] || sampleGallery[1];
  const photo3 = rawPhotos[2] || sampleGallery[2];
  const extraCount = Math.max(rawPhotos.length > 3 ? rawPhotos.length - 2 : 2, 2);

  const formatCategories = () => {
    if (!shop.categories || shop.categories.length === 0) {
      return 'Quán cà phê được yêu thích với cà phê trứng đặc trưng, pour-over và không gian yên tĩnh.';
    }
    const cleaned = shop.categories
      .map((c) => c.replace(/^catering\./, '').replace(/_/g, ' ').trim())
      .filter((c) => c.length > 0 && c !== 'cafe' && c !== 'coffee')
      .map((c) => c.charAt(0).toUpperCase() + c.slice(1));

    if (cleaned.length === 0) {
      return 'Quán cà phê được yêu thích với cà phê trứng đặc trưng, pour-over và không gian yên tĩnh.';
    }
    return `Cà phê đặc sản ${cleaned.join(' • ')} với hương vị nguyên bản & không gian ấm cúng.`;
  };

  const categoryTagline = formatCategories();
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const hasTotalRatings = typeof shop.total_ratings === 'number' && shop.total_ratings > 0;
  const distanceDisplay = shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const addressDisplay = shop.address?.trim() || 'Chưa có địa chỉ';

  return (
    <Card
      onClick={() => onSelect?.(shop)}
      className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-2 w-full h-full card-glow-border bg-gradient-to-br from-[#141414] via-[#1A1A1A] to-[#101010] text-white rounded-3xl border border-amber-gold/40 shadow-2xl hover:shadow-[0_20px_50px_rgba(212,160,87,0.2)] hover:border-amber-gold/70 hover:-translate-y-1.5 transition-all duration-500 p-0 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* 2-Column Magazine-Style Gallery (60% Left, 40% Right Stacked) */}
      <div className="relative w-full h-52 sm:h-60 p-1.5 flex gap-1.5 bg-[#101010]/60 border-b border-[#2A2A2A]/60 overflow-hidden flex-shrink-0">
        {/* Left Column (60% Width) - Primary Image */}
        <div className="w-[60%] h-full rounded-2xl overflow-hidden relative bg-[#141414] border border-[#2A2A2A]/40">
          {!imgError ? (
            <img
              src={photo1}
              alt={`${shop.name} main`}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#141414] text-[#A0A0A0] gap-1.5 p-2">
              <Coffee size={28} className="text-amber-gold opacity-60" />
              <span className="text-xs font-sans font-bold text-[#D0D0D0]">{shop.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/60 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Right Column (40% Width) - Two 50% Height Rows */}
        <div className="w-[40%] h-full flex flex-col gap-1.5">
          {/* Top Row (50% Height) */}
          <div className="h-1/2 rounded-xl overflow-hidden relative bg-[#141414] border border-[#2A2A2A]/40">
            <img
              src={photo2}
              alt={`${shop.name} secondary`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Bottom Row (50% Height) with +N More Overlay */}
          <div className="h-1/2 rounded-xl overflow-hidden relative bg-[#141414] border border-[#2A2A2A]/40">
            <img
              src={photo3}
              alt={`${shop.name} detail`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center text-amber-gold font-bold text-xs tracking-tight gap-1 hover:bg-black/50 transition-colors">
              <Images size={13} className="text-amber-gold" />
              <span>+{extraCount} ảnh</span>
            </div>
          </div>
        </div>

        {/* Floating Badges on Top-Left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <Badge variant="secondary" className="bg-amber-gold text-[#101010] font-bold text-xs px-2.5 py-0.5 rounded-full shadow-md">
            <Sparkles size={11} className="mr-1 fill-[#101010] text-[#101010]" /> Lựa chọn nổi bật
          </Badge>

          {hasOpenInfo && (
            <Badge
              variant="outline"
              className={cn(
                'text-[9px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-md',
                isOpen
                  ? 'bg-[#7CAE8E]/30 text-[#A3D9B1] border-[#7CAE8E]/40'
                  : 'bg-[#C97A7A]/30 text-[#E8A5A5] border-[#C97A7A]/40'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', isOpen ? 'bg-[#7CAE8E] animate-pulse' : 'bg-[#C97A7A]')} />
              {isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
            </Badge>
          )}
        </div>

        {/* Floating Favorite Button on Top-Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFav}
          aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          className="absolute top-2.5 right-2.5 z-10 h-7 w-7 rounded-full bg-[#101010]/80 backdrop-blur-md hover:bg-[#141414] border border-[#2A2A2A]/60 text-white shadow-md transition-all focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0"
        >
          <Heart
            size={14}
            className={cn(
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/80',
              isHeartAnimating && 'animate-heart-beat'
            )}
          />
        </Button>
      </div>

      {/* Structured Editorial Content Card */}
      <CardContent className="p-4 sm:p-5 space-y-2.5 bg-[#101010]/95 backdrop-blur-md flex-1 flex flex-col justify-between overflow-visible min-h-0">
        {/* Section 1: Title & Address */}
        <div>
          <h3 className="font-sans font-bold text-lg sm:text-xl text-white tracking-tight line-clamp-1 group-hover:text-amber-gold-hover transition-colors">
            {shop.name}
          </h3>
          <p className="text-xs text-[#D0D0D0]/90 flex items-center gap-1 mt-0.5 line-clamp-1">
            <MapPin size={12} className="text-amber-gold flex-shrink-0" />
            {addressDisplay}
          </p>
        </div>

        {/* Section 2: Excerpt / Tagline Panel */}
        <div className="bg-[#101010]/70 px-3 py-2 rounded-xl border border-[#2A2A2A]/60 text-xs text-[#D0D0D0]/90 leading-relaxed flex items-start gap-2 shadow-inner">
          <Quote size={13} className="text-amber-gold flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2 text-xs">{categoryTagline}</span>
        </div>

        {/* Section 3: 4-Box Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#141414]/50 p-2 rounded-xl border border-[#2A2A2A]/50 text-xs">
          <div className="flex items-center gap-1.5 bg-[#101010]/60 p-1.5 rounded-lg border border-[#2A2A2A]/40">
            {hasRating ? (
              <>
                <Star size={12} className="fill-amber-gold text-amber-gold flex-shrink-0" />
                <span className="font-bold text-white text-xs">{shop.rating.toFixed(1)}</span>
                {hasTotalRatings && (
                  <span className="text-[10px] text-[#A0A0A0] truncate">({shop.total_ratings})</span>
                )}
              </>
            ) : (
              <>
                <Star size={12} className="text-amber-gold/50 flex-shrink-0" />
                <span className="font-medium text-[#D0D0D0] text-xs">Mới</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#101010]/60 p-1.5 rounded-lg border border-[#2A2A2A]/40 text-[#D0D0D0] font-medium">
            <Footprints size={12} className="text-amber-gold/80 flex-shrink-0" />
            <span className="truncate text-[11px]">{distanceDisplay}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#101010]/60 p-1.5 rounded-lg border border-[#2A2A2A]/40 text-[#D0D0D0]/90 font-medium">
            <Clock size={12} className="text-amber-gold/80 flex-shrink-0" />
            <span className="truncate text-[11px]">{isOpen ? 'Đóng cửa 22:30' : 'Mở cửa 07:00'}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#101010]/60 p-1.5 rounded-lg border border-[#2A2A2A]/40 text-[#D0D0D0]/90 font-medium">
            <Wifi size={12} className="text-[#D0D0D0]/70 flex-shrink-0" />
            <span className="truncate text-[11px]">{shop.price_range || '25k - 65k'} · Wi-Fi</span>
          </div>
        </div>

        {/* Section 4: CTA Action Row */}
        <div className="flex items-center justify-end gap-2 pt-0.5">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-[#141414]/70 border-[#2A2A2A] text-white hover:text-amber-gold-hover hover:border-amber-gold/40 hover:bg-[#141414] rounded-xl font-medium transition-all"
            >
              <Navigation size={12} className="mr-1 text-amber-gold" /> Chỉ đường
            </Button>
          </a>

          <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3.5 text-xs bg-amber-gold text-[#101010] font-bold hover:bg-amber-gold-hover rounded-xl shadow-md transition-all"
            >
              Xem chi tiết <ExternalLink size={12} className="ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
