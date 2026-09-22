'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  FacebookIcon,
  TelegramIcon,
  XIcon,
  ZaloIcon
} from '@/components/common/SocialIcons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { buildShareTargets, type ShareTarget } from '@/lib/utils/share';

export interface ShareMenuProps {
  url: string;
  title: string;
  triggerClassName?: string;
  labelClassName?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareMenu({
  url,
  title,
  triggerClassName,
  labelClassName = 'truncate',
  align = 'end',
  side = 'top',
  open: openProp,
  onOpenChange
}: ShareMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : internalOpen;
  const isCopyingRef = useRef(false);

  const targets = useMemo(() => buildShareTargets(url, title), [url, title]);

  const isMobileWithNativeShare = () => {
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches;

    return (
      isMobile &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    );
  };

  const handleOpenChange = async (nextOpen: boolean) => {
    if (nextOpen && isMobileWithNativeShare()) {
      try {
        await navigator.share({
          title,
          text: `Khám phá quán cà phê ${title} trên PhinFind!`,
          url
        });
      } catch {
        // Ignore AbortError / user cancellation
      }
      return;
    }

    if (isControlled && onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  const handleTriggerPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (isMobileWithNativeShare()) {
      e.preventDefault();
    }
  };

  const handleTriggerClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobileWithNativeShare()) {
      e.preventDefault();
      try {
        await navigator.share({
          title,
          text: `Khám phá quán cà phê ${title} trên PhinFind!`,
          url
        });
      } catch {
        // Ignore AbortError / user cancellation
      }
      return;
    }

    // In test or non-pointer environments where click doesn't follow pointerDown
    if (!isOpen) {
      if (isControlled && onOpenChange) {
        onOpenChange(true);
      } else {
        setInternalOpen(true);
      }
    }
  };

  const handleCopyLink = async () => {
    if (isCopyingRef.current) return;
    isCopyingRef.current = true;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết vào bộ nhớ tạm!');
    } catch {
      toast.error('Không thể sao chép liên kết.');
    } finally {
      setTimeout(() => {
        isCopyingRef.current = false;
      }, 500);
    }
  };

  const getTargetIcon = (id: ShareTarget['id']) => {
    switch (id) {
      case 'facebook':
        return <FacebookIcon size={16} className='text-amber-gold shrink-0' />;
      case 'x':
        return <XIcon size={16} className='text-amber-gold shrink-0' />;
      case 'zalo':
        return <ZaloIcon size={16} className='text-amber-gold shrink-0' />;
      case 'telegram':
        return <TelegramIcon size={16} className='text-amber-gold shrink-0' />;
      case 'copy':
        return <Copy size={16} className='text-amber-gold shrink-0' />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          data-vaul-no-drag
          onPointerDown={handleTriggerPointerDown}
          onClick={handleTriggerClick}
          aria-label='Chia sẻ'
          title='Chia sẻ'
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full h-11 min-h-[44px] bg-secondary border border-border text-secondary-foreground hover:text-foreground hover:bg-accent hover:border-amber-gold/40 transition-all text-xs font-bold shadow-sm active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            triggerClassName
          )}
        >
          <Share2 size={15} className='text-amber-gold flex-shrink-0' />
          <span className={labelClassName}>Chia sẻ</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={8}
        className='w-52 p-1.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-xl z-50 animate-in fade-in-0 zoom-in-95'
      >
        {targets.map((target) => {
          if (target.id === 'copy') {
            return (
              <DropdownMenuItem
                key={target.id}
                onSelect={handleCopyLink}
                aria-label='Sao chép liên kết'
                className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:text-amber-gold focus:text-amber-gold hover:bg-accent/60 focus:bg-accent/60 min-h-[44px] cursor-pointer transition-colors select-none'
              >
                {getTargetIcon(target.id)}
                <span>{target.label}</span>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={target.id}
              asChild
              className='p-0 min-h-[44px] cursor-pointer rounded-xl'
            >
              <a
                href={target.href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`Chia sẻ qua ${target.label}`}
                className='flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-foreground hover:text-amber-gold focus:text-amber-gold hover:bg-accent/60 focus:bg-accent/60 transition-colors select-none rounded-xl'
              >
                {getTargetIcon(target.id)}
                <span>{target.label}</span>
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
