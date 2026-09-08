import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', user.id)
    .order('visited_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const visits = data || [];
  const placeIds = Array.from(new Set(visits.map((v) => v.shop_place_id).filter(Boolean)));

  const shopsMap = new Map<string, any>();
  if (placeIds.length > 0) {
    const { data: shopsData } = await supabase
      .from('shops')
      .select('place_id, name, address, photos, rating, total_ratings, categories, lat, lon')
      .in('place_id', placeIds);

    if (shopsData) {
      for (const s of shopsData) {
        shopsMap.set(s.place_id, s);
      }
    }
  }

  const enrichedVisits = visits.map((v) => {
    const matchedShop = shopsMap.get(v.shop_place_id);
    return {
      ...v,
      shop_name: matchedShop?.name || v.shop_name || 'Quán Cà Phê',
      shop_address: matchedShop?.address || v.shop_address || null,
      shop: matchedShop || null,
    };
  });

  return NextResponse.json({ visits: enrichedVisits });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { shop_place_id, name, address, note, visited_at } = body;

  if (!shop_place_id) {
    return NextResponse.json({ error: 'shop_place_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('visits')
    .upsert(
      [
        {
          user_id: user.id,
          shop_place_id,
          shop_name: name || null,
          shop_address: address || null,
          note: note || null,
          visited_at: visited_at || new Date().toISOString(),
        },
      ],
      { onConflict: 'user_id,shop_place_id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ visit: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'placeId required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('visits')
    .delete()
    .eq('user_id', user.id)
    .eq('shop_place_id', placeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
