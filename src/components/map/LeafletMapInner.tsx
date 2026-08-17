'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CoffeeShop } from '@/types/shop';
import { LocationButton } from './LocationButton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const coffeeIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white text-sm">☕</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const activeIcon = L.divIcon({
  className: 'custom-leaflet-marker-active',
  html: `<div class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-xl border-2 border-white text-base animate-bounce">☕</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md relative"><div class="absolute -inset-1 rounded-full bg-blue-500 opacity-40 animate-ping"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

interface LeafletMapInnerProps {
  center: [number, number];
  zoom?: number;
  shops: CoffeeShop[];
  selectedShop: CoffeeShop | null;
  onSelectShop: (shop: CoffeeShop) => void;
  onRecenter?: () => void;
}

export default function LeafletMapInner({
  center,
  zoom = 14,
  shops,
  selectedShop,
  onSelectShop,
  onRecenter,
}: LeafletMapInnerProps) {
  return (
    <Card className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden shadow-card border border-phin-100 p-0">
      {/* Badge showing count of shops found */}
      <div className="absolute top-4 left-4 z-[400]">
        <Badge variant="secondary" className="bg-white/95 text-phin-900 shadow-md border border-phin-200 px-3 py-1 font-semibold text-xs">
          ☕ {shops.length} shops nearby
        </Badge>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[350px] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />

        {/* User Location Marker */}
        <Marker position={center} icon={userIcon}>
          <Popup>
            <span className="font-medium text-xs">You are here</span>
          </Popup>
        </Marker>

        {/* Shop Markers */}
        {shops.map((shop) => {
          const isSelected = selectedShop?.id === shop.id;
          return (
            <Marker
              key={shop.id}
              position={[shop.lat, shop.lon]}
              icon={isSelected ? activeIcon : coffeeIcon}
              eventHandlers={{
                click: () => onSelectShop(shop),
              }}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <h4 className="font-bold text-sm text-primary leading-tight">{shop.name}</h4>
                  <p className="text-xs text-phin-700 mt-1 line-clamp-2">{shop.address}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="font-semibold text-amber-700">⭐ {shop.rating}</span>
                    <span className="text-phin-600">· {shop.distance_text}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {onRecenter && <LocationButton onClick={onRecenter} />}
    </Card>
  );
}
