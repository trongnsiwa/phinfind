'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';

interface LocationPickerMapInnerProps {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
  className?: string;
}

const pickerIcon = L.divIcon({
  className: 'custom-location-picker-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab; user-select: none;">
      <div style="width: 38px; height: 38px; border-radius: 14px; background: linear-gradient(135deg, #d97706, #b45309); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #ffffff;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 11h1a3 3 0 0 1 0 6h-1"/>
        </svg>
      </div>
      <div style="width: 10px; height: 10px; background: #b45309; transform: rotate(45deg); margin-top: -5px; border-right: 2px solid #ffffff; border-bottom: 2px solid #ffffff;"></div>
      <div style="width: 14px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 9999px; filter: blur(1px); margin-top: 2px;"></div>
    </div>
  `,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
});

function MapEventHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapViewController({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  const prevCoordsRef = useRef<string>('');

  useEffect(() => {
    const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
    if (prevCoordsRef.current !== key) {
      prevCoordsRef.current = key;
      map.setView([lat, lon], map.getZoom(), { animate: true });
    }
  }, [lat, lon, map]);

  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function LocationPickerMapInner({
  lat,
  lon,
  onChange,
  className,
}: LocationPickerMapInnerProps) {
  const centerLat = typeof lat === 'number' && !isNaN(lat) ? lat : DEFAULT_LOCATION.lat;
  const centerLon = typeof lon === 'number' && !isNaN(lon) ? lon : DEFAULT_LOCATION.lng;

  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.LeafletEvent) {
        const marker = e.target;
        if (marker != null) {
          const pos = marker.getLatLng();
          onChange(pos.lat, pos.lng);
        }
      },
    }),
    [onChange]
  );

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChange(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  return (
    <div className={cn('relative w-full h-full min-h-[220px] rounded-xl overflow-hidden border border-border bg-muted/40', className)}>
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={15}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapEventHandler onLocationSelect={onChange} />
        <MapViewController lat={centerLat} lon={centerLon} />

        <Marker
          position={[centerLat, centerLon]}
          icon={pickerIcon}
          draggable={true}
          eventHandlers={eventHandlers}
          title="Kéo thả hoặc nhấp bản đồ để chọn vị trí"
        />
      </MapContainer>

      {/* Floating Instructions & Locate Button */}
      <div className="absolute top-2.5 left-2.5 z-[400] flex items-center gap-1.5">
        <div className="bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border/80 text-[11px] font-medium text-foreground shadow-sm flex items-center gap-1.5">
          <MapPin size={12} className="text-amber-gold" />
          <span>Nhấp hoặc kéo thả ghim</span>
        </div>
      </div>

      <div className="absolute top-2.5 right-2.5 z-[400]">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleGetCurrentLocation}
          title="Lấy vị trí GPS hiện tại"
          className="h-8 px-2.5 bg-background/90 backdrop-blur-md hover:bg-background border border-border/80 text-foreground text-xs shadow-sm flex items-center gap-1.5 rounded-lg active:scale-95 transition-all"
        >
          <Crosshair size={13} className="text-amber-gold" />
          <span className="hidden xs:inline">Vị trí của tôi</span>
        </Button>
      </div>

      {/* Bottom Coordinates Bar */}
      <div className="absolute bottom-2 left-2 right-2 z-[400] bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border/80 text-[10px] text-muted-foreground flex items-center justify-between shadow-xs">
        <span>Tọa độ: <strong className="text-foreground font-mono">{centerLat.toFixed(5)}, {centerLon.toFixed(5)}</strong></span>
        <span className="text-[9px] text-muted-foreground">Kéo ghim để tinh chỉnh</span>
      </div>
    </div>
  );
}
