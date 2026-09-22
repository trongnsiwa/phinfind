'use client';

import React from 'react';
import {
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Youtube
} from '@/components/common/SocialIcons';
import { cn } from '@/lib/utils';
import type { CoffeeShop } from '@/types/shop';

const SOCIAL_LINKS = [
  {
    key: 'facebook_url' as const,
    icon: Facebook,
    label: 'Facebook',
    cls: 'text-[#1877F2] hover:bg-[#1877F2]/10 border-[#1877F2]/20'
  },
  {
    key: 'instagram_url' as const,
    icon: Instagram,
    label: 'Instagram',
    cls: 'text-[#E4405F] hover:bg-[#E4405F]/10 border-[#E4405F]/20'
  },
  {
    key: 'tiktok_url' as const,
    icon: Music2,
    label: 'TikTok',
    cls: 'text-foreground hover:bg-foreground/10 border-border/60'
  },
  {
    key: 'youtube_url' as const,
    icon: Youtube,
    label: 'YouTube',
    cls: 'text-[#FF0000] hover:bg-[#FF0000]/10 border-[#FF0000]/20'
  },
  {
    key: 'zalo_url' as const,
    icon: MessageCircle,
    label: 'Zalo',
    cls: 'text-[#0068FF] hover:bg-[#0068FF]/10 border-[#0068FF]/20'
  }
];

export function SocialLinksRow({ shop }: { shop: CoffeeShop }) {
  const items = SOCIAL_LINKS.filter((s) => Boolean(shop[s.key]));
  if (items.length === 0) return null;

  return (
    <div className='space-y-2'>
      <span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider block'>
        Kết nối với quán
      </span>
      <div className='flex flex-wrap gap-2'>
        {items.map((s) => {
          const Icon = s.icon;
          const href = shop[s.key]!;
          return (
            <a
              key={s.key}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={`Mở ${s.label} của ${shop.name}`}
              className={cn(
                'inline-flex items-center gap-2 min-h-[44px] h-11 px-3.5 rounded-xl border',
                'bg-secondary/50 text-xs font-semibold transition-all active:scale-95',
                s.cls
              )}
            >
              <Icon size={16} className='flex-shrink-0' />
              <span>{s.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
