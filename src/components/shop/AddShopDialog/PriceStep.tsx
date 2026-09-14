import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PRICE_OPTIONS } from './constants';
import type { PriceOption } from './types';

interface PriceStepProps {
  value?: PriceOption;
  onChange: (price?: PriceOption) => void;
}

export function PriceStep({ value, onChange }: PriceStepProps) {
  return (
    <div className='space-y-2 pt-1'>
      <Label className='text-xs font-semibold text-foreground mb-1.5 block'>Mức giá tham khảo</Label>
      <div className='grid grid-cols-4 gap-2'>
        {PRICE_OPTIONS.map((price) => {
          const isSelected = value === price;
          return (
            <button
              key={price}
              type='button'
              onClick={() => onChange(isSelected ? undefined : price)}
              className={cn(
                'h-11 md:h-auto py-1.5 md:py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer select-none active:scale-95 flex flex-col items-center justify-center min-h-[44px]',
                isSelected
                  ? 'bg-amber-gold/15 text-foreground border-amber-gold ring-1 ring-amber-gold font-bold shadow-xs'
                  : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
              )}
            >
              <span className='leading-tight'>{price}</span>
              <span className='block text-[9px] font-normal text-muted-foreground leading-tight'>
                {price === '₫'
                  ? '< 30k'
                  : price === '₫₫'
                    ? '30k - 60k'
                    : price === '₫₫₫'
                      ? '60k - 100k'
                      : '> 100k'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
