import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { fetchCommunityCoverPhotos, mapDbShopToCoffeeShop } from '@/lib/supabase/shops';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

  if (!q.trim()) {
    return NextResponse.json({ shops: [] });
  }

  try {
    const supabase = await createPublicClient();
    const cleanQ = q.trim().replace(/[%_]/g, '');
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .or(`name.ilike.%${cleanQ}%,address.ilike.%${cleanQ}%`)
      .neq('hidden', true);

    if (error) {
      console.error('Supabase search error in /api/shops/search:', error);
      return NextResponse.json({ shops: [] });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ shops: [] });
    }

    const missingPhotoPlaceIds = data
      .filter((row) => !row.hidden && (!Array.isArray(row.photos) || row.photos.length === 0))
      .map((row) => row.place_id || row.id)
      .filter(Boolean);

    const communityCovers = await fetchCommunityCoverPhotos(supabase, missingPhotoPlaceIds);

    const shops = data
      .filter((row) => !row.hidden)
      .map((row) =>
        mapDbShopToCoffeeShop(row, lat, lng, communityCovers[row.place_id || row.id])
      );

    if (typeof lat === 'number' && typeof lng === 'number') {
      shops.sort((a, b) => a.distance - b.distance);
    } else {
      shops.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({ shops });
  } catch (error) {
    console.error('API Error in /api/shops/search:', error);
    return NextResponse.json(
      { error: 'Failed to search coffee shops' },
      { status: 500 }
    );
  }
}
