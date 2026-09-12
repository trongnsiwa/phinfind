import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';
import { fetchNearbyShopsRpc } from '@/lib/supabase/shops';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsedLat = parseFloat(searchParams.get('lat') || '');
  const parsedLng = parseFloat(searchParams.get('lng') || '');
  const lat = !isNaN(parsedLat) ? parsedLat : DEFAULT_LOCATION.lat;
  const lng = !isNaN(parsedLng) ? parsedLng : DEFAULT_LOCATION.lng;

  const rawRadius = searchParams.get('radius');
  const parsedRadius = rawRadius !== null && rawRadius.trim() !== '' ? parseFloat(rawRadius) : NaN;
  const radiusKm = !isNaN(parsedRadius) ? Math.min(Math.max(parsedRadius, 1), 100) : null;

  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 1000);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const offset = searchParams.has('offset')
    ? Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
    : (page - 1) * limit;

  try {
    const supabase = await createPublicClient();
    const { shops, total } = await fetchNearbyShopsRpc(supabase as any, {
      lat,
      lng,
      radiusKm,
      limit,
      offset,
    });

    return NextResponse.json({
      shops,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[API /api/shops/nearby] Error fetching nearby shops:', error);
    return NextResponse.json({ shops: [], total: 0, page, totalPages: 0 });
  }
}
