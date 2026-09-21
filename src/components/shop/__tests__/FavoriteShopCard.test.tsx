import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FavoriteShopCard } from '../FavoriteShopCard';
import type { CoffeeShop } from '@/types/shop';

const mockShop: CoffeeShop = {
  id: 'shop-1',
  place_id: 'shop-1',
  name: 'SỞ SIPH OLD BAR',
  address: '192 Hẻm 6, Bình An, Đồng Nai, Vietnam',
  lat: 10.8,
  lon: 106.8,
  rating: 5.0,
  total_ratings: 2,
  price_range: '₫',
  opening_hours: { open_now: true },
  distance: 1300,
  distance_text: '1.3 km',
  photos: ['https://example.com/photo.jpg'],
  categories: ['Cà phê phin'],
  verified: true,
};

describe('FavoriteShopCard', () => {
  it('renders shop info with mobile compact hero tokens and 44px min tap targets', () => {
    render(
      <FavoriteShopCard
        shop={mockShop}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
        onRequestRemove={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    // Title text-base & line-clamp-1
    const title = screen.getByText('SỞ SIPH OLD BAR');
    expect(title).toBeInTheDocument();
    expect(title.className).toContain('text-base');
    expect(title.className).toContain('line-clamp-1');

    // Address text-xs & line-clamp-1
    const address = screen.getByText('192 Hẻm 6, Bình An, Đồng Nai, Vietnam');
    expect(address).toBeInTheDocument();
    expect(address.className).toContain('text-xs');
    expect(address.className).toContain('line-clamp-1');

    // Action buttons: equal-width and min-h-[44px] with h-11 on mobile
    const directionsBtn = screen.getByRole('link', { name: /chỉ đường/i });
    expect(directionsBtn).toBeInTheDocument();
    expect(directionsBtn.className).toContain('min-h-[44px]');
    expect(directionsBtn.className).toContain('h-11');

    const detailsBtn = screen.getByRole('link', { name: /xem chi tiết/i });
    expect(detailsBtn).toBeInTheDocument();
    expect(detailsBtn.className).toContain('min-h-[44px]');
    expect(detailsBtn.className).toContain('h-11');
    expect(detailsBtn.className).toContain('bg-amber-gold');

    // Trash and heart buttons: >= 44x44px tap targets on mobile via wrapper
    const actionButtons = screen.getAllByRole('button', { name: /xóa khỏi danh sách yêu thích/i });
    expect(actionButtons).toHaveLength(2);
    actionButtons.forEach((btn) => {
      expect(btn.className).toContain('min-h-[44px]');
      expect(btn.className).toContain('min-w-[44px]');
    });
  });

  it('renders image container with aspect-[16/10] and max-h-[200px] by default', () => {
    const { container } = render(
      <FavoriteShopCard
        shop={mockShop}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
        onRequestRemove={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const imageContainer = container.querySelector('.aspect-\\[16\\/10\\]');
    expect(imageContainer).toBeInTheDocument();
    expect(imageContainer?.className).toContain('max-h-[200px]');
    expect(imageContainer?.className).toContain('sm:aspect-auto');
    expect(imageContainer?.className).toContain('sm:h-36');
  });

  it('renders shortened mobile hero image when compactHero is true', () => {
    const { container } = render(
      <FavoriteShopCard
        shop={mockShop}
        compactHero={true}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
        onRequestRemove={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const imageContainer = container.querySelector('.aspect-\\[16\\/10\\]');
    expect(imageContainer).toBeInTheDocument();
    expect(imageContainer?.className).toContain('max-h-[140px]');
    expect(imageContainer?.className).toContain('sm:aspect-auto');
    expect(imageContainer?.className).toContain('sm:h-36');
  });
});
