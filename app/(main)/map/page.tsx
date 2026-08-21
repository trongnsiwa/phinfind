'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map } from '@/components/map/Map';
import { ShopDrawer } from '@/components/shop/ShopDrawer';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';
import { toast } from 'sonner';

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

  // Auto-open drawer if ?shop=id query param or /shop/[id] deep link is present on page load
  React.useEffect(() => {
    if (allShops.length > 0 && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shopQueryId = urlParams.get('shop');
      const pathMatch = window.location.pathname.match(/\/shop\/([^/]+)/);
      const targetId = shopQueryId || (pathMatch ? pathMatch[1] : null);

      if (targetId && (!selectedShop || (selectedShop.id !== targetId && selectedShop.place_id !== targetId))) {
        const found = allShops.find((s) => s.id === targetId || s.place_id === targetId);
        if (found) {
          setSelectedShop(found);
        }
      }
    }
  }, [allShops, selectedShop, setSelectedShop]);

  // Handle popstate on map page to close drawer if ?shop param is removed via back button
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get('shop') && selectedShop) {
        setSelectedShop(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedShop, setSelectedShop]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Map Control Bar Header */}
      <Card className="bg-dark-bg/95 backdrop-blur-md p-3.5 rounded-3xl border border-dark-border shadow-xl shadow-black/30">
        <CardContent className="p-0 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5 text-cream-white">
            <div className="w-8 h-8 rounded-xl bg-dark-roast border border-dark-border/80 flex items-center justify-center text-amber-gold flex-shrink-0">
              <MapPin size={16} />
            </div>
            <div>
              <span className="font-bold block text-cream-white">Interactive Map View</span>
              <span className="text-[11px] text-soft-beige/80">
                {locationLoading
                  ? 'Detecting GPS location...'
                  : isFallback
                  ? 'Default Location: Hà Nội'
                  : 'GPS Location Active'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-dark-roast text-soft-beige border-dark-border font-bold text-xs px-2.5 py-1 rounded-full">
              {allShops.length} spots
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefetch}
              disabled={locationLoading}
              className="text-xs h-8 px-3 bg-dark-roast/80 text-amber-gold hover:text-amber-gold-hover hover:bg-dark-roast border border-dark-border rounded-xl font-semibold transition-all"
            >
              <Navigation size={12} className="mr-1.5" />
              Relocate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Full Screen Leaflet Map Container */}
      <div className="h-[calc(100vh-220px)] min-h-[500px] rounded-3xl overflow-hidden border border-dark-border/80 shadow-2xl">
        <Map
          center={[lat, lng]}
          shops={allShops}
          selectedShop={selectedShop}
          onSelectShop={setSelectedShop}
          onRecenter={handleRefetch}
        />
      </div>

      {/* Unified Google Maps-Style Tabbed Shop Drawer */}
      <ShopDrawer
        shop={selectedShop}
        isOpen={Boolean(selectedShop)}
        onClose={() => setSelectedShop(null)}
        onToggleFavorite={handleToggleFav}
        isFavorite={selectedShop ? favorites.includes(selectedShop.place_id) : false}
      />
    </div>
  );
}
