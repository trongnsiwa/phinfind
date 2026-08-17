'use client';

import { ShopCard } from '@/components/shop/ShopCard';
import { CoffeeShop } from '@/types/shop';

interface ShopListProps {
  shops: CoffeeShop[];
  isLoading?: boolean;
  selectedShop?: CoffeeShop | null;
  favorites?: string[];
  onToggleFavorite?: (placeId: string) => void;
  onSelectShop?: (shop: CoffeeShop) => void;
}

export function ShopList({
  shops,
  isLoading = false,
  favorites = [],
  onToggleFavorite,
  onSelectShop,
}: ShopListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-36 rounded-2xl bg-phin-100 animate-pulse border border-phin-200"
          />
        ))}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-white border border-phin-100 shadow-sm">
        <span className="text-4xl">☕</span>
        <h3 className="text-lg font-bold text-phin-900 mt-2">No Coffee Shops Found</h3>
        <p className="text-sm text-phin-600 mt-1 max-w-sm mx-auto">
          Try expanding your search radius or clearing active filters to discover nearby spots.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {shops.map((shop) => (
        <ShopCard
          key={shop.id}
          shop={shop}
          isFavorite={favorites.includes(shop.place_id)}
          onToggleFavorite={onToggleFavorite}
          onSelect={onSelectShop}
        />
      ))}
    </div>
  );
}
