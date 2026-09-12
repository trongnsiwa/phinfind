import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchShopForServer } from '../shop-detail';
import * as serverModule from '@/lib/supabase/server';
import * as shopsModule from '@/lib/supabase/shops';

describe('fetchShopForServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null if placeId is empty', async () => {
    const result = await fetchShopForServer('');
    expect(result).toBeNull();
  });

  it('returns mapped CoffeeShop when database returns matching shop', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        place_id: 'place-1',
        name: 'The Workshop Coffee',
        address: '27 Ngô Đức Kế, Q.1, TP.HCM',
        lat: 10.7745,
        lon: 106.7032,
        rating: 4.8,
        total_ratings: 120,
        photos: ['https://example.com/photo.jpg'],
        hidden: false,
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockReturnValue({
          maybeSingle: mockSingle,
        }),
      }),
    });

    vi.spyOn(serverModule, 'createPublicClient').mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any);

    const result = await fetchShopForServer('place-1');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('The Workshop Coffee');
    expect(result?.photos?.[0]).toBe('https://example.com/photo.jpg');
    expect(result?.distance).toBe(0);
    expect(result?.distance_text).toBe('0 m');
  });

  it('returns null when shop is not found or hidden is true', async () => {
    const mockSingleNotFound = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockReturnValue({
          maybeSingle: mockSingleNotFound,
        }),
      }),
    });

    vi.spyOn(serverModule, 'createPublicClient').mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any);

    const result = await fetchShopForServer('non-existent');
    expect(result).toBeNull();
  });

  it('fetches community cover photos when official photos are empty', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        place_id: 'place-no-photo',
        name: 'Community Cafe',
        lat: 10.7,
        lon: 106.6,
        hidden: false,
        photos: [],
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockReturnValue({
          maybeSingle: mockSingle,
        }),
      }),
    });

    vi.spyOn(serverModule, 'createPublicClient').mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any);

    vi.spyOn(shopsModule, 'fetchCommunityCoverPhotos').mockResolvedValue({
      'place-no-photo': { url: 'https://community.com/cover.jpg', review_id: 'rev-1' },
    });

    const result = await fetchShopForServer('place-no-photo');
    expect(result).not.toBeNull();
    expect(result?.photos?.[0]).toBe('https://community.com/cover.jpg');
    expect(result?.cover_source).toBe('community');
  });

  it('returns null if database query errors', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database connection failure' },
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockReturnValue({
          maybeSingle: mockSingle,
        }),
      }),
    });

    vi.spyOn(serverModule, 'createPublicClient').mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any);

    const result = await fetchShopForServer('place-error');
    expect(result).toBeNull();
  });
});
