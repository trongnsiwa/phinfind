import { describe, it, expect, vi } from 'vitest';
import {
  calculateDistanceMeters,
  formatDistanceText,
  mapDbShopToCoffeeShop,
  fetchCommunityCoverPhotos,
  fetchNearbyShopsRpc,
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
  });
});
