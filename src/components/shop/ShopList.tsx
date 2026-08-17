'use client';

import { ShopCard } from '@/components/shop/ShopCard';
import { CoffeeShop } from '@/types/shop';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
          <div key={n} className="p-4 rounded-xl border border-phin-100 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/2 bg-phin-100" />
              <Skeleton className="h-6 w-16 rounded-full bg-phin-100" />
            </div>
            <Skeleton className="h-4 w-3/4 bg-phin-100" />
            <Separator className="bg-phin-100" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/3 bg-phin-100" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-md bg-phin-100" />
                <Skeleton className="h-8 w-16 rounded-md bg-phin-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-white border border-phin-100 shadow-sm space-y-2">
        <span className="text-4xl">☕</span>
        <h3 className="text-lg font-bold text-phin-900 font-display">No Coffee Shops Found</h3>
        <p className="text-sm text-phin-600 max-w-sm mx-auto">
          Try expanding your search radius or clearing active filters to discover nearby spots.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-1 pb-4">
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
    </ScrollArea>
  );
}
