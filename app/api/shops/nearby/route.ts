import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';
import { calculateDistanceMeters, fetchCommunityCoverPhotos, mapDbShopToCoffeeShop } from '@/lib/supabase/shops';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsedLat = parseFloat(searchParams.get('lat') || '');
  const parsedLng = parseFloat(searchParams.get('lng') || '');
  const lat = !isNaN(parsedLat) ? parsedLat : DEFAULT_LOCATION.lat;
  const lng = !isNaN(parsedLng) ? parsedLng : DEFAULT_LOCATION.lng;
  const rawRadius = searchParams.get('radius');
  const parsedRadius = rawRadius !== null && rawRadius.trim() !== '' ? parseFloat(rawRadius) : NaN;
  const radiusKm = !isNaN(parsedRadius) ? Math.min(Math.max(parsedRadius, 1), 100) : null;
  const radiusMeters = radiusKm !== null ? radiusKm * 1000 : null;
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 1000);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const offset = searchParams.has('offset')
    ? Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
    : (page - 1) * limit;

  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .neq('hidden', true);

    if (error) {
      console.error('[API /api/shops/nearby] Supabase query error:', error);
      return NextResponse.json({ shops: [], total: 0, page: 1, totalPages: 0 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ shops: [], total: 0, page: 1, totalPages: 0 });
    }

    const missingPhotoPlaceIds = data
      .filter((row) => !row.hidden && (!Array.isArray(row.photos) || row.photos.length === 0))
      .map((row) => row.place_id || row.id)
      .filter(Boolean);

    const communityCovers = await fetchCommunityCoverPhotos(supabase, missingPhotoPlaceIds);

    let allSortedShops = data
      .filter((row) => !row.hidden)
      .map((row) =>
        mapDbShopToCoffeeShop(row, lat, lng, communityCovers[row.place_id || row.id])
      );

    if (radiusMeters !== null) {
      allSortedShops = allSortedShops.filter((shop) => shop.distance <= radiusMeters);
    }

    allSortedShops.sort((a, b) => a.distance - b.distance);

    const total = allSortedShops.length;
    const paginatedShops = allSortedShops.slice(offset, offset + limit);

    return NextResponse.json({
      shops: paginatedShops,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('API Error in /api/shops/nearby:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby coffee shops' },
      { status: 500 }
    );
  }
}
