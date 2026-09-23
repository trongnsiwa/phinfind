'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import {
  Facebook,
  Instagram,
  Music2,
} from '@/components/common/SocialIcons';
import { cn } from '@/lib/utils';
import type { PublicProfileData } from '@/hooks/useShops';

interface ProfileSocialLinksProps {
  profile: Pick<
    PublicProfileData,
    'facebook_url' | 'instagram_url' | 'tiktok_url' | 'website_url' | 'full_name' | 'username'
  >;
  className?: string;
}

const SOCIAL_ITEMS = [
  {
    key: 'facebook_url' as const,
    icon: Facebook,
    label: 'Facebook',
    cls: 'text-[#1877F2] hover:bg-[#1877F2]/10 border-[#1877F2]/20',
  },
  {
    key: 'instagram_url' as const,
    icon: Instagram,
    label: 'Instagram',
    cls: 'text-[#E4405F] hover:bg-[#E4405F]/10 border-[#E4405F]/20',
  },
  {
    key: 'tiktok_url' as const,
    icon: Music2,
    label: 'TikTok',
    cls: 'text-foreground hover:bg-foreground/10 border-border/60',
  },
  {
    key: 'website_url' as const,
    icon: Globe,
    label: 'Website',
    cls: 'text-primary hover:bg-primary/10 border-primary/20',
  },
];

export function ProfileSocialLinks({ profile, className }: ProfileSocialLinksProps) {
  const items = SOCIAL_ITEMS.filter((s) => Boolean(profile[s.key]));
  if (items.length === 0) return null;

  const displayName = profile.full_name || profile.username || 'người dùng';

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {items.map((s) => {
        const Icon = s.icon;
        const href = profile[s.key]!;
        return (
          <a
            key={s.key}
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`Mở ${s.label} của ${displayName}`}
            className={cn(
              'inline-flex items-center gap-2 min-h-[44px] h-11 px-3.5 rounded-xl border',
              'bg-secondary/40 text-xs font-semibold transition-all active:scale-95',
              s.cls
            )}
          >
            <Icon size={16} className='shrink-0' />
            <span>{s.label}</span>
          </a>
        );
      })}
    </div>
  );
}
