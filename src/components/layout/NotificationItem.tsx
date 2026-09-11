'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShieldCheck, XCircle, Pencil, X } from 'lucide-react';
import { NotificationItem as NotificationItemType } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/lib/utils/formatTime';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/utils/constants';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onCloseDropdown: () => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onCloseDropdown,
}: NotificationItemProps) {
  const router = useRouter();

  const getIcon = () => {
    switch (notification.type) {
      case 'review_liked':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500/20 flex-shrink-0" />;
      case 'shop_approved':
        return <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
      case 'shop_rejected':
        return <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
      case 'edit_suggestion_pending':
      case 'edit_suggestion_approved':
      case 'edit_suggestion_rejected':
        return <Pencil className="w-4 h-4 text-amber-gold flex-shrink-0" />;
      default:
        return <Heart className="w-4 h-4 text-amber-gold flex-shrink-0" />;
    }
  };

  const getMessage = () => {
    const actorName = notification.actor_name || 'Một người dùng';
    const shopName = notification.payload?.shop_name;

    switch (notification.type) {
      case 'review_liked':
        return `${actorName} đã thấy đánh giá của bạn hữu ích`;
      case 'shop_approved':
        return shopName
          ? `Quán "${shopName}" của bạn đã được xác minh`
          : 'Quán của bạn đã được xác minh';
      case 'shop_rejected':
        return shopName
          ? `Quán "${shopName}" của bạn đã bị từ chối xác minh`
          : 'Quán của bạn đã bị từ chối xác minh';
      case 'edit_suggestion_pending':
        return shopName
          ? `Có đề xuất chỉnh sửa mới cho quán "${shopName}"`
          : 'Có đề xuất chỉnh sửa mới cho quán của bạn';
      case 'edit_suggestion_approved':
        return shopName
          ? `Đề xuất chỉnh sửa quán "${shopName}" đã được duyệt`
          : 'Đề xuất chỉnh sửa của bạn đã được duyệt';
      case 'edit_suggestion_rejected':
        return shopName
          ? `Đề xuất chỉnh sửa quán "${shopName}" đã bị từ chối`
          : 'Đề xuất chỉnh sửa của bạn đã bị từ chối';
      default:
        return 'Bạn có một thông báo mới';
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
    onCloseDropdown();

    if (notification.shop_place_id) {
      if (notification.type === 'review_liked') {
        router.push(`${APP_ROUTES.SHOP_DETAIL(notification.shop_place_id)}?tab=reviews`);
      } else {
        router.push(APP_ROUTES.SHOP_DETAIL(notification.shop_place_id));
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'group relative flex items-start gap-3 p-3 text-left transition-colors cursor-pointer select-none outline-none',
        'hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-1 focus-visible:ring-amber-gold',
        !notification.is_read && 'bg-amber-gold/5'
      )}
    >
      {/* Unread indicator dot */}
      <div className="pt-1.5 flex items-center justify-center w-2 flex-shrink-0">
        {!notification.is_read ? (
          <span className="w-2 h-2 rounded-full bg-amber-gold animate-pulse" />
        ) : (
          <span className="w-2 h-2" />
        )}
      </div>

      {/* Type icon container */}
      <div className="p-1.5 rounded-full bg-secondary/80 flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* Content & relative time */}
      <div className="flex-1 min-w-0 pr-6">
        <p
          className={cn(
            'text-xs leading-relaxed break-words',
            !notification.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'
          )}
        >
          {getMessage()}
        </p>
        <span className="text-[11px] text-muted-foreground/80 mt-1 block">
          {formatRelativeTime(notification.created_at)}
        </span>
      </div>

      {/* Delete button (revealed on group hover or focus) */}
      <button
        type="button"
        onClick={handleDelete}
        title="Xóa thông báo"
        aria-label="Xóa thông báo"
        className="absolute top-3 right-2 p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-background/80 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all outline-none focus-visible:ring-1 focus-visible:ring-amber-gold"
      >
        <X size={14} />
      </button>
    </div>
  );
}
