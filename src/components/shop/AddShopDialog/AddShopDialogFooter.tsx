import { Check, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface AddShopDialogFooterProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
  isUploadingPhotos?: boolean;
}

export function AddShopDialogFooter({
  isEditMode,
  isSubmitting,
  isSubmitDisabled,
  onCancel,
  isUploadingPhotos
}: AddShopDialogFooterProps) {
  return (
    <DialogFooter className='p-0 md:px-5 md:sm:px-6 md:py-3.5 md:border-t md:border-border/80 bg-card flex-shrink-0'>
      {/* MOBILE ( < md ): Sticky two-button row: "Hủy" (outline, flex-1) and primary submit (flex-[2]) */}
      <div className='md:hidden w-full flex items-center gap-2.5 px-4 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-card border-t border-border/60 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isSubmitting || isUploadingPhotos}
          className='flex-1 h-11 min-h-[44px] rounded-xl text-xs font-semibold border-input bg-secondary/50 text-foreground hover:bg-secondary cursor-pointer'
        >
          Hủy
        </Button>
        <Button
          type='submit'
          form='add-shop-form'
          disabled={isSubmitting || isSubmitDisabled || isUploadingPhotos}
          className='flex-[2] h-11 min-h-[44px] rounded-xl text-xs font-bold bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50'
        >
          {isUploadingPhotos ? (
            <>
              <Loader2 size={15} className='animate-spin' />
              <span>Đang tải ảnh lên...</span>
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 size={15} className='animate-spin' />
              <span>{isEditMode ? 'Đang lưu...' : 'Đang gửi...'}</span>
            </>
          ) : (
            <>
              {isEditMode ? (
                <Check size={15} strokeWidth={2.5} />
              ) : (
                <Plus size={15} strokeWidth={2.5} />
              )}
              <span>{isEditMode ? 'Lưu thay đổi' : 'Thêm quán cà phê'}</span>
            </>
          )}
        </Button>
      </div>

      {/* TABLET / DESKTOP ( >= md ): Preserved right-aligned footer */}
      <div className='hidden md:flex items-center justify-end gap-2.5 w-full'>
        <Button
          type='button'
          variant='ghost'
          onClick={onCancel}
          disabled={isSubmitting || isUploadingPhotos}
          className='rounded-xl text-xs h-9 px-4 cursor-pointer'
        >
          Hủy bỏ
        </Button>
        <Button
          type='submit'
          form='add-shop-form'
          disabled={isSubmitting || isSubmitDisabled || isUploadingPhotos}
          className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl h-9 px-5 shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
        >
          {isUploadingPhotos ? (
            <>
              <Loader2 size={14} className='animate-spin' />
              <span>Đang tải ảnh lên...</span>
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 size={14} className='animate-spin' />
              <span>{isEditMode ? 'Đang lưu thay đổi...' : 'Đang gửi thông tin...'}</span>
            </>
          ) : (
            <>
              {isEditMode ? (
                <Check size={14} strokeWidth={2.5} />
              ) : (
                <Plus size={14} strokeWidth={2.5} />
              )}
              <span>{isEditMode ? 'Lưu thay đổi' : 'Thêm quán cà phê'}</span>
            </>
          )}
        </Button>
      </div>
    </DialogFooter>
  );
}
