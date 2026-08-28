'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface LocationPickerMapProps {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
  className?: string;
}

const LocationPickerMapInner = dynamic(() => import('./LocationPickerMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[220px] rounded-xl border border-border bg-muted/30 flex items-center justify-center">
      <LoadingSpinner text="Đang tải bản đồ chọn vị trí..." />
    </div>
  ),
});

export function LocationPickerMap(props: LocationPickerMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[220px] rounded-xl border border-border bg-muted/30 flex items-center justify-center">
        <LoadingSpinner text="Đang chuẩn bị bản đồ..." />
      </div>
    );
  }

  return <LocationPickerMapInner {...props} />;
}
