import { NextRequest, NextResponse } from 'next/server';
import { createClient, createPublicClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json({ error: 'placeId required' }, { status: 400 });
    }

    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from('reviews')
      .select(
        'id, shop_place_id, user_id, rating, comment, images, created_at, profiles(full_name, avatar_url, username)'
      )
      .eq('shop_place_id', placeId)
      .order('created_at', { ascending: false });

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

    const formattedReviews = (data || []).map((item: any) => ({
      ...item,
      images: Array.isArray(item.images) ? item.images : [],
      author: item.profiles?.full_name || item.profiles?.username || 'Tín đồ cà phê',
      avatar: item.profiles?.avatar_url || null,
    }));

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
        'id, shop_place_id, user_id, rating, comment, images, created_at, profiles(full_name, avatar_url, username)'
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
    };

    return NextResponse.json({ review: returnReview, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
