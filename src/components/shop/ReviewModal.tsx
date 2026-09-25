'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Camera, ImagePlus, Loader2, PenLine, X, Edit3 } from 'lucide-react';
import { ShopImage } from '@/components/common/ShopImage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useEditReview } from '@/hooks/useShops';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { APP_ROUTES, REVIEW_TAGS, normalizeReviewTag } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';

export const RATING_DESCRIPTORS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Ngon',
  5: 'Xuất sắc',
};

export const PRESET_QUICK_TAGS = REVIEW_TAGS;

export interface ReviewItem {
  id?: string;
  user_id?: string;
  author: string;
  avatar?: string;
  username?: string;
  rating: number;
  date: string;
  highlight?: string;
  comment: string;
  images?: string[];
  tags?: string[];
  isUserSubmission?: boolean;
  like_count?: number;
  liked_by_me?: boolean;
  is_edited?: boolean;
  visitor_visit_count?: number;
}

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: CoffeeShop;
  existingReview?: ReviewItem;
  onSuccess?: (newReview?: ReviewItem) => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  shop,
  existingReview,
  onSuccess,
}: ReviewModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile, isAuthenticated } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const editReviewMutation = useEditReview();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens or closes, and reset guard state
  useEffect(() => {
    setShowCancelConfirm(false);
    if (open) {
      if (existingReview) {
        setRating(existingReview.rating || 5);
        setComment(existingReview.comment || '');
        setUploadedImages(existingReview.images || []);
        const normalizedTags = (existingReview.tags || [])
          .map(normalizeReviewTag)
          .filter((t): t is string => Boolean(t));
        setSelectedTags(normalizedTags);
      } else {
        setRating(5);
        setComment('');
        setUploadedImages([]);
        setSelectedTags([]);
      }
    }
    setFormError('');
    setIsSubmitting(false);
  }, [open, existingReview]);

  const hasUnsavedChanges = useMemo(() => {
    if (existingReview) {
      const origComment = (existingReview.comment || '').trim();
      const origRating = existingReview.rating || 5;
      const origImages = existingReview.images || [];
      const origTags = (existingReview.tags || [])
        .map(normalizeReviewTag)
        .filter((t): t is string => Boolean(t));
      const imagesChanged =
        uploadedImages.length !== origImages.length ||
        uploadedImages.some((img, i) => img !== origImages[i]);
      const tagsChanged =
        selectedTags.length !== origTags.length ||
        selectedTags.some((t, i) => t !== origTags[i]);
      return (
        comment.trim() !== origComment ||
        rating !== origRating ||
        imagesChanged ||
        tagsChanged
      );
    }
    return (
      comment.trim().length > 0 ||
      rating !== 5 ||
      uploadedImages.length > 0 ||
      selectedTags.length > 0
    );
  }, [existingReview, comment, rating, uploadedImages, selectedTags]);

  const handleRequestClose = () => {
    if (isSubmitting) return;
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      handleConfirmCancel();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
      setUploadedImages(existingReview.images || []);
      const normalizedTags = (existingReview.tags || [])
        .map(normalizeReviewTag)
        .filter((t): t is string => Boolean(t));
      setSelectedTags(normalizedTags);
    } else {
      setRating(5);
      setComment('');
      setUploadedImages([]);
      setSelectedTags([]);
    }
    setFormError('');
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 3) {
        toast.info('Chỉ chọn tối đa 3 thẻ');
        return;
      }
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

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
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20);
        const filePath = `reviews/${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('shop-photos')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          toast.error(`Không thể tải "${file.name}": ${uploadError.message}`, { id: toastId });
          continue;
        }

        const { data: publicUrlData } = supabase.storage.from('shop-photos').getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) newUrls.push(publicUrlData.publicUrl);
      }

      if (newUrls.length > 0) {
        setUploadedImages((prev) => [...prev, ...newUrls].slice(0, 3));
        toast.success(`Đã thêm thành công ${newUrls.length} ảnh!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch {
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.', { id: toastId });
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    const placeId = shop.place_id || shop.id;

    if (existingReview?.id) {
      try {
        await editReviewMutation.mutateAsync({
          id: existingReview.id,
          rating,
          comment: comment.trim(),
          images: uploadedImages,
          shop_place_id: placeId,
          tags: selectedTags,
        } as any);
        setSelectedTags([]);
        setShowCancelConfirm(false);
        onOpenChange(false);
      } catch {
        // Handled by mutation toast
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_place_id: placeId,
          rating,
          comment: comment.trim(),
          images: uploadedImages,
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể gửi đánh giá. Vui lòng thử lại.');
      }

      const returned = data.review;
      const newReview: ReviewItem = {
        id: returned?.id || String(Date.now()),
        user_id: user?.id,
        author:
          returned?.author ||
          returned?.profiles?.full_name ||
          profile?.full_name ||
          user?.user_metadata?.full_name ||
          user?.email?.split('@')[0] ||
          'Bạn',
        avatar:
          returned?.avatar ||
          returned?.profiles?.avatar_url ||
          profile?.avatar_url ||
          user?.user_metadata?.avatar_url ||
          undefined,
        username: returned?.username || profile?.username || undefined,
        rating: returned?.rating || rating,
        date: 'Vừa xong',
        highlight: 'Đánh giá của bạn',
        comment: comment.trim(),
        images: returned?.images || uploadedImages,
        tags: selectedTags,
        isUserSubmission: true,
      };

      setComment('');
      setRating(5);
      setUploadedImages([]);
      setSelectedTags([]);
      setFormError('');
      setShowCancelConfirm(false);
      onOpenChange(false);

      queryClient.invalidateQueries({ queryKey: ['shops', 'reviews', placeId] });
      queryClient.invalidateQueries({ queryKey: ['shops', 'reviews', 'infinite', placeId] });
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleRequestClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      {/* RESPONSIVE: w-[94vw] sm:w-full and p-4 sm:p-6 ensure clean margins at 320px */}
      <DialogContent
        onPointerDownOutside={(e) => {
          if (hasUnsavedChanges) {
            e.preventDefault();
            handleRequestClose();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (hasUnsavedChanges) {
            e.preventDefault();
            handleRequestClose();
          }
        }}
        className='w-[94vw] sm:w-full max-w-md p-4 sm:p-6 bg-card border-border shadow-2xl rounded-2xl sm:rounded-3xl'
      >
        <DialogHeader className='space-y-1 text-left border-b border-border/50 pb-3 pr-6'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold shadow-xs flex-shrink-0'>
              <Edit3 size={16} />
            </div>
            <div>
              <DialogTitle className='text-base font-bold text-foreground leading-snug'>
                {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết Đánh Giá Của Bạn'}
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                {existingReview
                  ? `Cập nhật trải nghiệm của bạn tại ${shop.name}`
                  : `Chia sẻ trải nghiệm thực tế tại ${shop.name}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmitReview} className='space-y-4 pt-1'>
          {/* User Reviewer Identity Banner */}
          {isAuthenticated && (
            <div className='flex items-center gap-2.5 bg-secondary/40 p-2.5 rounded-xl border border-border/50'>
              <ShopImage
                src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                alt='Ảnh đại diện'
                fallback={
                  <div className='w-full h-full bg-amber-gold/20 flex items-center justify-center text-amber-gold text-xs font-bold'>
                    {(profile?.full_name || user?.user_metadata?.full_name || 'U')[0].toUpperCase()}
                  </div>
                }
                sizes="28px"
                className="w-7 h-7 rounded-full overflow-hidden border border-amber-gold/40 bg-muted flex-shrink-0"
                imageClassName="object-cover"
              />
              <span className='text-xs text-muted-foreground truncate'>
                Đánh giá dưới tên{' '}
                <strong className='text-foreground font-semibold'>
                  {profile?.full_name || user?.user_metadata?.full_name || 'Bạn'}
                </strong>
              </span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div className='bg-secondary/40 p-3 rounded-xl border border-border/50 space-y-2'>
            {/* Row 1: Header row with label on the left and fixed-width descriptor pill on the right */}
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-foreground flex items-center gap-1 whitespace-nowrap shrink-0'>
                <span>Đánh giá</span>
                <span className='text-rose-500'>*</span>
              </span>
              <span className='text-xs font-semibold text-amber-gold w-24 min-w-[96px] text-center bg-amber-gold/10 px-2.5 py-1 rounded-full border border-amber-gold/30 whitespace-nowrap shrink-0 transition-colors'>
                {RATING_DESCRIPTORS[hoverRating || rating] || 'Xuất sắc'}
              </span>
            </div>

            {/* Row 2: Five-star picker taking full width, justified to start */}
            <div
              role='radiogroup'
              aria-label='Chọn số sao đánh giá'
              className='flex items-center justify-start gap-1 w-full'
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  // RESPONSIVE: 44px minimum tap target zone with p-1.5 for touch accessibility
                  <button
                    key={star}
                    type='button'
                    role='radio'
                    aria-checked={rating === star}
                    aria-label={`Đánh giá ${star} sao`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className='min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded-lg text-amber-gold hover:scale-125 active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold cursor-pointer touch-manipulation'
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
                {comment.trim().length === 0
                  ? 'Chia sẻ cảm nhận của bạn'
                  : comment.trim().length < 3
                    ? `Cần thêm ${3 - comment.trim().length} ký tự`
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

          {/* Quick-tag Chips */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-foreground'>
                Thẻ nhanh (tùy chọn)
              </span>
              <span className='text-[10px] text-muted-foreground font-medium'>
                {selectedTags.length}/3
              </span>
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              {PRESET_QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type='button'
                    onClick={() => handleToggleTag(tag.id)}
                    className={cn(
                      'inline-flex items-center justify-center px-3 py-1.5 min-h-[44px] sm:min-h-[32px] rounded-full border text-xs font-medium transition-colors cursor-pointer select-none',
                      isSelected
                        ? 'bg-amber-gold text-primary-foreground border-amber-gold'
                        : 'bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-secondary/80'
                    )}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
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
                  <ShopImage
                    src={imgUrl}
                    alt={`Ảnh đánh giá ${idx + 1}`}
                    imageClassName='object-cover'
                    sizes="64px"
                  />
                  <button
                    type='button'
                    onClick={() => handleRemoveImage(idx)}
                    className='absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-xs cursor-pointer z-10'
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
              onClick={handleRequestClose}
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
                  <span>{existingReview ? 'Đang lưu...' : 'Đang gửi...'}</span>
                </>
              ) : (
                <>
                  <PenLine size={13} />
                  <span>{existingReview ? 'Lưu thay đổi' : 'Gửi đánh giá'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className='bg-card text-card-foreground border-border w-[calc(100vw-2rem)] max-w-sm sm:max-w-md mx-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6'>
          <AlertDialogHeader className='space-y-2 text-center'>
            <AlertDialogTitle className='text-base font-bold text-foreground text-center'>
              Hủy bỏ đánh giá?
            </AlertDialogTitle>
            <AlertDialogDescription className='text-sm text-muted-foreground leading-relaxed text-center'>
              Bạn có chắc muốn hủy? Nội dung đã nhập sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2.5 mt-2 sm:mt-0'>
            {/* Safe action: continue editing, primary visually prominent (amber-gold) */}
            <AlertDialogCancel
              autoFocus
              className='order-1 sm:order-2 w-full sm:w-auto h-11 min-h-[44px] px-4 rounded-xl text-sm font-bold bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground border-transparent shadow-sm'
            >
              Tiếp tục
            </AlertDialogCancel>
            {/* Destructive action: discard changes, subtle outline styling */}
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className='order-2 sm:order-1 w-full sm:w-auto h-11 min-h-[44px] px-4 rounded-xl text-sm font-semibold bg-transparent border border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 shadow-none'
            >
              Hủy bỏ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
