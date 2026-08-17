'use client';

import { useMemo } from 'react';
import { MapPin, Navigation, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Map } from '@/components/map/Map';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { ShopList } from '@/components/shop/ShopList';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import { toast } from 'sonner';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/utils/constants';

export default function DiscoverPage() {
  const { lat, lng, loading: locationLoading, isFallback, refetchLocation } = useLocation();
  const { viewMode, filters } = useUIStore();
  const { selectedShop, setSelectedShop, favorites, toggleFavorite } = useShopStore();

  const { data: rawShops = [], isLoading: shopsLoading } = useNearbyShops(lat, lng);

  const handleRefetch = () => {
    refetchLocation();
    toast.info('Updating location...');
  };

  const handleToggleFav = (placeId: string) => {
    const isFav = favorites.includes(placeId);
    toggleFavorite(placeId);
    if (isFav) {
      toast.info('Removed from favorites');
    } else {
      toast.success('Shop saved to favorites!');
    }
  };

  // Filter & sort shop results
  const filteredShops = useMemo(() => {
    let result = [...rawShops];

    if (filters.openNowOnly) {
      result = result.filter((s) => s.opening_hours?.open_now);
    }

    if (filters.minRating && filters.minRating > 0) {
      result = result.filter((s) => s.rating >= (filters.minRating || 0));
    }

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [rawShops, filters]);

  return (
    <div className="space-y-4">
      {/* Location Status Card */}
      <Card className="bg-white p-3 rounded-2xl border border-phin-200 shadow-sm">
        <CardContent className="p-0 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-phin-800">
            <MapPin size={16} className="text-primary flex-shrink-0" />
            <span className="font-medium">
              {locationLoading
                ? 'Detecting your location...'
                : isFallback
                ? 'Default Location: Hà Nội'
                : 'Current GPS Location'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefetch}
            disabled={locationLoading}
            className="text-xs h-7 px-2.5 text-primary hover:bg-phin-100 border border-phin-200 rounded-lg"
          >
            <Navigation size={12} className="mr-1" />
            Relocate
          </Button>
        </CardContent>
      </Card>

      {/* Filter and View Controls */}
      <ShopFilters />

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="h-[420px] md:h-[500px]">
            <Map
              center={[lat, lng]}
              shops={filteredShops}
              selectedShop={selectedShop}
              onSelectShop={setSelectedShop}
              onRecenter={handleRefetch}
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-phin-900 flex items-center gap-2">
                Nearby Coffee Spots
              </h3>
              <Badge variant="outline" className="bg-phin-100 text-phin-800 border-phin-200">
                {filteredShops.length} spots
              </Badge>
            </div>
            <ShopList
              shops={filteredShops}
              isLoading={shopsLoading}
              selectedShop={selectedShop}
              favorites={favorites}
              onToggleFavorite={handleToggleFav}
              onSelectShop={setSelectedShop}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-phin-900">
              Coffee Shop List
            </h3>
            <Badge variant="outline" className="bg-phin-100 text-phin-800 border-phin-200">
              {filteredShops.length} spots
            </Badge>
          </div>
          <ShopList
            shops={filteredShops}
            isLoading={shopsLoading}
            selectedShop={selectedShop}
            favorites={favorites}
            onToggleFavorite={handleToggleFav}
            onSelectShop={setSelectedShop}
          />
        </div>
      )}

      {/* Mobile Drawer for Selected Shop */}
      {selectedShop && (
        <Drawer open={!!selectedShop} onOpenChange={(open) => !open && setSelectedShop(null)}>
          <DrawerContent className="bg-white border-t border-phin-200 p-4 space-y-4">
            <DrawerHeader className="p-0 text-left">
              <div className="flex items-center justify-between">
                <DrawerTitle className="font-display text-lg text-phin-900">{selectedShop.name}</DrawerTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFav(selectedShop.place_id)}
                  className="rounded-full"
                >
                  <Heart
                    size={20}
                    className={favorites.includes(selectedShop.place_id) ? 'fill-rose-500 text-rose-500' : ''}
                  />
                </Button>
              </div>
              <DrawerDescription className="text-xs text-phin-600 flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-phin-500" />
                {selectedShop.address}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex items-center gap-3 text-xs">
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {selectedShop.rating.toFixed(1)} ({selectedShop.total_ratings})
              </Badge>
              <span className="text-phin-600">📍 {selectedShop.distance_text}</span>
            </div>

            <DrawerFooter className="p-0 flex flex-row gap-2 pt-2">
              <Button variant="outline" className="flex-1 border-phin-200" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShop.lat},${selectedShop.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </Button>
              <Button variant="default" className="flex-1 bg-phin-800 text-white" asChild>
                <Link href={APP_ROUTES.SHOP_DETAIL(selectedShop.id)}>View Details</Link>
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
