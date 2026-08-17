'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Navigation, Star } from 'lucide-react';
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleFavorite?.(shop.place_id);
  };

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`;
  };

  return (
    <Card
      className="p-4 cursor-pointer flex flex-col justify-between gap-3 group bg-white rounded-xl shadow-sm border border-phin-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
      onClick={() => onSelect?.(shop)}
    >
      <CardHeader className="p-0 space-y-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge
                variant="outline"
                className={cn(
                  'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                  isOpen
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                )}
              >
                {isOpen ? '🟢 Open Now' : '🔴 Closed'}
              </Badge>
              {shop.price_range && (
                <Badge variant="secondary" className="bg-phin-100 text-phin-700 font-medium text-xs">
                  {shop.price_range}
                </Badge>
              )}
            </div>
            <CardTitle className="font-display font-bold text-base text-phin-900 group-hover:text-primary transition-colors line-clamp-1">
              {shop.name}
            </CardTitle>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className="h-8 w-8 rounded-full text-phin-500 hover:text-rose-500 hover:bg-phin-100"
          >
            <Heart
              size={18}
              className={cn(isFavorite ? 'fill-rose-500 text-rose-500 animate-heartPop' : '')}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-2">
        <p className="text-xs text-phin-700 flex items-center gap-1 line-clamp-1">
          <MapPin size={14} className="text-phin-500 flex-shrink-0" />
          {shop.address}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-phin-100 text-xs">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1 font-semibold text-xs py-0.5">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {shop.rating.toFixed(1)} ({shop.total_ratings})
            </Badge>
            <span className="text-phin-600 font-medium">📍 {shop.distance_text}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs border-phin-200 text-phin-800 hover:bg-phin-100">
                <Navigation size={12} className="mr-1" />
                Directions
              </Button>
            </a>

            <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)} onClick={(e) => e.stopPropagation()}>
              <Button variant="default" size="sm" className="h-8 px-3 text-xs bg-phin-800 text-white hover:bg-phin-900">
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
