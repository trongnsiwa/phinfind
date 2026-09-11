import { CoffeeShop, ShopFilterState } from '@/types/shop';

/**
 * Filter and sort an array of coffee shops based on the current filter criteria.
 * Pure function: never mutates input array.
 */
export function applyShopFilters(
  shops: CoffeeShop[],
  filters: ShopFilterState
): CoffeeShop[] {
  if (!shops || shops.length === 0) return [];

  let result = [...shops];

  // 1. Open Now filter
  if (filters.openNowOnly) {
    result = result.filter((shop) => shop.opening_hours?.open_now === true);
  }

  // 2. Minimum Rating filter
  if (filters.minRating && filters.minRating > 0) {
    result = result.filter((shop) => (shop.rating || 0) >= filters.minRating);
  }

  // 3. Price Range filter
  if (filters.priceRanges && filters.priceRanges.length > 0) {
    result = result.filter(
      (shop) =>
        Boolean(shop.price_range) &&
        filters.priceRanges.includes(shop.price_range!)
    );
  }

  // 4. Required Amenities filter
  if (filters.requiredAmenityIds && filters.requiredAmenityIds.length > 0) {
    result = result.filter((shop) =>
      filters.requiredAmenityIds.every(
        (amenityId) =>
          shop.amenities?.some((a) => a.id === amenityId) ||
          shop.categories?.includes(amenityId)
      )
    );
  }

  // 5. Radius filter (only when radiusKm !== null)
  if (typeof filters.radiusKm === 'number' && filters.radiusKm !== null) {
    const maxDistanceMeters = filters.radiusKm * 1000;
    result = result.filter((shop) => (shop.distance ?? Infinity) <= maxDistanceMeters);
  }

  // 6. Sorting
  if (filters.sortBy === 'rating') {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (filters.sortBy === 'name') {
    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else {
    // Default: distance ascending
    result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return result;
}

/**
 * Counts the number of active non-default filter criteria.
 */
export function countActiveFilters(
  filters: ShopFilterState,
  searchQuery: string = ''
): number {
  let count = 0;

  if (filters.openNowOnly) count++;
  if (filters.minRating && filters.minRating > 0) count++;
  if (filters.priceRanges && filters.priceRanges.length > 0) count++;
  if (filters.requiredAmenityIds && filters.requiredAmenityIds.length > 0) count++;
  if (filters.radiusKm !== null && typeof filters.radiusKm === 'number') count++;
  if (filters.sortBy && filters.sortBy !== 'distance') count++;
  if (searchQuery && searchQuery.trim().length > 0) count++;

  return count;
}

/**
 * Checks if all filter parameters match their default state.
 */
export function isFilterDefault(filters: ShopFilterState): boolean {
  if (filters.openNowOnly) return false;
  if (filters.minRating && filters.minRating > 0) return false;
  if (filters.priceRanges && filters.priceRanges.length > 0) return false;
  if (filters.requiredAmenityIds && filters.requiredAmenityIds.length > 0) return false;
  if (filters.radiusKm !== null) return false;
  if (filters.sortBy && filters.sortBy !== 'distance') return false;

  return true;
}
