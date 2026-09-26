import { describe, it, expect } from 'vitest';
import { computeRecap } from '../computeRecap';
import type { VisitedShopItem, SavedShopItem, ReviewData } from '@/hooks/useShops';

describe('computeRecap (Tier 3.3)', () => {
  it('returns default zero and null values when collections are empty', () => {
    const recap = computeRecap({ year: 2026 });

    expect(recap.year).toBe(2026);
    expect(recap.total_visits).toBe(0);
    expect(recap.total_reviews).toBe(0);
    expect(recap.total_favorites).toBe(0);
    expect(recap.unique_shops_visited).toBe(0);
    expect(recap.top_category).toBeNull();
    expect(recap.top_price_range).toBeNull();
    expect(recap.longest_streak_days).toBe(0);
    expect(recap.busiest_month).toBeNull();
    expect(recap.first_visit).toBeNull();
    expect(recap.top_shop).toBeNull();
    expect(recap.top_reviewed_shop).toBeNull();
    expect(recap.tier_label).toBe('Đồng');
  });

  it('filters out records outside the target year', () => {
    const visits: VisitedShopItem[] = [
      {
        id: 'v1',
        user_id: 'u1',
        shop_place_id: 'shop-2025',
        shop_name: 'Quán 2025',
        visited_at: '2025-12-31T15:00:00Z',
        created_at: '2025-12-31T15:00:00Z',
      },
      {
        id: 'v2',
        user_id: 'u1',
        shop_place_id: 'shop-2026',
        shop_name: 'Quán 2026',
        visited_at: '2026-01-02T10:00:00Z',
        created_at: '2026-01-02T10:00:00Z',
      },
    ];

    const reviews: ReviewData[] = [
      {
        id: 'r1',
        user_id: 'u1',
        shop_place_id: 'shop-2024',
        rating: 5,
        comment: 'Ngon',
        author: 'User',
        created_at: '2024-05-10T12:00:00Z',
      },
      {
        id: 'r2',
        user_id: 'u1',
        shop_place_id: 'shop-2026',
        rating: 4,
        comment: 'Ổn',
        author: 'User',
        created_at: '2026-03-15T09:00:00Z',
      },
    ];

    const favorites: SavedShopItem[] = [
      {
        id: 'f1',
        user_id: 'u1',
        place_id: 'shop-2025',
        name: 'Quán 2025',
        created_at: '2025-08-01T00:00:00Z',
      },
      {
        id: 'f2',
        user_id: 'u1',
        place_id: 'shop-2026',
        name: 'Quán 2026',
        created_at: '2026-02-14T00:00:00Z',
      },
    ];

    const recap = computeRecap({
      year: 2026,
      visits,
      reviews,
      favorites,
      tier_label: 'Vàng',
    });

    expect(recap.total_visits).toBe(1);
    expect(recap.total_reviews).toBe(1);
    expect(recap.total_favorites).toBe(1);
    expect(recap.unique_shops_visited).toBe(1);
    expect(recap.first_visit?.shop_name).toBe('Quán 2026');
    expect(recap.tier_label).toBe('Vàng');
  });

  it('correctly calculates longest visit streak in calendar days', () => {
    // 3 consecutive days: Feb 27, Feb 28, Feb 29 (leap year 2024 / or Jan 10, Jan 11, Jan 12)
    // plus multiple visits on Jan 11 (should count as 1 day)
    // plus a gap on Jan 13, and a 2-day streak on Jan 14-15
    const visits: VisitedShopItem[] = [
      {
        id: 'v1',
        user_id: 'u1',
        shop_place_id: 's1',
        shop_name: 'Quán 1',
        visited_at: '2026-01-10T08:00:00Z',
        created_at: '2026-01-10T08:00:00Z',
      },
      {
        id: 'v2',
        user_id: 'u1',
        shop_place_id: 's2',
        shop_name: 'Quán 2',
        visited_at: '2026-01-11T09:00:00Z',
        created_at: '2026-01-11T09:00:00Z',
      },
      {
        id: 'v3',
        user_id: 'u1',
        shop_place_id: 's3',
        shop_name: 'Quán 3',
        visited_at: '2026-01-11T16:00:00Z', // Same day second visit
        created_at: '2026-01-11T16:00:00Z',
      },
      {
        id: 'v4',
        user_id: 'u1',
        shop_place_id: 's4',
        shop_name: 'Quán 4',
        visited_at: '2026-01-12T10:00:00Z', // 3rd day in streak
        created_at: '2026-01-12T10:00:00Z',
      },
      // Jan 13 missing (gap)
      {
        id: 'v5',
        user_id: 'u1',
        shop_place_id: 's5',
        shop_name: 'Quán 5',
        visited_at: '2026-01-14T10:00:00Z',
        created_at: '2026-01-14T10:00:00Z',
      },
      {
        id: 'v6',
        user_id: 'u1',
        shop_place_id: 's6',
        shop_name: 'Quán 6',
        visited_at: '2026-01-15T10:00:00Z',
        created_at: '2026-01-15T10:00:00Z',
      },
    ];

    const recap = computeRecap({ year: 2026, visits });
    expect(recap.longest_streak_days).toBe(3);
    expect(recap.total_visits).toBe(6);
    expect(recap.unique_shops_visited).toBe(6);
  });

  it('determines the busiest month with earliest-month tie breaker', () => {
    // 2 visits in March (m=3) and 2 visits in July (m=7). March should win ties.
    const visits: VisitedShopItem[] = [
      {
        id: 'v1',
        user_id: 'u1',
        shop_place_id: 's1',
        shop_name: 'Quán 1',
        visited_at: '2026-03-01T08:00:00Z',
        created_at: '2026-03-01T08:00:00Z',
      },
      {
        id: 'v2',
        user_id: 'u1',
        shop_place_id: 's2',
        shop_name: 'Quán 2',
        visited_at: '2026-03-15T09:00:00Z',
        created_at: '2026-03-15T09:00:00Z',
      },
      {
        id: 'v3',
        user_id: 'u1',
        shop_place_id: 's3',
        shop_name: 'Quán 3',
        visited_at: '2026-07-10T12:00:00Z',
        created_at: '2026-07-10T12:00:00Z',
      },
      {
        id: 'v4',
        user_id: 'u1',
        shop_place_id: 's4',
        shop_name: 'Quán 4',
        visited_at: '2026-07-20T12:00:00Z',
        created_at: '2026-07-20T12:00:00Z',
      },
    ];

    const recap = computeRecap({ year: 2026, visits });
    expect(recap.busiest_month).toEqual({
      month: 3,
      name: 'Tháng 3',
      count: 2,
    });
  });

  it('falls back to reviews for busiest month if user has 0 visits in that year', () => {
    const reviews: ReviewData[] = [
      {
        id: 'r1',
        user_id: 'u1',
        shop_place_id: 's1',
        rating: 5,
        comment: 'Tuyệt',
        author: 'User',
        created_at: '2026-08-05T10:00:00Z',
      },
      {
        id: 'r2',
        user_id: 'u1',
        shop_place_id: 's2',
        rating: 4,
        comment: 'Được',
        author: 'User',
        created_at: '2026-08-12T10:00:00Z',
      },
    ];

    const recap = computeRecap({ year: 2026, visits: [], reviews });
    expect(recap.busiest_month).toEqual({
      month: 8,
      name: 'Tháng 8',
      count: 2,
    });
  });

  it('computes top category and top price range with label normalization', () => {
    const visits: VisitedShopItem[] = [
      {
        id: 'v1',
        user_id: 'u1',
        shop_place_id: 's1',
        shop_name: 'Phin & Phở',
        visited_at: '2026-04-01T08:00:00Z',
        created_at: '2026-04-01T08:00:00Z',
        shop: {
          id: 's1',
          place_id: 's1',
          name: 'Phin & Phở',
          address: '123 Đinh Tiên Hoàng',
          lat: 10.7,
          lon: 106.6,
          rating: 4.8,
          total_ratings: 50,
          photos: [],
          categories: ['catering.coffee_shop', 'air_conditioned'],
          price_range: '30k - 60k',
        } as any,
      },
      {
        id: 'v2',
        user_id: 'u1',
        shop_place_id: 's2',
        shop_name: 'Cà Phê Mộc',
        visited_at: '2026-04-10T08:00:00Z',
        created_at: '2026-04-10T08:00:00Z',
        shop: {
          id: 's2',
          place_id: 's2',
          name: 'Cà Phê Mộc',
          address: '456 Lê Lợi',
          lat: 10.7,
          lon: 106.6,
          rating: 4.5,
          total_ratings: 20,
          photos: [],
          categories: ['specialty_coffee'],
          price_range: '30k - 60k',
        } as any,
      },
    ];

    const recap = computeRecap({ year: 2026, visits });
    // 'catering.coffee_shop' and 'specialty_coffee' both translate to 'Cà phê đặc sản'
    expect(recap.top_category).toEqual({
      category: 'Cà phê đặc sản',
      count: 2,
    });
    expect(recap.top_price_range).toBe('30k - 60k');
  });

  it('computes top shop with visit count and earliest-visit tie breaker', () => {
    // s1 has 2 visits (first at May 1).
    // s2 has 2 visits (first at April 15).
    // s2 should win tie breaker because April 15 < May 1.
    const visits: VisitedShopItem[] = [
      {
        id: 'v1',
        user_id: 'u1',
        shop_place_id: 's1',
        shop_name: 'Quán Một',
        visited_at: '2026-05-01T10:00:00Z',
        created_at: '2026-05-01T10:00:00Z',
      },
      {
        id: 'v2',
        user_id: 'u1',
        shop_place_id: 's1',
        shop_name: 'Quán Một',
        visited_at: '2026-05-20T10:00:00Z',
        created_at: '2026-05-20T10:00:00Z',
      },
      {
        id: 'v3',
        user_id: 'u1',
        shop_place_id: 's2',
        shop_name: 'Quán Hai',
        visited_at: '2026-04-15T10:00:00Z',
        created_at: '2026-04-15T10:00:00Z',
        shop: {
          id: 's2',
          place_id: 's2',
          name: 'Quán Hai',
          slug: 'quan-hai',
          address: '789 Trần Hưng Đạo',
          photos: ['https://example.com/photo.jpg'],
        } as any,
      },
      {
        id: 'v4',
        user_id: 'u1',
        shop_place_id: 's2',
        shop_name: 'Quán Hai',
        visited_at: '2026-06-01T10:00:00Z',
        created_at: '2026-06-01T10:00:00Z',
      },
    ];

    const recap = computeRecap({ year: 2026, visits });
    expect(recap.top_shop).toEqual({
      shop_name: 'Quán Hai',
      count: 2,
      place_id: 's2',
      slug: 'quan-hai',
      address: '789 Trần Hưng Đạo',
      photo: 'https://example.com/photo.jpg',
    });
  });

  it('identifies top reviewed shop with rating and most-recent tie breaker', () => {
    const reviews: ReviewData[] = [
      {
        id: 'r1',
        user_id: 'u1',
        shop_place_id: 's1',
        shop_name: 'Quán A',
        shop_slug: 'quan-a',
        rating: 5,
        comment: 'Cũ hơn',
        author: 'User',
        created_at: '2026-02-01T10:00:00Z',
      },
      {
        id: 'r2',
        user_id: 'u1',
        shop_place_id: 's2',
        shop_name: 'Quán B',
        shop_slug: 'quan-b',
        rating: 5,
        comment: 'Mới hơn',
        author: 'User',
        created_at: '2026-03-01T10:00:00Z',
      },
      {
        id: 'r3',
        user_id: 'u1',
        shop_place_id: 's3',
        shop_name: 'Quán C',
        rating: 4,
        comment: 'Thường',
        author: 'User',
        created_at: '2026-04-01T10:00:00Z',
      },
    ];

    const recap = computeRecap({ year: 2026, reviews });
    expect(recap.top_reviewed_shop).toEqual({
      shop_name: 'Quán B',
      rating: 5,
      place_id: 's2',
      slug: 'quan-b',
    });
  });
});
