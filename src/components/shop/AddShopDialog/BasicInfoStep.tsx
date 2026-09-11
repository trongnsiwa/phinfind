import { AlertCircle, Coffee } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { AddShopFormData } from './types';

interface BasicInfoStepProps {
  register: UseFormRegister<AddShopFormData>;
  errors: FieldErrors<AddShopFormData>;
}

export function BasicInfoStep({ register, errors }: BasicInfoStepProps) {
  return (
    <div className='space-y-3.5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
          <Coffee size={14} className='text-amber-gold' />
          <span>1. Thông tin cơ bản</span>
        </h3>
        <span className='text-[11px] text-muted-foreground'>* Bắt buộc</span>
      </div>

      {/* Shop Name */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='shop-name'
          className='text-xs font-semibold text-foreground flex items-center gap-1'
        >
          Tên quán cà phê <span className='text-rose-500'>*</span>
        </Label>
        <Input
          id='shop-name'
          {...register('name')}
          placeholder='VD: Cà Phê Giảng, All Day Coffee...'
          className={cn(
            'h-10 bg-secondary/50 border-border text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold',
            errors.name && 'border-rose-500 focus-visible:ring-rose-500'
          )}
        />
        {errors.name && (
          <p className='text-[11px] text-rose-500 flex items-center gap-1 mt-1'>
            <AlertCircle size={12} />
            <span>{errors.name.message}</span>
          </p>
        )}
      </div>

      {/* Address */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='shop-address'
          className='text-xs font-semibold text-foreground flex items-center gap-1'
        >
          Địa chỉ chi tiết <span className='text-rose-500'>*</span>
        </Label>
        <Input
          id='shop-address'
          {...register('address')}
          placeholder='VD: Số 39 Nguyễn Hữu Huân, Hàng Bạc, Hoàn Kiếm, Hà Nội'
          className={cn(
            'h-10 bg-secondary/50 border-border text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold',
            errors.address && 'border-rose-500 focus-visible:ring-rose-500'
          )}
        />
        {errors.address && (
          <p className='text-[11px] text-rose-500 flex items-center gap-1 mt-1'>
            <AlertCircle size={12} />
            <span>{errors.address.message}</span>
          </p>
        )}
      </div>
    </div>
  );
}
