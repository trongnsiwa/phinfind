'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export type NotificationType =
  | 'review_liked'
  | 'shop_approved'
  | 'shop_rejected'
  | 'edit_suggestion_pending'
  | 'edit_suggestion_approved'
  | 'edit_suggestion_rejected';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id?: string | null;
  shop_place_id?: string | null;
  review_id?: string | null;
  payload?: Record<string, any>;
  read_at?: string | null;
  created_at: string;
  is_read: boolean;
  actor_name?: string | null;
  actor_avatar?: string | null;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unread_count: number;
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<NotificationsResponse>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const res = await axios.get<NotificationsResponse>('/api/notifications');
      return res.data;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30 * 1000,
  });

  // Realtime subscription to notifications for current user
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id, queryClient]);

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unread_count ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post<{ unread_count: number }>(`/api/notifications/${id}/read`);
      return res.data;
    },
    onMutate: async (id: string) => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ['notifications', user.id] });
      const previous = queryClient.getQueryData<NotificationsResponse>(['notifications', user.id]);

      if (previous) {
        let wasUnread = false;
        const updatedNotifications = previous.notifications.map((item) => {
          if (item.id === id) {
            if (!item.is_read) wasUnread = true;
            return { ...item, is_read: true, read_at: new Date().toISOString() };
          }
          return item;
        });

        queryClient.setQueryData<NotificationsResponse>(['notifications', user.id], {
          notifications: updatedNotifications,
          unread_count: wasUnread ? Math.max(0, previous.unread_count - 1) : previous.unread_count,
        });
      }

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (user?.id && context?.previous) {
        queryClient.setQueryData(['notifications', user.id], context.previous);
      }
    },
    onSettled: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      }
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const res = await axios.patch<{ unread_count: number }>('/api/notifications', {
        markAllRead: true,
      });
      return res.data;
    },
    onMutate: async () => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ['notifications', user.id] });
      const previous = queryClient.getQueryData<NotificationsResponse>(['notifications', user.id]);

      if (previous) {
        const now = new Date().toISOString();
        const updatedNotifications = previous.notifications.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at || now,
        }));

        queryClient.setQueryData<NotificationsResponse>(['notifications', user.id], {
          notifications: updatedNotifications,
          unread_count: 0,
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (user?.id && context?.previous) {
        queryClient.setQueryData(['notifications', user.id], context.previous);
      }
    },
    onSettled: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      }
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete<{ success: boolean; unread_count: number }>(
        `/api/notifications/${id}/read`
      );
      return res.data;
    },
    onMutate: async (id: string) => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ['notifications', user.id] });
      const previous = queryClient.getQueryData<NotificationsResponse>(['notifications', user.id]);

      if (previous) {
        let wasUnread = false;
        const target = previous.notifications.find((n) => n.id === id);
        if (target && !target.is_read) wasUnread = true;

        const updatedNotifications = previous.notifications.filter((n) => n.id !== id);

        queryClient.setQueryData<NotificationsResponse>(['notifications', user.id], {
          notifications: updatedNotifications,
          unread_count: wasUnread ? Math.max(0, previous.unread_count - 1) : previous.unread_count,
        });
      }

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (user?.id && context?.previous) {
        queryClient.setQueryData(['notifications', user.id], context.previous);
      }
    },
    onSettled: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      }
    },
  });
}
