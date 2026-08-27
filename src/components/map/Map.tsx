'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CoffeeShop } from '@/types/shop';

interface MapProps {
  center: [number, number];
  zoom?: number;
  shops: CoffeeShop[];
  selectedShop: CoffeeShop | null;
  searchQuery?: string;
  onSelectShop: (shop: CoffeeShop) => void;
  onRecenter?: () => void;
  className?: string;
}

// Dynamically import Leaflet map component to prevent SSR window undefined errors
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => <LoadingSpinner text="Đang chuẩn bị bản đồ tương tác..." className="w-full h-full flex-1 min-h-[300px]" />,
});

export function Map(props: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner text="Đang khởi tạo bản đồ..." className="w-full h-full flex-1 min-h-[300px]" />;
  }

  return <LeafletMapInner {...props} />;
}
