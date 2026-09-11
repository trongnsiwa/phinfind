'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle2, XCircle, RotateCcw, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopCardPlaceholder } from '@/components/common/ShopCardPlaceholder';
import { ShopImage } from '@/components/common/ShopImage';
import { cleanCategoryLabel } from '@/lib/utils/placeholders';
import { CoffeeShop } from '@/types/shop';

export interface AdminShopItem extends CoffeeShop {
  creator?: {
    id: string;
    full_name: string | null;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  updated_at?: string;
}

interface AdminShopCardProps {
  shop: AdminShopItem;
  variant: 'pending' | 'rejected';
  onApprove?: (shop: AdminShopItem) => void;
  onReject?: (shop: AdminShopItem) => void;
  onUnhide?: (shop: AdminShopItem) => void;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'gần đây';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diffMs)) return 'gần đây';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} ngày trước`;
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth} tháng trước`;
    const diffYear = Math.floor(diffDay / 365);
    return `${diffYear} năm trước`;
  } catch {
    return 'gần đây';
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function AdminShopCard({
  shop,
  variant,
  onApprove,
  onReject,
  onUnhide,
}: AdminShopCardProps) {
  const coverImage = shop.photos?.[0];
  const isPending = variant === 'pending';

  const rawUsername = shop.creator?.username;
  const creatorDisplay = rawUsername
    ? rawUsername.startsWith('@')
      ? rawUsername
      : `@${rawUsername}`
    : shop.creator?.full_name || 'người dùng ẩn danh';

  const rejectionDate = shop.updated_at ? formatDate(shop.updated_at) : '';

  return (
    <Card className="p-3.5 sm:p-4 bg-card border border-border rounded-2xl shadow-card hover:shadow-card-hover transition-all">
      {/* Top layout */}
      <div className="flex gap-3.5 items-start">
        {/* Left column: 80x80 thumbnail */}
        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-secondary border border-border/50">
          <ShopImage
            src={coverImage}
            alt={shop.name}
            fallback={<ShopCardPlaceholder shopId={shop.place_id || shop.id} shopName={shop.name} />}
            imageClassName={`object-cover ${!isPending ? 'grayscale-[20%]' : ''}`}
            sizes="80px"
          />
        </div>

        {/* Right column flex-1 */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-sans font-bold text-sm sm:text-base text-foreground tracking-tight line-clamp-1">
            {shop.name}
          </h3>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1">
            <MapPin size={12} className="text-muted-foreground shrink-0" />
            <span>{shop.address || 'Chưa cập nhật địa chỉ'}</span>
          </p>

          <p className="text-[11px] text-muted-foreground line-clamp-1">
            Đề xuất bởi <span className="font-medium text-foreground">{creatorDisplay}</span> ·{' '}
            {formatRelativeTime(shop.created_at)}
            {!isPending && rejectionDate && ` · Đã từ chối: ${rejectionDate}`}
          </p>

          {shop.categories && shop.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {shop.categories.slice(0, 3).map((category, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-[10px] sm:text-xs font-normal px-2 py-0 h-5 text-muted-foreground border-border/70 rounded-full"
                >
                  {cleanCategoryLabel(category)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row inside same card */}
      <div className="pt-3 mt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/shop/${shop.place_id || shop.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 rounded"
        >
          <span>Xem chi tiết quán</span>
          <ExternalLink size={12} className="shrink-0" />
        </Link>

        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <Button
                size="sm"
                onClick={() => onApprove?.(shop)}
                className="h-8 px-3.5 text-xs font-bold rounded-xl shadow-sm transition-transform active:scale-95"
              >
                <CheckCircle2 size={13} className="mr-1" />
                Xác minh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject?.(shop)}
                className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-8 px-3.5 text-xs font-bold rounded-xl transition-colors"
              >
                <XCircle size={13} className="mr-1" />
                Từ chối
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnhide?.(shop)}
              className="border-border text-foreground hover:bg-muted h-8 px-3.5 text-xs font-bold rounded-xl transition-colors"
            >
              <RotateCcw size={13} className="mr-1 text-primary" />
              Khôi phục
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
