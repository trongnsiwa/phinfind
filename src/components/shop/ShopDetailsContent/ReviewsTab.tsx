'use client';

import { Edit3, Loader2, LogIn, RotateCcw, Star } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { APP_ROUTES, REVIEW_TAGS, normalizeReviewTag } from '@/lib/utils/constants';
import { useUIStore } from '@/stores/useUIStore';
import type { CoffeeShop } from '@/types/shop';
import dynamic from 'next/dynamic';
import type { ReviewItem } from '../ReviewModal';

const ReviewModal = dynamic(
  () => import('../ReviewModal').then((mod) => mod.ReviewModal),
  { ssr: false, loading: () => null }
);
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
      tags: Array.isArray(r.tags) ? r.tags : [],
      like_count: r.like_count || 0,
      liked_by_me: Boolean(r.liked_by_me),
      is_edited: Boolean(r.is_edited),
    }));
  }, [data?.pages]);

  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  // Compute tag counts across all reviews
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reviewsList) {
      if (Array.isArray(r.tags)) {
        for (const tag of r.tags) {
          const norm = normalizeReviewTag(tag) || tag;
          counts[norm] = (counts[norm] || 0) + 1;
        }
      }
    }
    return counts;
  }, [reviewsList]);

  // Find tags present in current reviews
  const availableTags = useMemo(() => {
    return REVIEW_TAGS.filter((t) => (tagCounts[t.id] || 0) > 0);
  }, [tagCounts]);

  const handleToggleFilterTag = (tagId: string) => {
    setSelectedFilterTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleResetFilterTags = () => {
    setSelectedFilterTags([]);
  };

  // Filter reviews by active tag intersection
  const displayedReviews = useMemo(() => {
    if (selectedFilterTags.length === 0) return reviewsList;
    return reviewsList.filter((rev) => {
      const revTagIds = (rev.tags || []).map((t) => normalizeReviewTag(t) || t);
      return selectedFilterTags.every((filterId) => revTagIds.includes(filterId));
    });
  }, [reviewsList, selectedFilterTags]);

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
              href={`/login?redirect=${encodeURIComponent(`/?shop=${shop.slug || shop.place_id || shop.id}`)}`}
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
            {/* RESPONSIVE: h-9 on mobile for comfortable touch target, md:h-8.5 on desktop */}
            <Button
              type='button'
              onClick={() => setIsModalOpen(true)}
              className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-3.5 py-1.5 h-9 md:h-8.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer flex-shrink-0'
            >
              <Edit3 size={13} />
              <span>Viết đánh giá</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tag Filter Row */}
      {availableTags.length > 0 && (
        <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1' role='region' aria-label='Lọc đánh giá theo thẻ'>
          {selectedFilterTags.length > 0 && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleResetFilterTags}
              className='min-h-[44px] sm:min-h-[32px] h-9 sm:h-8 px-2.5 rounded-full text-xs font-semibold border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent shrink-0'
              aria-label='Đặt lại bộ lọc thẻ'
            >
              <RotateCcw size={12} className='mr-1' />
              <span>Tất cả</span>
            </Button>
          )}
          {availableTags.map((tag) => {
            const count = tagCounts[tag.id] || 0;
            const isSelected = selectedFilterTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type='button'
                onClick={() => handleToggleFilterTag(tag.id)}
                aria-pressed={isSelected}
                className={cn(
                  'inline-flex items-center justify-center min-h-[44px] sm:min-h-[32px] h-9 sm:h-8 px-3 rounded-full text-xs font-medium border transition-colors cursor-pointer select-none shrink-0',
                  isSelected
                    ? 'bg-amber-gold text-primary-foreground border-amber-gold font-semibold shadow-xs'
                    : 'bg-secondary text-muted-foreground border-border/80 hover:text-foreground hover:bg-secondary/80'
                )}
              >
                <span>{tag.label}</span>
                <span
                  className={cn(
                    'ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Reviews List */}
      <div className='space-y-2.5'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold text-foreground block'>
            Đánh giá &amp; Trải nghiệm cộng đồng ({totalReviews})
          </span>
          {selectedFilterTags.length > 0 && (
            <span className='text-[11px] text-muted-foreground font-medium'>
              Đang lọc: {displayedReviews.length}/{reviewsList.length}
            </span>
          )}
        </div>

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
                className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-4 py-2 h-9 md:h-8.5 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer'
              >
                <Edit3 size={13} />
                <span>Viết đánh giá đầu tiên</span>
              </Button>
            ) : (
              <Link href={`/login?redirect=${encodeURIComponent(`/?shop=${shop.slug || shop.place_id || shop.id}`)}`}>
                <Button
                  type='button'
                  className='bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs rounded-xl px-4 py-2 h-9 md:h-8.5 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer'
                >
                  <LogIn size={13} />
                  <span>Đăng nhập để đánh giá</span>
                </Button>
              </Link>
            )}
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 px-4 text-center space-y-2.5 bg-secondary/20 rounded-2xl border border-dashed border-border'>
            <p className='text-xs font-semibold text-foreground'>
              Không có đánh giá nào phù hợp với các thẻ đã chọn.
            </p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleResetFilterTags}
              className='text-xs min-h-[44px] sm:min-h-[32px] h-9 rounded-xl border-border'
            >
              <RotateCcw size={12} className='mr-1.5' />
              <span>Xóa bộ lọc thẻ</span>
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-2.5'>
            <AnimatePresence initial={false}>
              {displayedReviews.map((rev, idx) => (
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
          <AlertDialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            className='bg-card text-card-foreground border-border'
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                Xóa bài đánh giá?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa bài đánh giá này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (reviewToDelete.id) {
                    deleteReviewMutation.mutate(reviewToDelete.id);
                  }
                  setReviewToDelete(null);
                }}
              >
                Xóa đánh giá
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
});
