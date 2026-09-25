import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { fetchCommunityCoverPhotos, mapDbShopToCoffeeShop } from '@/lib/supabase/shops';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let placeId = searchParams.get('placeId') || searchParams.get('id');
  const slug = searchParams.get('slug');

  if (!placeId && !slug) {
    return NextResponse.json({ error: 'placeId or slug is required' }, { status: 400 });
  }

  try {
    const supabase = await createPublicClient();

    // When slug is provided, resolve it to a place_id first via a single SELECT
    if (slug) {
      const { data: slugRow, error: slugError } = await supabase
        .from('shops')
        .select('place_id')
        .eq('slug', slug)
        .neq('hidden', true)
        .maybeSingle();

      if (slugError) {
        console.error('Supabase query error resolving slug in /api/shops/details:', slugError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      if (!slugRow?.place_id) {
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
      }

      placeId = slugRow.place_id;
    }

    if (!placeId) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    let { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('place_id', placeId)
      .neq('hidden', true)
      .maybeSingle();

    // Fallback: If placeId was provided directly without slug but didn't match place_id,
    // check if it was a slug for backward compatibility
    if (!data && !slug && placeId) {
      const { data: fallbackRow, error: fallbackError } = await supabase
        .from('shops')
        .select('*')
        .eq('slug', placeId)
        .neq('hidden', true)
        .maybeSingle();

      if (!fallbackError && fallbackRow) {
        data = fallbackRow;
      }
    }

    if (error) {
      console.error('Supabase query error in /api/shops/details:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data || data.hidden) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

    let communityCover = null;
    if (!Array.isArray(data.photos) || data.photos.length === 0) {
      const covers = await fetchCommunityCoverPhotos(supabase, [data.place_id]);
      communityCover = covers[data.place_id] ?? null;
    }

    const shop = mapDbShopToCoffeeShop(data, userLat, userLng, communityCover);

    console.log('[API /api/shops/details] Raw Supabase row social fields:', {
      place_id: data.place_id,
      facebook_url: data.facebook_url,
      instagram_url: data.instagram_url,
      tiktok_url: data.tiktok_url,
      youtube_url: data.youtube_url,
      zalo_url: data.zalo_url,
    });
    console.log('[API /api/shops/details] Mapped CoffeeShop social fields:', {
      place_id: shop.place_id,
      facebook_url: shop.facebook_url,
      instagram_url: shop.instagram_url,
      tiktok_url: shop.tiktok_url,
      youtube_url: shop.youtube_url,
      zalo_url: shop.zalo_url,
    });

    return NextResponse.json({ shop });
  } catch (error) {
    console.error('API Error in /api/shops/details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop details' },
      { status: 500 }
    );
  }
}
