'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { ReviewData } from '@/hooks/useShops';
import { useUIStore } from '@/stores/useUIStore';
import { APP_ROUTES } from '@/lib/utils/constants';
import { ShopImage } from '@/components/common/ShopImage';

interface PublicReviewCardProps {
  review: ReviewData;
  action?: React.ReactNode;
}

export function PublicReviewCard({ review, action }: PublicReviewCardProps) {
  const openImagePreview = useUIStore((state) => state.openImagePreview);

  const shopHref = review.shop_place_id
    ? APP_ROUTES.SHOP_DETAIL(review.shop_place_id)
    : '#';

  return (
    <Card className="p-4 sm:p-5 bg-card border border-border shadow-card rounded-2xl transition-all hover:border-border/80">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Shop info, rating, and date */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={shopHref}
              className="font-sans font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-gold rounded-xs"
            >
              <span className="truncate">{review.shop_name || 'Quán Cà Phê'}</span>
              <ExternalLink
                size={14}
                className="text-muted-foreground group-hover:text-primary shrink-0"
              />
            </Link>
          </div>

          {review.shop_address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <MapPin size={12} className="shrink-0 text-primary" />
              <span>{review.shop_address}</span>
            </p>
          )}

          {/* Star Rating & Date */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={13}
                  className={
                    star <= review.rating
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-muted-foreground/30 fill-muted-foreground/10'
                  }
                />
              ))}
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1.5">
                {review.rating}.0
              </span>
            </div>

            <span className="text-muted-foreground/40 text-xs">•</span>

            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar size={12} />
              <span>
                {new Date(review.created_at).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
              {review.is_edited && (
                <span className="text-[10px] text-muted-foreground/70 italic">(đã chỉnh sửa)</span>
              )}
            </span>
          </div>
        </div>

        {/* Optional Action (e.g. Delete button on private profile) */}
        {action && <div className="self-end sm:self-start">{action}</div>}
      </div>

      {/* Review Comment */}
      <div className="mt-2.5 pt-2.5 border-t border-border/40">
        <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
          {review.comment}
        </p>
      </div>

      {/* Review Photos (if any) */}
      {review.images && review.images.length > 0 && (
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
          {review.images.map((img, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => openImagePreview(review.images || [], idx)}
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
    </Card>
  );
}
