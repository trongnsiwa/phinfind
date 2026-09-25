import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FeedItem } from '@/types/feed';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Yêu cầu đăng nhập để xem bảng tin' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const rawLimit = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(rawLimit || '20', 10), 1), 50);

    // 1. Fetch user's followees
    const { data: followRows, error: followError } = await supabase
      .from('follows')
      .select('followee_id')
      .eq('follower_id', user.id);

    if (followError) {
      return NextResponse.json({ items: [], next_cursor: null, total: 0 });
    }

    const followeeIds = (followRows || []).map((r: any) => r.followee_id).filter(Boolean);

    // If following nobody, return empty feed immediately
    if (followeeIds.length === 0) {
      return NextResponse.json({ items: [], next_cursor: null, total: 0 });
    }

    // 2. Fetch total event count for followees
    const [reviewsCountRes, visitsCountRes] = await Promise.all([
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .in('user_id', followeeIds),
      supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .in('user_id', followeeIds),
    ]);

    const total = (reviewsCountRes.count || 0) + (visitsCountRes.count || 0);

    // 3. Fetch reviews and visits from followees
    let reviewsQuery = supabase
      .from('reviews')
      .select('id, user_id, shop_place_id, rating, comment, images, tags, created_at, profiles!reviews_user_id_fkey(full_name, avatar_url, username)')
      .in('user_id', followeeIds);

    if (cursor) {
      reviewsQuery = reviewsQuery.lt('created_at', cursor);
    }

    let visitsQuery = supabase
      .from('visits')
      .select('id, user_id, shop_place_id, shop_name, shop_address, note, visited_at, created_at, profiles(full_name, avatar_url, username)')
      .in('user_id', followeeIds);

    if (cursor) {
      visitsQuery = visitsQuery.lt('created_at', cursor);
    }

    const [reviewsRes, visitsRes] = await Promise.all([
      reviewsQuery.order('created_at', { ascending: false }).limit(limit),
      visitsQuery.order('created_at', { ascending: false }).limit(limit),
    ]);

    const reviews = reviewsRes.data || [];
    const visits = visitsRes.data || [];

    // 4. Resolve actors and shops in batch
    const actorIds = Array.from(
      new Set([...reviews.map((r: any) => r.user_id), ...visits.map((v: any) => v.user_id)])
    );

    const placeIds = Array.from(
      new Set(
        [...reviews.map((r: any) => r.shop_place_id), ...visits.map((v: any) => v.shop_place_id)].filter(
          Boolean
        )
      )
    );

    const [profilesRes, shopsRes] = await Promise.all([
      actorIds.length > 0
        ? supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', actorIds)
        : Promise.resolve({ data: [] }),
      placeIds.length > 0
        ? supabase
            .from('shops')
            .select('place_id, name, address, photos, slug')
            .in('place_id', placeIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profilesMap = new Map<string, any>(
      (profilesRes.data || []).map((p: any) => [p.id, p])
    );
    const shopsMap = new Map<string, any>(
      (shopsRes.data || []).map((s: any) => [s.place_id, s])
    );

    // 5. Merge and format events
    const rawEvents: FeedItem[] = [];

    for (const r of reviews) {
      const embeddedProfile = (r as any).profiles;
      const actor = profilesMap.get(r.user_id) || embeddedProfile;
      const shop = shopsMap.get(r.shop_place_id);
      rawEvents.push({
        id: r.id,
        type: 'review_created',
        created_at: r.created_at,
        actor: {
          id: r.user_id,
          full_name: actor?.full_name || embeddedProfile?.full_name || null,
          username: actor?.username || embeddedProfile?.username || null,
          avatar_url: actor?.avatar_url || embeddedProfile?.avatar_url || null,
        },
        shop: {
          place_id: r.shop_place_id,
          name: shop?.name || 'Quán Cà Phê',
          address: shop?.address || null,
          slug: shop?.slug || null,
          photo: shop?.photos?.[0] || null,
        },
        review: {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          images: Array.isArray(r.images) ? r.images : [],
          tags: Array.isArray(r.tags) ? r.tags : [],
        },
      });
    }

    for (const v of visits) {
      const embeddedProfile = (v as any).profiles;
      const actor = profilesMap.get(v.user_id) || embeddedProfile;
      const shop = shopsMap.get(v.shop_place_id);
      rawEvents.push({
        id: v.id,
        type: 'shop_visited',
        created_at: v.created_at || v.visited_at,
        actor: {
          id: v.user_id,
          full_name: actor?.full_name || embeddedProfile?.full_name || null,
          username: actor?.username || embeddedProfile?.username || null,
          avatar_url: actor?.avatar_url || embeddedProfile?.avatar_url || null,
        },
        shop: {
          place_id: v.shop_place_id,
          name: shop?.name || v.shop_name || 'Quán Cà Phê',
          address: shop?.address || v.shop_address || null,
          slug: shop?.slug || null,
          photo: shop?.photos?.[0] || null,
        },
        visit: {
          id: v.id,
          note: v.note || null,
          visited_at: v.visited_at || v.created_at,
        },
      });
    }

    // Sort combined events descending by timestamp
    rawEvents.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Page slice
    const items = rawEvents.slice(0, limit);
    const nextCursor =
      rawEvents.length >= limit && items.length > 0
        ? items[items.length - 1].created_at
        : null;

    return NextResponse.json({
      items,
      next_cursor: nextCursor,
      total,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể tải bảng tin' },
      { status: 500 }
    );
  }
}
