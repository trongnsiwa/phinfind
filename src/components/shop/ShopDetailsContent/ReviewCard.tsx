'use client';

import { CheckCircle2, Star, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShopImage } from '@/components/common/ShopImage';
import { cn } from '@/lib/utils';
import type { ReviewItem } from '../ReviewModal';

interface ReviewCardProps {
  review: ReviewItem;
  currentUserId?: string;
  onOpenImage: (images: string[], index: number) => void;
  onEdit?: (review: ReviewItem) => void;
  onDelete?: (review: ReviewItem) => void;
  onToggleLike?: (review: ReviewItem) => void;
}

export function ReviewCard({
  review,
  currentUserId,
  onOpenImage,
  onEdit,
  onDelete,
  onToggleLike
}: ReviewCardProps) {
  const isOwner = Boolean(currentUserId && review.user_id === currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'p-3.5 rounded-2xl border flex flex-col gap-2 transition-all shadow-xs',
        review.isUserSubmission
          ? 'bg-amber-gold/10 border-amber-gold/40 shadow-sm'
          : 'bg-secondary/50 border-border/60 hover:border-border/90'
      )}
    >
      {/* Header Row: Avatar, Author, Verified, Rating, and Date */}
      <div className='flex items-start justify-between gap-2 min-w-0'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <ShopImage
            src={review.avatar}
            alt={review.author}
            fallback={
              <div className='w-full h-full bg-amber-gold/20 flex items-center justify-center text-amber-gold text-[10px] font-bold'>
                {review.author[0]?.toUpperCase() || 'U'}
              </div>
            }
            sizes="28px"
            className="w-7 h-7 rounded-full overflow-hidden border border-amber-gold/30 bg-muted flex-shrink-0"
            imageClassName="object-cover"
          />
          <div className='min-w-0 flex flex-col'>
            <div className='flex items-center gap-1.5 min-w-0'>
              {review.username ? (
                <Link
                  href={`/u/${encodeURIComponent(review.username)}`}
                  className='font-bold text-foreground text-xs truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold rounded-xs'
                >
                  {review.author}
                </Link>
              ) : (
                <span className='font-bold text-foreground text-xs truncate'>{review.author}</span>
              )}
              <CheckCircle2 size={12} className='text-teal flex-shrink-0' />
              {review.isUserSubmission && (
                <span className='text-[9px] bg-amber-gold text-primary-foreground font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider flex-shrink-0'>
                  Bạn
                </span>
              )}
            </div>
            <div className='flex items-center gap-0.5 text-amber-gold mt-0.5'>
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} size={10} className='fill-amber-gold text-amber-gold' />
              ))}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0 pt-0.5'>
          {isOwner && (
            <div className='flex items-center gap-1.5'>
              {onEdit && (
                <button
                  type='button'
                  onClick={() => onEdit(review)}
                  className='text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer'
                >
                  Chỉnh sửa
                </button>
              )}
              <span className='text-muted-foreground/40 text-[10px]'>•</span>
              {onDelete && (
                <button
                  type='button'
                  onClick={() => onDelete(review)}
                  className='text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer'
                >
                  Xóa
                </button>
              )}
            </div>
          )}
          <div className='flex items-center gap-1 text-[10px] text-muted-foreground font-medium whitespace-nowrap'>
            <span>{review.date}</span>
            {review.is_edited && (
              <span className='text-[10px] text-muted-foreground/70 italic'>(đã chỉnh sửa)</span>
            )}
          </div>
        </div>
      </div>

      {/* Review Comment Body with natural wrapping */}
      <p className='text-xs text-secondary-foreground leading-relaxed break-words whitespace-normal'>
        {review.comment}
      </p>

      {/* Review Attached Photos */}
      {review.images && review.images.length > 0 && (
        <div className='flex items-center gap-2 pt-1 overflow-x-auto pb-1'>
          {review.images.map((imgUrl, imgIdx) => (
            <div
              key={imgIdx}
              onClick={() => onOpenImage(review.images || [], imgIdx)}
              className='relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border/80 bg-muted cursor-pointer flex-shrink-0 group hover:border-amber-gold/60 transition-all shadow-xs'
            >
              <ShopImage
                src={imgUrl}
                alt={`Ảnh đánh giá từ ${review.author}`}
                imageClassName='object-cover group-hover:scale-105 transition-transform duration-200'
                sizes='(max-width: 640px) 64px, 80px'
              />
            </div>
          ))}
        </div>
      )}

      {/* Helpful Vote Button */}
      {onToggleLike && (
        <div className='flex items-center gap-2 pt-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => onToggleLike(review)}
            className={cn(
              'rounded-full h-7 px-2.5 text-[11px] font-medium gap-1.5 border transition-all cursor-pointer shadow-none',
              review.liked_by_me
                ? 'bg-amber-gold/15 text-amber-gold border-amber-gold/40 hover:bg-amber-gold/25'
                : 'bg-background/60 hover:bg-secondary border-border/60 text-muted-foreground hover:text-foreground'
            )}
          >
            <ThumbsUp
              size={12}
              className={cn(
                'transition-colors',
                review.liked_by_me ? 'fill-amber-gold text-amber-gold' : 'text-muted-foreground'
              )}
            />
            <span>Hữu ích{review.like_count && review.like_count > 0 ? ` (${review.like_count})` : ''}</span>
          </Button>
        </div>
      )}
    </motion.div>
  );
}
