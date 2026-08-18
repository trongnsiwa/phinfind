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
import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';
import { toast } from 'sonner';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/utils/constants';

export default function MapPage() {
  const { lat, lng, loading: locationLoading, isFallback, refetchLocation } = useLocation();
  const { selectedShop, setSelectedShop, favorites, toggleFavorite } = useShopStore();
  const { data: apiShops = [] } = useNearbyShops(lat, lng);

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

  const allShops = apiShops;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Map Control Bar Header */}
      <Card className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-phin-200 shadow-sm">
        <CardContent className="p-0 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-phin-800">
            <div className="w-7 h-7 rounded-xl bg-phin-100 flex items-center justify-center text-primary flex-shrink-0">
              <MapPin size={15} />
            </div>
            <div>
              <span className="font-bold block text-phin-900">Interactive Map View</span>
              <span className="text-[11px] text-phin-600">
                {locationLoading
                  ? 'Detecting GPS location...'
                  : isFallback
                  ? 'Default Location: Hà Nội'
                  : 'GPS Location Active'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-phin-100 text-phin-900 border-phin-200 font-bold text-xs">
              {allShops.length} spots
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefetch}
              disabled={locationLoading}
              className="text-xs h-8 px-3 text-primary hover:bg-phin-100 border border-phin-200 rounded-xl font-semibold transition-all"
            >
              <Navigation size={12} className="mr-1.5" />
              Relocate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Full Screen Leaflet Map Container */}
      <div className="h-[calc(100vh-220px)] min-h-[500px]">
        <Map
          center={[lat, lng]}
          shops={allShops}
          selectedShop={selectedShop}
          onSelectShop={setSelectedShop}
          onRecenter={handleRefetch}
        />
      </div>

      {/* Selected Shop Drawer Preview */}
      {selectedShop && (
        <Drawer open={!!selectedShop} onOpenChange={(open) => !open && setSelectedShop(null)}>
          <DrawerContent className="bg-white border-t border-phin-200 p-5 space-y-4 max-w-lg mx-auto rounded-t-3xl">
            <DrawerHeader className="p-0 text-left space-y-1">
              <div className="flex items-center justify-between">
                <DrawerTitle className="font-sans text-xl text-phin-900">{selectedShop.name}</DrawerTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFav(selectedShop.place_id)}
                  className="rounded-full hover:bg-phin-100"
                >
                  <Heart
                    size={20}
                    className={favorites.includes(selectedShop.place_id) ? 'fill-rose-500 text-rose-500' : 'text-phin-500'}
                  />
                </Button>
              </div>
              <DrawerDescription className="text-xs text-phin-600 flex items-center gap-1">
                <MapPin size={14} className="text-phin-500 flex-shrink-0" />
                {selectedShop.address}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex items-center gap-3 text-xs">
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1 font-bold">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {selectedShop.rating.toFixed(1)} ({selectedShop.total_ratings})
              </Badge>
              <span className="text-phin-600 font-medium">📍 {selectedShop.distance_text}</span>
            </div>

            <DrawerFooter className="p-0 flex flex-row gap-3 pt-3">
              <Button variant="outline" className="flex-1 border-phin-200 rounded-xl" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShop.lat},${selectedShop.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </Button>
              <Button variant="default" className="flex-1 bg-phin-800 text-white hover:bg-phin-900 rounded-xl font-semibold" asChild>
                <Link href={APP_ROUTES.SHOP_DETAIL(selectedShop.id)}>View Details</Link>
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
