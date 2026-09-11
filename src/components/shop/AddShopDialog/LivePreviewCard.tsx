import { ChevronDown, Clock, Coffee, Eye, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OpeningPeriod, PriceOption } from './types';

interface LivePreviewCardProps {
  name: string;
  address: string;
  photo?: string;
  price?: PriceOption;
  openNow: boolean;
  computedPeriods: OpeningPeriod[];
  isCustomPerDay: boolean;
  sameOpenTime: string;
  sameCloseTime: string;
}

export function LivePreviewCard({
  name,
  address,
  photo,
  price,
  openNow,
  computedPeriods,
  isCustomPerDay,
  sameOpenTime,
  sameCloseTime
}: LivePreviewCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className='border-t border-border/60 pt-3'>
      <button
        type='button'
        onClick={() => setShowPreview(!showPreview)}
        className='flex items-center justify-between w-full text-left py-1 text-xs font-bold text-foreground hover:text-amber-gold transition-colors cursor-pointer'
      >
        <span className='flex items-center gap-1.5'>
          <Eye size={14} className='text-amber-gold' />
          <span>Xem trước thẻ quán (Live Preview)</span>
        </span>
        <ChevronDown
          size={14}
          className={cn('transition-transform duration-200', showPreview && 'rotate-180')}
        />
      </button>

      {showPreview && (
        <div className='mt-3 p-3 bg-secondary/30 rounded-2xl border border-border/80 space-y-2 animate-in fade-in duration-200'>
          <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
            <span>Mô phỏng hiển thị trên trang Khám phá</span>
            <Badge
              variant='outline'
              className='bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 text-[10px] font-bold'
            >
              <Clock size={10} className='mr-1' /> Chờ xác minh
            </Badge>
          </div>

          <div className='p-3 bg-card rounded-xl border border-border flex items-start gap-3 shadow-sm'>
            <div className='w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border/40'>
              {photo ? (
                <img
                  src={photo}
                  alt='Preview'
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='flex flex-col items-center justify-center text-muted-foreground/50'>
                  <Coffee size={20} />
                  <span className='text-[8px] mt-0.5'>Chưa có ảnh</span>
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='font-bold text-xs text-foreground truncate'>
                {name || (
                  <span className='text-muted-foreground/50 font-normal italic'>
                    Chưa nhập tên quán
                  </span>
                )}
              </h4>
              <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
                {address ? (
                  <>
                    <MapPin size={10} className='inline mr-1 text-amber-gold' />
                    {address}
                  </>
                ) : (
                  <span className='text-muted-foreground/50 italic'>
                    Chưa nhập địa chỉ
                  </span>
                )}
              </p>
              <div className='flex items-center gap-1.5 mt-1.5 flex-wrap'>
                <Badge
                  variant='outline'
                  className='text-[9px] px-1.5 py-0 bg-teal/20 text-teal border-teal/40'
                >
                  {openNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
                </Badge>
                {computedPeriods.length > 0 && (
                  <Badge
                    variant='outline'
                    className='text-[9px] px-1.5 py-0 border-amber-gold/40 text-amber-gold bg-amber-gold/10 flex items-center gap-1'
                  >
                    <Clock size={9} />
                    <span>
                      {isCustomPerDay
                        ? `${computedPeriods.length}/7 ngày đặt giờ`
                        : `${sameOpenTime} - ${sameCloseTime}`}
                    </span>
                  </Badge>
                )}
                {price && (
                  <Badge variant='secondary' className='text-[9px] px-1.5 py-0'>
                    {price}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
