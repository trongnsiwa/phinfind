'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Star,
  Camera,
  ImagePlus,
  Loader2,
  Send,
  X,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

export interface ReviewItem {
  id?: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  highlight?: string;
  comment: string;
  images?: string[];
  isUserSubmission?: boolean;
}

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: CoffeeShop;
  onSuccess?: (newReview?: ReviewItem) => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  shop,
  onSuccess,
}: ReviewModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile, isAuthenticated } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (!open) {
      setFormError('');
      setIsSubmitting(false);
    }
  }, [open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      toast.error('Vui lòng đăng nhập để tải ảnh lên.');
      return;
    }

    const availableSlots = 3 - uploadedImages.length;
    if (availableSlots <= 0) {
      toast.error('Bạn chỉ có thể tải lên tối đa 3 hình ảnh cho mỗi đánh giá.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast.warning(`Chỉ có thể thêm tối đa ${availableSlots} ảnh nữa.`);
    }

    setIsUploadingImages(true);
    const toastId = toast.loading(`Đang tải lên ${filesToUpload.length} ảnh...`);
    const newUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Ảnh "${file.name}" vượt quá dung lượng 5MB.`, { id: toastId });
          continue;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type.toLowerCase())) {
          toast.error(`Ảnh "${file.name}" không đúng định dạng (hỗ trợ JPG, PNG, WEBP).`, { id: toastId });
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 20);
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const filePath = `reviews/${user.id}/${timestamp}_${randomStr}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('shop-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Lỗi tải ảnh:', uploadError);
          toast.error(`Không thể tải "${file.name}": ${uploadError.message}`, { id: toastId });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('shop-photos')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          newUrls.push(publicUrlData.publicUrl);
        }
      }

      if (newUrls.length > 0) {
        setUploadedImages((prev) => [...prev, ...newUrls].slice(0, 3));
        toast.success(`Đã thêm thành công ${newUrls.length} ảnh!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      console.error('Lỗi tải ảnh:', err);
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.', { id: toastId });
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast('Yêu cầu đăng nhập', {
        description: 'Đăng nhập để chia sẻ câu chuyện cà phê của bạn cùng cộng đồng.',
        action: {
          label: 'Đăng nhập',
          onClick: () => router.push(APP_ROUTES.LOGIN),
        },
      });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setFormError('Vui lòng chọn số sao đánh giá từ 1 đến 5.');
      toast.error('Vui lòng chọn số sao đánh giá từ 1 đến 5.');
      return;
    }

    if (!comment || comment.trim().length < 3) {
      setFormError('Vui lòng viết ít nhất 3 ký tự cho bài đánh giá của bạn.');
      toast.error('Vui lòng viết ít nhất 3 ký tự cho bài đánh giá của bạn.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      const placeId = shop.place_id || shop.id;
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_place_id: placeId,
          rating,
          comment: comment.trim(),
          images: uploadedImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không thể gửi đánh giá. Vui lòng thử lại.');
      }

      const returned = data.review;
      const newReview: ReviewItem = {
        id: returned?.id || String(Date.now()),
        author:
          returned?.author ||
          returned?.profiles?.full_name ||
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Bạn',
        avatar:
          returned?.avatar ||
          returned?.profiles?.avatar_url ||
          profile?.avatar_url ||
          user.user_metadata?.avatar_url ||
          undefined,
        rating: returned?.rating || rating,
        date: 'Vừa xong',
        highlight: 'Đánh giá của bạn',
        comment: comment.trim(),
        images: returned?.images || uploadedImages,
        isUserSubmission: true,
      };

      // Reset state
      setComment('');
      setRating(5);
      setUploadedImages([]);
      setFormError('');
      onOpenChange(false);

      queryClient.invalidateQueries({ queryKey: ['shops', 'reviews', placeId] });
      onSuccess?.(newReview);
      toast.success('Cảm ơn bạn! Đánh giá của bạn đã được đăng tải.');
    } catch (err: any) {
      const msg = err.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md w-full p-5 sm:p-6 bg-card border-border shadow-2xl rounded-2xl sm:rounded-3xl'>
        <DialogHeader className='space-y-1 text-left border-b border-border/50 pb-3 pr-6'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold shadow-xs flex-shrink-0'>
              <Edit3 size={16} />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground leading-snug'>
                Viết Đánh Giá Của Bạn
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Chia sẻ trải nghiệm thực tế tại {shop.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmitReview} className='space-y-4 pt-1'>
          {/* User Reviewer Identity Banner */}
          {isAuthenticated && (
            <div className='flex items-center gap-2.5 bg-secondary/40 p-2.5 rounded-xl border border-border/50'>
              <div className='w-7 h-7 rounded-full overflow-hidden border border-amber-gold/40 bg-muted flex-shrink-0 flex items-center justify-center'>
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <img
                    src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                    alt='Ảnh đại diện'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-amber-gold/20 flex items-center justify-center text-amber-gold text-xs font-bold'>
                    {(profile?.full_name || user?.user_metadata?.full_name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <span className='text-xs text-muted-foreground truncate'>
                Đánh giá dưới tên{' '}
                <strong className='text-foreground font-semibold'>
                  {profile?.full_name || user?.user_metadata?.full_name || 'Bạn'}
                </strong>
              </span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-secondary/40 p-3 rounded-xl border border-border/50'>
            <span className='text-xs font-semibold text-foreground flex items-center gap-1'>
              <span>Đánh giá tổng quan</span>
              <span className='text-rose-500'>*</span>
            </span>
            <div className='flex items-center gap-1 sm:gap-1.5'>
              <div
                role='radiogroup'
                aria-label='Chọn số sao đánh giá'
                className='flex items-center gap-0.5 sm:gap-1'
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type='button'
                      role='radio'
                      aria-checked={rating === star}
                      aria-label={`Đánh giá ${star} sao`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className='p-1 rounded-lg text-amber-gold hover:scale-125 active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold cursor-pointer touch-manipulation'
                    >
                      <Star
                        size={24}
                        className={cn(
                          'transition-colors duration-150',
                          active
                            ? 'fill-amber-gold text-amber-gold drop-shadow-[0_1px_2px_rgba(184,134,11,0.25)]'
                            : 'text-muted-foreground/30 hover:text-amber-gold/50'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <span className='text-xs font-bold text-foreground ml-1.5 min-w-[38px] text-right bg-background/80 px-2 py-0.5 rounded-md border border-border/60'>
                {hoverRating || rating} / 5
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='modal-review-comment'
                className='text-xs font-semibold text-foreground flex items-center gap-1'
              >
                <span>Nội dung cảm nhận</span>
                <span className='text-rose-500'>*</span>
              </label>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  comment.trim().length > 0 && comment.trim().length < 3
                    ? 'text-rose-500 font-semibold'
                    : 'text-muted-foreground'
                )}
              >
                {comment.trim().length < 3
                  ? `Tối thiểu 3 ký tự (${comment.trim().length}/3)`
                  : `${comment.trim().length} ký tự`}
              </span>
            </div>
            <textarea
              id='modal-review-comment'
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder='Chia sẻ cảm nhận của bạn về hương vị, không gian, dịch vụ...'
              rows={4}
              className={cn(
                'w-full bg-secondary/50 border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20 resize-none transition-all',
                formError ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-border/70 hover:border-border'
              )}
            />
            {formError && (
              <p className='text-[11px] text-rose-500 font-medium flex items-center gap-1 pt-0.5'>
                <span>⚠️</span>
                <span>{formError}</span>
              </p>
            )}
          </div>

          {/* Image Upload Section */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                <Camera size={13} className='text-amber-gold' />
                <span>Hình ảnh thực tế</span>
                <span className='text-[10px] text-muted-foreground font-normal'>(Tối đa 3 ảnh)</span>
              </label>
              <span className='text-[10px] text-muted-foreground font-medium'>
                {uploadedImages.length}/3 ảnh
              </span>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              {uploadedImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className='relative w-16 h-16 rounded-xl overflow-hidden border border-border/80 bg-muted shadow-xs group'
                >
                  <img
                    src={imgUrl}
                    alt={`Ảnh đánh giá ${idx + 1}`}
                    className='w-full h-full object-cover'
                  />
                  <button
                    type='button'
                    onClick={() => handleRemoveImage(idx)}
                    className='absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-xs cursor-pointer'
                    aria-label='Xóa ảnh này'
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              {uploadedImages.length < 3 && (
                <button
                  type='button'
                  disabled={isUploadingImages || isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  className='w-16 h-16 rounded-xl border-2 border-dashed border-border/80 hover:border-amber-gold/60 bg-secondary/30 hover:bg-secondary/60 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none'
                >
                  {isUploadingImages ? (
                    <Loader2 size={16} className='animate-spin text-amber-gold' />
                  ) : (
                    <>
                      <ImagePlus size={16} className='text-amber-gold' />
                      <span className='text-[9px] font-semibold'>Thêm ảnh</span>
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp,image/jpg'
                multiple
                className='hidden'
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-2.5 pt-2 border-t border-border/50'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className='text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-4 h-9 font-medium cursor-pointer transition-colors'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || comment.trim().length < 3}
              className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl px-5 h-9 shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all'
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className='animate-spin' />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Gửi đánh giá</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
