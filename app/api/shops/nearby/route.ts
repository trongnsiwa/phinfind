import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LOCATION } from '@/lib/utils/constants';
import { mapDbShopToCoffeeShop } from '@/lib/supabase/shops';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsedLat = parseFloat(searchParams.get('lat') || '');
  const parsedLng = parseFloat(searchParams.get('lng') || '');
  const lat = !isNaN(parsedLat) ? parsedLat : DEFAULT_LOCATION.lat;
  const lng = !isNaN(parsedLng) ? parsedLng : DEFAULT_LOCATION.lng;
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 1000);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const offset = searchParams.has('offset')
    ? Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
    : (page - 1) * limit;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('shops').select('*');

    if (error) {
      console.error('[API /api/shops/nearby] Supabase query error:', error);
      return NextResponse.json({ shops: [], total: 0, page: 1, totalPages: 0 });
    }

    console.log(`[API /api/shops/nearby] Supabase returned ${data?.length ?? 0} total shop records.`);

    if (!data || data.length === 0) {
      return NextResponse.json({ shops: [], total: 0, page: 1, totalPages: 0 });
    }

    const allSortedShops = data
      .map((row) => mapDbShopToCoffeeShop(row, lat, lng))
      .sort((a, b) => a.distance - b.distance);

    const total = allSortedShops.length;
    const paginatedShops = allSortedShops.slice(offset, offset + limit);

    console.log(
      `[API /api/shops/nearby] Returning ${paginatedShops.length} shops (limit: ${limit}, page: ${page}, offset: ${offset}, total: ${total}).`
    );

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
