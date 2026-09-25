'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, CheckCircle2, User as UserIcon, Coffee, ExternalLink } from 'lucide-react';
import { FeedItem } from '@/types/feed';
import { getShopPath } from '@/lib/utils/shopUrl';
import { ReviewerName } from '@/components/common/ReviewerName';
import { ShopImage } from '@/components/common/ShopImage';
import { useUIStore } from '@/stores/useUIStore';

interface FeedItemCardProps {
  item: FeedItem;
}

function formatRelativeTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function FeedItemCard({ item }: FeedItemCardProps) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const actor = item.actor;
  const shop = item.shop;
  const displayName = actor.full_name || actor.username || 'Tín đồ cà phê';

  const shopHref = getShopPath({
    slug: shop.slug,
    place_id: shop.place_id,
  });

  const timeAgo = formatRelativeTime(item.created_at);

  return (
    <Card className="p-4 sm:p-5 bg-card border border-border/80 shadow-card rounded-2xl space-y-3.5 hover:border-border transition-colors">
      {/* 1. Header: Actor avatar, name, action type, time */}
      <div className="flex items-start gap-3">
        <Link
          href={actor.username ? `/u/${actor.username}` : '#'}
          className="shrink-0 group"
          aria-label={`Trang cá nhân của ${displayName}`}
        >
          <Avatar className="w-10 h-10 sm:w-11 sm:h-11 border border-border group-hover:border-primary/60 transition-colors">
            <AvatarImage
              src={actor.avatar_url || ''}
              alt={displayName}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-secondary text-primary font-bold text-sm">
              {displayName[0]?.toUpperCase() || <UserIcon size={16} />}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <ReviewerName
              author={displayName}
              username={actor.username}
              className="text-sm sm:text-base font-bold"
            />
            <span className="text-xs text-muted-foreground font-normal">
              {item.type === 'review_created' ? 'đã đánh giá' : 'đã ghé thăm'}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block pt-0.5">
            {timeAgo}
          </span>
        </div>

        {item.type === 'shop_visited' ? (
          <Badge
            variant="outline"
            className="shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1 py-1"
          >
            <CheckCircle2 size={13} />
            <span>Check-in</span>
          </Badge>
        ) : (
          <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full text-xs font-bold">
            <Star size={13} className="fill-amber-500 text-amber-500" />
            <span>{item.review.rating}.0</span>
          </div>
        )}
      </div>

      {/* 2. Shop Reference Bar */}
      <Link
        href={shopHref}
        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/50 transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Coffee size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-sans font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {shop.name || 'Quán Cà Phê'}
            </span>
            <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary shrink-0" />
          </div>
          {shop.address && (
            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
              <MapPin size={10} className="shrink-0 text-primary" />
              <span>{shop.address}</span>
            </p>
          )}
        </div>
      </Link>

      {/* 3. Event-specific content */}
      {item.type === 'review_created' && (
        <div className="space-y-2.5 pt-0.5">
          {item.review.comment && (
            <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed line-clamp-4">
              {item.review.comment}
            </p>
          )}

          {/* Tags */}
          {item.review.tags && item.review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.review.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Photos */}
          {item.review.images && item.review.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
              {item.review.images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => openImagePreview(item.review.images || [], idx)}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border/80 bg-muted cursor-pointer shrink-0 hover:border-primary/60 transition-all shadow-xs group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
                  aria-label={`Xem ảnh đánh giá ${idx + 1}`}
                >
                  <ShopImage
                    src={img}
                    alt={`Ảnh đánh giá ${idx + 1}`}
                    imageClassName="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 64px, 80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {item.type === 'shop_visited' && item.visit.note && (
        <div className="p-3 rounded-xl bg-accent/40 border border-border/40 text-xs sm:text-sm text-foreground/80 italic">
          &ldquo;{item.visit.note}&rdquo;
        </div>
      )}
    </Card>
  );
}
