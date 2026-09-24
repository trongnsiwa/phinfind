import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditProfileDialog } from '../EditProfileDialog';

vi.mock('@/hooks/useShops', () => ({
  useUpdateProfile: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('EditProfileDialog - Polish Social Section & Layout', () => {
  const defaultProfile = {
    id: 'user-123',
    user_id: 'user-123',
    email: 'user@example.com',
    full_name: 'Nguyễn Sĩ Trọng',
    username: 'trongnsi',
    bio: 'Thích đi cà phê một mình',
    avatar_url: null,
    facebook_url: null,
    instagram_url: null,
    tiktok_url: null,
    website_url: null,
    role: 'user' as const,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };

  const defaultUser = {
    id: 'user-123',
    email: 'user@example.com',
  };

  it('renders collapsed state with "Chưa có liên kết" when all social fields are empty', () => {
    render(
      <EditProfileDialog
        open={true}
        onOpenChange={vi.fn()}
        user={defaultUser}
        profile={defaultProfile}
      />
    );

    expect(screen.getByText('Mạng xã hội (tùy chọn)')).toBeInTheDocument();
    expect(screen.getByText('Chưa có liên kết')).toBeInTheDocument();
  });

  it('renders collapsed state with summary "2 liên kết đã thêm" when 2 fields are populated', () => {
    render(
      <EditProfileDialog
        open={true}
        onOpenChange={vi.fn()}
        user={defaultUser}
        profile={{
          ...defaultProfile,
          facebook_url: 'https://facebook.com/quancafe',
          instagram_url: 'https://instagram.com/quancafe',
        }}
      />
    );

    expect(screen.getByText('2 liên kết đã thêm')).toBeInTheDocument();
  });

  it('expands the social section on toggle and renders persistent labels and 2-column responsive grid', () => {
    render(
      <EditProfileDialog
        open={true}
        onOpenChange={vi.fn()}
        user={defaultUser}
        profile={defaultProfile}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /mạng xã hội \(tùy chọn\)/i });
    expect(toggleButton.className).toContain('min-h-[44px]');
    fireEvent.click(toggleButton);

    // Persistent labels
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
    expect(screen.getByText('Website')).toBeInTheDocument();

    // Check placeholders match realistic Vietnamese coffee shop hints
    expect(screen.getByPlaceholderText('https://facebook.com/quancafe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://instagram.com/quancafe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://tiktok.com/@quancafe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://yourwebsite.com')).toBeInTheDocument();

    // Responsive two-column grid on sm+
    const fbInput = screen.getByPlaceholderText('https://facebook.com/quancafe');
    const gridContainer = fbInput.closest('.grid');
    expect(gridContainer).not.toBeNull();
    expect(gridContainer?.className).toContain('grid-cols-1');
    expect(gridContainer?.className).toContain('sm:grid-cols-2');
    expect(gridContainer?.className).toContain('gap-2.5');

    // Input height & size
    expect(fbInput.className).toContain('h-10');
    expect(fbInput.className).toContain('text-sm');
  });

  it('shows focus hint when input is empty and focused, and hides it on blur', () => {
    render(
      <EditProfileDialog
        open={true}
        onOpenChange={vi.fn()}
        user={defaultUser}
        profile={defaultProfile}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /mạng xã hội \(tùy chọn\)/i });
    fireEvent.click(toggleButton);

    const fbInput = screen.getByPlaceholderText('https://facebook.com/quancafe');
    expect(screen.queryByText('Dán liên kết đầy đủ bắt đầu bằng https://')).toBeNull();

    // Focus empty input
    fireEvent.focus(fbInput);
    expect(screen.getByText('Dán liên kết đầy đủ bắt đầu bằng https://')).toBeInTheDocument();

    // Blur input
    fireEvent.blur(fbInput);
    expect(screen.queryByText('Dán liên kết đầy đủ bắt đầu bằng https://')).toBeNull();
  });

  it('renders pinned sticky footer outside the scrollable body', () => {
    render(
      <EditProfileDialog
        open={true}
        onOpenChange={vi.fn()}
        user={defaultUser}
        profile={defaultProfile}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Hủy' });
    const saveButton = screen.getByRole('button', { name: /lưu thay đổi/i });

    expect(cancelButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();

    // Check min 44px tap targets
    expect(cancelButton.className).toContain('min-h-[44px]');
    expect(saveButton.className).toContain('min-h-[44px]');

    // Dialog content container constraints
    const dialogTitle = screen.getByText('Chỉnh sửa thông tin cá nhân');
    const dialogContent = dialogTitle.closest('[role="dialog"]');
    expect(dialogContent).not.toBeNull();
    expect(dialogContent?.className).toContain('max-h-[90vh]');
    expect(dialogContent?.className).toContain('flex flex-col');
    expect(dialogContent?.className).toContain('overflow-hidden');
  });
});
