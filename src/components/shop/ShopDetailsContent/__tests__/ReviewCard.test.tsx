import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ReviewCard } from '../ReviewCard';
import type { ReviewItem } from '../../ReviewModal';

const mockReviewWithUsername: ReviewItem = {
  id: 'rev-1',
  user_id: 'user-1',
  author: 'Nguyễn Sĩ Trọng',
  username: 'trongnsi',
  avatar: 'https://example.com/avatar.jpg',
  rating: 5,
  date: '8 thg 9, 2026',
  comment: 'Tôi đã ở đây vài ngày trước, thật sự quá wow!',
  images: ['https://example.com/photo1.jpg'],
  like_count: 2,
  liked_by_me: false,
};

const mockReviewWithoutUsername: ReviewItem = {
  id: 'rev-2',
  user_id: 'user-2',
  author: 'Trọng Đi Trốn',
  username: undefined,
  rating: 5,
  date: '11 thg 9, 2026',
  comment: 'Tuyệt vời quá',
};

describe('ReviewCard', () => {
  it('renders author name and avatar as links to /u/[username] when username exists', () => {
    render(
      <ReviewCard
        review={mockReviewWithUsername}
        onOpenImage={vi.fn()}
      />
    );

    const nameLink = screen.getByRole('link', { name: 'Nguyễn Sĩ Trọng' });
    expect(nameLink).toBeInTheDocument();
    expect(nameLink).toHaveAttribute('href', '/u/trongnsi');
    expect(nameLink.className).toContain('min-h-[44px]');
    expect(nameLink.className).toContain('cursor-pointer');
    expect(nameLink.className).toContain('hover:text-primary');

    // Avatar link
    const avatarLink = screen.getByRole('link', { name: 'Hồ sơ của Nguyễn Sĩ Trọng' });
    expect(avatarLink).toBeInTheDocument();
    expect(avatarLink).toHaveAttribute('href', '/u/trongnsi');
  });

  it('renders subtle hint "(chưa có hồ sơ)" and aria-disabled without any link when username is missing', () => {
    const { container } = render(
      <ReviewCard
        review={mockReviewWithoutUsername}
        onOpenImage={vi.fn()}
      />
    );

    // Should not render broken links like /u/null or /u/undefined
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(0);

    expect(screen.getByText('Trọng Đi Trốn')).toBeInTheDocument();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    const disabledElement = container.querySelector('[aria-disabled="true"]');
    expect(disabledElement).toBeInTheDocument();
    expect(disabledElement?.className).toContain('text-muted-foreground');
  });

  it('safely handles edge case usernames like "null", "undefined", and empty whitespace', () => {
    const { rerender } = render(
      <ReviewCard
        review={{ ...mockReviewWithoutUsername, username: 'null' }}
        onOpenImage={vi.fn()}
      />
    );
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    rerender(
      <ReviewCard
        review={{ ...mockReviewWithoutUsername, username: 'undefined' }}
        onOpenImage={vi.fn()}
      />
    );
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    rerender(
      <ReviewCard
        review={{ ...mockReviewWithoutUsername, username: '   ' }}
        onOpenImage={vi.fn()}
      />
    );
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();
  });

  it('stops propagation when tapping reviewer name so card or parent click handlers are not triggered', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <ReviewCard
          review={mockReviewWithUsername}
          onOpenImage={vi.fn()}
        />
      </div>
    );

    const nameLink = screen.getByRole('link', { name: 'Nguyễn Sĩ Trọng' });
    fireEvent.click(nameLink);
    expect(parentClick).not.toHaveBeenCalled();
  });
});
