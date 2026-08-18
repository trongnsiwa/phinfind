import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapDbShopToCoffeeShop } from '@/lib/supabase/shops';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

  if (!q.trim()) {
    return NextResponse.json({ shops: [] });
  }

  try {
    const supabase = await createClient();
    const cleanQ = q.trim().replace(/[%_]/g, '');
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .or(`name.ilike.%${cleanQ}%,address.ilike.%${cleanQ}%`);

    if (error) {
      console.error('Supabase search error in /api/shops/search:', error);
      return NextResponse.json({ shops: [] });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ shops: [] });
    }

    const shops = data.map((row) => mapDbShopToCoffeeShop(row, lat, lng));

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
