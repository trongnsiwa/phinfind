import { Phone } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AddShopFormData } from './types';

interface ContactStepProps {
  register: UseFormRegister<AddShopFormData>;
  errors: FieldErrors<AddShopFormData>;
}

export function ContactStep({ register, errors }: ContactStepProps) {
  return (
    <div id='step-5' data-step='5' className='space-y-3.5 pt-5 border-t border-border/40'>
      {/* MOBILE HEADER ( < md ): Two-line hierarchy */}
      <div className='md:hidden space-y-0.5'>
        <div className='flex items-center gap-2'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-amber-gold'>Bước 5</span>
          <h3 className='text-sm font-bold text-foreground'>Liên hệ &amp; Hình ảnh</h3>
        </div>
        <p className='text-[11px] text-muted-foreground'>(Tùy chọn)</p>
      </div>

      {/* TABLET / DESKTOP HEADER ( >= md ): Preserved */}
      <h3 className='hidden md:flex text-xs font-bold text-foreground uppercase tracking-wider items-center gap-1.5'>
        <Phone size={14} className='text-amber-gold' />
        <span>4. Liên hệ &amp; Hình ảnh (Tùy chọn)</span>
      </h3>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label htmlFor='shop-phone' className='text-xs font-semibold text-foreground mb-1.5 block'>
            Số điện thoại
          </Label>
          <Input
            id='shop-phone'
            {...register('phone')}
            placeholder='VD: 0912 345 678'
            className='h-11 md:h-9 bg-secondary/50 border-border text-sm md:text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold transition-all'
          />
        </div>

        <div className='space-y-1'>
          <Label htmlFor='shop-website' className='text-xs font-semibold text-foreground mb-1.5 block'>
            Website / Fanpage URL
          </Label>
          <Input
            id='shop-website'
            {...register('website')}
            placeholder='https://facebook.com/...'
            className='h-11 md:h-9 bg-secondary/50 border-border text-sm md:text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold transition-all'
          />
          {errors.website && (
            <p className='text-[11px] text-rose-500 mt-1'>{errors.website.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
