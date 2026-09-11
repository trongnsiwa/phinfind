import { NextRequest, NextResponse } from 'next/server';
import { createClient, createPublicClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');
    const userId = searchParams.get('userId');

    if (!placeId && !userId) {
      return NextResponse.json({ error: 'placeId or userId required' }, { status: 400 });
    }

    const supabase = await createPublicClient();
    let query = supabase
      .from('reviews')
      .select(
        'id, shop_place_id, user_id, rating, comment, images, created_at, updated_at, profiles!reviews_user_id_fkey(full_name, avatar_url, username)'
      );

    if (placeId) {
      query = query.eq('shop_place_id', placeId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        return NextResponse.json(
          {
            reviews: [],
            error: 'Bảng reviews chưa được khởi tạo trong Supabase.',
          },
          { status: 200 }
        );
      }
      return NextResponse.json({ reviews: [] });
    }

    // Inspect user auth for liked_by_me computation
    let currentUserId: string | null = null;
    try {
      const authClient = await createClient();
      const {
        data: { user: currentUser },
      } = await authClient.auth.getUser();
      if (currentUser) {
        currentUserId = currentUser.id;
      }
    } catch {
      // Unauthenticated or running without cookie context
    }

    // If userId was queried, also fetch shop details for each review
    let shopsMap: Record<string, { name: string; address?: string; photo?: string }> = {};
    if (userId && data && data.length > 0) {
      const placeIds = Array.from(new Set(data.map((r: any) => r.shop_place_id).filter(Boolean)));
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

    // Query like counts and user like status for the returned reviews
    const reviewIds = (data || []).map((r: any) => r.id).filter(Boolean);
    const likeCountMap: Record<string, number> = {};
    const userLikedSet = new Set<string>();

    if (reviewIds.length > 0) {
      try {
        const { data: likesData } = await supabase
          .from('review_likes')
          .select('review_id, user_id')
          .in('review_id', reviewIds);

        if (likesData) {
          likesData.forEach((like: any) => {
            likeCountMap[like.review_id] = (likeCountMap[like.review_id] || 0) + 1;
            if (currentUserId && like.user_id === currentUserId) {
              userLikedSet.add(like.review_id);
            }
          });
        }
      } catch {
        // Fallback if review_likes table is not yet populated
      }
    }

    const formattedReviews = (data || []).map((item: any) => {
      const shopInfo = shopsMap[item.shop_place_id];
      const isEdited = Boolean(
        item.created_at &&
        item.updated_at &&
        new Date(item.created_at).getTime() < new Date(item.updated_at).getTime()
      );

      return {
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        author: item.profiles?.full_name || item.profiles?.username || 'Tín đồ cà phê',
        avatar: item.profiles?.avatar_url || null,
        username: item.profiles?.username || null,
        shop_name: shopInfo?.name || 'Quán Cà Phê',
        shop_address: shopInfo?.address || null,
        shop_photo: shopInfo?.photo || null,
        like_count: likeCountMap[item.id] || 0,
        liked_by_me: currentUserId ? userLikedSet.has(item.id) : false,
        is_edited: isEdited,
      };
    });

    return NextResponse.json({ reviews: formattedReviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Yêu cầu đăng nhập. Vui lòng đăng nhập để gửi đánh giá.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shop_place_id, rating, comment, images } = body;

    if (!shop_place_id) {
      return NextResponse.json({ error: 'Thiếu mã định danh quán cà phê.' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: 'Vui lòng chọn số sao đánh giá từ 1 đến 5 sao.' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nội dung cảm nhận phải có ít nhất 3 ký tự.' },
        { status: 400 }
      );
    }

    let validatedImages: string[] = [];
    if (images) {
      if (!Array.isArray(images)) {
        return NextResponse.json(
          { error: 'Danh sách hình ảnh không đúng định dạng.' },
          { status: 400 }
        );
      }
      if (images.length > 3) {
        return NextResponse.json(
          { error: 'Chỉ được tải lên tối đa 3 hình ảnh cho mỗi đánh giá.' },
          { status: 400 }
        );
      }
      const isValidUrl = (url: any) =>
        typeof url === 'string' &&
        (url.startsWith('https://') || url.startsWith('http://'));
      if (!images.every(isValidUrl)) {
        return NextResponse.json(
          { error: 'Đường dẫn hình ảnh phải là URL hợp lệ (https://...).' },
          { status: 400 }
        );
      }
      validatedImages = images.map((u: string) => u.trim());
    }

    // Ensure profile row exists to satisfy foreign key constraint user_id -> profiles(id)
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Tín đồ cà phê',
        avatar_url: user.user_metadata?.avatar_url || null,
        email: user.email,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          shop_place_id,
          user_id: user.id,
          rating: numericRating,
          comment: comment.trim(),
          images: validatedImages,
        },
      ])
      .select(
        'id, shop_place_id, user_id, rating, comment, images, created_at, profiles!reviews_user_id_fkey(full_name, avatar_url, username)'
      )
      .single();

    if (error) {
      if (error.code === 'PGRST205') {
        return NextResponse.json(
          {
            error:
              'Bảng reviews chưa được tạo trong Supabase. Vui lòng chạy file supabase/schema_reviews.sql trong SQL Editor.',
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const profileData = (data as any)?.profiles;
    const authorName =
      profileData?.full_name ||
      profileData?.username ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Tín đồ cà phê';

    const authorAvatar = profileData?.avatar_url || user.user_metadata?.avatar_url || null;

    const returnReview = {
      ...data,
      images: Array.isArray((data as any)?.images) ? (data as any).images : validatedImages,
      author: authorName,
      avatar: authorAvatar,
      username: profileData?.username || null,
    };

    return NextResponse.json({ review: returnReview, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Yêu cầu đăng nhập để xóa đánh giá.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu mã đánh giá (id).' }, { status: 400 });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể xóa đánh giá. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Yêu cầu đăng nhập. Vui lòng đăng nhập để chỉnh sửa đánh giá.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, rating, comment, images } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu mã đánh giá.' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: 'Vui lòng chọn số sao đánh giá từ 1 đến 5 sao.' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nội dung cảm nhận phải có ít nhất 3 ký tự.' },
        { status: 400 }
      );
    }

    let validatedImages: string[] = [];
    if (images) {
      if (!Array.isArray(images)) {
        return NextResponse.json(
          { error: 'Danh sách hình ảnh không đúng định dạng.' },
          { status: 400 }
        );
      }
      if (images.length > 3) {
        return NextResponse.json(
          { error: 'Chỉ được tải lên tối đa 3 hình ảnh cho mỗi đánh giá.' },
          { status: 400 }
        );
      }
      const isValidUrl = (url: any) =>
        typeof url === 'string' &&
        (url.startsWith('https://') || url.startsWith('http://'));
      if (!images.every(isValidUrl)) {
        return NextResponse.json(
          { error: 'Đường dẫn hình ảnh phải là URL hợp lệ (https://...).' },
          { status: 400 }
        );
      }
      validatedImages = images.map((u: string) => u.trim());
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating: numericRating,
        comment: comment.trim(),
        images: validatedImages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(
        'id, shop_place_id, user_id, rating, comment, images, created_at, updated_at, profiles!reviews_user_id_fkey(full_name, avatar_url, username)'
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài đánh giá hoặc bạn không có quyền chỉnh sửa.' },
        { status: 403 }
      );
    }

    // Query like count and user like status
    let likeCount = 0;
    let isLikedByMe = false;

    try {
      const { count } = await supabase
        .from('review_likes')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', id);
      likeCount = count || 0;

      const { data: userLike } = await supabase
        .from('review_likes')
        .select('review_id')
        .eq('review_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      isLikedByMe = Boolean(userLike);
    } catch {
      // Fallback if review_likes table is not yet initialized
    }

    const profileData = (data as any)?.profiles;
    const authorName =
      profileData?.full_name ||
      profileData?.username ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Tín đồ cà phê';

    const returnReview = {
      ...data,
      images: Array.isArray((data as any)?.images) ? (data as any).images : validatedImages,
      author: authorName,
      avatar: profileData?.avatar_url || user.user_metadata?.avatar_url || null,
      username: profileData?.username || null,
      like_count: likeCount,
      liked_by_me: isLikedByMe,
      is_edited: true,
    };

    return NextResponse.json({ review: returnReview, success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể cập nhật đánh giá. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

