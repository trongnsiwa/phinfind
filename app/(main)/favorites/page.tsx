'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';
import { CoffeeShop } from '@/types/shop';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/lib/utils/constants';

export default function FavoritesPage() {
  const router = useRouter();
  const { lat, lng } = useLocation();
  const { data: shops = [] } = useNearbyShops(lat, lng);
  const { favorites, toggleFavorite } = useShopStore();
  const [shopToRemove, setShopToRemove] = useState<CoffeeShop | null>(null);

  const favoriteShops = shops.filter((s) => favorites.includes(s.place_id));

  const handleConfirmRemove = () => {
    if (shopToRemove) {
      toggleFavorite(shopToRemove.place_id);
      toast.info(`Removed "${shopToRemove.name}" from favorites`);
      setShopToRemove(null);
    }
  };

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
        <EmptyState
          icon={Heart}
          title="No Favorites Saved Yet"
          description="Tap the heart icon on any coffee shop card to bookmark it for easy access anytime."
          actionLabel="Discover Coffee Shops"
          onAction={() => router.push(APP_ROUTES.HOME)}
          className="py-12"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteShops.map((shop) => (
            <Card key={shop.id} className="p-4 bg-white border border-phin-100 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="p-0 space-y-1">
                <div className="flex items-start justify-between">
                  <CardTitle className="font-display font-bold text-base text-phin-900">
                    {shop.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShopToRemove(shop)}
                    className="h-8 w-8 text-phin-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <p className="text-xs text-phin-600 line-clamp-1">{shop.address}</p>
              </CardHeader>

              <CardContent className="p-0 pt-3 flex items-center justify-between text-xs">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  ⭐ {shop.rating.toFixed(1)} · {shop.distance_text}
                </Badge>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs border-phin-200" asChild>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation size={12} className="mr-1" />
                      Directions
                    </a>
                  </Button>
                  <Button variant="default" size="sm" className="h-8 text-xs bg-phin-800 text-white" asChild>
                    <Link href={APP_ROUTES.SHOP_DETAIL(shop.id)}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Remove Confirmation Alert Dialog */}
      <AlertDialog open={!!shopToRemove} onOpenChange={(open) => !open && setShopToRemove(null)}>
        <AlertDialogContent className="bg-white border-phin-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-phin-900">Remove Favorite?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-phin-600">
              Are you sure you want to remove &quot;{shopToRemove?.name}&quot; from your saved favorites?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-phin-200 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} className="bg-rose-600 text-white hover:bg-rose-700 text-xs">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
