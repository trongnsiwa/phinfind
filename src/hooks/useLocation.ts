'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';

export interface LocationState {
  lat: number;
  lng: number;
  error: string | null;
  loading: boolean;
  isFallback: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
    error: null,
    loading: true,
    isFallback: true,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation({
        lat: DEFAULT_LOCATION.lat,
        lng: DEFAULT_LOCATION.lng,
        error: 'Trình duyệt của bạn không hỗ trợ định vị GPS',
        loading: false,
        isFallback: true,
      });
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          loading: false,
          isFallback: false,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocation({
          lat: DEFAULT_LOCATION.lat,
          lng: DEFAULT_LOCATION.lng,
          error: error.message,
          loading: false,
          isFallback: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return {
    ...location,
    refetchLocation: requestLocation,
  };
}
