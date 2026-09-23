'use client';

import React from 'react';
import { PlayCircle } from 'lucide-react';
import { EmptyIllustration } from '@/components/common/EmptyIllustration';
import { ShopImage } from '@/components/common/ShopImage';
import {
  FacebookIcon,
  InstagramIcon,
  Music2,
  YoutubeIcon
} from '@/components/common/SocialIcons';
import { cn } from '@/lib/utils';
import type { CoffeeShop, VideoPlatform } from '@/types/shop';

interface VideosTabProps {
  shop: CoffeeShop;
}

interface PlatformMeta {
  label: string;
  gradient: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const PLATFORM_CONFIG: Record<VideoPlatform, PlatformMeta> = {
  tiktok: {
    label: 'TikTok',
    gradient: 'from-zinc-900 via-neutral-900 to-black',
    icon: ({ size = 16, className }: { size?: number; className?: string }) => (
      <Music2 size={size} className={className} />
    )
  },
  youtube: {
    label: 'YouTube',
    gradient: 'from-red-600 via-red-800 to-zinc-950',
    icon: YoutubeIcon
  },
  instagram: {
    label: 'Instagram',
    gradient: 'from-amber-600 via-pink-600 via-purple-700 to-indigo-950',
    icon: InstagramIcon
  },
  facebook: {
    label: 'Facebook',
    gradient: 'from-blue-600 via-blue-800 to-slate-950',
    icon: FacebookIcon
  }
};

function VideoPlaceholder({
  platform,
  url,
  title
}: {
  platform: VideoPlatform;
  url: string;
  title?: string;
}) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.youtube;
  const PlatformIcon = config.icon;

  return (
    <div
      className={cn(
        'absolute inset-0 bg-gradient-to-b flex flex-col items-center justify-between overflow-hidden select-none transition-all duration-300 group-hover:brightness-105',
        config.gradient
      )}
    >
      {/* Background large glyph (60-80px) with reduced opacity */}
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none' aria-hidden='true'>
        <PlatformIcon size={72} className='text-white/15 transition-transform duration-300 group-hover:scale-105' />
      </div>

      {/* Bottom overlay: matching the gradient scrim and typography of thumbnail cards */}
      <div className='absolute inset-x-0 bottom-0 z-10 p-3 pt-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none flex flex-col items-center text-center gap-0.5 w-full'>
        {title ? (
          <>
            <p className='text-xs font-semibold text-white line-clamp-2 leading-snug drop-shadow-sm'>
              {title}
            </p>
            <p className='text-[11px] font-medium text-white/80 drop-shadow-sm leading-tight'>
              Video từ {config.label}
            </p>
          </>
        ) : (
          <p className='text-xs font-semibold text-white drop-shadow-sm leading-tight'>
            Video từ {config.label}
          </p>
        )}
        <p
          className='w-full max-w-full text-[10px] text-white opacity-70 truncate font-mono mt-0.5'
          title={url}
        >
          {url}
        </p>
      </div>
    </div>
  );
}

export function VideosTab({ shop }: VideosTabProps) {
  const videos = shop.videos || [];

  if (videos.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 px-4 text-center select-none'>
        <EmptyIllustration type='no-videos' size={140} className='mb-3' />
        <h3 className='text-sm font-bold text-foreground mb-1'>Chưa có video nào</h3>
        <p className='text-xs text-muted-foreground max-w-xs leading-relaxed'>
          Quán chưa có video giới thiệu trên TikTok, YouTube, Instagram hay Facebook.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4 pt-1'>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-start'>
        {videos.map((video, index) => {
          const config = PLATFORM_CONFIG[video.platform] || PLATFORM_CONFIG.youtube;
          const PlatformIcon = config.icon;

          return (
            <a
              key={`${video.platform}-${video.video_id}-${index}`}
              href={video.url}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={`Mở video ${video.title || config.label} của ${shop.name} trên ${config.label}`}
              className={cn(
                'group relative w-full aspect-[9/16] rounded-2xl overflow-hidden border border-border/60 bg-muted/60 shadow-xs',
                'transition-all duration-200 hover:shadow-card hover:border-amber-gold/50 active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold min-h-[44px]'
              )}
            >
              {video.thumbnail_url ? (
                <>
                  <ShopImage
                    src={video.thumbnail_url}
                    alt={video.title || `Video ${config.label}`}
                    imageClassName='object-cover transition-transform duration-300 group-hover:scale-105'
                    fill
                  />
                  {/* Subtle top/bottom shadow gradients on thumbnail */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none' />

                  {/* Video Title Overlay inside bottom of container */}
                  {video.title && (
                    <div className='absolute inset-x-0 bottom-0 z-10 p-3 pt-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none'>
                      <p className='text-xs font-semibold text-white line-clamp-2 leading-snug drop-shadow-sm'>
                        {video.title}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <VideoPlaceholder platform={video.platform} url={video.url} title={video.title} />
              )}

              {/* Platform Badge - always top-left with consistent dark translucent pill style */}
              <div className='absolute top-2.5 left-2.5 z-20 pointer-events-none'>
                <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium shadow-sm'>
                  <PlatformIcon size={12} className='shrink-0' />
                  <span>{config.label}</span>
                </span>
              </div>

              {/* Centered Play Button Overlay - identical position on all cards */}
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-20'>
                <div className='h-12 w-12 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white/95 group-hover:scale-110 group-hover:bg-black/70 transition-transform shadow-lg'>
                  <PlayCircle className='h-8 w-8 text-white' />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
