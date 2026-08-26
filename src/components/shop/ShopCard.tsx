'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Navigation, Star, Footprints, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { cn } from '@/lib/utils';

interface ShopCardProps {
  shop: CoffeeShop;
  isFavorite?: boolean;
  onToggleFavorite?: (placeId: string) => void;
  onSelect?: (shop: CoffeeShop) => void;
}

export function ShopCard({
  shop,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}: ShopCardProps) {
  const isOpen = shop.opening_hours?.open_now ?? true;
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    onToggleFavorite?.(shop.place_id);
  };

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`;
  };

  // Sample decorative coffee shop cover images based on shop ID hash
  const sampleImages = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80',
  ];
  const charCodeSum = shop.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const coverImage = shop.photos?.[0] || sampleImages[charCodeSum % sampleImages.length];

  return (
    <Card
      className="group p-0 bg-white rounded-2xl border border-phin-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
      onClick={() => onSelect?.(shop)}
    >
      {/* Shop Image Header with Overlay & Floating Badges */}
      <div className="relative w-full h-40 overflow-hidden bg-phin-100">
        <img
          src={coverImage}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Floating Open/Closed Status Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md',
              isOpen
                ? 'bg-emerald-500/90 text-white border-emerald-400'
                : 'bg-rose-500/90 text-white border-rose-400'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full mr-1 inline-block', isOpen ? 'bg-emerald-200 animate-pulse' : 'bg-rose-200')} />
            {isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
          </Badge>

          {shop.price_range && (
            <Badge variant="secondary" className="bg-white/90 text-phin-900 font-bold text-[10px] shadow-sm backdrop-blur-md">
              {shop.price_range}
            </Badge>
          )}
        </div>

        {/* Floating Heart Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-phin-700 shadow-sm transition-transform active:scale-95"
        >
          <Heart
            size={16}
            className={cn(
              'transition-all duration-300',
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-phin-600 hover:text-rose-500',
              isHeartAnimating && 'animate-heart-beat'
            )}
          />
        </Button>

        {/* Shop Name & Address on Image Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-sans font-bold text-base leading-tight drop-shadow-md group-hover:text-phin-100 transition-colors line-clamp-1">
            {shop.name}
          </h3>
          <p className="text-[11px] text-phin-100/90 flex items-center gap-1 mt-0.5 line-clamp-1 drop-shadow-sm">
            <MapPin size={12} className="text-phin-300 flex-shrink-0" />
            {shop.address || 'Chưa có địa chỉ'}
          </p>
        </div>
      </div>

      {/* Card Content & Details Footer */}
      <CardContent className="p-3.5 space-y-3 bg-white">
        <div className="flex items-center justify-between text-xs pt-1 border-t border-phin-50">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1 font-bold text-[11px] py-0.5 px-2">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {shop.rating.toFixed(1)}
              <span className="text-[10px] text-amber-600 font-normal">({shop.total_ratings})</span>
            </Badge>

            <span className="text-phin-600 font-medium text-[11px] flex items-center gap-1">
              <Footprints size={12} className="text-phin-500" />
              {shop.distance_text || 'Gần đây'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] border-phin-200 text-phin-800 hover:bg-phin-100 rounded-lg">
                <Navigation size={11} className="mr-1 text-primary" />
                Chỉ đường
              </Button>
            </a>

            <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)} onClick={(e) => e.stopPropagation()}>
              <Button variant="default" size="sm" className="h-7 px-2.5 text-[11px] bg-phin-800 text-white hover:bg-phin-900 rounded-lg font-semibold">
                Xem
                <ExternalLink size={10} className="ml-1 opacity-70" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
