import { NextRequest, NextResponse } from 'next/server';
import { createClient, createPublicClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id');
    const rawLimit = searchParams.get('limit');
    const rawOffset = searchParams.get('offset');

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'user_id là bắt buộc' },
        { status: 400 }
      );
    }

    const limit = Math.min(Math.max(parseInt(rawLimit || '20', 10), 1), 50);
    const offset = Math.max(parseInt(rawOffset || '0', 10), 0);

    const publicSupabase = await createPublicClient();

    // Query total following count
    const { count: totalCount } = await publicSupabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetUserId);

    // Fetch following list
    const { data: followRows, error } = await publicSupabase
      .from('follows')
      .select('followee_id, created_at, profiles!follows_followee_id_fkey(id, username, full_name, avatar_url, bio)')
      .eq('follower_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ profiles: [], total: 0 });
    }

    // Optional auth check for mutual / is_following status
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
      // Unauthenticated
    }

    const followeeIds = (followRows || []).map((r: any) => r.followee_id).filter(Boolean);
    const myFollowedSet = new Set<string>();

    if (currentUserId && followeeIds.length > 0) {
      try {
        const { data: myFollows } = await publicSupabase
          .from('follows')
          .select('followee_id')
          .eq('follower_id', currentUserId)
          .in('followee_id', followeeIds);

        if (myFollows) {
          myFollows.forEach((f: any) => myFollowedSet.add(f.followee_id));
        }
      } catch {
        // Ignore
      }
    }

    const profiles = (followRows || []).map((row: any) => {
      const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: prof?.id || row.followee_id,
        username: prof?.username || null,
        full_name: prof?.full_name || null,
        avatar_url: prof?.avatar_url || null,
        bio: prof?.bio || null,
        followed_at: row.created_at,
        is_following: currentUserId ? myFollowedSet.has(prof?.id || row.followee_id) : false,
      };
    });

    return NextResponse.json({
      profiles,
      total: totalCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể tải danh sách người đang theo dõi' },
      { status: 500 }
    );
  }
}
