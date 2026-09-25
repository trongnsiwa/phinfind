import { describe, it, expect, vi } from 'vitest';
import { getShopPath } from '@/lib/utils/shopUrl';
import {
  calculateDistanceMeters,
  formatDistanceText,
  mapDbShopToCoffeeShop,
  fetchCommunityCoverPhotos,
  fetchNearbyShopsRpc,
  fetchTrendingShops,
  fetchNewShops,
  enrichMissingShopColumns,
} from '../shops';

describe('Supabase Shops Helpers', () => {
  describe('calculateDistanceMeters', () => {
    it('returns 0 for identical coordinates', () => {
      expect(calculateDistanceMeters(21.0285, 105.8542, 21.0285, 105.8542)).toBe(0);
    });

    it('approximates known distances (Hà Nội to TP. Hồ Chí Minh ~1140 km ±2%)', () => {
      // Hanoi: 21.0285, 105.8542
      // Ho Chi Minh City: 10.8231, 106.6297
      const distanceM = calculateDistanceMeters(21.0285, 105.8542, 10.8231, 106.6297);
      const distanceKm = distanceM / 1000;
      expect(distanceKm).toBeGreaterThan(1115);
      expect(distanceKm).toBeLessThan(1165);
    });
  });

  describe('formatDistanceText', () => {
    it('formats meters below 1000 m', () => {
      expect(formatDistanceText(350)).toBe('350 m');
      expect(formatDistanceText(999)).toBe('999 m');
    });

    it('formats kilometers from 1000 m and above with 1 decimal place', () => {
      expect(formatDistanceText(1000)).toBe('1.0 km');
      expect(formatDistanceText(2450)).toBe('2.5 km');
      expect(formatDistanceText(15600)).toBe('15.6 km');
    });
  });

  describe('mapDbShopToCoffeeShop', () => {
    it('maps every field correctly when given a complete database row', () => {
      const dbRow = {
        id: 'shop-123',
        place_id: 'place-abc',
        name: 'Phin Đậm Đà',
        address: '88 Phố Cũ',
        lat: 21.03,
        lon: 105.85,
        rating: 4.7,
        total_ratings: 85,
        opening_hours: { open_now: true },
        price_range: '₫₫',
        photos: ['https://example.com/photo1.jpg'],
        website: 'https://phindamda.vn',
        phone: '0901234567',
        categories: ['catering.cafe', 'specialty_coffee'],
        custom_amenities: [{ name: 'Góc đọc sách' }],
        amenities: [{ id: 'wifi', name: 'Wi-Fi', type: 'predefined', description: '' }],
        created_by: 'user-1',
        verified: true,
        hidden: false,
        created_at: '2026-01-01T00:00:00Z',
      };

      const result = mapDbShopToCoffeeShop(dbRow, 21.03, 105.85);

      expect(result.id).toBe('place-abc');
      expect(result.name).toBe('Phin Đậm Đà');
      expect(result.address).toBe('88 Phố Cũ');
      expect(result.distance).toBe(0);
      expect(result.distance_text).toBe('0 m');
      expect(result.rating).toBe(4.7);
      expect(result.total_ratings).toBe(85);
      expect(result.photos).toEqual(['https://example.com/photo1.jpg']);
      expect(result.cover_source).toBe('official');
      expect(result.website).toBe('https://phindamda.vn');
      expect(result.phone).toBe('0901234567');
      expect(result.verified).toBe(true);
      expect(result.hidden).toBe(false);
    });

    it('handles missing optional fields safely without throwing', () => {
      const minimalRow = {
        id: 'shop-min',
        lat: '21.00',
        lon: '105.80',
      };

      const result = mapDbShopToCoffeeShop(minimalRow);

      expect(result.id).toBe('shop-min');
      expect(result.name).toBe('Coffee Shop');
      expect(result.address).toBe('');
      expect(result.distance).toBe(0);
      expect(result.distance_text).toBe('0 m');
      expect(result.rating).toBe(0);
      expect(result.total_ratings).toBe(0);
      expect(result.photos).toEqual([]);
      expect(result.cover_source).toBeUndefined();
      expect(result.verified).toBe(true); // created_by is falsy -> true
      expect(result.hidden).toBe(false);
    });

    it('surfaces slug when present and getShopPath returns /shop/<slug>', () => {
      const rowWithSlug = {
        id: 'shop-123',
        place_id: 'place-abc',
        slug: 'ca-phe-sua-da',
        name: 'Cà Phê Sữa Đá',
        lat: 21.03,
        lon: 105.85,
      };

      const shop = mapDbShopToCoffeeShop(rowWithSlug);
      expect(shop.slug).toBe('ca-phe-sua-da');
      expect(getShopPath(shop)).toBe('/shop/ca-phe-sua-da');
    });

    it('sets slug to null when absent and getShopPath falls back to place_id or id', () => {
      const rowWithoutSlug = {
        id: 'shop-123',
        place_id: 'place-abc',
        name: 'Cà Phê Sữa Đá',
        lat: 21.03,
        lon: 105.85,
      };

      const shop = mapDbShopToCoffeeShop(rowWithoutSlug);
      expect(shop.slug).toBeNull();
      expect(getShopPath(shop)).toBe('/shop/place-abc');
    });

    it('merges community cover photo when official photos are empty (SHOP-COVER-REVIEW-FALLBACK)', () => {
      const shopWithoutPhotos = {
        id: 'shop-no-photo',
        place_id: 'place-no-photo',
        lat: 21.03,
        lon: 105.85,
        photos: [],
      };

      const communityCover = {
        url: 'https://example.com/community-review-cover.jpg',
        review_id: 'rev-999',
      };

      const result = mapDbShopToCoffeeShop(shopWithoutPhotos, undefined, undefined, communityCover);

      expect(result.photos).toEqual(['https://example.com/community-review-cover.jpg']);
      expect(result.cover_source).toBe('community');
      expect(result.cover_from_review_id).toBe('rev-999');
    });

    it('prefers official photos over community cover if official photos exist', () => {
      const shopWithPhotos = {
        id: 'shop-official',
        lat: 21.03,
        lon: 105.85,
        photos: ['https://example.com/official.jpg'],
      };

      const communityCover = {
        url: 'https://example.com/community.jpg',
        review_id: 'rev-1',
      };

      const result = mapDbShopToCoffeeShop(shopWithPhotos, undefined, undefined, communityCover);

      expect(result.photos).toEqual(['https://example.com/official.jpg']);
      expect(result.cover_source).toBe('official');
      expect(result.cover_from_review_id).toBeUndefined();
    });
  });

  describe('fetchCommunityCoverPhotos', () => {
    it('returns empty record for empty or invalid placeIds', async () => {
      const mockSupabase = {};
      expect(await fetchCommunityCoverPhotos(mockSupabase, [])).toEqual({});
      expect(await fetchCommunityCoverPhotos(mockSupabase, ['', '   '])).toEqual({});
    });

    it('queries reviews table and chunks place IDs', async () => {
      const mockData = [
        { shop_place_id: 'p1', id: 'r1', images: ['https://img.com/p1.jpg'], rating: 5 },
        { shop_place_id: 'p2', id: 'r2', images: ['https://img.com/p2.jpg'], rating: 4 },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
                }),
              }),
            }),
          }),
        }),
      };

      const covers = await fetchCommunityCoverPhotos(mockSupabase, ['p1', 'p2']);

      expect(covers['p1']).toEqual({ url: 'https://img.com/p1.jpg', review_id: 'r1' });
      expect(covers['p2']).toEqual({ url: 'https://img.com/p2.jpg', review_id: 'r2' });
    });
  });

  describe('fetchNearbyShopsRpc', () => {
    it('calls nearby_shops and nearby_shops_count RPCs and maps results', async () => {
      const mockRpc = vi.fn().mockImplementation((fnName: string) => {
        if (fnName === 'nearby_shops') {
          return Promise.resolve({
            data: [
              {
                place_id: 'shop-1',
                name: 'Cà Phê Phố Cổ',
                lat: 21.03,
                lon: 105.85,
                photos: ['https://example.com/p1.jpg'],
                distance_meters: 154.2,
                hidden: false,
              },
            ],
            error: null,
          });
        }
        if (fnName === 'nearby_shops_count') {
          return Promise.resolve({ data: 42, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const mockSupabase = { rpc: mockRpc } as any;

      const result = await fetchNearbyShopsRpc(mockSupabase, {
        lat: 21.0285,
        lng: 105.8542,
        radiusKm: 5,
        limit: 10,
        offset: 0,
      });

      expect(mockRpc).toHaveBeenCalledWith('nearby_shops', {
        user_lat: 21.0285,
        user_lon: 105.8542,
        radius_km: 5,
        page_limit: 10,
        page_offset: 0,
      });
      expect(mockRpc).toHaveBeenCalledWith('nearby_shops_count', {
        user_lat: 21.0285,
        user_lon: 105.8542,
        radius_km: 5,
      });

      expect(result.total).toBe(42);
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].name).toBe('Cà Phê Phố Cổ');
    });

    it('surfaces slug from nearby_shops RPC and generates canonical getShopPath', async () => {
      const mockRpc = vi.fn().mockImplementation((fnName: string) => {
        if (fnName === 'nearby_shops') {
          return Promise.resolve({
            data: [
              {
                place_id: 'shop-with-slug',
                slug: 'pho-co-coffee',
                name: 'Phố Cổ Coffee',
                lat: 21.03,
                lon: 105.85,
                photos: ['https://example.com/p.jpg'],
                distance_meters: 100,
                hidden: false,
              },
            ],
            error: null,
          });
        }
        if (fnName === 'nearby_shops_count') {
          return Promise.resolve({ data: 1, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const mockSupabase = { rpc: mockRpc } as any;

      const result = await fetchNearbyShopsRpc(mockSupabase, {
        lat: 21.0285,
        lng: 105.8542,
        radiusKm: 5,
        limit: 10,
        offset: 0,
      });

      expect(result.shops[0].slug).toBe('pho-co-coffee');
      expect(getShopPath(result.shops[0])).toBe('/shop/pho-co-coffee');
    });

    it('falls back to place_id in getShopPath when nearby_shops RPC row has no slug', async () => {
      const mockRpc = vi.fn().mockImplementation((fnName: string) => {
        if (fnName === 'nearby_shops') {
          return Promise.resolve({
            data: [
              {
                place_id: 'shop-without-slug',
                name: 'Legacy Shop',
                lat: 21.03,
                lon: 105.85,
                photos: ['https://example.com/p.jpg'],
                distance_meters: 100,
                hidden: false,
              },
            ],
            error: null,
          });
        }
        if (fnName === 'nearby_shops_count') {
          return Promise.resolve({ data: 1, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const mockSupabase = {
        rpc: mockRpc,
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any;

      const result = await fetchNearbyShopsRpc(mockSupabase, {
        lat: 21.0285,
        lng: 105.8542,
        radiusKm: 5,
        limit: 10,
        offset: 0,
      });

      expect(result.shops[0].slug).toBeNull();
      expect(getShopPath(result.shops[0])).toBe('/shop/shop-without-slug');
    });

    it('overrides distance with SQL distance_meters when divergence exceeds 1m', async () => {
      const mockRpc = vi.fn().mockImplementation((fnName: string) => {
        if (fnName === 'nearby_shops') {
          return Promise.resolve({
            data: [
              {
                place_id: 'shop-div',
                name: 'Divergent Shop',
                lat: 21.03,
                lon: 105.85,
                photos: ['https://example.com/p.jpg'],
                distance_meters: 500, // Deliberately divergent from Haversine calculation
                hidden: false,
              },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: 1, error: null });
      });

      const mockSupabase = { rpc: mockRpc } as any;

      const result = await fetchNearbyShopsRpc(mockSupabase, {
        lat: 21.0285,
        lng: 105.8542,
        radiusKm: null,
        limit: 10,
        offset: 0,
      });

      expect(result.shops[0].distance).toBe(500);
      expect(result.shops[0].distance_text).toBe('500 m');
    });

    it('returns empty shops and total 0 on RPC error', async () => {
      const mockRpc = vi.fn().mockImplementation((fnName: string) => {
        if (fnName === 'nearby_shops') {
          return Promise.resolve({ data: null, error: { message: 'Function not found' } });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const mockSupabase = { rpc: mockRpc } as any;

      const result = await fetchNearbyShopsRpc(mockSupabase, {
        lat: 21.0285,
        lng: 105.8542,
        radiusKm: null,
        limit: 10,
        offset: 0,
      });

      expect(result.shops).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('enriches social links from shops table when RPC returns rows lacking social columns', async () => {
      const mockRpc = vi.fn().mockImplementation((fnName: string) => {
        if (fnName === 'nearby_shops') {
          return Promise.resolve({
            data: [
              {
                place_id: 'shop-no-social-in-rpc',
                name: 'Quán Cà Phê Mới',
                lat: 21.03,
                lon: 105.85,
                photos: ['https://example.com/p.jpg'],
                distance_meters: 100,
                hidden: false,
              },
            ],
            error: null,
          });
        }
        if (fnName === 'nearby_shops_count') {
          return Promise.resolve({ data: 1, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [
              {
                place_id: 'shop-no-social-in-rpc',
                facebook_url: 'https://facebook.com/cafemoi',
                instagram_url: 'https://instagram.com/cafemoi',
                tiktok_url: null,
                youtube_url: null,
                zalo_url: null,
              },
            ],
            error: null,
          }),
        }),
      });

      const mockSupabase = { rpc: mockRpc, from: mockFrom } as any;

      const result = await fetchNearbyShopsRpc(mockSupabase, {
        lat: 21.0285,
        lng: 105.8542,
        radiusKm: null,
        limit: 10,
        offset: 0,
      });

      expect(mockFrom).toHaveBeenCalledWith('shops');
      expect(result.shops[0].facebook_url).toBe('https://facebook.com/cafemoi');
      expect(result.shops[0].instagram_url).toBe('https://instagram.com/cafemoi');
      expect(result.shops[0].tiktok_url).toBeNull();
    });
  });

  describe('fetchTrendingShops', () => {
    it('calls trending_shops RPC with correct arguments and maps results', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [
          {
            place_id: 'trending-1',
            name: 'Quán Trending',
            lat: 21.03,
            lon: 105.85,
            photos: ['https://example.com/trend.jpg'],
            review_count: 42,
            hidden: false,
          },
        ],
        error: null,
      });

      const mockSupabase = { rpc: mockRpc } as any;

      const result = await fetchTrendingShops(mockSupabase, { daysBack: 14, limit: 5 });

      expect(mockRpc).toHaveBeenCalledWith('trending_shops', {
        days_back: 14,
        result_limit: 5,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('trending-1');
      expect(result[0].name).toBe('Quán Trending');
      expect(result[0].cover_source).toBe('official');
    });

    it('resolves community cover photo for trending rows without official photos', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [
          {
            place_id: 'trending-no-photo',
            name: 'Quán No Photo',
            lat: 21.03,
            lon: 105.85,
            photos: [],
            review_count: 10,
            hidden: false,
          },
        ],
        error: null,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'rev-trend-1',
                      shop_place_id: 'trending-no-photo',
                      images: ['https://example.com/comm-cover.jpg'],
                      rating: 5,
                      created_at: '2026-09-01T00:00:00Z',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const mockSupabase = { rpc: mockRpc, from: mockFrom } as any;

      const result = await fetchTrendingShops(mockSupabase);

      expect(result[0].photos).toEqual(['https://example.com/comm-cover.jpg']);
      expect(result[0].cover_source).toBe('community');
      expect(result[0].cover_from_review_id).toBe('rev-trend-1');
    });

    it('returns empty array gracefully on RPC error without throwing', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database failure' },
      });

      const mockSupabase = { rpc: mockRpc } as any;

      const result = await fetchTrendingShops(mockSupabase);
      expect(result).toEqual([]);
    });
  });

  describe('fetchNewShops', () => {
    it('calls new_shops RPC with correct arguments and maps results', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [
          {
            place_id: 'new-1',
            name: 'Quán Mới',
            lat: 21.03,
            lon: 105.85,
            photos: ['https://example.com/new.jpg'],
            hidden: false,
          },
        ],
        error: null,
      });

      const mockSupabase = { rpc: mockRpc } as any;

      const result = await fetchNewShops(mockSupabase, { limit: 8 });

      expect(mockRpc).toHaveBeenCalledWith('new_shops', {
        result_limit: 8,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('new-1');
      expect(result[0].name).toBe('Quán Mới');
      expect(result[0].cover_source).toBe('official');
    });

    it('resolves community cover photo for new rows without official photos', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [
          {
            place_id: 'new-no-photo',
            name: 'Quán Mới Không Ảnh',
            lat: 21.03,
            lon: 105.85,
            photos: [],
            hidden: false,
          },
        ],
        error: null,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'rev-new-1',
                      shop_place_id: 'new-no-photo',
                      images: ['https://example.com/comm-new.jpg'],
                      rating: 4,
                      created_at: '2026-09-02T00:00:00Z',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const mockSupabase = { rpc: mockRpc, from: mockFrom } as any;

      const result = await fetchNewShops(mockSupabase);

      expect(result[0].photos).toEqual(['https://example.com/comm-new.jpg']);
      expect(result[0].cover_source).toBe('community');
      expect(result[0].cover_from_review_id).toBe('rev-new-1');
    });

    it('returns empty array gracefully on RPC error without throwing', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database failure' },
      });

      const mockSupabase = { rpc: mockRpc } as any;

      const result = await fetchNewShops(mockSupabase);
      expect(result).toEqual([]);
    });
  });

  describe('enrichMissingShopColumns', () => {
    it('enriches slug and social media fields when missing from RPC output', async () => {
      const rows = [
        { place_id: 'shop-1', name: 'Quán 1' },
        { place_id: 'shop-2', name: 'Quán 2' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [
              {
                place_id: 'shop-1',
                slug: 'quan-1',
                facebook_url: 'https://fb.com/quan1',
                instagram_url: null,
                tiktok_url: null,
                youtube_url: null,
                zalo_url: null,
                videos: [],
              },
              {
                place_id: 'shop-2',
                slug: 'quan-2',
                facebook_url: null,
                instagram_url: 'https://instagr.am/quan2',
                tiktok_url: null,
                youtube_url: null,
                zalo_url: null,
                videos: [],
              },
            ],
            error: null,
          }),
        }),
      });

      const mockSupabase = { from: mockFrom } as any;

      await enrichMissingShopColumns(mockSupabase, rows);

      expect((rows[0] as any).slug).toBe('quan-1');
      expect((rows[0] as any).facebook_url).toBe('https://fb.com/quan1');
      expect((rows[1] as any).slug).toBe('quan-2');
      expect((rows[1] as any).instagram_url).toBe('https://instagr.am/quan2');
    });

    it('skips database query when slug and social media fields are already present', async () => {
      const rows = [
        {
          place_id: 'shop-1',
          slug: 'quan-1',
          facebook_url: 'https://fb.com/quan1',
        },
      ];

      const mockFrom = vi.fn();
      const mockSupabase = { from: mockFrom } as any;

      await enrichMissingShopColumns(mockSupabase, rows);

      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('handles empty rows or missing supabase.from gracefully without throwing', async () => {
      await expect(enrichMissingShopColumns(null, [])).resolves.not.toThrow();
      await expect(enrichMissingShopColumns({} as any, [{ place_id: '1' }])).resolves.not.toThrow();
    });

    it('logs warning at warn level with error message when PostgREST returns schema cache error', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const rows = [{ place_id: 'shop-1' }];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Could not find the "slug" column in schema cache' },
          }),
        }),
      });

      const mockSupabase = { from: mockFrom } as any;

      await enrichMissingShopColumns(mockSupabase, rows);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[enrichMissingShopColumns] Error enriching missing columns:'),
        'Could not find the "slug" column in schema cache'
      );
      consoleWarnSpy.mockRestore();
    });

    it('logs warning at warn level when query throws an unexpected error', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const rows = [{ place_id: 'shop-1' }];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockRejectedValue(new Error('Network offline')),
        }),
      });

      const mockSupabase = { from: mockFrom } as any;

      await enrichMissingShopColumns(mockSupabase, rows);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[enrichMissingShopColumns] Failed to enrich missing columns:'),
        'Network offline'
      );
      consoleWarnSpy.mockRestore();
    });
  });
});

