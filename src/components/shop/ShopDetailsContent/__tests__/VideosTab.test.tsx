import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideosTab } from '../VideosTab';
import type { CoffeeShop, ShopVideo } from '@/types/shop';

const mockBaseShop: CoffeeShop = {
  id: 'shop-test-1',
  place_id: 'shop-test-1',
  name: 'Cà Phê Mùa Thu',
  address: '123 Phố Huế, Hà Nội',
  lat: 21.0285,
  lon: 105.8542,
  distance: 100,
  distance_text: '100 m',
  rating: 4.8,
  total_ratings: 12,
  photos: [],
  categories: ['cafe']
};

describe('VideosTab', () => {
  it('renders empty state illustration when shop has no videos', () => {
    render(<VideosTab shop={{ ...mockBaseShop, videos: [] }} />);
    expect(screen.getByText('Chưa có video nào')).toBeInTheDocument();
    expect(
      screen.getByText(/Quán chưa có video giới thiệu trên TikTok, YouTube, Instagram hay Facebook/i)
    ).toBeInTheDocument();
  });

  it('renders unified card layout for both thumbnail-resolved and placeholder cards', () => {
    const videos: ShopVideo[] = [
      {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        video_id: 'dQw4w9WgXcQ',
        title: 'Review YouTube Có Thumbnail',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      },
      {
        url: 'https://www.facebook.com/quan.cafe/videos/1234567890/',
        platform: 'facebook',
        video_id: '1234567890',
        title: 'Review Facebook Không Thumbnail'
      },
      {
        url: 'https://www.tiktok.com/@cafesaigon/video/7123456789012345678',
        platform: 'tiktok',
        video_id: '7123456789012345678'
        // No title
      }
    ];

    const { container } = render(<VideosTab shop={{ ...mockBaseShop, videos }} />);

    // 3 cards rendered as links with target="_blank"
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);

    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    // Verify all 3 cards have an image area with aspect-[9/16]
    const imageAreas = container.querySelectorAll('.aspect-\\[9\\/16\\]');
    expect(imageAreas).toHaveLength(3);

    // Verify badges are present with platform labels
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getAllByText('Facebook').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('TikTok').length).toBeGreaterThanOrEqual(1);

    // Verify placeholder card content for Facebook without thumbnail
    expect(screen.getByText('Video từ Facebook')).toBeInTheDocument();
    expect(screen.getByText('https://www.facebook.com/quan.cafe/videos/1234567890/')).toBeInTheDocument();

    // Verify titles are rendered in card overlays
    expect(screen.getByText('Review YouTube Có Thumbnail')).toBeInTheDocument();
    expect(screen.getByText('Review Facebook Không Thumbnail')).toBeInTheDocument();

    // Verify all 3 cards are single containers with aspect-[9/16] and no separate footer blocks
    expect(container.querySelectorAll('.aspect-\\[9\\/16\\]')).toHaveLength(3);
    expect(container.querySelectorAll('.border-t')).toHaveLength(0);
  });

  it('renders placeholder without title cleanly with no redundant platform name', () => {
    const videos: ShopVideo[] = [
      {
        url: 'https://www.facebook.com/quan.cafe/videos/9876543210/',
        platform: 'facebook',
        video_id: '9876543210'
        // No title, no thumbnail
      }
    ];

    render(<VideosTab shop={{ ...mockBaseShop, videos }} />);

    // Top badge has Facebook
    const facebookOccurrences = screen.getAllByText('Facebook');
    // Only the badge should say 'Facebook' as a standalone text (no redundant center/bottom Facebook heading)
    expect(facebookOccurrences).toHaveLength(1);

    // Subtitle and url are in the bottom overlay
    expect(screen.getByText('Video từ Facebook')).toBeInTheDocument();
    expect(screen.getByText('https://www.facebook.com/quan.cafe/videos/9876543210/')).toBeInTheDocument();
  });
});
