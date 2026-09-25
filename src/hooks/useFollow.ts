'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { API_ENDPOINTS, APP_ROUTES } from '@/lib/utils/constants';
import { SocialStats } from '@/types/user';
import { FeedResponse } from '@/types/feed';

export interface FollowProfileItem {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  followed_at: string;
  is_following?: boolean;
}

export interface FollowListResponse {
  profiles: FollowProfileItem[];
  total: number;
}

export function useFollowStatus(userId?: string) {
  return useQuery<SocialStats>({
    queryKey: ['user', 'follow-status', userId],
    queryFn: async () => {
      if (!userId) {
        return { followers: 0, following: 0, is_following: false };
      }
      const res = await axios.get<SocialStats>(API_ENDPOINTS.FOLLOW_STATUS, {
        params: { user_id: userId },
      });
      return res.data;
    },
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      isCurrentlyFollowing,
    }: {
      targetUserId: string;
      isCurrentlyFollowing: boolean;
      targetUsername?: string;
    }) => {
      if (!isAuthenticated) {
        throw new Error('UNAUTHENTICATED');
      }

      if (isCurrentlyFollowing) {
        const res = await axios.delete(API_ENDPOINTS.FOLLOW, {
          params: { followee_id: targetUserId },
        });
        return res.data;
      } else {
        const res = await axios.post(API_ENDPOINTS.FOLLOW, {
          followee_id: targetUserId,
        });
        return res.data;
      }
    },
    onMutate: async ({ targetUserId, isCurrentlyFollowing, targetUsername }) => {
      // Guest gate
      if (!isAuthenticated) {
        toast('Yêu cầu đăng nhập', {
          description: 'Đăng nhập để theo dõi những người yêu cà phê và cập nhật hành trình của họ.',
          action: {
            label: 'Đăng nhập',
            onClick: () => router.push(APP_ROUTES.LOGIN),
          },
        });
        throw new Error('UNAUTHENTICATED');
      }

      await queryClient.cancelQueries({ queryKey: ['user', 'follow-status', targetUserId] });
      if (targetUsername) {
        await queryClient.cancelQueries({ queryKey: ['public-profile', targetUsername] });
      }

      const previousStatus = queryClient.getQueryData<SocialStats>(['user', 'follow-status', targetUserId]);

      queryClient.setQueryData<SocialStats>(['user', 'follow-status', targetUserId], (old) => {
        if (!old) {
          return {
            followers: isCurrentlyFollowing ? 0 : 1,
            following: 0,
            is_following: !isCurrentlyFollowing,
          };
        }
        return {
          ...old,
          followers: Math.max(0, old.followers + (isCurrentlyFollowing ? -1 : 1)),
          is_following: !isCurrentlyFollowing,
        };
      });

      if (targetUsername) {
        queryClient.setQueryData<any>(['public-profile', targetUsername], (old: any) => {
          if (!old?.profile?.social_stats) return old;
          const currentStats = old.profile.social_stats;
          return {
            ...old,
            profile: {
              ...old.profile,
              social_stats: {
                ...currentStats,
                followers: Math.max(0, currentStats.followers + (isCurrentlyFollowing ? -1 : 1)),
                is_following: !isCurrentlyFollowing,
              },
            },
          };
        });
      }

      return { previousStatus, targetUserId, targetUsername };
    },
    onError: (err: any, _vars, context) => {
      if (err?.message === 'UNAUTHENTICATED') return;
      if (context?.previousStatus && context?.targetUserId) {
        queryClient.setQueryData(['user', 'follow-status', context.targetUserId], context.previousStatus);
      }
      toast.error('Không thể cập nhật theo dõi. Vui lòng thử lại.');
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'follow-status', variables.targetUserId] });
      if (variables.targetUsername) {
        queryClient.invalidateQueries({ queryKey: ['public-profile', variables.targetUsername] });
      }
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user', 'following', user.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useFeed(limit = 20) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery<FeedResponse>({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = null }) => {
      const res = await axios.get<FeedResponse>(API_ENDPOINTS.FEED, {
        params: {
          cursor: pageParam || undefined,
          limit,
        },
      });
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage?.next_cursor || undefined,
    staleTime: 30 * 1000,
    enabled: isAuthenticated,
  });
}

export function useFollowers(userId?: string, limit = 20) {
  return useInfiniteQuery<FollowListResponse>({
    queryKey: ['user', 'followers', userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return { profiles: [], total: 0 };
      const res = await axios.get<FollowListResponse>(API_ENDPOINTS.FOLLOWERS, {
        params: {
          user_id: userId,
          limit,
          offset: pageParam,
        },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.profiles).length;
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}

export function useFollowing(userId?: string, limit = 20) {
  return useInfiniteQuery<FollowListResponse>({
    queryKey: ['user', 'following', userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return { profiles: [], total: 0 };
      const res = await axios.get<FollowListResponse>(API_ENDPOINTS.FOLLOWING, {
        params: {
          user_id: userId,
          limit,
          offset: pageParam,
        },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.profiles).length;
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}
