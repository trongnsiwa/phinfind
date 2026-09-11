'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  Quote,
  ShieldCheck,
  User,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopEditSuggestion } from '@/hooks/useShops';
import { cn } from '@/lib/utils';

interface AdminSuggestionCardProps {
  suggestion: ShopEditSuggestion;
  currentUserId?: string;
  onApprove?: (suggestion: ShopEditSuggestion) => void;
  onReject?: (suggestion: ShopEditSuggestion) => void;
  variant?: 'pending' | 'reviewed';
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Tên quán',
  address: 'Địa chỉ',
  phone: 'Số điện thoại',
  website: 'Website',
  price_range: 'Mức giá',
  opening_hours: 'Giờ mở cửa',
  categories: 'Danh mục',
  amenities: 'Tiện ích',
  custom_amenities: 'Tiện ích riêng',
  photos: 'Hình ảnh',
  lat: 'Vĩ độ',
  lon: 'Kinh độ',
};

function formatFieldValue(key: string, val: any): string {
  if (val === null || val === undefined || val === '') {
    return '(Trống)';
  }
  if (key === 'opening_hours') {
    if (typeof val === 'object' && 'open_now' in val) {
      return val.open_now ? 'Đang mở cửa' : 'Đã đóng cửa';
    }
  }
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(', ') : '(Trống)';
  }
  return String(val);
}

function formatRelativeTime(dateStr?: string | null): string {
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

export function AdminSuggestionCard({
  suggestion,
  currentUserId,
  onApprove,
  onReject,
  variant = 'pending',
}: AdminSuggestionCardProps) {
  const isPending = variant === 'pending' || suggestion.status === 'pending';
  const isApproved = suggestion.status === 'approved';
  const isRejected = suggestion.status === 'rejected';

  const rawUsername = suggestion.suggester?.username;
  const suggesterDisplay = rawUsername
    ? rawUsername.startsWith('@')
      ? rawUsername
      : `@${rawUsername}`
    : suggestion.suggester?.full_name || 'Người dùng ẩn danh';

  const reviewerName = suggestion.reviewer?.full_name || suggestion.reviewer?.username || 'Admin';

  const isSelf = Boolean(currentUserId && suggestion.suggested_by === currentUserId);

  const changesEntries = Object.entries(suggestion.changes || {});

  return (
    <Card className="p-4 sm:p-5 bg-card border border-border rounded-2xl shadow-card hover:shadow-card-hover transition-all space-y-3.5">
      {/* Top row: Shop details and link */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-sans font-bold text-base text-foreground tracking-tight line-clamp-1">
              {suggestion.shop?.name || 'Quán cà phê'}
            </h3>
            {!isPending && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                  isApproved &&
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
                  isRejected && 'bg-destructive/10 text-destructive border-destructive/30'
                )}
              >
                {isApproved ? 'Đã duyệt' : 'Đã từ chối'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1">
            <MapPin size={12} className="text-muted-foreground shrink-0" />
            <span>{suggestion.shop?.address || 'Chưa cập nhật địa chỉ'}</span>
          </p>
        </div>

        <Link
          href={`/shop/${suggestion.shop_place_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-1 flex-shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold rounded"
        >
          <span>Xem quán</span>
          <ExternalLink size={12} className="shrink-0" />
        </Link>
      </div>

      {/* Suggester info & trust score */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-2 rounded-xl border border-border/40">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <User size={13} className="text-amber-gold flex-shrink-0" />
          <span>{suggesterDisplay}</span>
        </div>

        {suggestion.trust && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <ShieldCheck size={13} className="text-teal flex-shrink-0" />
              <span>
                {suggestion.trust.reviewsCount} đánh giá · {suggestion.trust.visitsCount} lượt ghé
              </span>
            </div>
          </>
        )}

        <span className="ml-auto text-[11px] text-muted-foreground/80">
          {formatRelativeTime(suggestion.created_at)}
        </span>
      </div>

      {/* Readable Diff List */}
      <div className="space-y-1.5 bg-background rounded-xl p-3 border border-border/50">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
          Các thay đổi đề xuất ({changesEntries.length})
        </span>

        <div className="space-y-2">
          {changesEntries.map(([key, diff]) => {
            const label = FIELD_LABELS[key] || key;
            const fromText = formatFieldValue(key, diff?.from);
            const toText = formatFieldValue(key, diff?.to);

            return (
              <div
                key={key}
                className="flex flex-wrap items-center gap-2 text-xs py-1 px-2 rounded-lg bg-secondary/20"
              >
                <span className="font-semibold text-foreground min-w-[90px]">{label}:</span>
                <span className="text-muted-foreground line-through decoration-muted-foreground/60">
                  {fromText}
                </span>
                <ArrowRight size={12} className="text-amber-gold flex-shrink-0" />
                <span className="font-semibold text-amber-gold">{toText}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reason text in italic quoted block */}
      {suggestion.reason && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-secondary/20 border border-border/30 text-xs text-muted-foreground italic">
          <Quote size={13} className="text-amber-gold flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed break-words whitespace-pre-wrap">
            &ldquo;{suggestion.reason}&rdquo;
          </p>
        </div>
      )}

      {/* Rejection Note display if already reviewed */}
      {isRejected && suggestion.review_note && (
        <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
          <span className="font-semibold block mb-0.5">Lý do từ chối:</span>
          <p className="italic leading-relaxed">{suggestion.review_note}</p>
        </div>
      )}

      {/* Reviewer audit info */}
      {!isPending && suggestion.reviewed_at && (
        <div className="text-[11px] text-muted-foreground pt-1">
          Được xử lý bởi <span className="font-medium text-foreground">{reviewerName}</span> ·{' '}
          {formatRelativeTime(suggestion.reviewed_at)}
        </div>
      )}

      {/* Actions (Only in pending state) */}
      {isPending && (
        <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onReject?.(suggestion)}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-8 px-3.5 text-xs font-bold rounded-xl transition-colors focus-visible:ring-1 focus-visible:ring-amber-gold"
          >
            <XCircle size={13} className="mr-1" />
            Từ chối
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isSelf}
            onClick={() => onApprove?.(suggestion)}
            title={isSelf ? 'Bạn không thể tự duyệt đề xuất của chính mình' : undefined}
            className={cn(
              'h-8 px-3.5 text-xs font-bold rounded-xl shadow-sm transition-transform active:scale-95 bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground focus-visible:ring-1 focus-visible:ring-amber-gold',
              isSelf && 'opacity-50 cursor-not-allowed'
            )}
          >
            <CheckCircle2 size={13} className="mr-1" />
            {isSelf ? 'Tự đề xuất (Khóa)' : 'Chấp nhận'}
          </Button>
        </div>
      )}
    </Card>
  );
}
