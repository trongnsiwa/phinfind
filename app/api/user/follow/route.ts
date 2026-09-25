import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Yêu cầu đăng nhập' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { followee_id } = body;

    if (!followee_id || typeof followee_id !== 'string') {
      return NextResponse.json(
        { error: 'followee_id là bắt buộc' },
        { status: 400 }
      );
    }

    if (followee_id === user.id) {
      return NextResponse.json(
        { error: 'Bạn không thể tự theo dõi chính mình' },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from('follows')
      .upsert(
        [
          {
            follower_id: user.id,
            followee_id,
          },
        ],
        { onConflict: 'follower_id,followee_id', ignoreDuplicates: true }
      );

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ following: true, success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể thực hiện theo dõi' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Yêu cầu đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const followeeId = searchParams.get('followee_id');

    if (!followeeId) {
      return NextResponse.json(
        { error: 'followee_id là bắt buộc' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followee_id', followeeId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ following: false, success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể hủy theo dõi' },
      { status: 500 }
    );
  }
}
