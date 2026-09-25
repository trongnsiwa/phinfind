import { NextRequest, NextResponse } from 'next/server';
import { createClient, createPublicClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id');

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'user_id là bắt buộc' },
        { status: 400 }
      );
    }

    const publicSupabase = await createPublicClient();

    // Check optional auth for is_following computation
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

    // Parallel count queries for followers and following
    const [followersRes, followingRes, isFollowingRes] = await Promise.all([
      publicSupabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followee_id', targetUserId),
      publicSupabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId),
      currentUserId && currentUserId !== targetUserId
        ? publicSupabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', currentUserId)
            .eq('followee_id', targetUserId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const followers = followersRes.count || 0;
    const following = followingRes.count || 0;
    const isFollowing = Boolean(isFollowingRes?.data);

    return NextResponse.json({
      followers,
      following,
      is_following: isFollowing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Không thể kiểm tra trạng thái theo dõi' },
      { status: 500 }
    );
  }
}
