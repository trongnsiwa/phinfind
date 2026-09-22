import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotosTab } from '../PhotosTab';
import { useUIStore } from '@/stores/useUIStore';
import type { CoffeeShop } from '@/types/shop';
import type { GalleryPhoto } from '../types';

// Mock useShopReviews hook
const mockUseShopReviews = vi.fn();
vi.mock('@/hooks/useShops', () => ({
  useShopReviews: (placeId: string) => mockUseShopReviews(placeId)
}));

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
  photos: ['https://example.com/official-1.jpg', 'https://example.com/official-2.jpg'],
  categories: ['cafe']
};

describe('PhotosTab (Community Photo Wall)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseShopReviews.mockReturnValue({ data: [] });
    useUIStore.setState({
      imagePreview: { isOpen: false, images: [], currentIndex: 0 }
    });
  });

  it('renders official photos in the first section and community photos in the second section', () => {
    const photos: GalleryPhoto[] = [
      {
        url: 'https://example.com/official-1.jpg',
        title: 'Cà Phê Mùa Thu - Ảnh 1',
        category: 'Nổi bật',
        isCommunity: false
      },
      {
        url: 'https://example.com/community-1.jpg',
        title: 'Cà Phê Mùa Thu - Ảnh từ đánh giá của Minh',
        category: 'Từ đánh giá cộng đồng',
        isCommunity: true,
        authorName: 'Minh',
        authorAvatar: 'https://example.com/minh-avatar.jpg'
      }
    ];

    render(<PhotosTab shop={mockBaseShop} photos={photos} reviewCount={5} />);

    // Check section 1: Official photos
    const officialHeading = screen.getByText('Không gian & Hình ảnh');
    expect(officialHeading).toBeInTheDocument();
    expect(screen.getByText('1 hình ảnh từ quán')).toBeInTheDocument();

    // Check section 2: Community photos
    const communityHeading = screen.getByText('Từ cộng đồng (1)');
    expect(communityHeading).toBeInTheDocument();
    expect(screen.getByText('Ảnh thực tế từ những người đã ghé quán')).toBeInTheDocument();

    // Verify images rendered in document
    const images = screen.getAllByRole('img');
    const imageSources = images.map((img) => img.getAttribute('src'));
    expect(imageSources.some((src) => src?.includes('official-1.jpg'))).toBe(true);
    expect(imageSources.some((src) => src?.includes('community-1.jpg'))).toBe(true);
  });

  it('deduplicates photos favoring official photos when duplicate URLs exist', () => {
    const duplicateUrl = 'https://example.com/shared-photo.jpg';
    const photos: GalleryPhoto[] = [
      {
        url: duplicateUrl,
        title: 'Official Photo',
        category: 'Nổi bật',
        isCommunity: false
      },
      {
        url: duplicateUrl,
        title: 'Community Review Duplicate',
        category: 'Từ đánh giá cộng đồng',
        isCommunity: true,
        authorName: 'Lan'
      },
      {
        url: 'https://example.com/unique-community.jpg',
        title: 'Community Unique',
        category: 'Từ đánh giá cộng đồng',
        isCommunity: true,
        authorName: 'Hoa'
      }
    ];

    render(<PhotosTab shop={mockBaseShop} photos={photos} reviewCount={3} />);

    // Official section has 1 photo
    expect(screen.getByText('1 hình ảnh từ quán')).toBeInTheDocument();

    // Community section has only 1 photo (the unique one, duplicate was omitted)
    expect(screen.getByText('Từ cộng đồng (1)')).toBeInTheDocument();
    expect(screen.queryByText('Community Review Duplicate')).not.toBeInTheDocument();
  });

  it('hides community section entirely when shop has 0 reviews', () => {
    const shopWithZeroReviews: CoffeeShop = {
      ...mockBaseShop,
      total_ratings: 0
    };

    const photos: GalleryPhoto[] = [
      {
        url: 'https://example.com/official-1.jpg',
        title: 'Official 1',
        category: 'Nổi bật',
        isCommunity: false
      }
    ];

    render(<PhotosTab shop={shopWithZeroReviews} photos={photos} reviewCount={0} />);

    // Official section exists
    expect(screen.getByText('Không gian & Hình ảnh')).toBeInTheDocument();

    // Community section should not be rendered
    expect(screen.queryByText(/Từ cộng đồng/i)).not.toBeInTheDocument();
  });

  it('renders EmptyIllustration inviting first photo when shop has reviews but 0 community photos', () => {
    const photos: GalleryPhoto[] = [
      {
        url: 'https://example.com/official-1.jpg',
        title: 'Official 1',
        category: 'Nổi bật',
        isCommunity: false
      }
    ];

    render(<PhotosTab shop={mockBaseShop} photos={photos} reviewCount={4} />);

    // Official section present
    expect(screen.getByText('1 hình ảnh từ quán')).toBeInTheDocument();

    // Community section shows 0 photos and empty invitation
    expect(screen.getByText('Từ cộng đồng (0)')).toBeInTheDocument();
    expect(screen.getByText('Chưa có ảnh từ cộng đồng')).toBeInTheDocument();
    expect(
      screen.getByText('Hãy là người đầu tiên chia sẻ hình ảnh khi ghé quán!')
    ).toBeInTheDocument();
  });

  it('renders overall empty state when 0 photos total exist', () => {
    const emptyShop: CoffeeShop = {
      ...mockBaseShop,
      photos: [],
      total_ratings: 0
    };

    render(<PhotosTab shop={emptyShop} photos={[]} reviewCount={0} />);

    expect(screen.getByText('Chưa có hình ảnh nào')).toBeInTheDocument();
    expect(
      screen.getByText('Quán cà phê này chưa có hình ảnh được đăng tải.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Không gian & Hình ảnh')).not.toBeInTheDocument();
    expect(screen.queryByText(/Từ cộng đồng/i)).not.toBeInTheDocument();
  });

  it('keeps official empty-state and displays community photos when only community photos exist', () => {
    const emptyOfficialShop: CoffeeShop = {
      ...mockBaseShop,
      photos: []
    };

    const communityOnlyPhotos: GalleryPhoto[] = [
      {
        url: 'https://example.com/community-only-1.jpg',
        title: 'Community Only',
        category: 'Từ đánh giá cộng đồng',
        isCommunity: true,
        authorName: 'Khách quen'
      }
    ];

    render(
      <PhotosTab shop={emptyOfficialShop} photos={communityOnlyPhotos} reviewCount={2} />
    );

    // Official section shows subtle empty state
    expect(screen.getByText('Không gian & Hình ảnh')).toBeInTheDocument();
    expect(screen.getByText('Quán chưa cập nhật ảnh chính thức')).toBeInTheDocument();

    // Community section renders the community photo
    expect(screen.getByText('Từ cộng đồng (1)')).toBeInTheDocument();
  });

  it('opens lightbox with community photos array only when tapping a community photo', () => {
    const photos: GalleryPhoto[] = [
      {
        url: 'https://example.com/official-1.jpg',
        title: 'Official 1',
        category: 'Nổi bật',
        isCommunity: false
      },
      {
        url: 'https://example.com/community-1.jpg',
        title: 'Community 1',
        category: 'Từ đánh giá cộng đồng',
        isCommunity: true,
        authorName: 'An'
      },
      {
        url: 'https://example.com/community-2.jpg',
        title: 'Community 2',
        category: 'Từ đánh giá cộng đồng',
        isCommunity: true,
        authorName: 'Bình'
      }
    ];

    render(<PhotosTab shop={mockBaseShop} photos={photos} reviewCount={2} />);

    // Tap on the second community photo (index 1 within communityPhotos)
    const communityBtn = screen.getByRole('button', { name: 'Community 2' });
    fireEvent.click(communityBtn);

    const storeState = useUIStore.getState().imagePreview;
    expect(storeState.isOpen).toBe(true);
    expect(storeState.currentIndex).toBe(1);
    // Crucial: lightbox should only contain the 2 community photos, not official photos
    expect(storeState.images).toHaveLength(2);
    expect(storeState.images[0].url).toBe('https://example.com/community-1.jpg');
    expect(storeState.images[1].url).toBe('https://example.com/community-2.jpg');
  });

  it('renders author avatar and initial-letter fallback in community cell', () => {
    const photos: GalleryPhoto[] = [
      {
        url: 'https://example.com/comm-1.jpg',
        title: 'Comm 1',
        category: 'Từ đánh giá cộng đồng',
        isCommunity: true,
        authorName: 'Trọng'
      }
    ];

    render(<PhotosTab shop={mockBaseShop} photos={photos} reviewCount={1} />);

    // Author name displayed
    expect(screen.getByText('Trọng')).toBeInTheDocument();
    // Avatar initial letter fallback displayed
    expect(screen.getByText('T')).toBeInTheDocument();
  });
});
