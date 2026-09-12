'use client';

import { Edit3, Loader2, LogIn, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { EmptyIllustration } from '@/components/common/EmptyIllustration';
import { ShopImage } from '@/components/common/ShopImage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteReview, useInfiniteShopReviews, useToggleReviewLike } from '@/hooks/useShops';
import { APP_ROUTES } from '@/lib/utils/constants';
import { useUIStore } from '@/stores/useUIStore';
import type { CoffeeShop } from '@/types/shop';
import { ReviewItem, ReviewModal } from '../ReviewModal';
import { ReviewCard } from './ReviewCard';

export const ReviewsTab = memo(function ReviewsTab({
  shop,
}: {
  shop: CoffeeShop;
  isSidebar?: boolean;
  isStandalone?: boolean;
}) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const { user, profile, isAuthenticated } = useAuth();
  const router = useRouter();
  const toggleLikeMutation = useToggleReviewLike();
  const deleteReviewMutation = useDeleteReview();

  const placeId = shop.place_id || shop.id || '';
  const {
    data,
    isLoading: isLoadingReviews,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteShopReviews(placeId);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<ReviewItem | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  const hasShopRating = typeof shop.rating === 'number' && shop.rating > 0;
  const shopRating = shop.rating || 0;

  // Flatten reviews from paginated infinite query pages
  const reviewsList: ReviewItem[] = useMemo(() => {
    if (!data?.pages) return [];
    const allRaw = data.pages.flatMap((page) => page.reviews || []);
    return allRaw.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      author:
        r.author ||
        r.profiles?.full_name ||
        r.profiles?.username ||
        'Tín đồ cà phê',
      avatar: r.avatar || r.profiles?.avatar_url || undefined,
      username: r.username || r.profiles?.username || undefined,
      rating: r.rating,
      date: new Date(r.created_at).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      highlight: 'Đánh giá từ cộng đồng',
      comment: r.comment,
      images: Array.isArray(r.images) ? r.images : [],
      like_count: r.like_count || 0,
      liked_by_me: Boolean(r.liked_by_me),
      is_edited: Boolean(r.is_edited),
    }));
  }, [data?.pages]);

  const totalReviews = data?.pages?.[0]?.total ?? (shop.total_ratings || reviewsList.length);

  // Auto-load next page on scroll into view
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleToggleLike = (rev: ReviewItem) => {
    if (!isAuthenticated) {
      toast('Yêu cầu đăng nhập', {
        description: 'Vui lòng đăng nhập để đánh dấu bài đánh giá này là hữu ích.',
        action: {
          label: 'Đăng nhập',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }

    if (user && rev.user_id === user.id) {
      toast.error('Bạn không thể tự đánh dấu hữu ích cho đánh giá của mình.');
      return;
    }

    if (!rev.id) return;

    toggleLikeMutation.mutate({
      reviewId: rev.id,
      isCurrentlyLiked: Boolean(rev.liked_by_me),
      placeId,
    });
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* 1. Top Section: Score Breakdown & Auth / Review Trigger Action */}
      <div className='space-y-3'>
        {/* Rating Breakdown Score Card */}
        <div className='bg-secondary/50 p-3.5 rounded-2xl border border-border/60 grid grid-cols-[110px_1fr] items-center gap-4 shadow-sm'>
          <div className='flex flex-col items-center justify-center text-center pr-3 border-r border-border/50'>
            <span className='text-3xl font-black text-foreground tracking-tight leading-none'>
              {shopRating.toFixed(1)}
            </span>
            <div className='flex items-center gap-0.5 text-amber-gold my-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={
                    hasShopRating && star <= Math.round(shopRating)
                      ? 'fill-amber-gold text-amber-gold'
                      : 'text-border'
                  }
                />
              ))}
            </div>
            <span className='text-[10px] text-muted-foreground font-medium leading-none'>
              {totalReviews > 0 ? `${totalReviews} Đánh giá` : 'Chưa có đánh giá'}
            </span>
          </div>

          <div className='space-y-1 text-xs text-secondary-foreground'>
            <p className='text-xs text-muted-foreground font-medium'>
              {hasShopRating || totalReviews > 0
                ? 'Đánh giá trung bình từ cộng đồng người dùng PhinFind.'
                : 'Chưa có đánh giá từ cộng đồng cho quán này.'}
            </p>
          </div>
        </div>

        {/* Inline "Write a Review" Action / Guest Auth Prompt */}
        {!isAuthenticated ? (
          <div className='bg-secondary/40 p-3 rounded-2xl border border-border/60 flex items-center justify-between gap-3 shadow-xs'>
            <div className='flex items-center gap-2.5 min-w-0 flex-1'>
              <div className='w-8 h-8 rounded-xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold flex-shrink-0'>
                <Edit3 size={15} />
              </div>
              <div className='min-w-0'>
                <span className='font-bold text-foreground text-xs block truncate'>
                  Bạn đã từng ghé quán cà phê này?
                </span>
                <p className='text-[11px] text-muted-foreground truncate'>
                  Chia sẻ cảm nhận và trải nghiệm của bạn
                </p>
              </div>
            </div>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/?shop=${shop.id}`)}`}
              className='flex-shrink-0'
            >
              <Button
                type='button'
                className='bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl px-3.5 py-1.5 h-8.5 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md'
              >
                <LogIn size={13} />
                <span>Đăng nhập</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className='flex items-center justify-between bg-secondary/40 p-3 rounded-2xl border border-border/60 gap-3 shadow-xs'>
            <div className='flex items-center gap-2.5 min-w-0 flex-1'>
              <ShopImage
                src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                alt='Ảnh đại diện của bạn'
                fallback={
                  <div className='w-full h-full bg-amber-gold/20 flex items-center justify-center text-amber-gold text-xs font-bold'>
                    {(profile?.full_name || user?.user_metadata?.full_name || 'U')[0].toUpperCase()}
                  </div>
                }
                sizes="32px"
                className="w-8 h-8 rounded-full overflow-hidden border border-amber-gold/40 bg-muted flex-shrink-0"
                imageClassName="object-cover"
              />
              <div className='min-w-0'>
                <span className='text-xs font-bold text-foreground block truncate'>
                  Đánh giá với tư cách {profile?.full_name || user?.user_metadata?.full_name || 'Tín đồ cà phê'}
                </span>
                <p className='text-[11px] text-muted-foreground truncate'>
                  Chia sẻ cảm nhận của bạn cùng cộng đồng
                </p>
              </div>
            </div>
            <Button
              type='button'
              onClick={() => setIsModalOpen(true)}
              className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-3.5 py-1.5 h-8.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer flex-shrink-0'
            >
              <Edit3 size={13} />
              <span>Viết đánh giá</span>
            </Button>
          </div>
        )}
      </div>

      {/* 2. Reviews List */}
      <div className='space-y-2.5'>
        <span className='text-xs font-bold text-foreground block'>
          Đánh giá &amp; Trải nghiệm cộng đồng ({totalReviews})
        </span>

        {isLoadingReviews ? (
          <div className='space-y-2.5'>
            {[1, 2].map((i) => (
              <div
                key={i}
                className='p-3.5 rounded-2xl border border-border/60 bg-secondary/30 animate-pulse space-y-2.5'
              >
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-full bg-muted-foreground/20' />
                  <div className='space-y-1 flex-1'>
                    <div className='h-3 w-28 bg-muted-foreground/20 rounded' />
                    <div className='h-2.5 w-16 bg-muted-foreground/15 rounded' />
                  </div>
                </div>
                <div className='h-3 w-full bg-muted-foreground/15 rounded' />
                <div className='h-3 w-3/4 bg-muted-foreground/10 rounded' />
              </div>
            ))}
          </div>
        ) : reviewsList.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 px-4 text-center space-y-3 bg-secondary/20 rounded-2xl border border-dashed border-border'>
            <EmptyIllustration type='no-reviews' size={140} />
            <div className='space-y-1 max-w-xs'>
              <h4 className='text-xs font-bold text-foreground'>Chưa có đánh giá nào</h4>
              <p className='text-[11px] text-muted-foreground leading-relaxed'>
                Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận về quán này cùng cộng đồng!
              </p>
            </div>
            {isAuthenticated ? (
              <Button
                type='button'
                onClick={() => setIsModalOpen(true)}
                className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-4 py-2 h-8 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer'
              >
                <Edit3 size={13} />
                <span>Viết đánh giá đầu tiên</span>
              </Button>
            ) : (
              <Link href={`/login?redirect=${encodeURIComponent(`/?shop=${shop.id}`)}`}>
                <Button
                  type='button'
                  className='bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded-xl px-4 py-2 h-8 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer'
                >
                  <LogIn size={13} />
                  <span>Đăng nhập để đánh giá</span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-2.5'>
            <AnimatePresence initial={false}>
              {reviewsList.map((rev, idx) => (
                <ReviewCard
                  key={rev.id || idx}
                  review={rev}
                  currentUserId={user?.id}
                  onOpenImage={openImagePreview}
                  onEdit={(item) => {
                    setReviewToEdit(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={(item) => setReviewToDelete(item)}
                  onToggleLike={handleToggleLike}
                />
              ))}
            </AnimatePresence>

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className='h-1' />

            {/* Load more button / fetch next page state */}
            {hasNextPage && (
              <div className='pt-2 pb-1 flex justify-center'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className='text-xs h-8 px-4 rounded-xl border-border/80 text-muted-foreground hover:text-foreground'
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 size={13} className='mr-1.5 animate-spin' />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <span>Tải thêm đánh giá</span>
                  )}
                </Button>
              </div>
            )}

            {!hasNextPage && reviewsList.length > 0 && (
              <p className='text-center text-[11px] text-muted-foreground py-2'>
                Bạn đã xem hết đánh giá
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Review Modal */}
      <ReviewModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setReviewToEdit(null);
        }}
        shop={shop}
        existingReview={reviewToEdit || undefined}
      />

      {/* 4. Delete Review Confirmation */}
      {reviewToDelete && (
        <AlertDialog open={Boolean(reviewToDelete)} onOpenChange={(open) => !open && setReviewToDelete(null)}>
          <AlertDialogContent className='bg-card text-card-foreground border-border max-w-sm rounded-2xl'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-foreground text-base font-bold'>
                Xóa bài đánh giá?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-xs'>
                Bạn có chắc chắn muốn xóa bài đánh giá này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-row gap-2 justify-end mt-4'>
              <AlertDialogCancel className='rounded-xl text-xs h-8'>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (reviewToDelete.id) {
                    deleteReviewMutation.mutate(reviewToDelete.id);
                  }
                  setReviewToDelete(null);
                }}
                className='bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs h-8'
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
});
