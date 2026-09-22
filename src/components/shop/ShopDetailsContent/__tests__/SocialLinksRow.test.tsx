import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialLinksRow } from '../SocialLinksRow';
import type { CoffeeShop } from '@/types/shop';

const mockBaseShop: CoffeeShop = {
  id: 'shop-test',
  place_id: 'shop-test',
  name: 'Cà Phê Sài Gòn',
  address: '123 Đường Lê Lợi, Q.1',
  lat: 10.7769,
  lon: 106.7009,
  distance: 500,
  distance_text: '500 m',
  rating: 4.8,
  total_ratings: 50,
  categories: ['catering.cafe']
};

describe('SocialLinksRow', () => {
  it('renders nothing when no social links exist on shop', () => {
    const { container } = render(<SocialLinksRow shop={mockBaseShop} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders only populated social links with proper attributes', () => {
    const shopWithSocial: CoffeeShop = {
      ...mockBaseShop,
      facebook_url: 'https://facebook.com/saigoncafe',
      instagram_url: 'https://instagram.com/saigoncafe',
      tiktok_url: 'https://tiktok.com/@saigoncafe'
    };

    render(<SocialLinksRow shop={shopWithSocial} />);

    expect(screen.getByText('Kết nối với quán')).toBeInTheDocument();

    const fbLink = screen.getByRole('link', { name: `Mở Facebook của ${mockBaseShop.name}` });
    expect(fbLink).toBeInTheDocument();
    expect(fbLink).toHaveAttribute('href', 'https://facebook.com/saigoncafe');
    expect(fbLink).toHaveAttribute('target', '_blank');
    expect(fbLink).toHaveAttribute('rel', 'noopener noreferrer');

    const igLink = screen.getByRole('link', { name: `Mở Instagram của ${mockBaseShop.name}` });
    expect(igLink).toBeInTheDocument();
    expect(igLink).toHaveAttribute('href', 'https://instagram.com/saigoncafe');
    expect(igLink).toHaveAttribute('target', '_blank');
    expect(igLink).toHaveAttribute('rel', 'noopener noreferrer');

    const ttLink = screen.getByRole('link', { name: `Mở TikTok của ${mockBaseShop.name}` });
    expect(ttLink).toBeInTheDocument();
    expect(ttLink).toHaveAttribute('href', 'https://tiktok.com/@saigoncafe');
    expect(ttLink).toHaveAttribute('target', '_blank');
    expect(ttLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Unpopulated links should not be rendered
    expect(screen.queryByRole('link', { name: /Mở YouTube của/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mở Zalo của/i })).not.toBeInTheDocument();
  });
});
