'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

export function useNearbyShops(
  lat: number,
  lng: number,
  limit: number = 200,
  offset: number = 0
) {
  return useQuery({
    queryKey: ['shops', 'nearby', lat, lng, limit, offset],
    queryFn: async () => {
      const response = await axios.get<{ shops: CoffeeShop[]; total: number }>(
        API_ENDPOINTS.NEARBY_SHOPS,
        {
          params: { lat, lng, limit, offset },
        }
      );
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

export function useSearchShops(query: string, lat?: number, lng?: number) {
  return useQuery({
    queryKey: ['shops', 'search', query, lat, lng],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await axios.get<{ shops: CoffeeShop[] }>(API_ENDPOINTS.SEARCH_SHOPS, {
        params: { q: query, lat, lng },
      });
      return response.data.shops;
    },
    staleTime: 30 * 1000,
    enabled: Boolean(query.trim()),
  });
}
