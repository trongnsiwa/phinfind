import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewsTab } from '../ReviewsTab';
import type { CoffeeShop } from '@/types/shop';

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseInfiniteShopReviews = vi.fn();
const mockUseUserReviews = vi.fn();
vi.mock('@/hooks/useShops', () => ({
  useInfiniteShopReviews: (id: string) => mockUseInfiniteShopReviews(id),
  useUserReviews: () => mockUseUserReviews(),
  useToggleReviewLike: () => ({ mutate: vi.fn() }),
  useDeleteReview: () => ({ mutate: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockReviewModalProps = vi.fn();
vi.mock('../../ReviewModal', () => ({
  ReviewModal: (props: any) => {
    mockReviewModalProps(props);
    return props.open ? (
      <div data-testid='review-modal'>
        <span data-testid='modal-mode'>{props.existingReview ? 'edit' : 'create'}</span>
        {props.existingReview && (
          <span data-testid='modal-existing-comment'>{props.existingReview.comment}</span>
        )}
      </div>
    ) : null;
  },
}));

const mockShop: CoffeeShop = {
  id: 'shop-test-1',
  place_id: 'shop-test-1',
  name: 'Cà Phê Mùa Thu',
  address: '123 Phố Huế, Hà Nội',
  lat: 21.0285,
  lon: 105.8542,
  distance: 100,
  distance_text: '100 m',
  rating: 4.8,
  total_ratings: 5,
  photos: ['https://example.com/photo.jpg'],
  categories: ['cafe'],
};

describe('ReviewsTab - One Review Per User Per Shop (Google Maps model)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseInfiniteShopReviews.mockReturnValue({
      data: {
        pages: [
          {
            reviews: [
              {
                id: 'rev-other-1',
                shop_place_id: 'shop-test-1',
                user_id: 'other-user-999',
                rating: 5,
                comment: 'Quán rất đẹp và rộng rãi',
                created_at: new Date().toISOString(),
                profiles: { full_name: 'Người dùng khác', avatar_url: null, username: 'other' },
              },
            ],
            total: 1,
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    });
    mockUseUserReviews.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('renders "Viết đánh giá" when the current user has no prior review', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'current-user-123' },
      profile: { full_name: 'Nguyễn Văn A' },
      isAuthenticated: true,
    });

    render(<ReviewsTab shop={mockShop} />);

    expect(screen.getByRole('button', { name: /viết đánh giá/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /chỉnh sửa đánh giá của bạn/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/bạn đã đánh giá quán này/i)).not.toBeInTheDocument();
  });

  it('renders "Chỉnh sửa đánh giá của bạn" with subtle inline hint when the current user has an existing review', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'current-user-123' },
      profile: { full_name: 'Nguyễn Văn A' },
      isAuthenticated: true,
    });

    // Provide user review in infinite shop reviews
    mockUseInfiniteShopReviews.mockReturnValue({
      data: {
        pages: [
          {
            reviews: [
              {
                id: 'rev-my-1',
                shop_place_id: 'shop-test-1',
                user_id: 'current-user-123',
                rating: 4,
                comment: 'Cà phê trứng tuyệt đỉnh!',
                created_at: new Date().toISOString(),
                profiles: { full_name: 'Nguyễn Văn A', avatar_url: null, username: 'nguyenvana' },
              },
            ],
            total: 1,
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(<ReviewsTab shop={mockShop} />);

    expect(screen.getByRole('button', { name: /chỉnh sửa đánh giá của bạn/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^viết đánh giá$/i })).not.toBeInTheDocument();

    const hint = screen.getByText('Bạn đã đánh giá quán này. Bạn có thể cập nhật bất cứ lúc nào.');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveAttribute('aria-live', 'polite');
  });

  it('clicking the edit button opens ReviewModal with the existing review pre-loaded', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'current-user-123' },
      profile: { full_name: 'Nguyễn Văn A' },
      isAuthenticated: true,
    });

    mockUseInfiniteShopReviews.mockReturnValue({
      data: {
        pages: [
          {
            reviews: [
              {
                id: 'rev-my-1',
                shop_place_id: 'shop-test-1',
                user_id: 'current-user-123',
                rating: 4,
                comment: 'Cà phê trứng tuyệt đỉnh!',
                created_at: new Date().toISOString(),
                profiles: { full_name: 'Nguyễn Văn A', avatar_url: null, username: 'nguyenvana' },
              },
            ],
            total: 1,
          },
        ],
      },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(<ReviewsTab shop={mockShop} />);

    const editBtn = screen.getByRole('button', { name: /chỉnh sửa đánh giá của bạn/i });
    fireEvent.click(editBtn);

    expect(screen.getByTestId('review-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-mode')).toHaveTextContent('edit');
    expect(screen.getByTestId('modal-existing-comment')).toHaveTextContent('Cà phê trứng tuyệt đỉnh!');
  });
});
