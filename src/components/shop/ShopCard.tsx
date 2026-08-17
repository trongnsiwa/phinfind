'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Navigation, Star } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

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
      className="p-4 cursor-pointer flex flex-col justify-between gap-3 group"
      onClick={() => onSelect?.(shop)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isOpen ? '🟢 Open Now' : '🔴 Closed'}
            </span>
            {shop.price_range && (
              <span className="text-xs text-phin-600 font-medium">{shop.price_range}</span>
            )}
          </div>
          <h3 className="font-bold text-base text-phin-900 group-hover:text-primary transition-colors line-clamp-1">
            {shop.name}
          </h3>
        </div>

        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className="p-2 rounded-full hover:bg-phin-100 transition-colors text-phin-500 hover:text-rose-500"
        >
          <Heart
            size={18}
            className={isFavorite ? 'fill-rose-500 text-rose-500 animate-heartPop' : ''}
          />
        </button>
      </div>

      <p className="text-xs text-phin-700 flex items-center gap-1 line-clamp-1">
        <MapPin size={14} className="text-phin-500 flex-shrink-0" />
        {shop.address}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-phin-100 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-amber-700">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {shop.rating.toFixed(1)} ({shop.total_ratings})
          </span>
          <span className="text-phin-600 font-medium">📍 {shop.distance_text}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
              <Navigation size={12} />
              Directions
            </Button>
          </a>

          <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)} onClick={(e) => e.stopPropagation()}>
            <Button variant="primary" size="sm" className="h-8 px-3 text-xs">
              View
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
