'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Plus, Minus, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoffeeShop } from '@/types/shop';
import { cn } from '@/lib/utils';

// Helper to escape HTML characters in dynamic shop strings
const escapeHtml = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Helper to generate SVG-based compact card marker with coffee cup, rating, and 2-line shop name
const createShopMarkerIcon = (name = 'Coffee Shop', rating?: number, isSelected = false) => {
  const ratingText = rating && rating > 0 ? rating.toFixed(1) : '4.8';
  const escapedName = escapeHtml(name);

  if (isSelected) {
    return L.divIcon({
      className: 'custom-shop-marker-selected',
      html: `
        <div role="button" title="${escapedName}" aria-label="Selected ${escapedName}, rating ${ratingText}" class="relative flex flex-col items-center cursor-pointer select-none origin-bottom transition-transform duration-300 ease-out scale-140 -translate-y-1 z-50">
          <!-- Gentle Glowing Amber Pulse Halo -->
          <div class="absolute -inset-2.5 rounded-2xl bg-[#D4A057]/40 animate-pulse-ring-halo pointer-events-none ring-1 ring-[#D4A057]/60"></div>
          
          <!-- Compact Card Body in Default Dark Theme with Amber Accent -->
          <div class="relative flex flex-col items-center w-[86px] bg-[#1A0F0A]/95 backdrop-blur-md px-1.5 py-1 rounded-xl shadow-2xl shadow-black/95 border border-[#D4A057] ring-1 ring-[#D4A057]/50">
            <!-- Top Row: Outlined Cup Icon & Outlined Rating Badge -->
            <div class="flex items-center justify-center gap-1.5 w-full">
              <span class="w-4 h-4 rounded-full bg-[#2C1810] border border-[#D4A057] flex items-center justify-center text-[#D4A057] shadow-xs flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 11h1a3 3 0 0 1 0 6h-1"/>
                </svg>
              </span>
              <span class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#1A0F0A] border border-[#D4A057] text-[9px] font-black text-[#D4A057] leading-none shadow-xs flex-shrink-0">
                <span class="text-[8px] text-[#E8B86D]">★</span>
                <span>${ratingText}</span>
              </span>
            </div>
            <!-- Bottom Row: 2-Line Clamped Name -->
            <div class="text-[9px] font-bold text-[#FAF7F2] text-center leading-tight mt-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word; line-height: 1.15;">
              ${escapedName}
            </div>
          </div>
          <!-- Bottom Arrow Tip -->
          <div class="w-2 h-2 bg-[#1A0F0A] border-r border-b border-[#D4A057] rotate-45 -mt-1 shadow-sm"></div>
        </div>
      `,
      iconSize: [90, 50],
      iconAnchor: [45, 50],
      popupAnchor: [0, -50],
    });
  }

  return L.divIcon({
    className: 'custom-shop-marker',
    html: `
      <div role="button" title="${escapedName}" aria-label="${escapedName}, rating ${ratingText}" class="relative flex flex-col items-center cursor-pointer group select-none transition-transform duration-200 ease-out hover:scale-110 hover:-translate-y-1">
        <!-- Compact Card Body with Subtle White Border -->
        <div class="flex flex-col items-center w-[86px] bg-[#1A0F0A]/95 backdrop-blur-md px-1.5 py-1 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.9)] border border-white/20 group-hover:border-[#D4A057] group-hover:bg-[#2C1810] transition-all">
          <!-- Top Row: Outlined Cup Icon & Outlined Rating Badge -->
          <div class="flex items-center justify-center gap-1.5 w-full">
            <span class="w-4 h-4 rounded-full bg-[#2C1810] border border-white/40 group-hover:border-[#D4A057] flex items-center justify-center text-[#D4A057] shadow-xs flex-shrink-0 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 11h1a3 3 0 0 1 0 6h-1"/>
              </svg>
            </span>
            <span class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#1A0F0A] border border-[#D4A057]/60 text-[9px] font-black text-[#D4A057] leading-none shadow-xs flex-shrink-0">
              <span class="text-[8px] text-[#E8B86D]">★</span>
              <span>${ratingText}</span>
            </span>
          </div>
          <!-- Bottom Row: 2-Line Clamped Name -->
          <div class="text-[9px] font-semibold text-[#FAF7F2] text-center leading-tight mt-1 group-hover:text-[#E8B86D] transition-colors" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word; line-height: 1.15;">
            ${escapedName}
          </div>
        </div>
        <!-- Bottom Arrow Tip -->
        <div class="w-2 h-2 bg-[#1A0F0A] border-r border-b border-white/20 rotate-45 -mt-1 shadow-sm group-hover:border-[#D4A057] transition-colors"></div>
      </div>
    `,
    iconSize: [90, 50],
    iconAnchor: [45, 50],
    popupAnchor: [0, -50],
  });
};

// Cache marker DivIcons to prevent unnecessary DOM layer thrashing and popup positioning errors
const iconCache = new Map<string, L.DivIcon>();
const getShopMarkerIcon = (shop: CoffeeShop, isSelected = false) => {
  const ratingKey = shop.rating && shop.rating > 0 ? shop.rating.toFixed(1) : '4.8';
  const nameKey = shop.name || 'Coffee';
  const cacheKey = `${shop.id || shop.place_id}-${nameKey}-${ratingKey}-${isSelected ? '1' : '0'}`;
  let cached = iconCache.get(cacheKey);
  if (!cached) {
    cached = createShopMarkerIcon(shop.name, shop.rating, isSelected);
    iconCache.set(cacheKey, cached);
  }
  return cached;
};

// Prominent blue-accented user location dot with outer pulsing ring
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div role="img" aria-label="Current GPS location" class="relative w-8 h-8 flex items-center justify-center pointer-events-none select-none">
      <div class="absolute inset-0 rounded-full bg-sky-500/35 animate-ping"></div>
      <div class="absolute inset-1 rounded-full bg-sky-400/25 animate-pulse"></div>
      <div class="relative w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-[0_0_14px_rgba(14,165,233,0.9)] flex items-center justify-center">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom amber-gold to dark-roast cluster badge with bold dark text
const createCustomClusterIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  let size = 38;
  let textSize = 'text-xs font-bold';
  if (count >= 50) {
    size = 48;
    textSize = 'text-sm font-black';
  } else if (count >= 10) {
    size = 42;
    textSize = 'text-xs font-black';
  }

  return L.divIcon({
    html: `
      <div role="button" aria-label="${count} coffee spots cluster" style="width: ${size}px; height: ${size}px;" class="flex items-center justify-center rounded-full bg-gradient-to-br from-[#E8B86D] via-[#D4A057] to-[#2C1810] text-[#1A0F0A] ${textSize} shadow-[0_8px_22px_rgba(0,0,0,0.7)] border-2 border-white ring-4 ring-[#D4A057]/35 transition-transform duration-300 ease-out hover:scale-115 active:scale-95 select-none">
        <span class="leading-none drop-shadow-xs font-black">${count}</span>
      </div>
    `,
    className: 'custom-marker-cluster-icon',
    iconSize: L.point(size, size, true),
  });
};

function MapFocusController({
  selectedShop,
}: {
  selectedShop: CoffeeShop | null;
}) {
  const map = useMap();
  const prevShopIdRef = useRef<string | null>(null);

  // Continuously invalidate size whenever the map container resizes (e.g. sidebar open/close CSS transition)
  useEffect(() => {
    map.invalidateSize();
    const container = map.getContainer();
    if (!container) return;

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize({ animate: false, pan: false });
      });
      resizeObserver.observe(container);
    }

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (!selectedShop || typeof selectedShop.lat !== 'number' || typeof selectedShop.lon !== 'number') {
      if (prevShopIdRef.current !== null) {
        prevShopIdRef.current = null;
        // Drawer/sidebar closed: invalidate size across the 300ms CSS width expansion to immediately fill blank right space
        map.invalidateSize({ animate: false, pan: false });
        const t1 = setTimeout(() => map.invalidateSize({ animate: false, pan: false }), 100);
        const t2 = setTimeout(() => map.invalidateSize({ animate: false, pan: false }), 250);
        const t3 = setTimeout(() => map.invalidateSize({ animate: false, pan: false }), 350);
        const t4 = setTimeout(() => map.invalidateSize({ animate: false, pan: false }), 500);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          clearTimeout(t4);
        };
      }
      return;
    }

    const currentShopId = selectedShop.id || selectedShop.place_id || `${selectedShop.lat}-${selectedShop.lon}`;

    if (currentShopId !== prevShopIdRef.current) {
      prevShopIdRef.current = currentShopId;

      map.invalidateSize({ animate: false, pan: false });
      map.flyTo([selectedShop.lat, selectedShop.lon], 17, {
        animate: true,
        duration: 1.2,
      });

      const timer = setTimeout(() => {
        map.invalidateSize({ animate: false, pan: false });
        map.panTo([selectedShop.lat, selectedShop.lon], { animate: true, duration: 0.3 });
      }, 340);

      return () => clearTimeout(timer);
    }
  }, [selectedShop, map]);

  return null;
}

// Compact bottom-right floating controls grouping zoom controls and recenter button
function MapFloatingControls({
  center,
  onRecenter,
}: {
  center: [number, number];
  onRecenter?: () => void;
}) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleRecenter = () => {
    map.flyTo(center, 14, {
      animate: true,
      duration: 1.2,
    });
    onRecenter?.();
  };

  return (
    <div className="absolute bottom-5 right-4 sm:bottom-6 sm:right-6 z-[400] flex flex-col gap-2 pointer-events-auto select-none items-center">
      {/* Recenter Location Button */}
      {onRecenter && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRecenter}
          aria-label="Re-center map on GPS location"
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-dark-bg/90 backdrop-blur-md border border-dark-border/80 text-sky-400 hover:text-sky-300 hover:bg-dark-roast hover:border-sky-400/50 shadow-xl shadow-black/50 transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <Navigation size={17} className="fill-sky-400/20 text-sky-400 group-hover:scale-110 transition-transform" />
        </Button>
      )}

      {/* Grouped Zoom In / Zoom Out Capsule */}
      <div className="w-10 sm:w-11 flex flex-col bg-dark-bg/90 backdrop-blur-md border border-dark-border/80 rounded-2xl shadow-xl shadow-black/50 overflow-hidden divide-y divide-dark-border/60">
        <Button
          type="button"
          variant="ghost"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-full h-10 sm:h-11 p-0 rounded-none text-cream-white hover:text-amber-gold hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
        >
          <Plus size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-full h-10 sm:h-11 p-0 rounded-none text-cream-white hover:text-amber-gold hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
        >
          <Minus size={16} />
        </Button>
      </div>
    </div>
  );
}

interface LeafletMapInnerProps {
  center: [number, number];
  zoom?: number;
  shops: CoffeeShop[];
  selectedShop: CoffeeShop | null;
  onSelectShop: (shop: CoffeeShop) => void;
  onRecenter?: () => void;
  className?: string;
}

export default function LeafletMapInner({
  center,
  zoom = 14,
  shops,
  selectedShop,
  onSelectShop,
  onRecenter,
  className,
}: LeafletMapInnerProps) {
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <MapFocusController selectedShop={selectedShop} />

        {/* User Location Marker */}
        <Marker position={center} icon={userIcon} title="You are here">
          <Popup className="custom-dark-popup">
            <span className="font-medium text-xs text-cream-white">You are here</span>
          </Popup>
        </Marker>

        {/* Clustered Shop Markers (Unselected spots) */}
        <MarkerClusterGroup
          chunkedLoading={true}
          iconCreateFunction={createCustomClusterIcon}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          zoomToBoundsOnClick={true}
          disableClusteringAtZoom={16}
          maxClusterRadius={45}
        >
          {shops
            .filter((shop) => shop.id !== selectedShop?.id && shop.place_id !== selectedShop?.place_id)
            .map((shop) => {
              const markerIcon = getShopMarkerIcon(shop, false);

              return (
                <Marker
                  key={shop.id}
                  position={[shop.lat, shop.lon]}
                  icon={markerIcon}
                  title={shop.name}
                  alt={shop.name}
                  keyboard={true}
                  riseOnHover={true}
                  eventHandlers={{
                    click: () => {
                      onSelectShop(shop);
                    },
                  }}
                />
              );
            })}
        </MarkerClusterGroup>

        {/* Prominent Active Selected Shop Marker (Always unclustered and focused) */}
        {selectedShop && typeof selectedShop.lat === 'number' && typeof selectedShop.lon === 'number' && (
          <Marker
            key={`selected-${selectedShop.id || selectedShop.place_id}`}
            position={[selectedShop.lat, selectedShop.lon]}
            icon={getShopMarkerIcon(selectedShop, true)}
            title={selectedShop.name}
            alt={selectedShop.name}
            keyboard={true}
            zIndexOffset={1000}
            riseOnHover={true}
            eventHandlers={{
              click: () => {
                onSelectShop(selectedShop);
              },
            }}
          />
        )}

        <MapFloatingControls center={center} onRecenter={onRecenter} />
      </MapContainer>
    </div>
  );
}
