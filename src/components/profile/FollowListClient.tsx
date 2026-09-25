'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User as UserIcon, Users, UserCheck, UserPlus, UserX, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { usePublicProfile } from '@/hooks/useShops';
import {
  FollowProfileItem,
  useFollowers,
  useFollowing,
  useFollowStatus,
  useToggleFollow,
} from '@/hooks/useFollow';
import { APP_ROUTES } from '@/lib/utils/constants';

interface FollowListClientProps {
  username: string;
  type: 'followers' | 'following';
}

function FollowUserItemRow({
  item,
  currentUserId,
}: {
  item: FollowProfileItem;
  currentUserId?: string;
}) {
  const { data: status } = useFollowStatus(item.id);
  const toggleFollow = useToggleFollow();

  const isSelf = currentUserId === item.id;
  const isFollowing = status?.is_following ?? item.is_following ?? false;
  const displayName = item.full_name || item.username || 'Tín đồ cà phê';

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFollow.mutate({
      targetUserId: item.id,
      isCurrentlyFollowing: isFollowing,
      targetUsername: item.username || undefined,
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/30 transition-colors">
      <Link
        href={item.username ? `/u/${item.username}` : '#'}
        className="flex items-center gap-3 min-w-0 flex-1 group"
      >
        <Avatar className="w-12 h-12 border border-border shrink-0">
          <AvatarImage src={item.avatar_url || ''} alt={displayName} />
          <AvatarFallback className="bg-secondary text-primary font-bold">
            {displayName[0]?.toUpperCase() || <UserIcon size={18} />}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="font-sans font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
            {displayName}
          </div>
          {item.username && (
            <p className="text-xs text-muted-foreground truncate">
              @{item.username}
            </p>
          )}
          {item.bio && (
            <p className="text-xs text-foreground/80 line-clamp-1 pt-0.5">
              {item.bio}
            </p>
          )}
        </div>
      </Link>

      {!isSelf && item.id && (
        <div className="shrink-0">
          {isFollowing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              disabled={toggleFollow.isPending}
              className="min-h-[44px] px-3 sm:px-4 rounded-xl font-medium border-border/80 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive group transition-all text-xs sm:text-sm"
            >
              <UserCheck size={15} className="group-hover:hidden shrink-0 text-primary" />
              <UserX size={15} className="hidden group-hover:inline shrink-0 text-destructive" />
              <span className="group-hover:hidden">Đang theo dõi</span>
              <span className="hidden group-hover:inline text-destructive">Bỏ theo dõi</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleToggle}
              disabled={toggleFollow.isPending}
              className="min-h-[44px] px-3 sm:px-4 rounded-xl font-medium shadow-xs text-xs sm:text-sm"
            >
              <UserPlus size={15} className="shrink-0" />
              <span>Theo dõi</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function FollowListClient({ username, type }: FollowListClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = usePublicProfile(username);
  const targetUserId = profileData?.profile?.id;

  const followersQuery = useFollowers(type === 'followers' ? targetUserId : undefined);
  const followingQuery = useFollowing(type === 'following' ? targetUserId : undefined);

  const activeQuery = type === 'followers' ? followersQuery : followingQuery;
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading: isListLoading } = activeQuery;

  // Infinite scroll observer
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isProfileLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-6 px-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-xl" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-18 bg-muted/60 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isProfileError || !profileData?.profile) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <EmptyState
          icon={UserIcon}
          title="Không tìm thấy người dùng"
          description="Người dùng này không tồn tại hoặc chưa thiết lập hồ sơ công khai."
          actionLabel="Quay lại"
          onAction={() => router.back()}
          className="py-12"
        />
      </div>
    );
  }

  const profile = profileData.profile;
  const allProfiles = data?.pages.flatMap((page) => page.profiles) || [];
  const title = type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi';

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16 px-4 pt-4 sm:pt-6">
      {/* Top Header Bar */}
      <div className="flex items-center gap-3">
        <Link
          href={`/u/${profile.username}`}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-accent transition-colors text-foreground"
          aria-label="Quay lại trang cá nhân"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-sans font-bold text-lg sm:text-xl text-foreground truncate">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            @{profile.username}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Card className="flex border border-border/80 p-1 rounded-xl bg-muted/40">
        <Link
          href={`/u/${profile.username}/followers`}
          className={`flex-1 min-h-[40px] flex items-center justify-center text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
            type === 'followers'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Người theo dõi
        </Link>
        <Link
          href={`/u/${profile.username}/following`}
          className={`flex-1 min-h-[40px] flex items-center justify-center text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
            type === 'following'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Đang theo dõi
        </Link>
      </Card>

      {/* List / Empty State */}
      {isListLoading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-18 bg-muted/60 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : allProfiles.length === 0 ? (
        <EmptyState
          icon={Users}
          title={type === 'followers' ? 'Chưa có người theo dõi' : 'Chưa theo dõi ai'}
          description={
            type === 'followers'
              ? `${profile.full_name || profile.username} chưa có người theo dõi nào.`
              : `${profile.full_name || profile.username} chưa theo dõi ai.`
          }
          className="py-12"
        />
      ) : (
        <div className="space-y-2.5">
          {allProfiles.map((item) => (
            <FollowUserItemRow
              key={item.id}
              item={item}
              currentUserId={user?.id}
            />
          ))}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="py-4 flex items-center justify-center min-h-[48px]">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span>Đang tải thêm...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
