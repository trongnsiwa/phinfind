import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim();

    if (!username) {
      return NextResponse.json(
        { error: 'Tên người dùng là bắt buộc' },
        { status: 400 }
      );
    }

    const supabase = await createPublicClient();

    // Query profile by username (case-insensitive for URL flexibility).
    // NOTE: Users who have username = null are unreachable by this route because
    // a non-null, unique username is required for public profile resolution.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, created_at')
      .ilike('username', username)
      .maybeSingle();

    if (profileError || !profile || !profile.username) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Exclude private fields: email, role, etc. are omitted from public display.
    const publicProfile = {
      id: profile.id,
      username: profile.username,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      created_at: profile.created_at,
    };

    // Fetch user reviews joined with shops, matching /api/reviews?userId=X
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, shop_place_id, user_id, rating, comment, images, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      return NextResponse.json({
        profile: publicProfile,
        reviews: [],
      });
    }

    let shopsMap: Record<string, { name: string; address?: string; photo?: string }> = {};
    if (reviewsData && reviewsData.length > 0) {
      const placeIds = Array.from(
        new Set(reviewsData.map((r: any) => r.shop_place_id).filter(Boolean))
      );

      if (placeIds.length > 0) {
        const { data: shopsData } = await supabase
          .from('shops')
          .select('place_id, name, address, photos')
          .in('place_id', placeIds);

        if (shopsData) {
          shopsData.forEach((s: any) => {
            shopsMap[s.place_id] = {
              name: s.name,
              address: s.address,
              photo: s.photos?.[0],
            };
          });
        }
      }
    }

    const formattedReviews = (reviewsData || []).map((item: any) => {
      const shopInfo = shopsMap[item.shop_place_id];
      return {
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        author: publicProfile.full_name || publicProfile.username || 'Tín đồ cà phê',
        avatar: publicProfile.avatar_url || null,
        username: publicProfile.username,
        shop_name: shopInfo?.name || 'Quán Cà Phê',
        shop_address: shopInfo?.address || null,
        shop_photo: shopInfo?.photo || null,
        profiles: {
          full_name: publicProfile.full_name,
          avatar_url: publicProfile.avatar_url,
          username: publicProfile.username,
        },
      };
    });

    return NextResponse.json({
      profile: publicProfile,
      reviews: formattedReviews,
    });
  } catch {
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tải hồ sơ người dùng' },
      { status: 500 }
    );
  }
}
