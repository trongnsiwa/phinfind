import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await context.params;

    if (!reviewId) {
      return NextResponse.json({ error: 'Thiếu mã đánh giá.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Yêu cầu đăng nhập để đánh dấu hữu ích.' },
        { status: 401 }
      );
    }

    // Verify review existence and check against self-liking
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', reviewId)
      .maybeSingle();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài đánh giá.' },
        { status: 404 }
      );
    }

    if (review.user_id === user.id) {
      return NextResponse.json(
        { error: 'Bạn không thể tự đánh dấu hữu ích cho đánh giá của mình.' },
        { status: 400 }
      );
    }

    // Insert like row with idempotent conflict handling
    const { error: insertError } = await supabase
      .from('review_likes')
      .upsert(
        { review_id: reviewId, user_id: user.id },
        { onConflict: 'review_id,user_id', ignoreDuplicates: true }
      );

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || 'Không thể đánh dấu hữu ích.' },
        { status: 500 }
      );
    }

    // Recompute current like count from table
    const { count: likeCount } = await supabase
      .from('review_likes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);

    return NextResponse.json({
      liked: true,
      like_count: likeCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Đã xảy ra lỗi khi đánh dấu hữu ích.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await context.params;

    if (!reviewId) {
      return NextResponse.json({ error: 'Thiếu mã đánh giá.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Yêu cầu đăng nhập để bỏ đánh dấu hữu ích.' },
        { status: 401 }
      );
    }

    // Delete like row
    const { error: deleteError } = await supabase
      .from('review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message || 'Không thể bỏ đánh dấu hữu ích.' },
        { status: 500 }
      );
    }

    // Recompute current like count from table
    const { count: likeCount } = await supabase
      .from('review_likes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);

    return NextResponse.json({
      liked: false,
      like_count: likeCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Đã xảy ra lỗi khi bỏ đánh dấu hữu ích.' },
      { status: 500 }
    );
  }
}
