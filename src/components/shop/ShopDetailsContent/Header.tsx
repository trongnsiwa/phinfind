'use client';

import {
  Clock,
  Footprints,
  MapPin,
  MoreVertical,
  Pencil,
  Star,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import type { CoffeeShop } from '@/types/shop';
import type { ComputedSchedule } from './types';

interface HeaderProps {
  shop: CoffeeShop;
  scheduleInfo: ComputedSchedule;
  isAuthenticated: boolean;
  isOwner: boolean;
  hasPendingSuggestion: boolean;
  onEditShop: () => void;
  onDeleteShop: () => void;
  onSuggestEdit: () => void;
}

export function Header({
  shop,
  scheduleInfo,
  isAuthenticated,
  isOwner,
  hasPendingSuggestion,
  onEditShop,
  onDeleteShop,
  onSuggestEdit
}: HeaderProps) {
  const hasRating = typeof shop.rating === 'number' && shop.rating > 0;
  const distanceText =
    shop.distance_text && shop.distance_text !== '0 m' ? shop.distance_text : 'Gần đây';
  const isOpenNow = scheduleInfo.isOpenNow;

  return (
    <div className='space-y-1.5'>
      <div className='flex items-start justify-between gap-2'>
        <h2 className='flex-1 min-w-0 font-sans font-bold text-lg sm:text-xl text-foreground tracking-tight leading-snug break-words'>
          {shop.name}
        </h2>

        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Tùy chọn quán cà phê'
                className='h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-1 focus-visible:ring-amber-gold focus-visible:ring-offset-0 flex-shrink-0 cursor-pointer'
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48 bg-popover text-popover-foreground border-border'>
              {isOwner ? (
                <>
                  <DropdownMenuItem
                    onClick={onEditShop}
                    className='cursor-pointer gap-2'
                  >
                    <Pencil size={14} className='text-muted-foreground' />
                    <span>Chỉnh sửa quán</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDeleteShop}
                    className='cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive'
                  >
                    <Trash2 size={14} />
                    <span>Xóa quán</span>
                  </DropdownMenuItem>
                </>
              ) : hasPendingSuggestion ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <DropdownMenuItem
                          disabled
                          className='gap-2 opacity-50 cursor-not-allowed'
                        >
                          <Pencil size={14} className='text-muted-foreground' />
                          <span>Đề xuất chỉnh sửa</span>
                        </DropdownMenuItem>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='left'>
                      <p>Bạn đã có một đề xuất đang chờ duyệt</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem
                  onClick={onSuggestEdit}
                  className='cursor-pointer gap-2'
                >
                  <Pencil size={14} className='text-muted-foreground' />
                  <span>Đề xuất chỉnh sửa</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className='text-xs text-secondary-foreground flex items-start gap-1.5'>
        <MapPin size={13} className='text-amber-gold flex-shrink-0 mt-0.5' />
        <span className='break-words leading-relaxed'>{shop.address || 'Chưa có địa chỉ'}</span>
      </div>

      {/* Quick Metrics Bar */}
      <div className='flex flex-wrap items-center gap-1.5 pt-0.5'>
        {shop.verified === false && (
          <Badge
            variant='outline'
            className='bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 flex items-center gap-1 font-bold text-[11px] py-0.5 px-2 rounded-xl shadow-xs flex-shrink-0 whitespace-nowrap'
          >
            <Clock size={11} className='text-amber-500 flex-shrink-0' />
            <span className='whitespace-nowrap'>Chờ xác minh</span>
          </Badge>
        )}

        <Badge
          variant='outline'
          className='bg-secondary text-amber-gold border-border flex items-center gap-1 font-bold text-[11px] py-0.5 px-2 rounded-xl shadow-xs flex-shrink-0 whitespace-nowrap'
        >
          {hasRating ? (
            <>
              <Star size={11} className='fill-amber-gold text-amber-gold flex-shrink-0' />
              <span className='whitespace-nowrap'>{shop.rating?.toFixed(1)}</span>
              {shop.total_ratings ? (
                <span className='text-[10px] text-muted-foreground font-normal whitespace-nowrap'>
                  ({shop.total_ratings})
                </span>
              ) : null}
            </>
          ) : (
            <>
              <Star size={11} className='text-amber-gold/50 flex-shrink-0' />
              <span className='whitespace-nowrap'>Mới</span>
            </>
          )}
        </Badge>

        <Badge
          variant='outline'
          className='bg-secondary text-secondary-foreground border-border flex items-center gap-1 font-medium text-[11px] py-0.5 px-2 rounded-xl shadow-xs flex-shrink-0 whitespace-nowrap'
        >
          <Footprints size={11} className='text-amber-gold/80 flex-shrink-0' />
          <span className='whitespace-nowrap'>{distanceText}</span>
        </Badge>

        <Badge
          variant='outline'
          className='bg-secondary text-secondary-foreground border-border flex items-center gap-1 font-medium text-[11px] py-0.5 px-2 rounded-xl shadow-xs flex-shrink-0 whitespace-nowrap max-w-full'
        >
          <Clock size={11} className='text-amber-gold/80 flex-shrink-0' />
          <span className='whitespace-nowrap truncate'>{isOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa'}</span>
        </Badge>
      </div>
    </div>
  );
}
