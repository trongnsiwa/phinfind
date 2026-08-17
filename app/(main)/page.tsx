'use client';

import { useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Map } from '@/components/map/Map';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { ShopList } from '@/components/shop/ShopList';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyShops } from '@/hooks/useShops';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';

export default function DiscoverPage() {
  const { lat, lng, loading: locationLoading, isFallback, refetchLocation } = useLocation();
  const { viewMode, filters } = useUIStore();
  const { selectedShop, setSelectedShop, favorites, toggleFavorite } = useShopStore();

  const { data: rawShops = [], isLoading: shopsLoading } = useNearbyShops(lat, lng);

  // Filter & sort shop results
  const filteredShops = useMemo(() => {
    let result = [...rawShops];

    if (filters.openNowOnly) {
      result = result.filter((s) => s.opening_hours?.open_now);
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
      {/* Location Status Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-phin-200 shadow-sm text-xs">
        <div className="flex items-center gap-2 text-phin-800">
          <MapPin size={16} className="text-primary" />
          <span className="font-medium">
            {locationLoading
              ? 'Detecting your location...'
              : isFallback
              ? 'Showing default location (Hà Nội)'
              : 'Using your current GPS location'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refetchLocation}
          isLoading={locationLoading}
          className="text-xs h-7 px-2 text-primary hover:bg-phin-100"
        >
          <Navigation size={12} />
          Relocate
        </Button>
      </div>

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
              onRecenter={refetchLocation}
            />
          </div>

          <div className="pt-2">
            <h3 className="font-bold text-sm text-phin-900 mb-3 flex items-center gap-2">
              Nearby Coffee Spots ({filteredShops.length})
            </h3>
            <ShopList
              shops={filteredShops}
              isLoading={shopsLoading}
              selectedShop={selectedShop}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelectShop={setSelectedShop}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-phin-900 mb-3">
            Coffee Shop List ({filteredShops.length})
          </h3>
          <ShopList
            shops={filteredShops}
            isLoading={shopsLoading}
            selectedShop={selectedShop}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectShop={setSelectedShop}
          />
        </div>
      )}
    </div>
  );
}
