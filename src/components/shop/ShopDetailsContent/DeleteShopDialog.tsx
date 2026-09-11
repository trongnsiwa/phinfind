'use client';

import { Loader2, Trash2 } from 'lucide-react';
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

interface DeleteShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName: string;
  isPending: boolean;
  onConfirmDelete: () => void;
}

export function DeleteShopDialog({
  open,
  onOpenChange,
  shopName,
  isPending,
  onConfirmDelete
}: DeleteShopDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='bg-card text-card-foreground border-border max-w-md rounded-2xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-foreground text-base sm:text-lg font-bold'>
            Xác nhận xóa quán cà phê
          </AlertDialogTitle>
          <AlertDialogDescription className='text-muted-foreground text-xs sm:text-sm'>
            Bạn có chắc chắn muốn xóa quán &ldquo;{shopName}&rdquo; không? Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn thông tin quán cùng tất cả lượt đánh giá liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-row gap-2 justify-end mt-4'>
          <AlertDialogCancel
            disabled={isPending}
            className='rounded-xl text-xs h-9 px-4 cursor-pointer mt-0'
          >
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirmDelete();
            }}
            disabled={isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs font-bold h-9 px-4 cursor-pointer disabled:opacity-50 flex items-center gap-1.5'
          >
            {isPending ? (
              <>
                <Loader2 size={14} className='animate-spin' />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Xóa quán</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
