import { Coffee, X } from 'lucide-react';
import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AddShopDialogHeaderProps {
  isEditMode: boolean;
  onClose?: () => void;
  disabled?: boolean;
}

export function AddShopDialogHeader({ isEditMode, onClose, disabled }: AddShopDialogHeaderProps) {
  return (
    <DialogHeader className='p-0 md:px-5 md:sm:px-6 md:pt-5 md:pb-3 border-b border-border/80 flex-shrink-0 h-14 md:h-auto flex items-center justify-between md:block bg-card'>
      {/* MOBILE ( < md ): Single compact row <= 56px with left title & 44x44 close button */}
      <div className='md:hidden flex items-center justify-between w-full h-14 px-4'>
        <DialogTitle className='font-sans font-bold text-base text-foreground'>
          {isEditMode ? 'Chỉnh sửa quán' : 'Thêm Quán'}
        </DialogTitle>
        <DialogClose asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            disabled={disabled}
            onClick={onClose}
            aria-label='Đóng biểu mẫu'
            className='w-11 h-11 min-h-[44px] min-w-[44px] p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all disabled:pointer-events-none disabled:opacity-50'
          >
            <X size={18} />
          </Button>
        </DialogClose>
      </div>

      {/* TABLET / DESKTOP ( >= md ): Preserved layout with decorative icon, title & subtitle */}
      <div className='hidden md:flex items-center gap-2.5'>
        <div className='w-9 h-9 rounded-2xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold flex-shrink-0'>
          <Coffee size={20} />
        </div>
        <div>
          <DialogTitle className='font-sans font-bold text-lg sm:text-xl text-foreground'>
            {isEditMode ? 'Chỉnh sửa quán cà phê' : 'Thêm Quán Cà Phê Mới'}
          </DialogTitle>
          <DialogDescription
            id='add-shop-dialog-desc'
            className='text-xs text-muted-foreground mt-0.5'
          >
            {isEditMode
              ? 'Cập nhật thông tin quán cà phê của bạn trên PhinFind'
              : 'Chia sẻ không gian cà phê yêu thích của bạn cùng cộng đồng PhinFind'}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}
