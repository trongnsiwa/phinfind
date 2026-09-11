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
  userLng?: number,
  communityCoverPhoto?: { url: string; review_id: string } | null
): CoffeeShop {
  const distance =
    typeof userLat === 'number' && typeof userLng === 'number'
      ? calculateDistanceMeters(userLat, userLng, Number(row.lat), Number(row.lon))
      : 0;

  const hasOfficialPhotos = Array.isArray(row.photos) && row.photos.length > 0;
  let photos: string[] = [];
  let cover_source: 'official' | 'community' | undefined = undefined;
  let cover_from_review_id: string | undefined = undefined;

  if (hasOfficialPhotos) {
    photos = row.photos;
    cover_source = 'official';
  } else if (communityCoverPhoto?.url) {
    photos = [communityCoverPhoto.url];
    cover_source = 'community';
    cover_from_review_id = communityCoverPhoto.review_id;
  }

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
    opening_hours: row.opening_hours || undefined,
    price_range: row.price_range || undefined,
    photos,
    cover_source,
    cover_from_review_id,
    website: row.website || undefined,
    phone: row.phone || undefined,
    categories: Array.isArray(row.categories) ? row.categories : [],
    custom_amenities: Array.isArray(row.custom_amenities) ? row.custom_amenities : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    created_by: row.created_by || null,
    verified: typeof row.verified === 'boolean' ? row.verified : (row.created_by ? false : true),
    hidden: typeof row.hidden === 'boolean' ? row.hidden : false,
    created_at: row.created_at || undefined
  };
}

export async function fetchCommunityCoverPhotos(
  supabase: any,
  placeIds: string[]
): Promise<Record<string, { url: string; review_id: string }>> {
  if (!placeIds || placeIds.length === 0) {
    return {};
  }

  const validPlaceIds = placeIds.filter((id) => typeof id === 'string' && id.trim().length > 0);
  if (validPlaceIds.length === 0) {
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, shop_place_id, images, rating, created_at')
      .in('shop_place_id', validPlaceIds)
      .gte('rating', 3)
      .not('images', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchCommunityCoverPhotos] Error querying reviews:', error);
      return {};
    }

    if (!data || data.length === 0) {
      return {};
    }

    const result: Record<string, { url: string; review_id: string }> = {};

    for (const row of data) {
      const placeId = row.shop_place_id;
      if (!placeId || result[placeId]) {
        continue;
      }
      if (Array.isArray(row.images) && row.images.length > 0) {
        const firstValidUrl = row.images.find(
          (img: any) =>
            typeof img === 'string' &&
            img.trim().length > 0 &&
            (img.startsWith('http://') || img.startsWith('https://'))
        );
        if (firstValidUrl) {
          result[placeId] = {
            url: firstValidUrl.trim(),
            review_id: row.id
          };
        }
      }
    }

    return result;
  } catch (err) {
    console.error('[fetchCommunityCoverPhotos] Unexpected error:', err);
    return {};
  }
}

