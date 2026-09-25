'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Calendar, Star, Users, UserCheck, UserPlus, UserX } from 'lucide-react';
import { PublicProfileData } from '@/hooks/useShops';
import { useAuth } from '@/hooks/useAuth';
import { useFollowStatus, useToggleFollow } from '@/hooks/useFollow';
import { ProfileSocialLinks } from './ProfileSocialLinks';

interface PublicProfileHeaderProps {
  profile: PublicProfileData;
  reviewCount: number;
}

export function PublicProfileHeader({ profile, reviewCount }: PublicProfileHeaderProps) {
  const { user } = useAuth();
  const { data: followStatus } = useFollowStatus(profile.id);
  const toggleFollow = useToggleFollow();

  const isOwnProfile = Boolean(user?.id && user.id === profile.id);
  const isFollowing = followStatus?.is_following ?? profile.social_stats?.is_following ?? false;
  const followersCount = followStatus?.followers ?? profile.social_stats?.followers ?? 0;
  const followingCount = followStatus?.following ?? profile.social_stats?.following ?? 0;

  const displayName = profile.full_name || profile.username || 'Tín đồ cà phê';

  const formatJoinedDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return null;
      return `Tham gia từ tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
    } catch {
      return null;
    }
  };

  const joinedDateText = formatJoinedDate(profile.created_at);

  const handleToggleFollow = () => {
    if (!profile.id) return;
    toggleFollow.mutate({
      targetUserId: profile.id,
      isCurrentlyFollowing: isFollowing,
      targetUsername: profile.username || undefined,
    });
  };

  return (
    <Card className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5 space-y-4">
      {/* Top section: Avatar + Info + Follow Button */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left min-w-0 flex-1">
          {/* Large Avatar (w-20 h-20) */}
          <Avatar className="w-20 h-20 border-2 border-border/80 shrink-0 shadow-xs">
            <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-secondary text-primary font-bold text-2xl">
              {profile.full_name ? profile.full_name[0]?.toUpperCase() : <UserIcon size={32} />}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="font-sans font-bold text-lg sm:text-xl text-foreground tracking-tight truncate">
                {displayName}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-primary font-medium">
              @{profile.username}
            </p>

            {joinedDateText && (
              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <Calendar size={13} className="shrink-0 text-muted-foreground/80" />
                <span>{joinedDateText}</span>
              </p>
            )}

            {profile.bio && (
              <p className="text-xs text-foreground/80 pt-1 line-clamp-4 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            <ProfileSocialLinks
              profile={profile}
              className="pt-2 justify-center sm:justify-start"
            />
          </div>
        </div>

        {/* Follow Button (hidden on own profile) */}
        {!isOwnProfile && profile.id && (
          <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-end">
            {isFollowing ? (
              <Button
                variant="outline"
                onClick={handleToggleFollow}
                disabled={toggleFollow.isPending}
                className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl font-medium border-border/80 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive group transition-all"
              >
                <UserCheck size={16} className="group-hover:hidden shrink-0 text-primary" />
                <UserX size={16} className="hidden group-hover:inline shrink-0 text-destructive" />
                <span className="group-hover:hidden">Đang theo dõi</span>
                <span className="hidden group-hover:inline text-destructive">Bỏ theo dõi</span>
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleToggleFollow}
                disabled={toggleFollow.isPending}
                className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl font-medium shadow-xs"
              >
                <UserPlus size={16} className="shrink-0" />
                <span>Theo dõi</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3.5 border-t border-border/60">
        <div className="text-center sm:text-left space-y-1">
          <span className="font-sans font-bold text-xl sm:text-2xl text-foreground block leading-tight">
            {reviewCount}
          </span>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground">
            <Star size={13} className="text-amber-500 fill-amber-500/20 shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              Đánh giá
            </span>
          </div>
        </div>

        {profile.username ? (
          <Link
            href={`/u/${profile.username}/followers`}
            className="text-center sm:text-left space-y-1 group hover:opacity-85 transition-opacity block min-h-[44px]"
          >
            <span className="font-sans font-bold text-xl sm:text-2xl text-foreground block leading-tight group-hover:text-primary transition-colors">
              {followersCount}
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground">
              <Users size={13} className="text-primary/70 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider group-hover:text-primary transition-colors">
                Người theo dõi
              </span>
            </div>
          </Link>
        ) : (
          <div className="text-center sm:text-left space-y-1 min-h-[44px]">
            <span className="font-sans font-bold text-xl sm:text-2xl text-foreground block leading-tight">
              {followersCount}
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground">
              <Users size={13} className="text-primary/70 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                Người theo dõi
              </span>
            </div>
          </div>
        )}

        {profile.username ? (
          <Link
            href={`/u/${profile.username}/following`}
            className="text-center sm:text-left space-y-1 group hover:opacity-85 transition-opacity block min-h-[44px]"
          >
            <span className="font-sans font-bold text-xl sm:text-2xl text-foreground block leading-tight group-hover:text-primary transition-colors">
              {followingCount}
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground">
              <UserCheck size={13} className="text-primary/70 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider group-hover:text-primary transition-colors">
                Đang theo dõi
              </span>
            </div>
          </Link>
        ) : (
          <div className="text-center sm:text-left space-y-1 min-h-[44px]">
            <span className="font-sans font-bold text-xl sm:text-2xl text-foreground block leading-tight">
              {followingCount}
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground">
              <UserCheck size={13} className="text-primary/70 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                Đang theo dõi
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
