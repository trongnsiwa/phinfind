import { CoffeeShop } from '@/types/shop';

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatDistanceText(distanceInMeters: number): string {
  if (distanceInMeters < 1000) {
    return `${distanceInMeters} m`;
  }
  return `${(distanceInMeters / 1000).toFixed(1)} km`;
}

export function mapDbShopToCoffeeShop(
  row: any,
  userLat?: number,
  userLng?: number
): CoffeeShop {
  const distance =
    typeof userLat === 'number' && typeof userLng === 'number'
      ? calculateDistanceMeters(userLat, userLng, Number(row.lat), Number(row.lon))
      : 0;

  return {
    id: row.place_id || row.id,
    place_id: row.place_id || row.id,
    name: row.name || 'Coffee Shop',
    address: row.address || '',
    lat: Number(row.lat),
    lon: Number(row.lon),
    distance,
    distance_text: formatDistanceText(distance),
    rating: typeof row.rating === 'number' ? row.rating : parseFloat(row.rating || '0'),
    total_ratings: Number(row.total_ratings) || 0,
    opening_hours: row.opening_hours || { open_now: true },
    price_range: row.price_range || undefined,
    photos: Array.isArray(row.photos) ? row.photos : [],
    website: row.website || undefined,
    phone: row.phone || undefined,
    categories: Array.isArray(row.categories) ? row.categories : ['catering.cafe'],
    created_by: row.created_by || null,
    verified: typeof row.verified === 'boolean' ? row.verified : (row.created_by ? false : true),
  };
}

