import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Header } from '../Header';

let currentPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@example.com' },
    profile: {
      id: 'u1',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
      role: 'user',
    },
    isAuthenticated: true,
    signOut: vi.fn(),
    loading: false,
  }),
}));

vi.mock('@/hooks/useLocation', () => ({
  useLocation: () => ({ lat: 21.0285, lng: 105.8542 }),
}));

vi.mock('@/hooks/useShops', () => ({
  useSearchShops: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useUserBadges', () => ({
  useUserBadges: () => ({ label: 'Đồng' }),
}));

vi.mock('@/components/layout/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

describe('Header desktop navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = '/';
  });

  it('renders "Bảng tin" link with correct href when on non-feed route', () => {
    currentPathname = '/';
    render(<Header />);

    const feedLink = screen.getByRole('link', { name: /bảng tin/i });
    expect(feedLink).toBeInTheDocument();
    expect(feedLink).toHaveAttribute('href', '/feed');
    expect(feedLink.className).not.toContain('bg-primary/20');
  });

  it('applies active state styling to "Bảng tin" when on /feed route', () => {
    currentPathname = '/feed';
    render(<Header />);

    const feedLink = screen.getByRole('link', { name: /bảng tin/i });
    expect(feedLink).toBeInTheDocument();
    expect(feedLink.className).toContain('bg-primary/20');
    expect(feedLink.className).toContain('font-bold');

    const dot = feedLink.querySelector('.w-4.h-\\[2px\\].bg-primary');
    expect(dot).toBeInTheDocument();
  });

  it('does not render "Bảng tin" in the avatar dropdown menu', async () => {
    currentPathname = '/';
    render(<Header />);

    const avatarBtn = screen.getByRole('button', { name: /Menu người dùng/i });
    fireEvent.pointerDown(avatarBtn, { button: 0 });

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /Trang cá nhân/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Yêu thích/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Cài đặt/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole('menuitem', { name: /Bảng tin/i })).toBeNull();
  });
});
