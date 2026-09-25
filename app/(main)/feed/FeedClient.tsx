'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rss, Compass, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyIllustration } from '@/components/common/EmptyIllustration';
import { FeedItemCard } from '@/components/feed/FeedItemCard';
import { useAuth } from '@/hooks/useAuth';
import { useFeed } from '@/hooks/useFollow';
import { APP_ROUTES } from '@/lib/utils/constants';

export function FeedClient() {
  const router = useRouter();
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Client-side auth safeguard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(`${APP_ROUTES.LOGIN}?redirect=/feed`);
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useFeed();

  // Infinite scroll observer
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isAuthLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-6 px-4">
        <div className="h-8 w-36 bg-muted animate-pulse rounded-lg" />
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-muted/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const items = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20 px-4 pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="font-sans font-bold text-xl sm:text-2xl text-foreground flex items-center gap-2">
            <Rss size={22} className="text-primary shrink-0" />
            <span>Bảng tin</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Cập nhật hoạt động từ những người bạn theo dõi
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-muted/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center space-y-4 border-border rounded-2xl">
          <p className="text-sm text-muted-foreground">
            Không thể tải bảng tin lúc này. Vui lòng thử lại.
          </p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="min-h-[44px] px-6 rounded-xl font-medium"
          >
            Thử lại
          </Button>
        </Card>
      ) : items.length === 0 ? (
        /* Empty State: user follows nobody or followees haven't posted yet */
        <Card className="py-12 px-6 text-center space-y-4 border border-border/80 rounded-2xl bg-card">
          <div className="flex justify-center">
            <EmptyIllustration type="no-following" size={160} />
          </div>
          <div className="max-w-sm mx-auto space-y-1.5">
            <h2 className="font-sans font-bold text-base sm:text-lg text-foreground">
              Chưa có hoạt động nào
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Theo dõi những tín đồ cà phê khác để khám phá quán mới và xem đánh giá của họ tại đây.
            </p>
          </div>
          <div className="pt-2">
            <Button
              asChild
              variant="default"
              className="min-h-[44px] px-6 rounded-xl font-medium shadow-xs"
            >
              <Link href={APP_ROUTES.HOME} className="flex items-center gap-2">
                <Compass size={16} />
                <span>Khám phá quán cà phê</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <FeedItemCard key={`${item.type}-${item.id}`} item={item} />
          ))}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="py-6 flex items-center justify-center min-h-[48px]">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span>Đang tải thêm hoạt động...</span>
              </div>
            ) : !hasNextPage ? (
              <p className="text-xs text-muted-foreground/70 font-medium">
                ☕ Bạn đã xem hết các hoạt động mới nhất!
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
