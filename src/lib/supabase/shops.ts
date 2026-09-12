import { CoffeeShop } from '@/types/shop';
import type { SupabaseClient } from '@supabase/supabase-js';

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

  const officialPhotos = Array.isArray(row.photos) ? row.photos : [];
  let photos = officialPhotos;
  let coverSource: 'official' | 'community' | undefined = officialPhotos.length > 0 ? 'official' : undefined;
  let coverFromReviewId: string | undefined;

  if (officialPhotos.length === 0 && communityCoverPhoto) {
    photos = [communityCoverPhoto.url];
    coverSource = 'community';
    coverFromReviewId = communityCoverPhoto.review_id;
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
    cover_source: coverSource,
    cover_from_review_id: coverFromReviewId,
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
    const CHUNK_SIZE = 30;
    const chunks: string[][] = [];
    for (let i = 0; i < validPlaceIds.length; i += CHUNK_SIZE) {
      chunks.push(validPlaceIds.slice(i, i + CHUNK_SIZE));
    }

    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        const { data, error } = await supabase
          .from('reviews')
          .select('id, shop_place_id, images, rating, created_at')
          .in('shop_place_id', chunk)
          .gte('rating', 3)
          .not('images', 'is', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[fetchCommunityCoverPhotos] Error querying reviews:', error);
          return [];
        }
        return data || [];
      })
    );

    const allRows = chunkResults.flat();
    if (allRows.length === 0) {
      return {};
    }

    const result: Record<string, { url: string; review_id: string }> = {};

    for (const row of allRows) {
      const placeId = row.shop_place_id;
      if (!placeId || result[placeId]) {
        continue;
      }
      if (
        Array.isArray(row.images) &&
        row.images.length > 0 &&
        typeof row.images[0] === 'string' &&
        row.images[0].startsWith('http')
      ) {
        result[placeId] = {
          url: row.images[0].trim(),
          review_id: row.id
        };
      }
    }

    return result;
  } catch (err) {
    console.error('[fetchCommunityCoverPhotos] Unexpected error:', err);
    return {};
  }
}

export interface FetchNearbyShopsParams {
  lat: number;
  lng: number;
  radiusKm: number | null;
  limit: number;
  offset: number;
}

export async function fetchNearbyShopsRpc(
  supabase: SupabaseClient<any>,
  params: FetchNearbyShopsParams
): Promise<{ shops: CoffeeShop[]; total: number }> {
  const { lat, lng, radiusKm, limit, offset } = params;

  const [shopsRes, countRes] = await Promise.all([
    supabase.rpc('nearby_shops', {
      user_lat: lat,
      user_lon: lng,
      radius_km: radiusKm,
      page_limit: limit,
      page_offset: offset,
    }),
    supabase.rpc('nearby_shops_count', {
      user_lat: lat,
      user_lon: lng,
      radius_km: radiusKm,
    }),
  ]);

  if (shopsRes.error) {
    console.error('[fetchNearbyShopsRpc] Error calling nearby_shops RPC:', shopsRes.error);
    return { shops: [], total: 0 };
  }

  const rows: any[] = shopsRes.data || [];
  const total = typeof countRes.data === 'number' ? countRes.data : Number(countRes.data || 0);

  if (rows.length === 0) {
    return { shops: [], total };
  }

  const needsCover = rows
    .filter((r) => !Array.isArray(r.photos) || r.photos.length === 0)
    .map((r) => r.place_id);
  const communityCovers = await fetchCommunityCoverPhotos(supabase, needsCover);

  const shops = rows.map((row) => {
    const shop = mapDbShopToCoffeeShop(row, lat, lng, communityCovers[row.place_id] ?? null);
    if (typeof row.distance_meters === 'number') {
      const sqlDist = Math.round(row.distance_meters);
      if (Math.abs(shop.distance - sqlDist) > 1) {
        shop.distance = sqlDist;
        shop.distance_text = formatDistanceText(sqlDist);
      }
    }
    return shop;
  });

  return { shops, total };
}

