import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FeedItemCard } from '../FeedItemCard';
import { ReviewFeedItem, VisitFeedItem } from '@/types/feed';

vi.mock('@/stores/useUIStore', () => ({
  useUIStore: vi.fn((selector) =>
    selector({
      openImagePreview: vi.fn(),
    })
  ),
}));

describe('FeedItemCard', () => {
  const mockReviewItem: ReviewFeedItem = {
    id: 'rev-1',
    type: 'review_created',
    created_at: '2026-09-25T10:00:00Z',
    actor: {
      id: 'act-1',
      full_name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    shop: {
      place_id: 'shop-123',
      name: 'Phin Xanh Coffee',
      address: '123 Cầu Giấy, Hà Nội',
      slug: 'phin-xanh-coffee',
      photo: 'https://example.com/shop.jpg',
    },
    review: {
      id: 'rev-1',
      rating: 5,
      comment: 'Cà phê rang mộc rất thơm và đậm đà.',
      images: ['https://example.com/review1.jpg'],
      tags: ['ca-phe-ngon', 'song-ao'],
    },
  };

  const mockVisitItem: VisitFeedItem = {
    id: 'vis-1',
    type: 'shop_visited',
    created_at: '2026-09-25T11:00:00Z',
    actor: {
      id: 'act-2',
      full_name: 'Trần Thị B',
      username: 'tranthib',
      avatar_url: null,
    },
    shop: {
      place_id: 'shop-456',
      name: 'Cà Phê Yên',
      address: '82 Quán Thánh, Hà Nội',
      slug: 'ca-phe-yen',
    },
    visit: {
      id: 'vis-1',
      note: 'Ghé vào một chiều mưa, không gian rất dễ chịu.',
      visited_at: '2026-09-25T11:00:00Z',
    },
  };

  it('renders review_created item with rating, comment, tags, and shop link', () => {
    render(<FeedItemCard item={mockReviewItem} />);

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('đã đánh giá')).toBeInTheDocument();
    expect(screen.getByText('Phin Xanh Coffee')).toBeInTheDocument();
    expect(screen.getByText('123 Cầu Giấy, Hà Nội')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('Cà phê rang mộc rất thơm và đậm đà.')).toBeInTheDocument();
    expect(screen.getByText('#ca-phe-ngon')).toBeInTheDocument();
    expect(screen.getByText('#song-ao')).toBeInTheDocument();

    const shopLink = screen.getByRole('link', { name: /Phin Xanh Coffee/i });
    expect(shopLink).toHaveAttribute('href', '/shop/phin-xanh-coffee');
  });

  it('renders shop_visited item with check-in badge, note, and shop link', () => {
    render(<FeedItemCard item={mockVisitItem} />);

    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    expect(screen.getByText('đã ghé thăm')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText(/Ghé vào một chiều mưa/i)).toBeInTheDocument();
    expect(screen.getByText('Cà Phê Yên')).toBeInTheDocument();

    const shopLink = screen.getByRole('link', { name: /Cà Phê Yên/i });
    expect(shopLink).toHaveAttribute('href', '/shop/ca-phe-yen');
  });
});
