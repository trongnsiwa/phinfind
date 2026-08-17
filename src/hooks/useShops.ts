'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

export function useNearbyShops(lat: number, lng: number, radiusMeters: number = 3000) {
  return useQuery({
    queryKey: ['shops', 'nearby', lat, lng, radiusMeters],
    queryFn: async () => {
      const response = await axios.get<{ shops: CoffeeShop[] }>(API_ENDPOINTS.NEARBY_SHOPS, {
        params: { lat, lng, radius: radiusMeters },
      });
      return response.data.shops;
    },
    staleTime: 60 * 1000, // 60s
    enabled: Boolean(lat && lng),
  });
}

export function useShopDetails(placeId: string) {
  return useQuery({
    queryKey: ['shops', 'details', placeId],
    queryFn: async () => {
      const response = await axios.get<{ shop: CoffeeShop }>(API_ENDPOINTS.SHOP_DETAILS, {
        params: { placeId },
      });
      return response.data.shop;
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(placeId),
  });
}
