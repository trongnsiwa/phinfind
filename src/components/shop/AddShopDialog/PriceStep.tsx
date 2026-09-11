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
    <div className='space-y-2'>
      <Label className='text-xs font-semibold text-foreground'>Mức giá tham khảo</Label>
      <div className='grid grid-cols-4 gap-2'>
        {PRICE_OPTIONS.map((price) => {
          const isSelected = value === price;
          return (
            <button
              key={price}
              type='button'
              onClick={() => onChange(isSelected ? undefined : price)}
              className={cn(
                'py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer select-none',
                isSelected
                  ? 'bg-primary/20 text-foreground border-primary/50 ring-1 ring-primary'
                  : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
              )}
            >
              {price}
              <span className='block text-[9px] font-normal text-muted-foreground mt-0.5'>
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
