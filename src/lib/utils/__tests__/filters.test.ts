import { describe, it, expect } from 'vitest';
import { CoffeeShop, ShopFilterState } from '@/types/shop';
import { applyShopFilters, countActiveFilters, isFilterDefault } from '../filters';

const mockShops: CoffeeShop[] = [
  {
    id: 'shop-1',
    place_id: 'shop-1',
    name: 'An Café',
    address: '123 Đường A',
    lat: 21.0285,
    lon: 105.8542,
    distance: 500,
    distance_text: '500 m',
    rating: 4.8,
    total_ratings: 120,
    opening_hours: { open_now: true },
    price_range: '₫',
    categories: ['catering.cafe', 'air_conditioned'],
    amenities: [
      { id: 'air_conditioned', name: 'Máy lạnh', type: 'predefined', description: '' },
      { id: 'high_speed_wifi', name: 'Wi-Fi tốc độ cao', type: 'predefined', description: '' },
    ],
  },
  {
    id: 'shop-2',
    place_id: 'shop-2',
    name: 'Bình Minh Coffee',
    address: '456 Đường B',
    lat: 21.03,
    lon: 105.85,
    distance: 1200,
    distance_text: '1.2 km',
    rating: 4.2,
    total_ratings: 45,
    opening_hours: { open_now: false },
    price_range: '₫₫',
    categories: ['catering.cafe'],
    amenities: [
      { id: 'air_conditioned', name: 'Máy lạnh', type: 'predefined', description: '' },
    ],
  },
  {
    id: 'shop-3',
    place_id: 'shop-3',
    name: 'Cà Phê Chiều',
    address: '789 Đường C',
    lat: 21.035,
    lon: 105.84,
    distance: 6500,
    distance_text: '6.5 km',
    rating: 3.9,
    total_ratings: 80,
    opening_hours: { open_now: true },
    price_range: '₫₫₫',
    categories: ['catering.cafe'],
    amenities: [
      { id: 'parking_available', name: 'Chỗ đỗ xe', type: 'predefined', description: '' },
    ],
  },
];

const defaultFilters: ShopFilterState = {
  openNowOnly: false,
  minRating: 0,
  sortBy: 'distance',
  priceRanges: [],
  requiredAmenityIds: [],
  radiusKm: null,
};

describe('Filters Utility (FEAT-07)', () => {
  it('returns input shops unchanged when all filters are default and preserves input immutability', () => {
    const originalCopy = JSON.parse(JSON.stringify(mockShops));
    const result = applyShopFilters(mockShops, defaultFilters);

    expect(result).toHaveLength(mockShops.length);
    expect(result.map((s) => s.id)).toEqual(['shop-1', 'shop-2', 'shop-3']);
    // Immutability check
    expect(mockShops).toEqual(originalCopy);
  });

  it('filters by openNowOnly correctly', () => {
    const result = applyShopFilters(mockShops, { ...defaultFilters, openNowOnly: true });
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.opening_hours?.open_now)).toBe(true);
  });

  it('filters by priceRanges matching only the selected ranges', () => {
    const singlePrice = applyShopFilters(mockShops, { ...defaultFilters, priceRanges: ['₫'] });
    expect(singlePrice).toHaveLength(1);
    expect(singlePrice[0].id).toBe('shop-1');

    const multiPrice = applyShopFilters(mockShops, { ...defaultFilters, priceRanges: ['₫', '₫₫'] });
    expect(multiPrice).toHaveLength(2);
    expect(multiPrice.map((s) => s.id)).toEqual(['shop-1', 'shop-2']);
  });

  it('requires ALL listed requiredAmenityIds to be present', () => {
    const oneAmenity = applyShopFilters(mockShops, { ...defaultFilters, requiredAmenityIds: ['air_conditioned'] });
    expect(oneAmenity).toHaveLength(2);

    const bothAmenities = applyShopFilters(mockShops, {
      ...defaultFilters,
      requiredAmenityIds: ['air_conditioned', 'high_speed_wifi'],
    });
    expect(bothAmenities).toHaveLength(1);
    expect(bothAmenities[0].id).toBe('shop-1');
  });

  it('handles radiusKm correctly (skips when null, excludes beyond limit when set)', () => {
    const noRadius = applyShopFilters(mockShops, { ...defaultFilters, radiusKm: null });
    expect(noRadius).toHaveLength(3);

    const radius5km = applyShopFilters(mockShops, { ...defaultFilters, radiusKm: 5 });
    expect(radius5km).toHaveLength(2);
    expect(radius5km.map((s) => s.id)).toEqual(['shop-1', 'shop-2']);
    expect(radius5km.some((s) => s.id === 'shop-3')).toBe(false);
  });

  it('sorts by distance, rating, and name correctly', () => {
    const byDistance = applyShopFilters(mockShops, { ...defaultFilters, sortBy: 'distance' });
    expect(byDistance.map((s) => s.id)).toEqual(['shop-1', 'shop-2', 'shop-3']);

    const byRating = applyShopFilters(mockShops, { ...defaultFilters, sortBy: 'rating' });
    expect(byRating.map((s) => s.id)).toEqual(['shop-1', 'shop-2', 'shop-3']);

    const byName = applyShopFilters(mockShops, { ...defaultFilters, sortBy: 'name' });
    expect(byName.map((s) => s.id)).toEqual(['shop-1', 'shop-2', 'shop-3']);
  });

  it('counts active filters properly', () => {
    expect(countActiveFilters(defaultFilters, '')).toBe(0);
    expect(countActiveFilters({ ...defaultFilters, openNowOnly: true }, '')).toBe(1);
    expect(
      countActiveFilters(
        {
          ...defaultFilters,
          openNowOnly: true,
          minRating: 4.0,
          priceRanges: ['₫', '₫₫'],
          requiredAmenityIds: ['air_conditioned'],
          radiusKm: 2,
        },
        'cafe'
      )
    ).toBe(6);
  });

  it('identifies default filter state with isFilterDefault', () => {
    expect(isFilterDefault(defaultFilters)).toBe(true);
    expect(isFilterDefault({ ...defaultFilters, openNowOnly: true })).toBe(false);
    expect(isFilterDefault({ ...defaultFilters, radiusKm: 5 })).toBe(false);
    expect(isFilterDefault({ ...defaultFilters, minRating: 4 })).toBe(false);
  });
});
