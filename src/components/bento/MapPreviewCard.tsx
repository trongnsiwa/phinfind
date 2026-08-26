'use client';

import React from 'react';
import { MapPin, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Map } from '@/components/map/Map';
import { CoffeeShop } from '@/types/shop';
import { useUIStore } from '@/stores/useUIStore';

interface MapPreviewCardProps {
  center: [number, number];
  shops: CoffeeShop[];
  selectedShop: CoffeeShop | null;
  onSelectShop: (shop: CoffeeShop) => void;
  onRecenter?: () => void;
}

export function MapPreviewCard({
  center,
  shops,
  selectedShop,
  onSelectShop,
  onRecenter,
}: MapPreviewCardProps) {
  const { setViewMode } = useUIStore();

  return (
    <Card className="col-span-2 row-span-2 bg-white rounded-3xl border border-phin-200 shadow-card overflow-hidden relative group p-0">
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5">
        <Badge variant="secondary" className="bg-white/95 backdrop-blur-md text-phin-900 shadow-md border border-phin-200 px-3 py-1 font-bold text-xs">
          <MapPin size={13} className="mr-1 text-primary inline" />
          {shops.length} Quán gần đây
        </Badge>
      </div>

      <div className="absolute top-3 right-3 z-[400]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('map')}
          className="h-8 px-2.5 bg-white/95 backdrop-blur-md text-phin-900 border-phin-200 shadow-md text-xs font-semibold hover:bg-phin-50 rounded-xl"
        >
          <Maximize2 size={13} className="mr-1 text-primary" />
          Xem bản đồ lớn
        </Button>
      </div>

      <div className="w-full h-full min-h-[380px]">
        <Map
          center={center}
          shops={shops}
          selectedShop={selectedShop}
          onSelectShop={onSelectShop}
          onRecenter={onRecenter}
        />
      </div>
    </Card>
  );
}
