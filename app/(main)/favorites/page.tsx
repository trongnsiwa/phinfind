'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ShopList } from '@/components/shop/ShopList';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';

export default function FavoritesPage() {
  const { lat, lng } = useLocation();
  const { data: shops = [], isLoading } = useNearbyShops(lat, lng);
  const { favorites, toggleFavorite, setSelectedShop } = useShopStore();

  const favoriteShops = shops.filter((s) => favorites.includes(s.place_id));

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-phin-900 flex items-center gap-2">
            <Heart size={20} className="text-rose-500 fill-rose-500" />
            Saved Coffee Shops
          </h2>
          <p className="text-xs text-phin-600 mt-0.5">
            Quick access to your favorite coffee spots ({favoriteShops.length})
          </p>
        </div>
      </div>

      {favoriteShops.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-phin-200 shadow-sm space-y-3">
          <span className="text-5xl">❤️</span>
          <h3 className="text-lg font-bold text-phin-900">No Favorites Saved Yet</h3>
          <p className="text-xs text-phin-600 max-w-sm mx-auto">
            Tap the heart icon on any coffee shop card to bookmark it for easy access anytime.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="primary" size="sm">
                Discover Coffee Shops
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <ShopList
          shops={favoriteShops}
          isLoading={isLoading}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectShop={setSelectedShop}
        />
      )}
    </div>
  );
}
