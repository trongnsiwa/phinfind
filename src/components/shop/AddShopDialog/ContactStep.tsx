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
    <div className='space-y-3.5'>
      <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
        <Phone size={14} className='text-amber-gold' />
        <span>4. Liên hệ &amp; Hình ảnh (Tùy chọn)</span>
      </h3>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label htmlFor='shop-phone' className='text-xs font-medium text-foreground'>
            Số điện thoại
          </Label>
          <Input
            id='shop-phone'
            {...register('phone')}
            placeholder='VD: 0912 345 678'
            className='h-9 bg-secondary/50 border-border text-xs rounded-xl'
          />
        </div>

        <div className='space-y-1'>
          <Label htmlFor='shop-website' className='text-xs font-medium text-foreground'>
            Website / Fanpage URL
          </Label>
          <Input
            id='shop-website'
            {...register('website')}
            placeholder='https://facebook.com/...'
            className='h-9 bg-secondary/50 border-border text-xs rounded-xl'
          />
          {errors.website && (
            <p className='text-[10px] text-rose-500'>{errors.website.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
