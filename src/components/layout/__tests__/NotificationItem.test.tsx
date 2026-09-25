import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NotificationItem } from '../NotificationItem';
import type { NotificationItem as NotificationItemType } from '@/hooks/useNotifications';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('NotificationItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseNotification: NotificationItemType = {
    id: 'notif-1',
    user_id: 'user-1',
    type: 'shop_approved',
    shop_place_id: 'place-abc',
    created_at: '2026-09-20T10:00:00Z',
    is_read: false,
    payload: {
      shop_name: 'The Workshop Coffee',
    },
  };

  it('navigates to /shop/<slug> when shop_slug is present', () => {
    const notifWithSlug: NotificationItemType = {
      ...baseNotification,
      shop_slug: 'the-workshop-coffee',
    };

    render(
      <NotificationItem
        notification={notifWithSlug}
        onMarkRead={vi.fn()}
        onDelete={vi.fn()}
        onCloseDropdown={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Quán "The Workshop Coffee" của bạn đã được xác minh/i }));
    expect(mockPush).toHaveBeenCalledWith('/shop/the-workshop-coffee');
  });

  it('navigates to /shop/<place_id> when shop_slug is absent', () => {
    render(
      <NotificationItem
        notification={baseNotification}
        onMarkRead={vi.fn()}
        onDelete={vi.fn()}
        onCloseDropdown={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Quán "The Workshop Coffee" của bạn đã được xác minh/i }));
    expect(mockPush).toHaveBeenCalledWith('/shop/place-abc');
  });

  it('navigates to /shop/<slug>?tab=reviews for review_liked notifications', () => {
    const reviewLikedNotif: NotificationItemType = {
      ...baseNotification,
      type: 'review_liked',
      shop_slug: 'the-workshop-coffee',
    };

    render(
      <NotificationItem
        notification={reviewLikedNotif}
        onMarkRead={vi.fn()}
        onDelete={vi.fn()}
        onCloseDropdown={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Một người dùng đã thấy đánh giá của bạn hữu ích/i }));
    expect(mockPush).toHaveBeenCalledWith('/shop/the-workshop-coffee?tab=reviews');
  });
});
