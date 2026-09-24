import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrendingCarousel } from '../TrendingCarousel';
import type { CoffeeShop } from '@/types/shop';

const mockShops: CoffeeShop[] = [
  {
    id: 'shop-1',
    place_id: 'shop-1',
    name: 'Quán Cà Phê A',
    address: '123 Đường A, Quận 1',
    lat: 10.77,
    lon: 106.7,
    distance: 500,
    distance_text: '500 m',
    rating: 4.8,
    total_ratings: 120,
    photos: ['https://example.com/a.jpg'],
    categories: ['catering.cafe'],
    hidden: false,
    verified: true,
  },
  {
    id: 'shop-2',
    place_id: 'shop-2',
    name: 'Quán Cà Phê B',
    address: '456 Đường B, Quận 3',
    lat: 10.78,
    lon: 106.69,
    distance: 1200,
    distance_text: '1.2 km',
    rating: 4.5,
    total_ratings: 50,
    photos: [],
    categories: ['catering.cafe'],
    hidden: false,
    verified: true,
  },
];

describe('TrendingCarousel', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.IntersectionObserver = MockIntersectionObserver as any;

    class MockResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.ResizeObserver = MockResizeObserver as any;
  });

  it('renders nothing when shops array is empty and isLoading is false', () => {
    const { container } = render(
      <TrendingCarousel
        title="Đang thịnh hành"
        shops={[]}
        isLoading={false}
        onSelect={vi.fn()}
        onToggleFavorite={vi.fn()}
        favorites={[]}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders DiscoverCarouselSkeleton when isLoading is true', () => {
    const { container } = render(
      <TrendingCarousel
        title="Đang thịnh hành"
        shops={[]}
        isLoading={true}
        onSelect={vi.fn()}
        onToggleFavorite={vi.fn()}
        favorites={[]}
      />
    );
    expect(container.querySelector('.animate-pulse, [class*="bg-muted"]')).toBeInTheDocument();
  });

  it('renders shops list with titles, ratings, and distances', () => {
    render(
      <TrendingCarousel
        title="Đang thịnh hành"
        subtitle="Quán nhiều đánh giá nhất"
        shops={mockShops}
        isLoading={false}
        onSelect={vi.fn()}
        onToggleFavorite={vi.fn()}
        favorites={['shop-1']}
      />
    );

    expect(screen.getByText('Đang thịnh hành')).toBeInTheDocument();
    expect(screen.getByText('Quán nhiều đánh giá nhất')).toBeInTheDocument();
    expect(screen.getByText('Quán Cà Phê A')).toBeInTheDocument();
    expect(screen.getByText('Quán Cà Phê B')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('500 m')).toBeInTheDocument();
  });

  it('triggers onSelect when card is clicked', () => {
    const onSelect = vi.fn();
    render(
      <TrendingCarousel
        title="Đang thịnh hành"
        shops={mockShops}
        isLoading={false}
        onSelect={onSelect}
        onToggleFavorite={vi.fn()}
        favorites={[]}
      />
    );

    fireEvent.click(screen.getByText('Quán Cà Phê A'));
    expect(onSelect).toHaveBeenCalledWith(mockShops[0]);
  });

  it('triggers onToggleFavorite when heart button is clicked without opening card', () => {
    const onSelect = vi.fn();
    const onToggleFavorite = vi.fn();
    render(
      <TrendingCarousel
        title="Đang thịnh hành"
        shops={mockShops}
        isLoading={false}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
        favorites={['shop-1']}
      />
    );

    const favButton = screen.getByLabelText('Bỏ lưu Quán Cà Phê A');
    fireEvent.click(favButton);

    expect(onToggleFavorite).toHaveBeenCalledWith('shop-1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onViewAll when "Xem tất cả" button is clicked', () => {
    const onViewAll = vi.fn();
    render(
      <TrendingCarousel
        title="Đang thịnh hành"
        shops={mockShops}
        isLoading={false}
        onSelect={vi.fn()}
        onToggleFavorite={vi.fn()}
        favorites={[]}
        onViewAll={onViewAll}
      />
    );

    fireEvent.click(screen.getByText('Xem tất cả'));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('triggers onSelect when Enter or Space is pressed on card', () => {
    const onSelect = vi.fn();
    render(
      <TrendingCarousel
        title="Đang thịnh hành"
        shops={mockShops}
        isLoading={false}
        onSelect={onSelect}
        onToggleFavorite={vi.fn()}
        favorites={[]}
      />
    );

    const card = screen.getByLabelText('Xem chi tiết quán Quán Cà Phê A');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(mockShops[0]);

    fireEvent.keyDown(card, { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('renders bullet separator between rating and distance', () => {
    render(
      <TrendingCarousel
        title="Đang thịnh hành"
        shops={mockShops}
        isLoading={false}
        onSelect={vi.fn()}
        onToggleFavorite={vi.fn()}
        favorites={[]}
      />
    );

    const bullets = screen.getAllByText('•');
    expect(bullets.length).toBeGreaterThan(0);
  });
});
