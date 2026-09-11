'use client';

import React, { useState } from 'react';
import { Bell, Coffee, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/layout/NotificationItem';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.preventDefault();
    if (unreadCount > 0 && !isMarkingAll) {
      markAllRead();
    }
  };

  const badgeText = unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            unreadCount > 0
              ? `Thông báo (${unreadCount} chưa đọc)`
              : 'Thông báo'
          }
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/70 border border-border/60 hover:border-amber-gold/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 flex-shrink-0"
        >
          <Bell size={16} />

          {/* Unread count pill */}
          {badgeText && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-amber-gold text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-sm pointer-events-none"
            >
              {badgeText}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] p-0 overflow-hidden shadow-xl border border-border bg-popover"
      >
        {/* Header Row */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">Thông báo</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-gold/15 text-amber-gold">
                {unreadCount} mới
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isMarkingAll}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-gold hover:underline disabled:text-muted-foreground/50 disabled:no-underline disabled:cursor-not-allowed transition-colors"
          >
            <CheckCheck size={13} />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        </div>

        {/* Notifications list or empty state */}
        <div className="max-h-96 overflow-y-auto divide-y divide-border/40">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center mb-2">
                <Coffee className="w-5 h-5 text-muted-foreground/60" />
              </div>
              <p className="text-xs font-medium text-foreground">Chưa có thông báo nào</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Các tương tác về đánh giá và quán của bạn sẽ xuất hiện tại đây
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markRead(id)}
                onDelete={(id) => deleteNotification(id)}
                onCloseDropdown={() => setIsOpen(false)}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
