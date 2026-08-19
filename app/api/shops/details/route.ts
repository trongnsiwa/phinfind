import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { mapDbShopToCoffeeShop } from '@/lib/supabase/shops';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId') || searchParams.get('id');

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
  }

  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('place_id', placeId)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error in /api/shops/details:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const shop = mapDbShopToCoffeeShop(data);
    return NextResponse.json({ shop });
  } catch (error) {
    console.error('API Error in /api/shops/details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop details' },
      { status: 500 }
    );
  }
}
