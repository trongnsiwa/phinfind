'use client';

import { useCallback, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_ENDPOINTS, APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { UserProfile } from '@/types/user';
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
  username?: string | null;
  shop_name?: string;
  shop_address?: string | null;
  shop_photo?: string | null;
  like_count?: number;
  liked_by_me?: boolean;
  is_edited?: boolean;
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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

export interface EditReviewPayload {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  shop_place_id?: string;
}

export function useEditReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EditReviewPayload) => {
      const res = await axios.put<{ review: ReviewData; success: boolean }>(
        '/api/reviews',
        payload
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      toast.success('Đã cập nhật đánh giá');
      queryClient.invalidateQueries({ queryKey: ['shops', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'reviews'] });
      if (variables.shop_place_id) {
        queryClient.invalidateQueries({ queryKey: ['shops', 'reviews', variables.shop_place_id] });
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Không thể cập nhật đánh giá. Vui lòng thử lại.';
      toast.error(msg);
    },
  });
}

export interface ToggleReviewLikeInput {
  reviewId: string;
  isCurrentlyLiked: boolean;
  placeId?: string;
}

export function useToggleReviewLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, isCurrentlyLiked }: ToggleReviewLikeInput) => {
      if (isCurrentlyLiked) {
        const res = await axios.delete<{ liked: boolean; like_count: number }>(
          `/api/reviews/${reviewId}/like`
        );
        return res.data;
      } else {
        const res = await axios.post<{ liked: boolean; like_count: number }>(
          `/api/reviews/${reviewId}/like`
        );
        return res.data;
      }
    },
    onMutate: async ({ reviewId, isCurrentlyLiked, placeId }) => {
      const queryKey = placeId ? ['shops', 'reviews', placeId] : ['shops', 'reviews'];
      await queryClient.cancelQueries({ queryKey });

      const previousReviews = queryClient.getQueryData<ReviewData[]>(queryKey);

      if (previousReviews) {
        queryClient.setQueryData<ReviewData[]>(queryKey, (old) => {
          if (!old) return [];
          return old.map((rev) => {
            if (rev.id === reviewId) {
              const currentCount = rev.like_count || 0;
              const newCount = isCurrentlyLiked
                ? Math.max(0, currentCount - 1)
                : currentCount + 1;
              return {
                ...rev,
                liked_by_me: !isCurrentlyLiked,
                like_count: newCount,
              };
            }
            return rev;
          });
        });
      }

      return { previousReviews, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousReviews && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousReviews);
      }
      toast.error('Không thể cập nhật. Vui lòng thử lại.');
    },
    onSettled: (_data, _error, variables) => {
      if (variables.placeId) {
        queryClient.invalidateQueries({ queryKey: ['shops', 'reviews', variables.placeId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['shops', 'reviews'] });
      }
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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

export interface VisitedShopItem {
  id: string;
  user_id: string;
  shop_place_id: string;
  shop_name: string;
  shop_address?: string | null;
  visited_at: string;
  note?: string | null;
  created_at: string;
  shop?: CoffeeShop | null;
}

export interface ToggleVisitInput {
  place_id?: string;
  id?: string;
  name?: string;
  address?: string | null;
  note?: string | null;
  updateOnly?: boolean;
}

export function useUserVisits() {
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();
  const setVisits = useShopStore((state) => state.setVisits);

  const query = useQuery<VisitedShopItem[]>({
    queryKey: ['user', 'visits', user?.id],
    queryFn: async () => {
      try {
        const response = await axios.get<{ visits: VisitedShopItem[] }>(
          API_ENDPOINTS.USER_VISITS
        );
        return response.data.visits || [];
      } catch (err: any) {
        if (err?.response?.status === 401) {
          return [];
        }
        throw err;
      }
    },
    enabled: !isAuthLoading && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      const newIds = query.data.map((v) => v.shop_place_id).filter(Boolean);
      const currentIds = useShopStore.getState().visits;
      const isSame =
        currentIds.length === newIds.length &&
        currentIds.every((id, idx) => id === newIds[idx]);
      if (!isSame) {
        setVisits(newIds);
      }
    } else if (!isAuthenticated && !isAuthLoading) {
      if (useShopStore.getState().visits.length > 0) {
        setVisits([]);
      }
    }
  }, [query.data, isAuthenticated, isAuthLoading, setVisits]);

  return query;
}

export function useToggleVisit() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const toggleVisit = useCallback(
    async (
      input: string | ToggleVisitInput,
      details?: { name?: string; address?: string | null; note?: string | null; updateOnly?: boolean }
    ) => {
      let placeId: string;
      let name: string = 'Quán Cà Phê';
      let address: string | null = null;
      let note: string | null = null;
      let updateOnly: boolean = false;

      if (typeof input === 'string') {
        placeId = input;
        if (details?.name) name = details.name;
        if (details?.address !== undefined) address = details.address;
        if (details?.note !== undefined) note = details.note;
        if (details?.updateOnly) updateOnly = details.updateOnly;
      } else {
        placeId = input.place_id || (input as any).id;
        if (input.name) name = input.name;
        if (input.address !== undefined) address = input.address;
        if (input.note !== undefined) note = input.note;
        if (input.updateOnly) updateOnly = input.updateOnly;
        if (details?.name) name = details.name;
        if (details?.address !== undefined) address = details.address;
        if (details?.note !== undefined) note = details.note;
        if (details?.updateOnly) updateOnly = details.updateOnly;
      }

      if (!placeId) return;

      if (!isAuthenticated) {
        toast('Yêu cầu đăng nhập', {
          description:
            'Đăng nhập để đánh dấu các quán bạn đã ghé thăm và theo dõi lịch sử cà phê của bạn.',
          action: {
            label: 'Đăng nhập',
            onClick: () => router.push(APP_ROUTES.LOGIN),
          },
        });
        return;
      }

      const isCurrentlyVisited = useShopStore.getState().visits.includes(placeId);

      // If adding or updating and shop name wasn't provided, look up from Zustand store
      if ((!isCurrentlyVisited || updateOnly) && name === 'Quán Cà Phê') {
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

      // Optimistic store update only when toggling visited status (not when updating note)
      if (!updateOnly) {
        useShopStore.getState().toggleVisit(placeId);
      }

      try {
        if (isCurrentlyVisited && !updateOnly) {
          await axios.delete(API_ENDPOINTS.USER_VISITS, {
            params: { placeId },
          });
          toast.info('Đã bỏ đánh dấu ghé thăm');
        } else {
          await axios.post(API_ENDPOINTS.USER_VISITS, {
            shop_place_id: placeId,
            name,
            address: address || null,
            note: note !== undefined ? note : null,
          });
          if (updateOnly) {
            toast.success(note ? 'Đã cập nhật ghi chú ghé thăm!' : 'Đã xóa ghi chú ghé thăm!');
          } else {
            toast.success('Đã đánh dấu đã ghé thăm quán!');
          }
        }

        await queryClient.invalidateQueries({ queryKey: ['user', 'visits'] });
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đã ghé:', error);
        // Rollback store state on failure
        if (!updateOnly) {
          useShopStore.getState().toggleVisit(placeId);
        }
        toast.error('Không thể cập nhật trạng thái đã ghé. Vui lòng thử lại.');
      }
    },
    [isAuthenticated, queryClient, router]
  );

  return Object.assign(toggleVisit, { toggleVisit });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      username?: string | null;
      full_name?: string | null;
      avatar_url?: string | null;
      bio?: string | null;
    }) => {
      const res = await axios.put<{ profile: UserProfile }>(
        API_ENDPOINTS.USER_PROFILE,
        payload
      );
      return res.data?.profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.put<{
        success: boolean;
        message: string;
        shop: CoffeeShop;
      }>(API_ENDPOINTS.UPDATE_SHOP, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật quán cà phê thành công!', {
        description: 'Thông tin đã được lưu và chuyển sang trạng thái chờ duyệt lại.',
      });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Không thể cập nhật quán cà phê. Vui lòng thử lại.';
      toast.error('Lỗi khi cập nhật quán', { description: msg });
    },
  });
}

export function useDeleteShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (placeId: string) => {
      const res = await axios.delete<{
        success: boolean;
        message?: string;
      }>(API_ENDPOINTS.DELETE_SHOP, {
        params: { placeId },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Đã xóa quán cà phê thành công!');
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'visits'] });
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Không thể xóa quán cà phê. Vui lòng thử lại.';
      toast.error('Lỗi khi xóa quán', { description: msg });
    },
  });
}

export interface PublicProfileData {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  created_at: string;
}

export interface PublicProfileResponse {
  profile: PublicProfileData;
  reviews: ReviewData[];
}

export function usePublicProfile(username: string) {
  return useQuery<PublicProfileResponse>({
    queryKey: ['user', 'public', username],
    queryFn: async () => {
      const res = await axios.get<PublicProfileResponse>(API_ENDPOINTS.PUBLIC_PROFILE, {
        params: { username },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(username),
  });
}

export function usePublicUserReviews(username: string) {
  return useQuery<PublicProfileResponse, Error, ReviewData[]>({
    queryKey: ['user', 'public', username],
    queryFn: async () => {
      const res = await axios.get<PublicProfileResponse>(API_ENDPOINTS.PUBLIC_PROFILE, {
        params: { username },
      });
      return res.data;
    },
    select: (data) => data?.reviews || [],
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(username),
  });
}
