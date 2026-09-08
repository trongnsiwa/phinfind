'use client';

import { useCallback, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_ENDPOINTS, APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { useShopStore } from '@/stores/useShopStore';
import { useAuth } from '@/hooks/useAuth';

export interface SavedShopItem {
  id?: string;
  user_id?: string;
  place_id: string;
  name: string;
  address?: string | null;
  created_at?: string;
}

export type ToggleFavoriteInput =
  | string
  | { place_id: string; name?: string; address?: string | null }
  | CoffeeShop;

export interface PaginatedShopsResponse {
  shops: CoffeeShop[];
  total: number;
  page: number;
  totalPages: number;
}

export function useInfiniteShops(
  lat: number,
  lng: number,
  limit: number = 12
) {
  return useInfiniteQuery({
    queryKey: ['shops', 'infinite', lat, lng, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get<PaginatedShopsResponse>(
        API_ENDPOINTS.NEARBY_SHOPS,
        {
          params: { lat, lng, limit, page: pageParam },
        }
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.shops || lastPage.shops.length < limit) {
        return undefined;
      }
      if (lastPage.page >= lastPage.totalPages) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    staleTime: 60 * 1000,
    enabled: Boolean(lat && lng),
  });
}

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

export interface ReviewData {
  id: string;
  shop_place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
  author: string;
  avatar?: string | null;
  shop_name?: string;
  shop_address?: string | null;
  shop_photo?: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export function useShopReviews(placeId: string) {
  return useQuery<ReviewData[]>({
    queryKey: ['shops', 'reviews', placeId],
    queryFn: async () => {
      if (!placeId) return [];
      const res = await axios.get<{ reviews: ReviewData[] }>(`/api/reviews`, {
        params: { placeId },
      });
      return res.data?.reviews || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: Boolean(placeId),
  });
}

export function useUserReviews() {
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();

  return useQuery<ReviewData[]>({
    queryKey: ['user', 'reviews', user?.id],
    queryFn: async () => {
      try {
        const res = await axios.get<{ reviews: ReviewData[] }>('/api/reviews', {
          params: { userId: user?.id },
        });
        return res.data?.reviews || [];
      } catch (err: any) {
        if (err?.response?.status === 401) {
          return [];
        }
        throw err;
      }
    },
    enabled: !isAuthLoading && isAuthenticated && Boolean(user?.id),
    staleTime: 60 * 1000,
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await axios.delete('/api/reviews', {
        params: { id: reviewId },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['shops', 'reviews'] });
      toast.success('Đã xóa đánh giá thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Không thể xóa đánh giá. Vui lòng thử lại.');
    },
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

export function useUserFavorites() {
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();
  const setFavorites = useShopStore((state) => state.setFavorites);

  const query = useQuery<SavedShopItem[]>({
    queryKey: ['user', 'favorites', user?.id],
    queryFn: async () => {
      try {
        const response = await axios.get<{ favorites: SavedShopItem[] }>(
          API_ENDPOINTS.USER_FAVORITES
        );
        return response.data.favorites || [];
      } catch (err: any) {
        if (err?.response?.status === 401) {
          return [];
        }
        throw err;
      }
    },
    enabled: !isAuthLoading && isAuthenticated,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      const newIds = query.data.map((f) => f.place_id).filter(Boolean);
      const currentIds = useShopStore.getState().favorites;
      const isSame =
        currentIds.length === newIds.length &&
        currentIds.every((id, idx) => id === newIds[idx]);
      if (!isSame) {
        setFavorites(newIds);
      }
    } else if (!isAuthenticated && !isAuthLoading) {
      if (useShopStore.getState().favorites.length > 0) {
        setFavorites([]);
      }
    }
  }, [query.data, isAuthenticated, isAuthLoading, setFavorites]);

  return query;
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const toggleFavorite = useCallback(
    async (
      input: ToggleFavoriteInput,
      details?: { name?: string; address?: string | null }
    ) => {
      let placeId: string;
      let name: string = 'Quán Cà Phê';
      let address: string | null = null;

      if (typeof input === 'string') {
        placeId = input;
        if (details?.name) name = details.name;
        if (details?.address !== undefined) address = details.address;
      } else {
        placeId = input.place_id || (input as any).id;
        if (input.name) name = input.name;
        if (input.address !== undefined) address = input.address;
      }

      if (!placeId) return;

      if (!isAuthenticated) {
        toast('Yêu cầu đăng nhập', {
          description:
            'Đăng nhập để bắt đầu lưu lại các quán yêu thích và chia sẻ trải nghiệm cà phê của bạn.',
          action: {
            label: 'Đăng nhập',
            onClick: () => router.push(APP_ROUTES.LOGIN),
          },
        });
        return;
      }

      const isCurrentlyFav = useShopStore.getState().favorites.includes(placeId);

      // If adding and shop name wasn't provided, look up from Zustand store
      if (!isCurrentlyFav && name === 'Quán Cà Phê') {
        const store = useShopStore.getState();
        const candidate =
          store.shops.find((s) => s.place_id === placeId || s.id === placeId) ||
          store.nearbyShops.find((s) => s.place_id === placeId || s.id === placeId) ||
          (store.selectedShop?.place_id === placeId ? store.selectedShop : null);
        if (candidate) {
          name = candidate.name;
          address = candidate.address || address;
        }
      }

      // Optimistic store update
      useShopStore.getState().toggleFavorite(placeId);

      try {
        if (isCurrentlyFav) {
          await axios.delete(API_ENDPOINTS.USER_FAVORITES, {
            params: { placeId },
          });
          toast.info('Đã xóa khỏi danh sách yêu thích');
        } else {
          await axios.post(API_ENDPOINTS.USER_FAVORITES, {
            place_id: placeId,
            name,
            address: address || null,
          });
          toast.success('Đã lưu quán vào danh sách yêu thích!');
        }

        await queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
      } catch (error) {
        console.error('Lỗi khi cập nhật danh sách yêu thích:', error);
        // Rollback store state on failure
        useShopStore.getState().toggleFavorite(placeId);
        toast.error('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.');
      }
    },
    [isAuthenticated, queryClient, router]
  );

  return Object.assign(toggleFavorite, { toggleFavorite });
}

