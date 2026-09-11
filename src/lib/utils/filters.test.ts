import { CoffeeShop, ShopFilterState } from '@/types/shop';
import { applyShopFilters, countActiveFilters, isFilterDefault } from './filters';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

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
    distance: 2500,
    distance_text: '2.5 km',
    rating: 3.9,
    total_ratings: 80,
    opening_hours: { open_now: true },
    price_range: '₫₫₫',
    categories: ['outdoor_garden'],
    amenities: [],
  },
  {
    id: 'shop-4',
    place_id: 'shop-4',
    name: 'Đêm Nay Roastery',
    address: '101 Đường D',
    lat: 21.04,
    lon: 105.83,
    distance: 300,
    distance_text: '300 m',
    rating: 4.9,
    total_ratings: 300,
    price_range: undefined,
    categories: ['specialty_coffee'],
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

export function runFilterTests() {
  // 1. Default filters return all shops sorted by distance (no distance exclusion when radiusKm is null)
  const defaultResult = applyShopFilters(mockShops, defaultFilters);
  assert(defaultResult.length === 4, 'Default filters should return all shops');
  assert(defaultResult[0].id === 'shop-4', 'Default sort by distance should place 300m first');
  assert(defaultResult[1].id === 'shop-1', '500m second');
  assert(defaultResult[2].id === 'shop-2', '1.2km third');
  assert(defaultResult[3].id === 'shop-3', '2.5km fourth');

  // Immutability check
  assert(mockShops[0].id === 'shop-1', 'Original array must not be mutated');

  // 2. Open now filter
  const openNowResult = applyShopFilters(mockShops, { ...defaultFilters, openNowOnly: true });
  assert(openNowResult.length === 2, 'Only 2 shops are open now');
  assert(openNowResult.every((s) => s.opening_hours?.open_now === true), 'All returned must be open now');

  // 3. Min rating filter
  const minRatingResult = applyShopFilters(mockShops, { ...defaultFilters, minRating: 4.5 });
  assert(minRatingResult.length === 2, 'Only 2 shops have rating >= 4.5');
  assert(minRatingResult.every((s) => s.rating >= 4.5), 'All returned ratings >= 4.5');

  // 4. Price range filter
  const priceResult1 = applyShopFilters(mockShops, { ...defaultFilters, priceRanges: ['₫', '₫₫'] });
  assert(priceResult1.length === 2, 'Only shop-1 and shop-2 match ₫ or ₫₫');
  assert(priceResult1.some((s) => s.id === 'shop-1') && priceResult1.some((s) => s.id === 'shop-2'), 'Matches shop-1 and shop-2');

  const priceResult2 = applyShopFilters(mockShops, { ...defaultFilters, priceRanges: ['₫₫₫₫'] });
  assert(priceResult2.length === 0, 'No shops have ₫₫₫₫');

  // 5. Amenity filter (requires all amenities)
  const amenityResult1 = applyShopFilters(mockShops, {
    ...defaultFilters,
    requiredAmenityIds: ['air_conditioned', 'high_speed_wifi'],
  });
  assert(amenityResult1.length === 1, 'Only shop-1 has both air_conditioned and high_speed_wifi');
  assert(amenityResult1[0].id === 'shop-1', 'Should be shop-1');

  // Fallback to categories
  const amenityResult2 = applyShopFilters(mockShops, {
    ...defaultFilters,
    requiredAmenityIds: ['outdoor_garden'],
  });
  assert(amenityResult2.length === 1 && amenityResult2[0].id === 'shop-3', 'Should match category outdoor_garden');

  // 6. Radius filter (when radiusKm is set)
  const radius1km = applyShopFilters(mockShops, { ...defaultFilters, radiusKm: 1 });
  assert(radius1km.length === 2, '1 km radius should include shop-4 (300m) and shop-1 (500m)');
  assert(radius1km[0].id === 'shop-4' && radius1km[1].id === 'shop-1', 'Should match shop-4 and shop-1');

  const radius2km = applyShopFilters(mockShops, { ...defaultFilters, radiusKm: 2 });
  assert(radius2km.length === 3, '2 km radius should include shop-4, shop-1, and shop-2 (1.2km)');

  // 7. Sorting
  const ratingSort = applyShopFilters(mockShops, { ...defaultFilters, sortBy: 'rating' });
  assert(ratingSort[0].id === 'shop-4', 'Highest rated (4.9) should be first');
  assert(ratingSort[1].id === 'shop-1', 'Second highest (4.8)');
  assert(ratingSort[3].id === 'shop-3', 'Lowest rated (3.9) should be last');

  const nameSort = applyShopFilters(mockShops, { ...defaultFilters, sortBy: 'name' });
  assert(nameSort[0].id === 'shop-1', 'An Café should be first');
  assert(nameSort[1].id === 'shop-2', 'Bình Minh should be second');
  assert(nameSort[2].id === 'shop-3', 'Cà Phê Chiều third');
  assert(nameSort[3].id === 'shop-4', 'Đêm Nay fourth');

  // 8. countActiveFilters
  assert(countActiveFilters(defaultFilters) === 0, 'Default filters count is 0');
  assert(countActiveFilters({ ...defaultFilters, openNowOnly: true }) === 1, 'openNowOnly adds 1');
  assert(countActiveFilters({ ...defaultFilters, minRating: 4.0 }) === 1, 'minRating adds 1');
  assert(countActiveFilters({ ...defaultFilters, priceRanges: ['₫'] }) === 1, 'priceRanges adds 1');
  assert(countActiveFilters({ ...defaultFilters, requiredAmenityIds: ['wifi'] }) === 1, 'requiredAmenityIds adds 1');
  assert(countActiveFilters({ ...defaultFilters, radiusKm: 1 }) === 1, 'radiusKm !== null adds 1');
  assert(countActiveFilters({ ...defaultFilters, radiusKm: null }) === 0, 'radiusKm === null adds 0');
  assert(countActiveFilters({ ...defaultFilters, sortBy: 'rating' }) === 1, 'sortBy !== distance adds 1');
  assert(countActiveFilters(defaultFilters, 'latte') === 1, 'searchQuery adds 1');
  assert(
    countActiveFilters(
      {
        openNowOnly: true,
        minRating: 4,
        priceRanges: ['₫', '₫₫'],
        requiredAmenityIds: ['wifi'],
        radiusKm: 5,
        sortBy: 'rating',
      },
      'hanoi'
    ) === 7,
    'All 7 active filters should return 7'
  );

  // 9. isFilterDefault
  assert(isFilterDefault(defaultFilters) === true, 'defaultFilters is default');
  assert(isFilterDefault({ ...defaultFilters, radiusKm: null }) === true, 'radiusKm: null is default');
  assert(isFilterDefault({ ...defaultFilters, radiusKm: 5 }) === false, 'radiusKm: 5 is not default');
  assert(isFilterDefault({ ...defaultFilters, openNowOnly: true }) === false, 'openNowOnly is not default');
  assert(isFilterDefault({ ...defaultFilters, priceRanges: ['₫'] }) === false, 'priceRanges is not default');
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('filters.test')) {
  try {
    runFilterTests();
    console.log('All filter unit tests passed successfully!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
