'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, MapPin } from 'lucide-react';
import { CoffeeShop } from '@/types/shop';
import { cn } from '@/lib/utils';

export interface VisitNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: CoffeeShop;
  existingNote?: string | null;
  onConfirm: (note: string | null) => void;
}

export function VisitNoteDialog({
  open,
  onOpenChange,
  shop,
  existingNote,
  onConfirm,
}: VisitNoteDialogProps) {
  const [note, setNote] = useState(existingNote || '');

  useEffect(() => {
    if (open) {
      setNote(existingNote || '');
    }
  }, [open, existingNote]);

  const handleSave = () => {
    const trimmed = note.trim();
    if (!trimmed || trimmed.length > 200) return;
    onConfirm(trimmed);
    onOpenChange(false);
  };

  const handleSkipOrDelete = () => {
    onConfirm(null);
    onOpenChange(false);
  };

  const hasExistingNote = Boolean(existingNote && existingNote.trim().length > 0);
  const isValid = note.trim().length > 0 && note.length <= 200;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[94vw] sm:w-full max-w-md bg-card border-border shadow-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4'>
        <DialogHeader className='space-y-1.5 text-left'>
          <DialogTitle className='font-sans font-bold text-base sm:text-lg text-foreground flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center text-teal shrink-0'>
              <CheckCircle2 size={16} />
            </div>
            <span>{hasExistingNote ? 'Chỉnh sửa ghi chú ghé thăm' : 'Đánh dấu đã ghé thăm'}</span>
          </DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground'>
            Lưu lại cảm nhận hoặc trải nghiệm của bạn tại quán cà phê này.
          </DialogDescription>
        </DialogHeader>

        {/* Shop Context Header */}
        <div className='p-3 rounded-xl bg-secondary/40 border border-border/50 space-y-0.5'>
          <p className='text-xs font-bold text-foreground truncate'>{shop.name}</p>
          {shop.address && (
            <p className='text-[11px] text-muted-foreground truncate flex items-center gap-1'>
              <MapPin size={11} className='shrink-0 text-amber-gold' />
              <span className='truncate'>{shop.address}</span>
            </p>
          )}
        </div>

        {/* Note Input */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='visit-note-input' className='text-xs font-semibold text-foreground'>
              Ghi chú của bạn
            </Label>
            <span
              className={cn(
                'text-[10px] text-muted-foreground',
                note.length >= 200 && 'text-destructive font-semibold'
              )}
            >
              {note.length}/200 ký tự
            </span>
          </div>

          <Textarea
            id='visit-note-input'
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            className='min-h-[90px] max-h-[140px] text-xs border-border bg-secondary/30 rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold resize-y'
          />
        </div>

        {/* Actions */}
        <DialogFooter className='flex-row items-center justify-end gap-2 pt-2 border-t border-border/60 sm:space-x-0'>
          <Button
            type='button'
            variant='ghost'
            onClick={handleSkipOrDelete}
            className={cn(
              'h-9 px-3 text-xs font-medium rounded-xl cursor-pointer',
              hasExistingNote
                ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {hasExistingNote ? 'Xóa ghi chú' : 'Bỏ qua'}
          </Button>

          <Button
            type='button'
            onClick={handleSave}
            disabled={!isValid}
            className='h-9 px-4 text-xs font-bold bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50'
          >
            {hasExistingNote ? 'Cập nhật ghi chú' : 'Lưu ghi chú'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
