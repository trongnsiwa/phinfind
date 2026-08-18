'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';

export function useReverseGeocode(lat: number, lng: number, isFallback: boolean) {
  return useQuery({
    queryKey: ['reverse-geocode', lat, lng, isFallback],
    queryFn: async (): Promise<string> => {
      if (isFallback) {
        return 'Hà Nội';
      }

      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
      if (!apiKey) {
        return 'Hà Nội';
      }

      try {
        const response = await axios.get('https://api.geoapify.com/v1/geocode/reverse', {
          params: {
            lat,
            lon: lng,
            apiKey,
          },
        });

        const feature = response.data?.features?.[0];
        const props = feature?.properties;

        const city =
          props?.city ||
          props?.town ||
          props?.village ||
          props?.municipality ||
          props?.county ||
          props?.state ||
          props?.country;

        return city || 'Hà Nội';
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
        return 'Hà Nội';
      }
    },
    staleTime: 10 * 60 * 1000, // 10 mins cache
    enabled: Boolean(lat && lng),
  });
}
