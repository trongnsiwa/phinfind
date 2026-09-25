import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';
import * as serverModule from '@/lib/supabase/server';
import * as shopsModule from '@/lib/supabase/shops';

describe('GET /api/shops/details', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when neither placeId nor slug is provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/shops/details');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('placeId or slug is required');
  });

  it('fetches shop details when placeId is provided', async () => {
    const shopRow = {
      place_id: 'test-place-1',
      slug: 'test-shop',
      name: 'Test Coffee',
      lat: 10.7,
      lon: 106.7,
      hidden: false,
      photos: ['https://example.com/p1.jpg'],
    };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: shopRow, error: null }),
        }),
      }),
    });

    vi.spyOn(serverModule, 'createPublicClient').mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/shops/details?placeId=test-place-1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shop.place_id).toBe('test-place-1');
    expect(data.shop.name).toBe('Test Coffee');
  });

  it('resolves slug to place_id first and returns shop details when slug is provided', async () => {
    const shopRow = {
      place_id: 'resolved-place-id',
      slug: 'resolved-slug',
      name: 'Resolved Coffee',
      lat: 10.7,
      lon: 106.7,
      hidden: false,
      photos: [],
    };

    const mockSingleSlug = vi.fn().mockResolvedValue({
      data: { place_id: 'resolved-place-id' },
      error: null,
    });
    const mockSingleDetails = vi.fn().mockResolvedValue({
      data: shopRow,
      error: null,
    });

    const mockSelect = vi.fn().mockImplementation((fields: string) => {
      if (fields === 'place_id') {
        return {
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockReturnValue({
              maybeSingle: mockSingleSlug,
            }),
          }),
        };
      }
      return {
        eq: vi.fn().mockReturnValue({
          neq: vi.fn().mockReturnValue({
            maybeSingle: mockSingleDetails,
          }),
        }),
      };
    });

    vi.spyOn(serverModule, 'createPublicClient').mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any);

    vi.spyOn(shopsModule, 'fetchCommunityCoverPhotos').mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/shops/details?slug=resolved-slug');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shop.place_id).toBe('resolved-place-id');
    expect(data.shop.name).toBe('Resolved Coffee');
    expect(mockSingleSlug).toHaveBeenCalled();
    expect(mockSingleDetails).toHaveBeenCalled();
  });

  it('returns 404 when slug does not resolve to any shop', async () => {
    const mockSingleSlug = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockReturnValue({
          maybeSingle: mockSingleSlug,
        }),
      }),
    });

    vi.spyOn(serverModule, 'createPublicClient').mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/shops/details?slug=non-existent-slug');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Shop not found');
  });

  it('returns 404 when shop is hidden', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
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

    const request = new NextRequest('http://localhost:3000/api/shops/details?placeId=hidden-place');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Shop not found');
  });

  it('falls back to querying by slug when placeId does not match place_id directly', async () => {
    const shopRow = {
      place_id: 'legacy-place-id',
      slug: 'legacy-slug',
      name: 'Legacy Coffee',
      lat: 10.7,
      lon: 106.7,
      hidden: false,
      photos: [],
    };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockImplementation((col: string) => {
        return {
          neq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockImplementation(async () => {
              if (col === 'place_id') {
                return { data: null, error: null }; // Not found by place_id
              }
              if (col === 'slug') {
                return { data: shopRow, error: null }; // Found by fallback slug query
              }
              return { data: null, error: null };
            }),
          }),
        };
      }),
    });

    vi.spyOn(serverModule, 'createPublicClient').mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    } as any);

    vi.spyOn(shopsModule, 'fetchCommunityCoverPhotos').mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/shops/details?placeId=legacy-slug');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shop.place_id).toBe('legacy-place-id');
    expect(data.shop.slug).toBe('legacy-slug');
    expect(data.shop.name).toBe('Legacy Coffee');
  });
});
