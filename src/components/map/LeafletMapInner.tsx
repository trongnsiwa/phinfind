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
const createShopMarkerIcon = (name = 'Quán cà phê', rating?: number, isSelected = false) => {
  const ratingText = rating && rating > 0 ? rating.toFixed(1) : '4.8';
  const escapedName = escapeHtml(name);

  if (isSelected) {
    return L.divIcon({
      className: 'custom-shop-marker-selected',
      html: `
        <div role="button" title="${escapedName}" aria-label="Đã chọn ${escapedName}, đánh giá ${ratingText}" class="shop-marker-wrapper is-selected">
          <div class="shop-marker-halo"></div>
          <div class="shop-marker-card">
            <div class="shop-marker-top-row">
              <span class="shop-marker-cup">
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 11h1a3 3 0 0 1 0 6h-1"/>
                </svg>
              </span>
              <span class="shop-marker-rating">
                <span class="shop-marker-star">★</span>
                <span>${ratingText}</span>
              </span>
            </div>
            <div class="shop-marker-name">
              ${escapedName}
            </div>
          </div>
          <div class="shop-marker-tip"></div>
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
      <div role="button" title="${escapedName}" aria-label="${escapedName}, đánh giá ${ratingText}" class="shop-marker-wrapper">
        <div class="shop-marker-card">
          <div class="shop-marker-top-row">
            <span class="shop-marker-cup">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 11h1a3 3 0 0 1 0 6h-1"/>
              </svg>
            </span>
            <span class="shop-marker-rating">
              <span class="shop-marker-star">★</span>
              <span>${ratingText}</span>
            </span>
          </div>
          <div class="shop-marker-name">
            ${escapedName}
          </div>
        </div>
        <div class="shop-marker-tip"></div>
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
  const nameKey = shop.name || 'Quán Cà Phê';
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
    <div role="img" aria-label="Vị trí GPS hiện tại" class="relative w-8 h-8 flex items-center justify-center pointer-events-none select-none">
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

// Custom theme-adaptive cluster badge with bold text
const createCustomClusterIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  let size = 38;
  let textSize = 'text-xs font-black';
  if (count >= 50) {
    size = 48;
    textSize = 'text-sm font-black';
  } else if (count >= 10) {
    size = 42;
    textSize = 'text-xs font-black';
  }

  return L.divIcon({
    html: `
      <div role="button" aria-label="Cụm ${count} quán cà phê" style="width: ${size}px; height: ${size}px;" class="shop-cluster-badge ${textSize}">
        <span>${count}</span>
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
        duration: 0.8,
        easeLinearity: 0.25,
      });
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
          aria-label="Định vị lại bản đồ theo vị trí GPS"
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-card/90 backdrop-blur-md border border-border text-sky-500 hover:text-sky-400 hover:bg-secondary shadow-xl transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <Navigation size={17} className="fill-sky-400/20 text-sky-500 group-hover:scale-110 transition-transform" />
        </Button>
      )}

      {/* Grouped Zoom In / Zoom Out Capsule */}
      <div className="w-10 sm:w-11 flex flex-col bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-xl overflow-hidden divide-y divide-border/60">
        <Button
          type="button"
          variant="ghost"
          onClick={handleZoomIn}
          aria-label="Phóng to"
          className="w-full h-10 sm:h-11 p-0 rounded-none text-foreground hover:text-amber-gold hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
        >
          <Plus size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleZoomOut}
          aria-label="Thu nhỏ"
          className="w-full h-10 sm:h-11 p-0 rounded-none text-foreground hover:text-amber-gold hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapFocusController selectedShop={selectedShop} />

        {/* User Location Marker */}
        <Marker position={center} icon={userIcon} title="Vị trí của bạn">
          <Popup className="custom-dark-popup">
            <span className="font-medium text-xs text-white">Vị trí của bạn</span>
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
