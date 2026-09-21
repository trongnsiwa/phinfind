'use client';

// UX: discard-changes uses outline (recoverable); delete uses solid destructive fill (irreversible).

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

export const CANCEL_CONFIRM_COPY = {
  create: {
    title: 'Hủy bỏ thêm quán?',
    description: 'Bạn có chắc muốn hủy? Mọi thông tin đã nhập sẽ bị mất.',
    confirmLabel: 'Hủy bỏ',
    continueLabel: 'Tiếp tục'
  },
  edit: {
    title: 'Hủy bỏ chỉnh sửa?',
    description: 'Bạn có chắc muốn hủy? Mọi thay đổi chưa lưu sẽ bị mất.',
    confirmLabel: 'Bỏ thay đổi',
    continueLabel: 'Tiếp tục'
  }
} as const;

export interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  onConfirm: () => void;
}

export function CancelConfirmDialog({
  open,
  onOpenChange,
  isEditMode,
  onConfirm
}: CancelConfirmDialogProps) {
  const copy = CANCEL_CONFIRM_COPY[isEditMode ? 'edit' : 'create'];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='bg-card text-card-foreground border-border w-[calc(100vw-2rem)] max-w-sm sm:max-w-md mx-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6'>
        <AlertDialogHeader className='space-y-2 text-center'>
          <AlertDialogTitle className='text-base font-bold text-foreground text-center'>
            {copy.title}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-sm text-muted-foreground leading-relaxed text-center'>
            {copy.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2.5 mt-2 sm:mt-0'>
          {/* Safe action: continue editing, primary visually prominent (amber-gold) */}
          <AlertDialogCancel
            autoFocus
            className='order-1 sm:order-2 w-full sm:w-auto h-11 min-h-[44px] px-4 rounded-xl text-sm font-bold bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground border-transparent shadow-sm'
          >
            {copy.continueLabel}
          </AlertDialogCancel>
          {/* Destructive action: discard changes, subtle outline styling */}
          <AlertDialogAction
            onClick={onConfirm}
            className='order-2 sm:order-1 w-full sm:w-auto h-11 min-h-[44px] px-4 rounded-xl text-sm font-semibold bg-transparent border border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 shadow-none'
          >
            {copy.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
