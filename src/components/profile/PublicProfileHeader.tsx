'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Calendar, Star } from 'lucide-react';
import { PublicProfileData } from '@/hooks/useShops';

interface PublicProfileHeaderProps {
  profile: PublicProfileData;
  reviewCount: number;
}

export function PublicProfileHeader({ profile, reviewCount }: PublicProfileHeaderProps) {
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

  return (
    <Card className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5 space-y-4">
      {/* Profile Header Layout: Column on mobile, Row on desktop */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
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
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5 border-t border-border/60">
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
      </div>
    </Card>
  );
}
