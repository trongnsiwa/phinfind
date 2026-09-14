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
      <AlertDialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className='bg-card text-card-foreground border-border'
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            Xác nhận xóa quán cà phê
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa quán &ldquo;{shopName}&rdquo; không? Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn thông tin quán cùng tất cả lượt đánh giá liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirmDelete();
            }}
            disabled={isPending}
            className='disabled:opacity-50 flex items-center justify-center gap-1.5'
          >
            {isPending ? (
              <>
                <Loader2 size={16} className='animate-spin' />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Xóa quán</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
