import { Check, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface AddShopDialogFooterProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
}

export function AddShopDialogFooter({
  isEditMode,
  isSubmitting,
  isSubmitDisabled,
  onCancel
}: AddShopDialogFooterProps) {
  return (
    <DialogFooter className='px-5 sm:px-6 py-3.5 border-t border-border/80 bg-card flex-shrink-0 flex items-center justify-end gap-2.5'>
      <Button
        type='button'
        variant='ghost'
        onClick={onCancel}
        disabled={isSubmitting}
        className='rounded-xl text-xs h-9 px-4 cursor-pointer'
      >
        Hủy bỏ
      </Button>
      <Button
        type='submit'
        form='add-shop-form'
        disabled={isSubmitting || isSubmitDisabled}
        className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl h-9 px-5 shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
      >
        {isSubmitting ? (
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
    </DialogFooter>
  );
}
