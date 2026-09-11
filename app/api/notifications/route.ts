import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    // Fetch unread count for current user
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null);

    if (countError && countError.code === 'PGRST205') {
      return NextResponse.json({ notifications: [], unread_count: 0 });
    }

    // Fetch notifications list with actor profile joined
    const { data: rawNotifications, error: listError } = await supabase
      .from('notifications')
      .select(
        'id, user_id, type, actor_id, shop_place_id, review_id, payload, read_at, created_at, actor:profiles!notifications_actor_id_fkey(full_name, avatar_url, username)'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (listError) {
      if (listError.code === 'PGRST205') {
        return NextResponse.json({ notifications: [], unread_count: 0 });
      }
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const formattedNotifications = (rawNotifications || []).map((item: any) => {
      const actor = Array.isArray(item.actor) ? item.actor[0] : item.actor;
      return {
        id: item.id,
        user_id: item.user_id,
        type: item.type,
        actor_id: item.actor_id,
        shop_place_id: item.shop_place_id,
        review_id: item.review_id,
        payload: item.payload || {},
        read_at: item.read_at,
        created_at: item.created_at,
        is_read: item.read_at !== null,
        actor_name: actor?.full_name || actor?.username || item.payload?.actor_name || null,
        actor_avatar: actor?.avatar_url || null,
      };
    });

    return NextResponse.json({
      notifications: formattedNotifications,
      unread_count: unreadCount ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Lỗi hệ thống khi tải thông báo' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body.markAllRead) {
      return NextResponse.json(
        { error: "Tham số không hợp lệ. Cần 'markAllRead: true'" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ unread_count: 0 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Lỗi khi cập nhật trạng thái đã đọc' },
      { status: 500 }
    );
  }
}
