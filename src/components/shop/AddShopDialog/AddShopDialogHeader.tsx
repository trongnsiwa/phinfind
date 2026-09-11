import { Coffee } from 'lucide-react';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface AddShopDialogHeaderProps {
  isEditMode: boolean;
}

export function AddShopDialogHeader({ isEditMode }: AddShopDialogHeaderProps) {
  return (
    <DialogHeader className='px-5 sm:px-6 pt-5 pb-3 border-b border-border/80 flex-shrink-0'>
      <div className='flex items-center gap-2.5'>
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
